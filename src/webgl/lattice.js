/* Interactive 3D "identity node lattice".
   An ambient point-field + a sparser graph of bright lime nodes joined by lines.
   All motion is GPU/uniform-driven (uTime / uMouse / uScroll) — no per-particle JS.
   One BufferGeometry per layer, additive blending, soft in-shader sprites (no textures). */

import {
  WebGLRenderer, Scene, PerspectiveCamera,
  BufferGeometry, Float32BufferAttribute,
  Points, LineSegments, ShaderMaterial, AdditiveBlending,
  Vector2, Color, Clock,
} from 'three';

const FOV = 52;
const CAM_Z = 6;

/* shared GLSL — the displacement function used by BOTH points and lines so
   connected nodes and their links move together. */
const DISPLACE = /* glsl */`
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uScroll;

  vec3 displace(vec3 p, float seed) {
    float t = uTime * 0.18;
    vec3 d = p;
    d.x += sin(p.y * 0.55 + t + seed) * 0.20;
    d.y += cos(p.x * 0.55 + t * 1.1 + seed) * 0.20;
    d.z += sin(p.x * 0.4 + p.y * 0.4 + t * 0.8 + seed) * 0.28;
    // cursor well (xy)
    vec2 toM = d.xy - uMouse;
    float md = length(toM);
    float infl = smoothstep(2.4, 0.0, md);
    d.xy += normalize(toM + 0.0001) * infl * 1.0;
    // scroll → disperse + push back
    d *= 1.0 + uScroll * 0.55;
    d.z -= uScroll * 2.4;
    return d;
  }
`;

const pointsVert = /* glsl */`
  attribute float aRandom;
  attribute float aScale;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vMix;
  varying float vGlow;
  ${DISPLACE}
  void main() {
    vec3 p = displace(position, aRandom * 6.2831);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vGlow = smoothstep(2.6, 0.0, length(p.xy - uMouse));
    vMix = aRandom;
    gl_PointSize = uSize * aScale * (1.0 + aRandom * 0.6) * uPixelRatio * (12.0 / -mv.z);
  }
`;

const pointsFrag = /* glsl */`
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uColor2;
  varying float vMix;
  varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    if (a < 0.01) discard;
    vec3 col = mix(uColor2, uColor, clamp(vMix * 0.35 + vGlow, 0.0, 1.0));
    gl_FragColor = vec4(col, a * (0.10 + vGlow * 0.65));
  }
`;

const lineVert = /* glsl */`
  attribute float aRandom;
  varying float vGlow;
  ${DISPLACE}
  void main() {
    vec3 p = displace(position, aRandom * 6.2831);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vGlow = smoothstep(2.2, 0.0, length(p.xy - uMouse));
  }
`;

const lineFrag = /* glsl */`
  precision mediump float;
  uniform vec3 uColor;
  varying float vGlow;
  void main() {
    gl_FragColor = vec4(uColor, 0.05 + vGlow * 0.55);
  }
`;

export function createLattice(canvas, { tier = 'full', onContextLost } = {}) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAM_Z;

  const lime = new Color('#ccff00');
  const bone = new Color('#2c2c26');
  const clock = new Clock();

  const dprCap = tier === 'full' ? 2 : 1.5;
  const uMouse = new Vector2(0, 0);
  const mouseTarget = new Vector2(0, 0);

  let halfH = 0, halfW = 0;
  let cloud, nodes, lines;
  let scroll = 0, scrollTarget = 0;
  let running = false, rafBound = null;

  // shared uniforms (one object reused across materials)
  const shared = {
    uTime: { value: 0 },
    uMouse: { value: uMouse },
    uScroll: { value: 0 },
  };

  function viewExtent() {
    halfH = Math.tan((FOV * Math.PI) / 360) * CAM_Z;
    halfW = halfH * camera.aspect;
  }

  function rand(spreadX, spreadY, spreadZ) {
    return [
      (Math.random() * 2 - 1) * spreadX,
      (Math.random() * 2 - 1) * spreadY,
      (Math.random() * 2 - 1) * spreadZ,
    ];
  }

  function buildCloud() {
    const w = window.innerWidth, h = window.innerHeight;
    const count = Math.min(tier === 'full' ? 11000 : 5000, Math.floor((w * h) / 200));
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const scl = new Float32Array(count);
    const sx = halfW * 1.25, sy = halfH * 1.25, sz = 2.4;
    for (let i = 0; i < count; i++) {
      const [x, y, z] = rand(sx, sy, sz);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      rnd[i] = Math.random();
      scl[i] = 0.5 + Math.random() * 0.9;
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    g.setAttribute('aRandom', new Float32BufferAttribute(rnd, 1));
    g.setAttribute('aScale', new Float32BufferAttribute(scl, 1));

    const m = new ShaderMaterial({
      uniforms: {
        ...shared,
        uSize: { value: 1.5 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, dprCap) },
        uColor: { value: lime },
        uColor2: { value: bone },
      },
      vertexShader: pointsVert, fragmentShader: pointsFrag,
      transparent: true, depthWrite: false, blending: AdditiveBlending,
    });
    return new Points(g, m);
  }

  function buildGraph() {
    const M = tier === 'full' ? 360 : 150;
    const sx = halfW * 1.05, sy = halfH * 1.05, sz = 1.8;
    const pts = [];
    for (let i = 0; i < M; i++) pts.push(rand(sx, sy, sz));

    // nodes (bright lime points)
    const npos = new Float32Array(M * 3);
    const nrnd = new Float32Array(M);
    const nscl = new Float32Array(M);
    for (let i = 0; i < M; i++) {
      npos[i * 3] = pts[i][0]; npos[i * 3 + 1] = pts[i][1]; npos[i * 3 + 2] = pts[i][2];
      nrnd[i] = 0.7 + Math.random() * 0.3;
      nscl[i] = 1.0 + Math.random() * 0.8;
    }
    const ng = new BufferGeometry();
    ng.setAttribute('position', new Float32BufferAttribute(npos, 3));
    ng.setAttribute('aRandom', new Float32BufferAttribute(nrnd, 1));
    ng.setAttribute('aScale', new Float32BufferAttribute(nscl, 1));
    const nm = new ShaderMaterial({
      uniforms: {
        ...shared,
        uSize: { value: 2.4 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, dprCap) },
        uColor: { value: lime },
        uColor2: { value: lime },
      },
      vertexShader: pointsVert, fragmentShader: pointsFrag,
      transparent: true, depthWrite: false, blending: AdditiveBlending,
    });
    const nodePoints = new Points(ng, nm);

    // edges: connect each node to its 2 nearest neighbours (O(M^2), M small)
    const edges = [];
    const seen = new Set();
    for (let i = 0; i < M; i++) {
      const dists = [];
      for (let j = 0; j < M; j++) {
        if (i === j) continue;
        const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], dz = pts[i][2] - pts[j][2];
        dists.push([dx * dx + dy * dy + dz * dz, j]);
      }
      dists.sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < 2; k++) {
        const j = dists[k][1];
        const key = i < j ? `${i}_${j}` : `${j}_${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push([i, j]);
      }
    }
    const lpos = new Float32Array(edges.length * 6);
    const lrnd = new Float32Array(edges.length * 2);
    edges.forEach(([a, b], e) => {
      lpos.set(pts[a], e * 6);
      lpos.set(pts[b], e * 6 + 3);
      lrnd[e * 2] = nrnd[a]; lrnd[e * 2 + 1] = nrnd[b];
    });
    const lg = new BufferGeometry();
    lg.setAttribute('position', new Float32BufferAttribute(lpos, 3));
    lg.setAttribute('aRandom', new Float32BufferAttribute(lrnd, 1));
    const lm = new ShaderMaterial({
      uniforms: { ...shared, uColor: { value: lime } },
      vertexShader: lineVert, fragmentShader: lineFrag,
      transparent: true, depthWrite: false, blending: AdditiveBlending,
    });
    const lineSeg = new LineSegments(lg, lm);

    return { nodePoints, lineSeg };
  }

  function clearScene() {
    [cloud, nodes, lines].forEach(o => {
      if (!o) return;
      scene.remove(o);
      o.geometry.dispose();
      o.material.dispose();
    });
  }

  function rebuild() {
    clearScene();
    viewExtent();
    cloud = buildCloud();
    const g = buildGraph();
    nodes = g.nodePoints;
    lines = g.lineSeg;
    scene.add(lines, cloud, nodes);
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    rebuild();
  }

  function render() {
    const dt = Math.min(clock.getDelta(), 0.05);
    shared.uTime.value += dt;
    // smooth mouse + scroll
    uMouse.x += (mouseTarget.x - uMouse.x) * 0.06;
    uMouse.y += (mouseTarget.y - uMouse.y) * 0.06;
    scroll += (scrollTarget - scroll) * 0.06;
    shared.uScroll.value = scroll;
    // subtle scroll-driven camera dolly + drift
    camera.position.z = CAM_Z + scroll * 2.2;
    camera.position.x = uMouse.x * 0.06;
    camera.position.y = uMouse.y * 0.06;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    render();
    rafBound = requestAnimationFrame(loop);
  }

  function onPointer(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -((e.clientY / window.innerHeight) * 2 - 1);
    mouseTarget.set(nx * halfW, ny * halfH);
  }

  function onLost(e) {
    e.preventDefault();
    running = false;
    onContextLost && onContextLost();
  }

  // ---- public API ----
  const api = {
    start() {
      if (running) return;
      running = true;
      clock.getDelta();
      loop();
    },
    stop() {
      running = false;
      if (rafBound) cancelAnimationFrame(rafBound);
    },
    setScroll(v) { scrollTarget = v; },
    resize,
    dispose() {
      api.stop();
      clearScene();
      renderer.dispose();
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onLost);
    },
  };

  // init
  viewExtent();
  resize();
  window.addEventListener('pointermove', onPointer, { passive: true });
  canvas.addEventListener('webglcontextlost', onLost, false);

  return api;
}
