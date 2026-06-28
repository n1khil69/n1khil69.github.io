/* Access-decision simulator — the signature interactive centerpiece.
   Runs an identity request through IDENTIFY → AUTHENTICATE → ENTITLEMENTS →
   SoD CHECK → CERTIFY → DECISION, dramatizing what real IGA does. Two preset
   scenarios — a clean joiner (GRANT) and a mover whose request trips an SoD
   toxic combination (DENY) — plus a "BUILD YOUR OWN" mode where the visitor
   picks a role + entitlements and watches the engine decide live. Subjects are
   illustrative demo data — no real clients/metrics claimed.

   Tier-aware: static/reduced-motion renders the final resolved state instantly;
   lite/full animate it via a paused GSAP timeline, auto-run once on scroll-in and
   replayable. No ScrollTrigger pinning — works with or without Lenis. */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

const SCENARIOS = {
  grant: {
    request: 'request: joiner · cn=A. Rao · dept=Finance · type=FTE',
    steps: [
      { stage: 'identify', lines: [
        ['step', '› IDENTIFY  resolving subject from HR feed…'],
        ['ok',   '  ✓ matched 1 identity · status=active'] ] },
      { stage: 'auth', lines: [
        ['step', '› AUTHENTICATE  verifying authoritative source + MFA…'],
        ['ok',   '  ✓ source trusted · MFA assertion ok'] ] },
      { stage: 'entitlements', lines: [
        ['step',  '› ENTITLEMENTS  evaluating birthright policy…'],
        ['muted', '  · role=Finance-Analyst  app=ERP  scope=read'],
        ['ok',    '  ✓ birthright bundle resolved · 3 entitlements'] ] },
      { stage: 'sod', lines: [
        ['step', '› SoD CHECK  scanning for toxic combinations…'],
        ['ok',   '  ✓ 0 conflicts · separation of duties clean'] ] },
      { stage: 'certify', lines: [
        ['step', '› CERTIFY  routing for certification…'],
        ['ok',   '  ✓ within auto-approval policy · no reviewer needed'] ] },
      { stage: 'decision', pass: true, lines: [
        ['step', '› DECISION  committing provisioning…'],
        ['ok',   '  ✓ access provisioned · ticket auto-closed'] ] },
    ],
    verdict: ['✓ ACCESS GRANTED — provisioned, zero tickets filed', 'grant'],
  },

  deny: {
    request: 'request: mover · cn=B. Shah · adds=Payments-Approver',
    steps: [
      { stage: 'identify', lines: [
        ['step', '› IDENTIFY  resolving subject from HR feed…'],
        ['ok',   '  ✓ matched 1 identity · transfer: Procurement → Payments'] ] },
      { stage: 'auth', lines: [
        ['step', '› AUTHENTICATE  verifying authoritative source + MFA…'],
        ['ok',   '  ✓ source trusted · MFA assertion ok'] ] },
      { stage: 'entitlements', lines: [
        ['step',  '› ENTITLEMENTS  evaluating requested + retained access…'],
        ['muted', '  · requested  role=Payments-Approver'],
        ['muted', '  · retained   role=Vendor-Requester'] ] },
      { stage: 'sod', fail: true, lines: [
        ['step', '› SoD CHECK  scanning for toxic combinations…'],
        ['warn', '  ✗ CONFLICT  Vendor-Requester ⊕ Payments-Approver'],
        ['warn', '  ✗ rule SOD-014 · create-and-approve own payment'] ] },
      { stage: 'certify', fail: true, lines: [
        ['step',  '› CERTIFY  escalating to risk owner…'],
        ['muted', '  · reviewer action required · no mitigating control'] ] },
      { stage: 'decision', fail: true, lines: [
        ['step', '› DECISION  applying policy…'],
        ['warn', '  ✗ auto-provisioning blocked'] ] },
    ],
    verdict: ['✗ ACCESS DENIED — SoD violation, remediation required', 'deny'],
  },
};

/* ---- BUILD YOUR OWN: role flavour + the SoD ruleset the engine enforces ---- */
const ROLES = {
  finance:     { cn: 'A. Rao',  dept: 'Finance' },
  procurement: { cn: 'B. Shah', dept: 'Procurement' },
  treasury:    { cn: 'C. Iyer', dept: 'Treasury' },
  it:          { cn: 'D. Khan', dept: 'IT' },
  audit:       { cn: 'E. Bose', dept: 'Audit' },
};

const SOD_RULES = [
  { pair: ['Vendor-Requester', 'Payments-Approver'], id: 'SOD-014', desc: 'create-and-approve own payment' },
  { pair: ['GL-Poster', 'Bank-Recon'],               id: 'SOD-008', desc: 'post-and-reconcile' },
  { pair: ['ERP-Admin', 'Access-Certifier'],         id: 'SOD-021', desc: 'admin cannot self-certify' },
  { pair: ['User-Admin', 'Access-Certifier'],        id: 'SOD-033', desc: 'provision-and-certify' },
];

export function initAccessSim(tier) {
  const root = document.getElementById('accessSim');
  if (!root) return;

  try {
    const logEl = root.querySelector('#asimLog');
    const verdictEl = root.querySelector('#asimVerdict');
    const replayBtn = root.querySelector('#asimReplay');
    const builderEl = root.querySelector('#asimBuilder');
    const rolesEl = root.querySelector('#asimRoles');
    const entsEl = root.querySelector('#asimEnts');
    const scenarioBtns = [...root.querySelectorAll('.asim__scenario')];
    const stageEls = new Map(
      [...root.querySelectorAll('.asim__stage')].map((el) => [el.dataset.stage, el]),
    );
    if (!logEl || !verdictEl) return;

    let current = 'grant';
    let tl = null;

    const setStage = (stage, state) => {
      const el = stageEls.get(stage);
      if (el) el.className = `asim__stage ${state}`;
    };
    const resetStages = () => stageEls.forEach((el) => { el.className = 'asim__stage is-pending'; });
    const printLine = (kind, text) => {
      const p = document.createElement('p');
      p.className = 'asim__line' + (kind ? ` asim__line--${kind}` : '');
      p.textContent = text;
      logEl.appendChild(p);
      logEl.scrollTop = logEl.scrollHeight;
    };
    const setVerdict = ([text, kind]) => {
      verdictEl.textContent = text;
      verdictEl.className = `asim__verdict is-${kind}`;
    };
    const reset = () => {
      if (tl) { tl.kill(); tl = null; }
      logEl.innerHTML = '';
      verdictEl.textContent = '';
      verdictEl.className = 'asim__verdict';
      resetStages();
    };

    /* assemble a scenario from the current builder selections */
    const buildScenario = () => {
      const roleKey = rolesEl?.querySelector('.is-active')?.dataset.role || 'finance';
      const role = ROLES[roleKey] || ROLES.finance;
      const ents = [...(entsEl?.querySelectorAll('.is-active') || [])].map((b) => b.dataset.ent);
      const request = `request: access · cn=${role.cn} · dept=${role.dept} · type=FTE`;

      const baseSteps = [
        { stage: 'identify', lines: [
          ['step', '› IDENTIFY  resolving subject from HR feed…'],
          ['ok',   `  ✓ matched 1 identity · dept=${role.dept} · status=active`] ] },
        { stage: 'auth', lines: [
          ['step', '› AUTHENTICATE  verifying authoritative source + MFA…'],
          ['ok',   '  ✓ source trusted · MFA assertion ok'] ] },
      ];

      if (!ents.length) {
        return {
          request,
          steps: [...baseSteps, { stage: 'entitlements', lines: [
            ['step',  '› ENTITLEMENTS  evaluating requested access…'],
            ['muted', '  · no entitlements selected'] ] }],
          verdict: ['— select at least one entitlement to evaluate', 'wait'],
        };
      }

      const entStep = { stage: 'entitlements', lines: [
        ['step', '› ENTITLEMENTS  evaluating requested access…'],
        ...ents.map((e) => ['muted', `  · requested  ${e}`]) ] };
      const conflicts = SOD_RULES.filter((r) => r.pair.every((p) => ents.includes(p)));
      const n = ents.length;
      const plural = n > 1 ? 's' : '';

      if (conflicts.length) {
        return {
          request,
          steps: [...baseSteps, entStep,
            { stage: 'sod', fail: true, lines: [
              ['step', '› SoD CHECK  scanning for toxic combinations…'],
              ...conflicts.flatMap((c) => [
                ['warn', `  ✗ CONFLICT  ${c.pair[0]} ⊕ ${c.pair[1]}`],
                ['warn', `  ✗ rule ${c.id} · ${c.desc}`] ]) ] },
            { stage: 'certify', fail: true, lines: [
              ['step',  '› CERTIFY  escalating to risk owner…'],
              ['muted', '  · reviewer action required · no mitigating control'] ] },
            { stage: 'decision', fail: true, lines: [
              ['step', '› DECISION  applying policy…'],
              ['warn', '  ✗ auto-provisioning blocked'] ] },
          ],
          verdict: [`✗ ACCESS DENIED — SoD violation (${conflicts.map((c) => c.id).join(', ')}), remediation required`, 'deny'],
        };
      }

      return {
        request,
        steps: [...baseSteps, entStep,
          { stage: 'sod', lines: [
            ['step', '› SoD CHECK  scanning for toxic combinations…'],
            ['ok',   `  ✓ ${n} entitlement${plural} · 0 conflicts · separation of duties clean`] ] },
          { stage: 'certify', lines: [
            ['step', '› CERTIFY  routing for certification…'],
            ['ok',   '  ✓ within auto-approval policy · no reviewer needed'] ] },
          { stage: 'decision', pass: true, lines: [
            ['step', '› DECISION  committing provisioning…'],
            ['ok',   `  ✓ ${n} entitlement${plural} provisioned · ticket auto-closed`] ] },
        ],
        verdict: ['✓ ACCESS GRANTED — provisioned, zero tickets filed', 'grant'],
      };
    };

    const scenarioFor = () => (current === 'build' ? buildScenario() : SCENARIOS[current]);

    /* render the fully-resolved end state with no animation (static tier) */
    const renderFinal = (scn) => {
      reset();
      printLine('muted', scn.request);
      scn.steps.forEach((step) => {
        step.lines.forEach(([kind, text]) => printLine(kind, text));
        setStage(step.stage, step.fail ? 'is-fail' : 'is-pass');
      });
      setVerdict(scn.verdict);
    };

    /* animate the pipeline (lite/full) */
    const play = (scn) => {
      reset();
      tl = gsap.timeline();
      tl.call(() => printLine('muted', scn.request));
      scn.steps.forEach((step) => {
        tl.call(() => setStage(step.stage, 'is-active'), null, '+=0.15');
        step.lines.forEach(([kind, text]) => {
          tl.call(() => printLine(kind, text), null, '+=0.10');
        });
        tl.call(() => setStage(step.stage, step.fail ? 'is-fail' : 'is-pass'), null, '+=0.08');
      });
      tl.call(() => setVerdict(scn.verdict), null, '+=0.2');
    };

    const run = () => (tier === 'static' ? renderFinal(scenarioFor()) : play(scenarioFor()));

    const selectScenario = (name) => {
      current = name;
      root.dataset.scenario = name;
      scenarioBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.scenario === name));
      if (builderEl) builderEl.hidden = name !== 'build';
      if (replayBtn?.firstChild) replayBtn.firstChild.nodeValue = name === 'build' ? 'EVALUATE ' : 'RUN AGAIN ';
      run();
    };

    /* builder chips: single-select roles, multi-toggle entitlements */
    const onChip = (e) => {
      const btn = e.target.closest('.asim__chip');
      if (!btn) return;
      if (btn.parentElement === rolesEl) {
        rolesEl.querySelectorAll('.asim__chip').forEach((b) => {
          const on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
      } else {
        const on = !btn.classList.contains('is-active');
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
      }
      current === 'build' ? run() : selectScenario('build');
    };
    rolesEl?.addEventListener('click', onChip);
    entsEl?.addEventListener('click', onChip);

    scenarioBtns.forEach((b) =>
      b.addEventListener('click', () => selectScenario(b.dataset.scenario)));
    replayBtn?.addEventListener('click', run);

    if (tier === 'static') {
      renderFinal(scenarioFor()); // reduced-motion: show the resolved decision immediately
    } else {
      ScrollTrigger.create({ trigger: root, start: 'top 75%', once: true, onEnter: run });
    }
  } catch {
    /* never break the page — leave the static markup in place */
  }
}
