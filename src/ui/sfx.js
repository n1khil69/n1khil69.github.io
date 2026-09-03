/* INTERFACE SOUND
   ---------------------------------------------------------------------
   "SFX" cuts both ways on this site: the optics are one half, this is the
   other. Every sound is synthesised on the fly — no audio files, no network
   cost — from the same material the visuals are made of: struck glass,
   filtered air, a shutter.

   It is OFF until asked for. The AudioContext is not even constructed until
   the visitor presses the toggle, which is itself the required user gesture,
   and the choice is remembered. Nothing on the page depends on it. */

const KEY = 'ns.sfx';

let ctx = null;
let bus = null;
let enabled = false;
let noiseBuf = null;

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  bus = ctx.createGain();
  bus.gain.value = 0.5;

  // a touch of room so the glass isn't struck in a vacuum
  const conv = ctx.createConvolver();
  const len = Math.floor(ctx.sampleRate * 1.1);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
  }
  conv.buffer = ir;
  const wet = ctx.createGain();
  wet.gain.value = 0.22;

  bus.connect(ctx.destination);
  bus.connect(conv);
  conv.connect(wet);
  wet.connect(ctx.destination);

  // one shared noise buffer for air/shutter sounds
  const nlen = Math.floor(ctx.sampleRate * 0.6);
  noiseBuf = ctx.createBuffer(1, nlen, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nlen; i++) nd[i] = Math.random() * 2 - 1;

  return ctx;
}

/* a struck partial — the body of every "glass" sound */
function strike(freq, { at = 0, dur = 0.5, gain = 0.1, type = 'sine', detune = 0 } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.detune.value = detune;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(bus);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/* filtered air — shutters, sweeps, the sound of a pane sliding */
function air({ at = 0, dur = 0.3, gain = 0.05, from = 800, to = 3600, q = 6 } = {}) {
  if (!ctx || !noiseBuf) return;
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = q;
  bp.frequency.setValueAtTime(from, t);
  bp.frequency.exponentialRampToValueAtTime(Math.max(60, to), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(bus);
  src.start(t);
  src.stop(t + dur + 0.02);
}

const VOICES = {
  // pointer crossing a target — barely there, high and short
  tick:   () => { strike(2400, { dur: 0.06, gain: 0.014, type: 'triangle' }); },
  // a pane being touched
  tap:    () => { strike(880, { dur: 0.32, gain: 0.05 }); strike(1320, { dur: 0.2, gain: 0.028, detune: 6 }); air({ dur: 0.1, gain: 0.02, from: 2600, to: 700 }); },
  // the iris opening
  open:   () => { air({ dur: 0.7, gain: 0.06, from: 240, to: 4200, q: 2 }); strike(196, { dur: 0.9, gain: 0.05, type: 'sine' }); strike(392, { at: 0.06, dur: 0.7, gain: 0.03 }); },
  // moving between layers
  sweep:  () => { air({ dur: 0.42, gain: 0.028, from: 3000, to: 500, q: 3 }); },
  // a decision resolved in your favour
  grant:  () => { strike(523.25, { dur: 0.5, gain: 0.06 }); strike(659.25, { at: 0.07, dur: 0.5, gain: 0.05 }); strike(987.77, { at: 0.14, dur: 0.7, gain: 0.04 }); },
  // refused
  deny:   () => { strike(146.83, { dur: 0.42, gain: 0.07, type: 'sawtooth' }); strike(155.56, { at: 0.02, dur: 0.4, gain: 0.05, type: 'sawtooth' }); },
  // a keystroke landing in the shell
  key:    () => { strike(1600 + Math.random() * 500, { dur: 0.04, gain: 0.012, type: 'square' }); },
};

export function play(name) {
  if (!enabled || !ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  try { VOICES[name]?.(); } catch { /* audio is never load-bearing */ }
}

export function isEnabled() { return enabled; }

export function setEnabled(on) {
  enabled = !!on;
  try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch { /* private mode */ }
  if (enabled) {
    ensureContext();
    ctx?.resume?.();
    play('tap');
  }
  document.getElementById('sfxToggle')?.setAttribute('aria-pressed', String(enabled));
  return enabled;
}

export function initSfx({ reduced = false } = {}) {
  const toggle = document.getElementById('sfxToggle');

  let stored = '0';
  try { stored = localStorage.getItem(KEY) || '0'; } catch { /* ignore */ }
  // never auto-start: the stored preference is applied on the first gesture
  enabled = false;
  toggle?.setAttribute('aria-pressed', 'false');

  const wantsSound = stored === '1' && !reduced;
  if (wantsSound) {
    const arm = () => setEnabled(true);
    window.addEventListener('pointerdown', arm, { once: true });
    window.addEventListener('keydown', arm, { once: true });
  }

  toggle?.addEventListener('click', () => setEnabled(!enabled));

  // hover ticks, delegated and rate-limited so it never chatters
  let last = 0;
  document.addEventListener('pointerover', (e) => {
    if (!enabled) return;
    if (!e.target.closest?.('a, button, .tile, .cred, .prism')) return;
    const now = performance.now();
    if (now - last < 70) return;
    last = now;
    play('tick');
  }, { passive: true });

  document.addEventListener('pointerdown', (e) => {
    if (!enabled) return;
    if (e.target.closest?.('a, button')) play('tap');
  }, { passive: true });

  return { play, setEnabled, isEnabled };
}
