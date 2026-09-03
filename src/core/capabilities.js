/* Single source of truth for how much optics this device should carry.

   tier: 'full'  → desktop + WebGL2: liquid substrate, Lenis, lens cursor,
                   scrubbed scroll choreography, live rim lighting
         'lite'  → touch / low-power / small: Canvas2D substrate, native
                   scroll, static rim lighting, no lens
         'static'→ prefers-reduced-motion: everything already in its final
                   state, no animation, no canvas

   `optics` is separate from the tier: it reports whether the engine will
   honour an SVG filter reference inside backdrop-filter, which is what makes
   the panes genuinely refract rather than merely blur. Blink says yes today;
   WebKit and Gecko say no, and fall back to the layered-blur construction. */

export const prefersReduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const canHover = window.matchMedia('(hover: hover)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;
export const coarse = window.matchMedia('(pointer: coarse)').matches;

function hasWebGL2() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

export const webgl2 = hasWebGL2();

/* Probe, don't assume: set an SVG filter ref on backdrop-filter and read it
   back. Engines that don't support it drop the declaration entirely. */
function hasRefraction() {
  const probe = document.createElement('div');
  const value = 'blur(2px) url(#op-refract)';
  probe.style.backdropFilter = value;
  probe.style.webkitBackdropFilter = value;
  const applied = probe.style.backdropFilter || probe.style.webkitBackdropFilter || '';
  return applied.includes('url(');
}

function computeTier() {
  // explicit override — used for debugging and for CI's WebGL-path screenshot
  const forced = new URLSearchParams(window.location.search).get('tier');
  if (forced === 'full' || forced === 'lite' || forced === 'static') return forced;

  if (prefersReduced) return 'static';
  const lowPower =
    coarse ||
    !canHover ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    window.innerWidth <= 768 ||
    !webgl2;
  return lowPower ? 'lite' : 'full';
}

export const tier = computeTier();

/* Real refraction is expensive; only the full tier pays for it. */
export const optics = tier === 'full' && hasRefraction();
