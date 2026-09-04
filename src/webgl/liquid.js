/* THE SUBSTRATE
   ---------------------------------------------------------------------
   One full-screen fragment shader: a thick, dark liquid seen from above,
   lit by a single cold lamp with a warm counter-bounce. Caustic light
   knots and unknots across it; the pointer pushes rings into the surface;
   scrolling drags the flow and drains the light as you descend.

   Everything reads as *optics*, not as particles — there is no lattice, no
   node graph, nothing that announces "WebGL demo". The glass panes above
   blur it further, so the job here is motion and colour temperature, not
   detail.

   Brightness discipline: every additive term is capped and the whole frame
   is vignetted, keeping mean luma far below the CI wash guard even when the
   caustics peak. */

import {
  WebGLRenderer, Scene, OrthographicCamera,
  PlaneGeometry, Mesh, ShaderMaterial, Vector2, Vector4, Color, Clock,
} from 'three';

const vert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const frag = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform vec2  uLight;      // lamp position, 0..1 screen space
  uniform float uScroll;     // 0 at hero, 1 once the hero has left
  uniform float uEnergy;     // transient brightness kick
  uniform vec2  uResolution;
  uniform vec4  uRipple;     // xy = origin (0..1), z = age (s), w = strength
  uniform vec3  uVoid;
  uniform vec3  uCyan;
  uniform vec3  uMagenta;
  uniform vec3  uAmber;

  varying vec2 vUv;

  const float TAU = 6.28318530718;

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
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  /* light refracted through a moving surface — the knots of brightness you
     get on the floor of a pool. Four folds is enough at this scale. */
  float caustic(vec2 uv, float t) {
    vec2 p = mod(uv * TAU, TAU) - 250.0;
    vec2 i = p;
    float c = 1.0;
    const float inten = 0.0045;
    for (int n = 0; n < 4; n++) {
      float tt = t * (1.0 - (3.5 / float(n + 1)));
      i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
      c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
    }
    c /= 4.0;
    c = 1.16 - pow(c, 1.4);
    return clamp(pow(abs(c), 7.0), 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2(uv.x * aspect, uv.y);

    float t = uTime * 0.16;

    /* --- the pointer's wake: a decaying ring pushed into the surface --- */
    vec2 rp = uRipple.xy;
    rp.x *= aspect;
    float rd = length(p - rp);
    float age = uRipple.z;
    float wave = sin(rd * 34.0 - age * 7.0) * exp(-rd * 5.0) * exp(-age * 1.7) * uRipple.w;

    /* --- slow domain warp so the liquid has body, not just surface --- */
    vec2 flow = vec2(fbm(p * 1.6 + vec2(0.0, t * 0.5)), fbm(p * 1.6 + vec2(4.7, -t * 0.4)));
    vec2 cuv = p * 0.55 + flow * 0.30 + wave * 0.06;
    cuv.y += uScroll * 0.42;               // scrolling drags the flow downward

    /* --- caustics, sampled per channel: the liquid disperses light --- */
    float ca_r = caustic(cuv + vec2( 0.0035, 0.0), uTime * 0.36);
    float ca_g = caustic(cuv,                      uTime * 0.36);
    float ca_b = caustic(cuv + vec2(-0.0035, 0.0), uTime * 0.36);

    /* a second, larger and slower sheet for depth */
    float deep = caustic(p * 0.26 + flow * 0.12 + vec2(1.3, -t * 0.22), uTime * 0.13);

    /* --- lamp falloff: light is a place, not a wash --- */
    vec2 lp = vec2(uLight.x * aspect, uLight.y);
    float lampD = length(p - lp);
    float lamp = exp(-lampD * 1.35);
    float lampWide = exp(-lampD * 0.55);

    /* --- assemble ------------------------------------------------------ */
    vec3 col = uVoid;

    // the cold key light, coloured by dispersion
    vec3 chroma = vec3(ca_r, ca_g, ca_b);
    col += uCyan * chroma * (0.085 + lamp * 0.19);
    col += uMagenta * ca_b * 0.030 * lampWide;

    // the warm bounce from below, weakest where the key is strongest
    col += uAmber * deep * 0.055 * (1.0 - lamp * 0.6);

    // body of the liquid: a faint structural haze so it isn't empty black
    float body = fbm(p * 2.1 + flow * 0.8 + vec2(0.0, t * 0.28));
    col += uCyan * pow(body, 3.2) * 0.030;

    // the ripple itself catches a highlight
    col += uCyan * clamp(wave, 0.0, 1.0) * 0.22;

    // transient energy (a command run, a decision committed)
    col += uCyan * lamp * uEnergy * 0.30;

    // vignette, then drain toward the void as the page descends
    vec2 c = uv - 0.5;
    col *= mix(0.34, 1.0, smoothstep(1.00, 0.16, length(c)));
    col = mix(col, uVoid, clamp(uScroll, 0.0, 1.0) * 0.52);

    // dithering — kills banding across these very dark gradients
    float dither = (hash(uv * uResolution) - 0.5) * 0.006;
    gl_FragColor = vec4(col + dither, 1.0);
  }
`;

const cssVar = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

export function createLiquid(canvas, { tier = 'full', onContextLost } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 1);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const clock = new Clock();

  const uniforms = {
    uTime:       { value: 0 },
    uLight:      { value: new Vector2(0.5, 0.82) },
    uScroll:     { value: 0 },
    uEnergy:     { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uRipple:     { value: new Vector4(0.5, 0.5, 99, 0) },
    uVoid:       { value: new Color(cssVar('--void', '#04060a')) },
    uCyan:       { value: new Color(cssVar('--spec-c', '#7fe7ff')) },
    uMagenta:    { value: new Color(cssVar('--spec-m', '#ff79c0')) },
    uAmber:      { value: new Color(cssVar('--live', '#ffb44d')) },
  };

  const material = new ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, uniforms,
    depthTest: false, depthWrite: false,
  });
  scene.add(new Mesh(new PlaneGeometry(2, 2), material));

  const lightTarget = new Vector2(0.5, 0.82);
  let scrollTarget = 0;
  let energyTarget = 0;
  let rippleAt = -99;
  let running = false;
  let raf = null;

  /* The substrate is soft by design and sits under 20-30px of backdrop blur,
     so it is rendered below native resolution: a large win on integrated GPUs
     and on CI's software rasteriser, invisible in the result. */
  let lastW = 0, lastH = 0;

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const budget = tier === 'full' ? 1400 : 1000;
    const ratio = Math.min(window.devicePixelRatio || 1, 1) * Math.min(1, budget / Math.max(w, 1));
    renderer.setPixelRatio(Math.max(0.5, ratio));
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w * ratio, h * ratio);
    lastW = w; lastH = h;
  }

  /* A mobile URL bar sliding in and out fires `resize` continuously and only
     changes the height. Reallocating the drawing buffer for that is visible as
     a flash, so only a width change (or a rotation-sized height change) counts. */
  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    if (w === lastW && Math.abs(h - lastH) < lastH * 0.2) return;
    resize();
  }

  function render() {
    const dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt;

    const L = uniforms.uLight.value;
    L.x += (lightTarget.x - L.x) * 0.05;
    L.y += (lightTarget.y - L.y) * 0.05;

    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * 0.06;

    energyTarget *= 0.94;
    uniforms.uEnergy.value += (energyTarget - uniforms.uEnergy.value) * 0.2;

    uniforms.uRipple.value.z = uniforms.uTime.value - rippleAt;

    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    render();
    raf = requestAnimationFrame(loop);
  }

  function onPointer(e) {
    lightTarget.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  }
  function onLost(e) {
    e.preventDefault();
    running = false;
    onContextLost && onContextLost();
  }

  const api = {
    start() { if (running) return; running = true; clock.getDelta(); loop(); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); },
    setScroll(v) { scrollTarget = v; },
    /* a ring pushed into the liquid at viewport coordinates */
    ripple(x, y, strength = 1) {
      uniforms.uRipple.value.set(x / window.innerWidth, 1 - y / window.innerHeight, 0, strength);
      rippleAt = uniforms.uTime.value;
    },
    /* a brief lift in the key light — used when the page does something */
    flare(amount = 1) { energyTarget = Math.min(1.6, energyTarget + amount); },
    resize,
    dispose() {
      api.stop();
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      renderer.dispose();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('webglcontextlost', onLost);
    },
  };

  resize();
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('webglcontextlost', onLost, false);

  return api;
}
