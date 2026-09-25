/**
 * A small Canvas2D identity sculpture. All geometry is generated locally; the
 * scene is decorative, never intercepts gestures, and requires no WebGL.
 */
const instances = new WeakMap();
const TAU = Math.PI * 2;

export function initIdentityArt(canvas) {
  if (!canvas?.getContext) return () => {};
  instances.get(canvas)?.();

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');
  const host = canvas.closest('.hero') || canvas.parentElement || canvas;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let width = 0;
  let height = 0;
  let radius = 0;
  let compact = false;
  let reduced = motion.matches;
  let visible = true;
  let disposed = false;
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let points = [];
  let wires = [];

  // Reused projection buffers avoid allocating thousands of objects per frame.
  const projected = new Float32Array(6);
  const shades = Array.from({ length: 14 }, () => []);
  const wireShades = Array.from({ length: 4 }, () => []);
  const rings = [makeOrbit(1.34, -0.68, 0.26), makeOrbit(1.19, 0.83, -0.46)];
  const satellites = [0.9, 3.5];
  const stars = makeStars();

  function buildGeometry() {
    points = [];
    wires = [];
    const rows = compact ? 35 : 47;
    const columns = compact ? 78 : 104;
    for (let row = 1; row < rows; row += 1) {
      const latitude = (row / rows) * Math.PI;
      const y = Math.cos(latitude);
      const ringRadius = Math.sin(latitude);
      const count = Math.max(12, Math.round(columns * ringRadius));
      for (let column = 0; column < count; column += 1) {
        const angle = (column / count) * TAU + (row % 2) * 0.024;
        const modulation = 0.78 + 0.22 * Math.sin(angle * 3 + latitude * 7) ** 2;
        points.push(ringRadius * Math.cos(angle), y, ringRadius * Math.sin(angle), modulation);
      }
    }

    const steps = compact ? 64 : 88;
    for (let latitude = -60; latitude <= 60; latitude += 15) {
      const phi = (latitude * Math.PI) / 180;
      const ringRadius = Math.cos(phi);
      const y = Math.sin(phi);
      for (let step = 0; step < steps; step += 1) {
        const a = (step / steps) * TAU;
        const b = ((step + 1) / steps) * TAU;
        wires.push(ringRadius * Math.cos(a), y, ringRadius * Math.sin(a),
          ringRadius * Math.cos(b), y, ringRadius * Math.sin(b));
      }
    }
    for (let meridian = 0; meridian < 10; meridian += 1) {
      const longitude = (meridian / 10) * Math.PI;
      for (let step = 0; step < steps; step += 1) {
        const a = (step / steps) * TAU;
        const b = ((step + 1) / steps) * TAU;
        wires.push(Math.cos(a) * Math.cos(longitude), Math.sin(a), Math.cos(a) * Math.sin(longitude),
          Math.cos(b) * Math.cos(longitude), Math.sin(b), Math.cos(b) * Math.sin(longitude));
      }
    }
    points = new Float32Array(points);
    wires = new Float32Array(wires);
  }

  function draw() {
    if (!width || !height || disposed) return;
    ctx.clearRect(0, 0, width, height);

    const rotation = elapsed * 0.000065 + 0.52 + pointer.x * 0.32;
    const tilt = -0.22 + pointer.y * 0.19;
    const cy = Math.cos(rotation);
    const sy = Math.sin(rotation);
    const cx = Math.cos(tilt);
    const sx = Math.sin(tilt);
    const cz = Math.cos(-0.23);
    const sz = Math.sin(-0.23);
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    function project(x, y, z, offset = 0) {
      const rx = x * cy + z * sy;
      const rz = z * cy - x * sy;
      const ry = y * cx - rz * sx;
      const depth = rz * cx + y * sx;
      const perspective = 4.8 / (4.8 - depth);
      projected[offset] = centerX + (rx * cz - ry * sz) * radius * perspective;
      projected[offset + 1] = centerY + (rx * sz + ry * cz) * radius * perspective;
      projected[offset + 2] = depth;
    }

    // A sparse, fixed constellation frames the denser geometry without bloom.
    ctx.lineWidth = 0.6;
    for (let i = 0; i < stars.length; i += 3) {
      const x = centerX + stars[i] * radius;
      const y = centerY + stars[i + 1] * radius;
      const size = stars[i + 2];
      ctx.fillStyle = `rgba(255,255,255,${size > 1 ? 0.42 : 0.2})`;
      ctx.fillRect(x, y, size, size);
      if (i % 21 === 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.14)';
        ctx.beginPath();
        ctx.moveTo(x - 4, y + size * 0.5);
        ctx.lineTo(x + 4 + size, y + size * 0.5);
        ctx.moveTo(x + size * 0.5, y - 4);
        ctx.lineTo(x + size * 0.5, y + 4 + size);
        ctx.stroke();
      }
    }

    function drawOrbits(front) {
      rings.forEach((ring, ringIndex) => {
        ctx.beginPath();
        for (let index = 0; index < ring.length - 3; index += 3) {
          project(ring[index], ring[index + 1], ring[index + 2]);
          project(ring[index + 3], ring[index + 4], ring[index + 5], 3);
          if ((projected[2] + projected[5] > 0) !== front) continue;
          ctx.moveTo(projected[0], projected[1]);
          ctx.lineTo(projected[3], projected[4]);
        }
        ctx.strokeStyle = `rgba(255,255,255,${front ? (ringIndex ? 0.28 : 0.52) : 0.12})`;
        ctx.lineWidth = ringIndex ? 0.65 : 0.8;
        ctx.stroke();
      });
    }

    drawOrbits(false);

    // Bucket the fine surface grid by depth so only four stroke calls are used.
    for (const bucket of wireShades) bucket.length = 0;
    for (let i = 0; i < wires.length; i += 6) {
      project(wires[i], wires[i + 1], wires[i + 2]);
      project(wires[i + 3], wires[i + 4], wires[i + 5], 3);
      const depth = (projected[2] + projected[5]) * 0.5;
      const bucket = Math.min(3, Math.max(0, Math.floor((depth + 1) * 2)));
      wireShades[bucket].push(projected[0], projected[1], projected[3], projected[4]);
    }
    wireShades.forEach((segments, index) => {
      ctx.beginPath();
      for (let i = 0; i < segments.length; i += 4) {
        ctx.moveTo(segments[i], segments[i + 1]);
        ctx.lineTo(segments[i + 2], segments[i + 3]);
      }
      ctx.strokeStyle = `rgba(255,255,255,${[0.025, 0.045, 0.085, 0.17][index]})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    for (const bucket of shades) bucket.length = 0;
    for (let i = 0; i < points.length; i += 4) {
      project(points[i], points[i + 1], points[i + 2]);
      const depth = (projected[2] + 1) * 0.5;
      const brightness = (0.13 + depth * 0.87) * points[i + 3];
      const bucket = Math.min(13, Math.max(0, Math.floor(brightness * 13)));
      shades[bucket].push(projected[0], projected[1]);
    }

    const pointScale = Math.max(0.65, Math.min(1, radius / 205));
    shades.forEach((dots, index) => {
      const dotRadius = (0.55 + (index / 13) * 0.48) * pointScale;
      ctx.beginPath();
      for (let i = 0; i < dots.length; i += 2) {
        ctx.moveTo(dots[i] + dotRadius, dots[i + 1]);
        ctx.arc(dots[i], dots[i + 1], dotRadius, 0, TAU);
      }
      ctx.fillStyle = `rgba(255,255,255,${0.08 + (index / 13) * 0.85})`;
      ctx.fill();
    });

    drawOrbits(true);

    // Small nodes travel on the actual orbits; their larger outline stays sharp.
    rings.forEach((ring, index) => {
      const phase = satellites[index] + elapsed * (index ? -0.0001 : 0.00012);
      const position = ((phase % TAU + TAU) % TAU) / TAU * 160;
      const step = Math.floor(position) * 3;
      const blend = position % 1;
      project(
        ring[step] + (ring[step + 3] - ring[step]) * blend,
        ring[step + 1] + (ring[step + 4] - ring[step + 1]) * blend,
        ring[step + 2] + (ring[step + 5] - ring[step + 2]) * blend,
      );
      const front = projected[2] > 0;
      ctx.beginPath();
      ctx.arc(projected[0], projected[1], compact ? 2 : 2.6, 0, TAU);
      ctx.fillStyle = `rgba(255,255,255,${front ? 0.95 : 0.36})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(projected[0], projected[1], compact ? 5 : 7, 0, TAU);
      ctx.strokeStyle = `rgba(255,255,255,${front ? 0.3 : 0.1})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    });
  }

  function tick(time) {
    frame = 0;
    if (disposed || reduced || !visible || document.hidden) return;
    const interval = compact || coarse.matches ? 1000 / 30 : 1000 / 60;
    if (!previous) previous = time - interval;
    const delta = time - previous;
    if (delta >= interval - 0.5) {
      elapsed += Math.min(delta, 80);
      previous = time;
      const smoothing = 1 - Math.exp(-Math.min(delta, 80) / 220);
      pointer.x += (pointer.targetX - pointer.x) * smoothing;
      pointer.y += (pointer.targetY - pointer.y) * smoothing;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  function updatePlayback() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (disposed || !visible || document.hidden) return;
    draw();
    if (!reduced) frame = requestAnimationFrame(tick);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.round(rect.width);
    const nextHeight = Math.round(rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (width === nextWidth && height === nextHeight && canvas.width === Math.round(nextWidth * dpr)) return;
    width = nextWidth;
    height = nextHeight;
    const wasCompact = compact;
    compact = width < 480;
    radius = Math.min(width, height) * 0.325;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!points.length || wasCompact !== compact) buildGeometry();
    if (visible && !document.hidden) draw();
  }

  function onPointerMove(event) {
    if (reduced || coarse.matches || event.pointerType === 'touch' || !visible) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.targetX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    pointer.targetY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
  }

  function resetPointer() {
    pointer.targetX = 0;
    pointer.targetY = 0;
  }

  function onMotionChange() {
    reduced = motion.matches;
    resetPointer();
    pointer.x = 0;
    pointer.y = 0;
    updatePlayback();
  }

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  const intersectionObserver = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    }, { threshold: 0 })
    : null;

  resizeObserver?.observe(canvas);
  intersectionObserver?.observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', updatePlayback);
  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerleave', resetPointer, { passive: true });
  motion.addEventListener('change', onMotionChange);
  resize();
  updatePlayback();

  function cleanup() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', updatePlayback);
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', resetPointer);
    motion.removeEventListener('change', onMotionChange);
    instances.delete(canvas);
  }

  instances.set(canvas, cleanup);
  return cleanup;
}

function makeOrbit(radius, tilt, turn) {
  const points = new Float32Array(161 * 3);
  for (let step = 0; step <= 160; step += 1) {
    const angle = (step / 160) * TAU;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = z * Math.sin(tilt);
    points[step * 3] = x * Math.cos(turn) - y * Math.sin(turn);
    points[step * 3 + 1] = x * Math.sin(turn) + y * Math.cos(turn);
    points[step * 3 + 2] = z * Math.cos(tilt);
  }
  return points;
}

function makeStars() {
  const stars = [];
  for (let index = 0; index < 29; index += 1) {
    const angle = index * 2.399963;
    const radius = 1.25 + ((index * 37) % 19) / 42;
    stars.push(Math.cos(angle) * radius, Math.sin(angle) * radius, index % 4 === 0 ? 1.4 : 0.8);
  }
  return stars;
}
