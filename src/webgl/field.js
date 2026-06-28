/* Subtle textural background field.
   A single full-screen fragment shader: two domain-warped fbm layers over a
   deep-charcoal base, with faint signal-amber highlights, a deeper bronze depth
   tone, a slow diagonal scan-sweep, and an edge vignette. Atmosphere only — no
   points, no graph, nothing that reads as a focal "effect". All motion is
   uniform-driven (uTime / uMouse / uScroll). Colours track the CSS tokens
   (--bg / --acc / --acc-dim). Kept deliberately dark — the glow cap is low so
   the visual-check brightness guard (mean luma < 120) always passes, even
   though amber is higher-luma than the old cyan. */

import {
  WebGLRenderer, Scene, OrthographicCamera,
  PlaneGeometry, Mesh, ShaderMaterial, Vector2, Color, Clock,
} from 'three';

const vert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // plane spans clip space
  }
`;

const frag = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uScroll;
  uniform vec2  uResolution;
  uniform vec3  uColorBg;
  uniform vec3  uColorAcc;
  uniform vec3  uColorAcc2;
  varying vec2  vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2(uv.x * aspect, uv.y) * 2.2;
    float t = uTime * 0.05;

    // primary two-pass domain warp for soft flowing structure
    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t)));
    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7, 9.2) + uMouse * 0.35),
      fbm(p + 3.0 * q + vec2(8.3, 2.8) - uMouse * 0.35)
    );
    float f = fbm(p + 2.5 * r + t);
    f = smoothstep(0.25, 0.95, f);

    // secondary slower, larger-scale layer → parallax depth
    float t2 = uTime * 0.02;
    float f2 = fbm(p * 0.5 + r * 0.6 + vec2(t2, -t2));
    f2 = smoothstep(0.30, 1.0, f2);

    // slow diagonal scan-sweep — a thin travelling highlight line
    float d = fract((uv.x + uv.y) * 0.5 - uTime * 0.03) - 0.5;
    float sweep = exp(-d * d * 1200.0);

    // faint amber highlights — caps kept low so the field stays dark
    float glow  = pow(f, 2.2) * 0.11;
    float depth = pow(f2, 2.4) * 0.06;
    float scan  = sweep * f * 0.05;

    vec3 col = uColorBg
             + uColorAcc  * (glow + scan)
             + uColorAcc2 * depth;

    // edge vignette
    vec2 c = uv - 0.5;
    col *= mix(0.5, 1.0, smoothstep(0.95, 0.22, length(c)));

    // settle to flat charcoal as the hero scrolls away
    col = mix(col, uColorBg, clamp(uScroll, 0.0, 1.0) * 0.6);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createField(canvas, { tier = 'full', onContextLost } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 1);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const clock = new Clock();

  const dprCap = tier === 'full' ? 2 : 1.5;
  const uMouse = new Vector2(0, 0);
  const mouseTarget = new Vector2(0, 0);
  let scroll = 0, scrollTarget = 0;
  let running = false, rafBound = null;

  // single-source the palette from the CSS tokens
  const css = (name, fallback) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  };

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: uMouse },
    uScroll: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uColorBg: { value: new Color(css('--bg', '#0e1116')) },
    uColorAcc: { value: new Color(css('--acc', '#ffb02e')) },
    uColorAcc2: { value: new Color(css('--acc-dim', '#c97e12')) },
  };

  const material = new ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
  scene.add(new Mesh(new PlaneGeometry(2, 2), material));

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }

  function render() {
    const dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt;
    uMouse.x += (mouseTarget.x - uMouse.x) * 0.05;
    uMouse.y += (mouseTarget.y - uMouse.y) * 0.05;
    scroll += (scrollTarget - scroll) * 0.06;
    uniforms.uScroll.value = scroll;
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    render();
    rafBound = requestAnimationFrame(loop);
  }

  function onPointer(e) {
    mouseTarget.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1)
    );
  }
  function onLost(e) {
    e.preventDefault();
    running = false;
    onContextLost && onContextLost();
  }

  const api = {
    start() { if (running) return; running = true; clock.getDelta(); loop(); },
    stop() { running = false; if (rafBound) cancelAnimationFrame(rafBound); },
    setScroll(v) { scrollTarget = v; },
    resize,
    dispose() {
      api.stop();
      scene.traverse(o => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); });
      renderer.dispose();
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onLost);
    },
  };

  resize();
  window.addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('webglcontextlost', onLost, false);

  return api;
}
