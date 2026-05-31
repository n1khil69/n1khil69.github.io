/* =============================================================
   L'Atelier de Fleurs — Botanical Illustration System
   One shared SVG petal language → eight blooms + foliage.
   Fine ink line-work over soft, layered watercolor fills.
   ============================================================= */
(function () {
  "use strict";

  // ---- shared palette of dusty, low-chroma flower tints -------------------
  // each: soft (wash), mid (deeper wash), line (ink in same family)
  const TINT = {
    rose:      { soft: "#E3B7B0", mid: "#CE948C", line: "#7E4C46" },
    blush:     { soft: "#EBC9C8", mid: "#DBA9A8", line: "#9A6463" },
    cream:     { soft: "#EEE2C9", mid: "#E2CFA6", line: "#8C7A4E" },
    butter:    { soft: "#E8D193", mid: "#D7B968", line: "#8E7333" },
    lilac:     { soft: "#C9BBD2", mid: "#AE9CBC", line: "#5F5170" },
    lavender:  { soft: "#B9AAC9", mid: "#9C8AB0", line: "#574a68" },
    terracotta:{ soft: "#D98E6F", mid: "#C56F4C", line: "#7E3F28" },
    poppy:     { soft: "#CE6A4F", mid: "#B5482F", line: "#6E2D1c" },
    sage:      { soft: "#AEB694", mid: "#8E9870", line: "#535B3D" },
    white:     { soft: "#F2EBDB", mid: "#E4D9C0", line: "#8a8068" },
  };
  const STEM  = { soft: "#A6AE86", mid: "#828C5F", line: "#525a39" };
  const DARK  = "#27231d"; // anther / center ink

  // optional per-render colour override. when set (to a TINT family object),
  // bloom petals/centres are recoloured to that family while stems stay green.
  let ACTIVE = null;
  const fam = (t) => ACTIVE || t;

  let UID = 0;

  // ---- low-level helpers --------------------------------------------------
  // a single teardrop petal whose base sits `r0` out from (cx,cy), pointing up
  function petalPath(cx, cy, len, wid, bow, r0) {
    bow = bow == null ? 0.55 : bow;
    r0 = r0 || 0;
    const baseY = cy - r0;
    const tipY = baseY - len;
    return `M${cx},${baseY} C${cx - wid},${baseY - len * 0.42} ${cx - wid * bow},${tipY} ${cx},${tipY} ` +
           `C${cx + wid * bow},${tipY} ${cx + wid},${baseY - len * 0.42} ${cx},${baseY}Z`;
  }

  // build a ring of petals; pushes to fills[] and lines[]
  function ring(fills, lines, cx, cy, n, len, wid, t, off, bow, idx, r0) {
    off = off || 0;
    r0 = r0 || 0;
    t = fam(t);
    for (let i = 0; i < n; i++) {
      const a = off + (360 / n) * i;
      const dF = petalPath(cx, cy, len * 1.06, wid * 1.12, bow, r0); // wash sits a touch larger
      const dL = petalPath(cx, cy, len, wid, bow, r0);
      fills.push(`<path class="wc wc-soft" style="--o:.56;--i:${idx.v}" fill="${t.soft}" d="${dF}" transform="rotate(${a} ${cx} ${cy})"/>`);
      fills.push(`<path class="wc wc-core" style="--o:.42;--i:${idx.v}" fill="${t.mid}" d="${petalPath(cx, cy, len * 0.7, wid * 0.74, bow, r0)}" transform="rotate(${a} ${cx} ${cy})"/>`);
      lines.push(`<path class="ink" style="--i:${idx.v}" d="${dL}" transform="rotate(${a} ${cx} ${cy})"/>`);
      // a single vein — only on the larger outer petals so centers stay clean
      if (len > 26) {
        lines.push(`<path class="ink vein" style="--i:${idx.v}" d="M${cx},${cy - r0 - len * 0.18} L${cx},${cy - r0 - len * 0.74}" transform="rotate(${a} ${cx} ${cy})"/>`);
      }
      idx.v++;
    }
  }

  function softCenter(fills, cx, cy, r, t, idx) {
    fills.push(`<circle class="wc" style="--o:.7;--i:${idx.v}" cx="${cx}" cy="${cy}" r="${r}" fill="${fam(t).mid}"/>`);
  }

  // generic curved stem + a couple of leaves, drawn from bloom base to (bx,by)
  function stem(fills, lines, topX, topY, bx, by, leafSide, idx) {
    const midX = (topX + bx) / 2 + (leafSide || 6);
    const d = `M${topX},${topY} Q${midX},${(topY + by) / 2} ${bx},${by}`;
    lines.push(`<path class="ink stem" style="--i:${idx.v}" d="${d}"/>`); idx.v++;
    // two leaves
    const ly1 = topY + (by - topY) * 0.42, ly2 = topY + (by - topY) * 0.7;
    const lx1 = midX + 2, lx2 = midX + 6;
    function leaf(x, y, dir, ln, wd, ii) {
      const ex = x + dir * wd, ey = y - ln;
      const c1x = x + dir * wd * 1.4, c1y = y - ln * 0.2;
      const c2x = x + dir * wd * 0.3, c2y = y - ln * 0.95;
      const dF = `M${x},${y} C${c1x},${c1y} ${ex + dir * 3},${ey} ${ex},${ey} C${ex - dir * 6},${ey + ln * 0.3} ${c2x},${c2y} ${x},${y}Z`;
      fills.push(`<path class="wc" style="--o:.5;--i:${ii}" fill="${STEM.soft}" d="${dF}"/>`);
      lines.push(`<path class="ink" style="--i:${ii}" d="${dF}"/>`);
      lines.push(`<path class="ink vein" style="--i:${ii}" d="M${x},${y} ${ex * 0.45 + x * 0.55},${(ey + y) / 2} ${ex},${ey}" fill="none"/>`);
    }
    leaf(lx1, ly1,  1, 30, 13, idx.v); idx.v++;
    leaf(lx2, ly2, -1, 26, 11, idx.v); idx.v++;
  }

  // =========================================================================
  // FLOWER DEFINITIONS
  // each draw fn fills `fills` (wash, drawn first) and `lines` (ink, on top)
  // bloom centered near (100, 92); stem base at (100, 300)
  // =========================================================================
  const cx = 100, cy = 96, baseY = 300;

  const DRAW = {
    rose(f, l, i) {
      stem(f, l, cx, cy + 30, cx, baseY, 7, i);
      ring(f, l, cx, cy, 8, 46, 26, TINT.rose, 0,   0.6, i, 14);
      ring(f, l, cx, cy, 6, 36, 22, TINT.rose, 24,  0.62, i, 10);
      ring(f, l, cx, cy, 5, 27, 18, TINT.rose, 48,  0.65, i, 6);
      // tight spiral heart
      ring(f, l, cx, cy, 3, 17, 13, TINT.rose, 70,  0.8, i, 2);
      softCenter(f, cx, cy, 6, TINT.rose, i);
    },
    ranunculus(f, l, i) {
      stem(f, l, cx, cy + 26, cx, baseY, 6, i);
      ring(f, l, cx, cy, 11, 31, 17, TINT.blush, 0,  0.85, i, 8);
      ring(f, l, cx, cy, 9,  24, 15, TINT.blush, 16, 0.88, i, 5);
      ring(f, l, cx, cy, 7,  17, 13, TINT.blush, 30, 0.9, i, 3);
      ring(f, l, cx, cy, 5,  11, 10, TINT.cream, 44, 0.95, i, 1);
      softCenter(f, cx, cy, 5, TINT.sage, i);
    },
    peony(f, l, i) {
      stem(f, l, cx, cy + 34, cx, baseY, 8, i);
      ring(f, l, cx, cy, 9, 54, 35, TINT.blush, 0,   0.5, i, 16);
      ring(f, l, cx, cy, 8, 42, 29, TINT.blush, 20,  0.55, i, 12);
      ring(f, l, cx, cy, 7, 31, 23, TINT.rose,  36,  0.62, i, 8);
      ring(f, l, cx, cy, 6, 21, 17, TINT.rose,  52,  0.72, i, 4);
      ring(f, l, cx, cy, 4, 12, 12, TINT.cream, 70,  0.9, i, 1);
      softCenter(f, cx, cy, 5, TINT.butter, i);
    },
    anemone(f, l, i) {
      stem(f, l, cx, cy + 30, cx, baseY, 5, i);
      ring(f, l, cx, cy, 8, 46, 25, TINT.white, 0, 0.58, i, 16);
      // big dark center + stamens
      f.push(`<circle class="wc" style="--o:.92;--i:${i.v}" cx="${cx}" cy="${cy}" r="17" fill="${DARK}"/>`);
      f.push(`<circle class="wc" style="--o:.85;--i:${i.v}" cx="${cx}" cy="${cy}" r="9" fill="#3c352b"/>`);
      for (let s = 0; s < 14; s++) {
        const a = (360 / 14) * s, rad = a * Math.PI / 180;
        const x2 = cx + Math.sin(rad) * 24, y2 = cy - Math.cos(rad) * 24;
        l.push(`<path class="ink fil" style="--i:${i.v}" d="M${cx + Math.sin(rad) * 15},${cy - Math.cos(rad) * 15} L${x2},${y2}"/>`);
        l.push(`<circle class="dot" cx="${x2}" cy="${y2}" r="1.7" fill="${DARK}" style="--i:${i.v}"/>`);
      }
      i.v++;
    },
    tulip(f, l, i) {
      // goblet — bespoke cupped petals
      stem(f, l, cx, cy + 6, cx, baseY, 4, i);
      const tl = fam(TINT.lilac), tv = fam(TINT.lavender);
      const top = cy - 44, bot = cy + 14;
      // back petals
      f.push(`<path class="wc" style="--o:.55;--i:${i.v}" fill="${tl.soft}" d="M${cx - 30},${bot} C${cx - 40},${top + 8} ${cx - 22},${top - 14} ${cx - 8},${top} L${cx - 8},${bot}Z"/>`);
      f.push(`<path class="wc" style="--o:.55;--i:${i.v}" fill="${tl.soft}" d="M${cx + 30},${bot} C${cx + 40},${top + 8} ${cx + 22},${top - 14} ${cx + 8},${top} L${cx + 8},${bot}Z"/>`);
      l.push(`<path class="ink" style="--i:${i.v}" d="M${cx - 30},${bot} C${cx - 40},${top + 8} ${cx - 22},${top - 14} ${cx - 8},${top}"/>`);
      l.push(`<path class="ink" style="--i:${i.v}" d="M${cx + 30},${bot} C${cx + 40},${top + 8} ${cx + 22},${top - 14} ${cx + 8},${top}"/>`);
      i.v++;
      // front cup
      const cup = `M${cx - 30},${bot} C${cx - 30},${top + 18} ${cx - 14},${top} ${cx},${top} C${cx + 14},${top} ${cx + 30},${top + 18} ${cx + 30},${bot} C${cx + 18},${bot + 14} ${cx - 18},${bot + 14} ${cx - 30},${bot}Z`;
      f.push(`<path class="wc" style="--o:.66;--i:${i.v}" fill="${tl.mid}" d="${cup}"/>`);
      f.push(`<path class="wc" style="--o:.5;--i:${i.v}" fill="${tv.mid}" d="M${cx - 12},${bot} C${cx - 12},${top + 22} ${cx},${top + 6} ${cx},${top + 6} C${cx},${top + 6} ${cx + 12},${top + 22} ${cx + 12},${bot} C${cx + 5},${bot + 8} ${cx - 5},${bot + 8} ${cx - 12},${bot}Z"/>`);
      l.push(`<path class="ink" style="--i:${i.v}" d="${cup}"/>`);
      l.push(`<path class="ink vein" style="--i:${i.v}" d="M${cx - 11},${top + 4} C${cx - 12},${top + 24} ${cx - 12},${bot - 6} ${cx - 8},${bot}"/>`);
      l.push(`<path class="ink vein" style="--i:${i.v}" d="M${cx + 11},${top + 4} C${cx + 12},${top + 24} ${cx + 12},${bot - 6} ${cx + 8},${bot}"/>`);
      i.v++;
    },
    poppy(f, l, i) {
      stem(f, l, cx, cy + 6, cx, baseY, 5, i);
      // 4 broad crinkled petals
      const t = fam(TINT.poppy);
      const pet = [[-1, -0.15], [1, -0.15], [-0.5, -1], [0.5, -1]];
      const dd = [
        `M${cx},${cy} C${cx - 56},${cy - 6} ${cx - 50},${cy - 46} ${cx - 6},${cy - 40} C${cx - 2},${cy - 22} ${cx - 2},${cy - 8} ${cx},${cy}Z`,
        `M${cx},${cy} C${cx + 56},${cy - 6} ${cx + 50},${cy - 46} ${cx + 6},${cy - 40} C${cx + 2},${cy - 22} ${cx + 2},${cy - 8} ${cx},${cy}Z`,
        `M${cx},${cy} C${cx - 30},${cy - 54} ${cx - 8},${cy - 56} ${cx - 2},${cy - 16} C${cx - 6},${cy - 8} ${cx - 4},${cy - 4} ${cx},${cy}Z`,
        `M${cx},${cy} C${cx + 30},${cy - 54} ${cx + 8},${cy - 56} ${cx + 2},${cy - 16} C${cx + 6},${cy - 8} ${cx + 4},${cy - 4} ${cx},${cy}Z`,
      ];
      dd.forEach((d) => {
        f.push(`<path class="wc" style="--o:.62;--i:${i.v}" fill="${t.soft}" d="${d}"/>`);
        f.push(`<path class="wc" style="--o:.5;--i:${i.v}" fill="${t.mid}" d="${d}" transform="scale(.72) translate(${cx * 0.39} ${cy * 0.39})"/>`);
        l.push(`<path class="ink" style="--i:${i.v}" d="${d}"/>`);
      });
      f.push(`<circle class="wc" style="--o:.95;--i:${i.v}" cx="${cx}" cy="${cy - 6}" r="11" fill="${DARK}"/>`);
      for (let s = 0; s < 12; s++) {
        const a = (360 / 12) * s * Math.PI / 180;
        l.push(`<circle class="dot" cx="${cx + Math.sin(a) * 16}" cy="${cy - 6 - Math.cos(a) * 16}" r="1.6" fill="${DARK}" style="--i:${i.v}"/>`);
      }
      i.v++;
    },
    sweetpea(f, l, i) {
      stem(f, l, cx, cy + 40, cx, baseY, 9, i);
      // cluster of bonnet blooms
      const t = fam(TINT.lilac);
      const spots = [[cx - 18, cy - 6, 1], [cx + 16, cy + 8, 0.9], [cx - 2, cy - 30, 0.85], [cx + 22, cy - 18, 0.8]];
      spots.forEach(([x, y, s]) => {
        const w = 30 * s, h = 24 * s;
        // back fan
        f.push(`<path class="wc" style="--o:.55;--i:${i.v}" fill="${t.soft}" d="M${x - w},${y} C${x - w},${y - h * 1.3} ${x + w},${y - h * 1.3} ${x + w},${y} C${x + w * 0.5},${y + h * 0.4} ${x - w * 0.5},${y + h * 0.4} ${x - w},${y}Z"/>`);
        // front bonnet
        f.push(`<path class="wc" style="--o:.62;--i:${i.v}" fill="${t.mid}" d="M${x - w * 0.6},${y + 2} C${x - w * 0.6},${y - h * 0.7} ${x + w * 0.6},${y - h * 0.7} ${x + w * 0.6},${y + 2} C${x + w * 0.3},${y + h * 0.5} ${x - w * 0.3},${y + h * 0.5} ${x - w * 0.6},${y + 2}Z"/>`);
        l.push(`<path class="ink" style="--i:${i.v}" d="M${x - w},${y} C${x - w},${y - h * 1.3} ${x + w},${y - h * 1.3} ${x + w},${y} C${x + w * 0.5},${y + h * 0.4} ${x - w * 0.5},${y + h * 0.4} ${x - w},${y}Z"/>`);
        l.push(`<path class="ink vein" style="--i:${i.v}" d="M${x - w * 0.6},${y + 2} C${x - w * 0.6},${y - h * 0.7} ${x + w * 0.6},${y - h * 0.7} ${x + w * 0.6},${y + 2}"/>`);
        i.v++;
      });
    },
    lavender(f, l, i) {
      // tall sage spike with a tapering cluster of florets
      l.push(`<path class="ink stem" style="--i:${i.v}" d="M${cx},${cy - 58} Q${cx + 4},${(cy - 58 + baseY) / 2} ${cx},${baseY}"/>`); i.v++;
      const t = fam(TINT.lavender);
      const topY = cy - 56;
      for (let r = 0; r < 11; r++) {
        const tt = r / 10;                 // 0 at tip → 1 at base
        const spread = 3 + tt * 13;        // widens toward the base = spike taper
        const fy = topY + r * 9;
        // 2–3 florets per tier, jittered around the axis
        const cols = r < 2 ? 1 : (r < 6 ? 2 : 3);
        for (let c = 0; c < cols; c++) {
          const fx = cx + (cols === 1 ? 0 : (c / (cols - 1) - 0.5) * 2 * spread);
          const rot = (fx - cx) * 2.2;
          f.push(`<ellipse class="wc" style="--o:.62;--i:${i.v}" cx="${fx}" cy="${fy}" rx="6.5" ry="9" fill="${t.soft}" transform="rotate(${rot} ${fx} ${fy})"/>`);
          f.push(`<ellipse class="wc" style="--o:.55;--i:${i.v}" cx="${fx}" cy="${fy - 1}" rx="3" ry="5" fill="${t.mid}" transform="rotate(${rot} ${fx} ${fy})"/>`);
          l.push(`<path class="ink fil" style="--i:${i.v}" d="M${fx},${fy + 7} Q${fx - 5},${fy} ${fx},${fy - 8} Q${fx + 5},${fy} ${fx},${fy + 7}Z" transform="rotate(${rot} ${fx} ${fy})"/>`);
        }
        i.v++;
      }
      // slim base leaves
      l.push(`<path class="ink" style="--i:${i.v}" d="M${cx},${baseY - 80} C${cx - 17},${baseY - 66} ${cx - 19},${baseY - 32} ${cx - 4},${baseY - 26}"/>`);
      l.push(`<path class="ink" style="--i:${i.v}" d="M${cx},${baseY - 66} C${cx + 17},${baseY - 54} ${cx + 19},${baseY - 24} ${cx + 4},${baseY - 20}"/>`);
      i.v++;
    },
    // ---- foliage ----------------------------------------------------------
    eucalyptus(f, l, i) {
      const d = `M${cx},${cy - 50} Q${cx - 8},${(cy - 50 + baseY) / 2} ${cx},${baseY}`;
      l.push(`<path class="ink stem" style="--i:${i.v}" d="${d}"/>`); i.v++;
      let yy = cy - 44;
      for (let r = 0; r < 9; r++) {
        for (const dir of [-1, 1]) {
          const off = Math.sin(yy / 30) * 6;
          const lx = cx + off, ly = yy;
          const rx = lx + dir * 17;
          f.push(`<ellipse class="wc" style="--o:.55;--i:${i.v}" cx="${(lx + rx) / 2}" cy="${ly}" rx="12" ry="9" fill="${STEM.soft}"/>`);
          l.push(`<ellipse class="ink" style="--i:${i.v}" cx="${(lx + rx) / 2}" cy="${ly}" rx="12" ry="9"/>`);
        }
        yy += 26;
        i.v++;
      }
    },
    fern(f, l, i) {
      const d = `M${cx},${cy - 54} Q${cx + 10},${(cy + baseY) / 2} ${cx},${baseY}`;
      l.push(`<path class="ink stem" style="--i:${i.v}" d="${d}"/>`); i.v++;
      let yy = cy - 48;
      for (let r = 0; r < 11; r++) {
        const len = 30 - r * 1.6;
        for (const dir of [-1, 1]) {
          const x = cx, y = yy;
          const ex = x + dir * len, ey = y - 6;
          f.push(`<path class="wc" style="--o:.5;--i:${i.v}" fill="${STEM.soft}" d="M${x},${y} Q${x + dir * len * 0.5},${y - 14} ${ex},${ey} Q${x + dir * len * 0.5},${y + 2} ${x},${y}Z"/>`);
          l.push(`<path class="ink" style="--i:${i.v}" d="M${x},${y} Q${x + dir * len * 0.5},${y - 14} ${ex},${ey} Q${x + dir * len * 0.5},${y + 2} ${x},${y}Z"/>`);
        }
        yy += 20;
        i.v++;
      }
    },
  };

  // ---- flower metadata ----------------------------------------------------
  const META = {
    rose:       { name: "Garden Rose",  latin: "Rosa centifolia",   word: "Amour",        color: "rose",   season: "Summer", mood: "Romantic", meaning: "Love & devotion", note: "The hundred-petalled rose — chosen when words run short. We grow ours blowsy and a little undone." },
    ranunculus: { name: "Ranunculus",   latin: "Ranunculus asiaticus", word: "Charme",    color: "blush",  season: "Spring", mood: "Tender",   meaning: "Radiant charm", note: "Layer upon paper-thin layer. A bloom that rewards the patient eye, like a compliment quietly given." },
    peony:      { name: "Peony",        latin: "Paeonia lactiflora", word: "Abondance",   color: "blush",  season: "Spring", mood: "Lavish",   meaning: "Prosperity & honour", note: "Extravagance with manners. The peony opens slowly, then all at once, as the best things tend to." },
    anemone:    { name: "Anemone",      latin: "Anemone coronaria", word: "Attente",      color: "white",  season: "Winter", mood: "Striking", meaning: "Anticipation", note: "A dark heart ringed in light. The flower of the held breath, of the moment just before." },
    tulip:      { name: "Tulip",        latin: "Tulipa gesneriana", word: "Tendresse",    color: "lilac",  season: "Spring", mood: "Calm",     meaning: "Perfect love", note: "Quiet and upright. The tulip keeps growing after cutting, reaching always toward the light." },
    poppy:      { name: "Poppy",        latin: "Papaver rhoeas",    word: "Mémoire",      color: "poppy",  season: "Summer", mood: "Striking", meaning: "Remembrance & rest", note: "Crushed silk and a coal-dark eye. Fleeting by nature — which is rather the point." },
    sweetpea:   { name: "Sweet Pea",    latin: "Lathyrus odoratus", word: "Adieu doux",   color: "lilac",  season: "Spring", mood: "Tender",   meaning: "A gentle goodbye", note: "Scent before sight. We tuck it in to soften an edge and to perfume the whole arrangement." },
    lavender:   { name: "Lavender",     latin: "Lavandula",         word: "Dévotion",     color: "lavender", season: "Summer", mood: "Calm",    meaning: "Devotion & stillness", note: "Cut from the hillside at dusk. It dries beautifully — a bouquet that outlasts the occasion." },
  };

  const FOLIAGE = {
    eucalyptus: { name: "Eucalyptus", latin: "Eucalyptus cinerea", word: "Protection", color: "sage", season: "All", mood: "Calm", meaning: "Protection", note: "Silver-blue and resinous. The quiet structure every bouquet is built around." },
    fern:       { name: "Fern",       latin: "Adiantum",           word: "Sincérité",  color: "sage", season: "All", mood: "Calm", meaning: "Sincerity", note: "Soft architecture. We let it spill where the eye needs somewhere to rest." },
  };

  // ---- public builder -----------------------------------------------------
  // opts: { stem:true, w, h, anim:true }  → returns full <svg> string
  function build(id, opts) {
    opts = opts || {};
    const draw = DRAW[id];
    if (!draw) return "";
    const fills = [], lines = [], idx = { v: 0 };
    const drawStem = opts.stem !== false;
    if (drawStem) {
      draw(fills, lines, idx);
    } else {
      // bloom only: temporarily neuter stem fn calls by drawing then trimming?
      // simpler: draw fully (stem is cheap) — callers that hide stem clip via viewBox
      draw(fills, lines, idx);
    }
    const vb = opts.stem === false ? "32 8 136 150" : "10 0 180 312";
    const w = opts.w || 200, h = opts.h || (opts.stem === false ? 220 : 340);
    const cls = "flora" + (opts.anim ? " anim" : "");
    const linesStr = lines.join("").replace(/class="ink/g, 'pathLength="1" class="ink');
    return `<svg class="${cls}" viewBox="${vb}" width="${w}" height="${h}" ` +
      `preserveAspectRatio="xMidYMid meet" aria-hidden="true" data-flower="${id}">` +
      `<g class="wash">${fills.join("")}</g><g class="lines">${linesStr}</g></svg>`;
  }

  // bloom-only group for the bouquet canvas, drawn around tie origin (0,0).
  // returns an <g> placed so the stem base sits at (0,0), bloom up at -stemLen
  function bouquetStem(id, scale) {
    const draw = DRAW[id];
    if (!draw) return "";
    const fills = [], lines = [], idx = { v: 0 };
    draw(fills, lines, idx);
    // local: bloom ~ (100,96), base (100,300). shift so base→origin.
    const s = scale || 1;
    const linesStr = lines.join("").replace(/class="ink/g, 'pathLength="1" class="ink');
    return `<g transform="translate(${-cx * s} ${-baseY * s}) scale(${s})">` +
      `<g class="wash">${fills.join("")}</g><g class="lines">${linesStr}</g></g>`;
  }

  // raw artwork (no <svg> wrapper, no transform) in local coords for placing
  // freely on the studio canvas. Drawing spans ~ x10..190, y0..312; centre ~ (100,156).
  function art(id, opts) {
    const draw = DRAW[id];
    if (!draw) return "";
    opts = opts || {};
    ACTIVE = (opts.tint && TINT[opts.tint]) || null;
    const fills = [], lines = [], idx = { v: 0 };
    try { draw(fills, lines, idx); } finally { ACTIVE = null; }
    const linesStr = lines.join("").replace(/class="ink/g, 'pathLength="1" class="ink');
    return `<g class="wash">${fills.join("")}</g><g class="lines">${linesStr}</g>`;
  }

  window.Flora = {
    build,
    bouquetStem,
    art,
    center: { x: 100, y: 156 },
    meta: META,
    foliage: FOLIAGE,
    ids: Object.keys(META),
    foliageIds: Object.keys(FOLIAGE),
    tint: TINT,
    tintKeys: Object.keys(TINT),
  };
})();
