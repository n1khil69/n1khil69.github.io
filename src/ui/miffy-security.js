/**
 * Miffy: Chief Security Officer (IGA Crossover)
 * Bridges Miffy's charming world with Nikhil's enterprise identity governance career at PwC.
 * Interactive ID badge scanner, Saviynt certification card, and rubber stamp approvals.
 */

import { miffyIcon } from './miffy-shape.js';

export function initMiffySecurity(container, onStatusChange) {
  if (!container) return;

  const card = document.createElement('div');
  card.className = 'miffy-audit-card';
  card.id = 'miffyAuditCard';
  card.setAttribute('aria-label', 'Identity governance audit record for Miffy');
  card.hidden = true;

  card.innerHTML = `
    <div class="miffy-audit-card__head">
      <span class="miffy-audit-card__corp">PwC ACCELERATION CENTERS · CYBER IDENTITY</span>
      <span class="miffy-audit-card__badge">SAVIYNT EIC AUDIT</span>
    </div>
    <div class="miffy-audit-card__body">
      <div class="miffy-audit-card__profile">
        <div class="miffy-audit-card__avatar" aria-hidden="true">${miffyIcon()}</div>
        <div>
          <h4 class="miffy-audit-card__name">NIJNTJE (MIFFY) BRUNA</h4>
          <p class="miffy-audit-card__role">CHIEF HAPPINESS OFFICER · LEVEL 99</p>
        </div>
      </div>
      <dl class="miffy-audit-card__specs">
        <div><dt>AUTHORITATIVE SOURCE</dt><dd>HR_FEED // WORKDAY_GLOBAL</dd></div>
        <div><dt>BIRTHRIGHT ROLES</dt><dd>Carrot-Harvester, Paper-Aviator</dd></div>
        <div><dt>ASSIGNED ENTITLEMENTS</dt><dd>ERP-Read, Meadow-Pass, Joy-Admin</dd></div>
        <div><dt>SOD TOXIC RULES SCANNED</dt><dd class="miffy-tag-pass">0 VIOLATIONS (SOD-014 CLEAR)</dd></div>
      </dl>
      <div class="miffy-stamp-seal" id="miffyStampSeal" aria-hidden="true"></div>
    </div>
    <div class="miffy-audit-card__footer">
      <span class="miffy-audit-card__action-label">AUDITOR DECISION:</span>
      <div class="miffy-audit-card__buttons">
        <button type="button" class="miffy-stamp-btn miffy-stamp-btn--approve" id="miffyCertifyBtn">
          <span>🥕 CERTIFY ACCESS</span>
        </button>
        <button type="button" class="miffy-stamp-btn miffy-stamp-btn--flag" id="miffyFlagBtn">
          <span>⚠️ FLAG SOD RISK</span>
        </button>
      </div>
    </div>
  `;

  container.appendChild(card);

  const certifyBtn = card.querySelector('#miffyCertifyBtn');
  const flagBtn = card.querySelector('#miffyFlagBtn');
  const stampSeal = card.querySelector('#miffyStampSeal');

  function applyStamp(type, text, caption) {
    stampSeal.className = `miffy-stamp-seal miffy-stamp-seal--${type} is-stamped`;
    stampSeal.textContent = text;
    stampSeal.setAttribute('aria-label', text);

    if (onStatusChange) {
      onStatusChange(caption);
    }

    // Trigger pulse on the card
    card.classList.remove('card-bump');
    void card.offsetWidth;
    card.classList.add('card-bump');
  }

  certifyBtn.addEventListener('click', () => {
    applyStamp(
      'approved',
      'CERTIFIED ✓',
      'Access approved! 0 SoD violations detected. Miffy is officially provisioned in Saviynt EIC.'
    );
  });

  flagBtn.addEventListener('click', () => {
    applyStamp(
      'flagged',
      'SOD FLAG ⚠️',
      'Auditor note: Extreme sweetness potential flagged under policy SOD-099. Remediation in progress.'
    );
  });

  return {
    show() {
      card.hidden = false;
      card.classList.add('is-visible');
      stampSeal.className = 'miffy-stamp-seal';
      stampSeal.textContent = '';
    },
    hide() {
      card.hidden = true;
      card.classList.remove('is-visible');
    },
    isOpen() {
      return !card.hidden;
    },
  };
}
