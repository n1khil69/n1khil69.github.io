/* Single source of truth for how much motion/WebGL this device should get.
   tier: 'full'  → desktop, capable GPU: WebGL lattice + Lenis + scrubbed scroll
         'lite'  → touch / low-power / small: Canvas2D mesh, native scroll, light reveals
         'static'→ prefers-reduced-motion: everything in final state, no animation     */

export const prefersReduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const canHover = window.matchMedia('(hover: hover)').matches;
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

function computeTier() {
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
