import "./flowers.js";

/* =============================================================
   L'Atelier de Fleurs — interactions
   A freeform arrangement STUDIO: place, move, rotate, resize,
   layer illustrated flowers, then save as image or send.
   ============================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const metaOf = (id) => Flora.meta[id] || Flora.foliage[id];
  const SVGNS = "http://www.w3.org/2000/svg";

  /* ============================================================
     VESSELS — drawn in the same line+wash language.
     Local coords: centred x=300, mouth ~y556, base ~y712 (centre ~634).
     ============================================================ */
  const VESSELS = [
    { id: "kraft",   name: "Kraft Wrap" },
    { id: "budvase", name: "Bud Vase" },
    { id: "ceramic", name: "Ceramic Vessel" },
    { id: "box",     name: "Signature Box" },
    { id: "ribbon",  name: "Tied Ribbon" },
  ];
  function vesselMarkup(id) {
    const ink = "#2A251D";
    const W = (d, fill, extra) => {
      extra = extra || "";
      const sw = /stroke-width/.test(extra) ? "" : ' stroke-width="1.6"';
      return `<path d="${d}" fill="${fill || "none"}" stroke="${ink}"${sw} stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
    };
    switch (id) {
      case "budvase":
        return `<g>${W("M287,528 L313,528 C313,540 314,552 317,560 C319,604 332,628 330,664 C328,700 315,712 300,712 C285,712 272,700 270,664 C268,628 281,604 283,560 C286,552 287,540 287,528 Z", "#EAE3D4")}<ellipse cx="300" cy="528" rx="13" ry="4" fill="#E0D7C4" stroke="${ink}" stroke-width="1.4"/>${W("M285,600 C292,620 308,620 315,600", "none", 'opacity=".4" stroke-width="1"')}</g>`;
      case "ceramic":
        return `<g>${W("M256,566 C242,612 246,672 268,700 C282,716 318,716 332,700 C354,672 358,612 344,566 C330,576 270,576 256,566", "#E7DECC")}${W("M256,566 C270,578 330,578 344,566", "none", 'stroke-width="1.4"')}${W("M300,590 C300,640 296,672 290,700", "none", 'opacity=".3" stroke-width="1"')}</g>`;
      case "box":
        return `<g>${W("M256,604 L344,604 L338,712 L262,712 Z", "#EDE6D5")}${W("M250,588 L350,588 L344,610 L256,610 Z", "#E2D9C6")}${W("M300,588 L300,712", "none", 'opacity=".35" stroke-width="1"')}${W("M270,572 C282,556 318,556 330,572 C326,560 300,556 300,576 C300,556 274,560 270,572 Z", "#D9CFB8", 'stroke-width="1.3"')}</g>`;
      case "ribbon":
        return `<g>${W("M276,560 C272,600 280,660 292,700 C296,712 304,712 308,700 C320,660 328,600 324,560", "none", 'stroke-width="1.4" opacity=".5"')}${W("M300,612 C288,600 270,604 268,618 C266,632 286,636 300,624 C314,636 334,632 332,618 C330,604 312,600 300,612 Z", "#D9A79E")}<circle cx="300" cy="618" r="5" fill="#C58E84" stroke="${ink}" stroke-width="1.3"/>${W("M300,624 C296,660 290,690 282,712", "none", 'opacity=".5" stroke-width="1.1"')}${W("M300,624 C304,660 310,690 318,712", "none", 'opacity=".5" stroke-width="1.1"')}</g>`;
      case "kraft":
      default:
        return `<g>${W("M252,556 L348,556 L322,712 L278,712 Z", "#E6DBC2")}${W("M252,556 C275,548 325,548 348,556", "none", 'stroke-width="1.4"')}${W("M286,610 L314,610 L308,712 L292,712 Z", "#DCCFAF", 'opacity=".7"')}${W("M270,636 C288,648 312,648 330,636", "none", 'opacity=".45" stroke-width="1.1"')}<circle cx="300" cy="636" r="6" fill="#C9B98F" stroke="${ink}" stroke-width="1.3"/>${W("M300,636 C288,660 280,690 282,712", "none", 'opacity=".5" stroke-width="1"')}${W("M300,636 C312,660 320,690 318,712", "none", 'opacity=".5" stroke-width="1"')}</g>`;
    }
  }
  function vesselForegroundMarkup(id) {
    const ink = "#2A251D";
    const W = (d, fill, extra) => {
      extra = extra || "";
      const sw = /stroke-width/.test(extra) ? "" : ' stroke-width="1.6"';
      return `<path d="${d}" fill="${fill || "none"}" stroke="${ink}"${sw} stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
    };
    switch (id) {
      case "budvase":
        return `<g class="vessel-front">${W("M287,528 L313,528 C313,540 314,552 317,560 C319,604 332,628 330,664 C328,700 315,712 300,712 C285,712 272,700 270,664 C268,628 281,604 283,560 C286,552 287,540 287,528 Z", "#EAE3D4")}<path d="M287,528 C294,532 306,532 313,528" fill="none" stroke="${ink}" stroke-width="1.4"/></g>`;
      case "ceramic":
        return `<g class="vessel-front">${W("M256,566 C242,612 246,672 268,700 C282,716 318,716 332,700 C354,672 358,612 344,566 C326,580 274,580 256,566 Z", "#E7DECC")}<path d="M256,566 C274,580 326,580 344,566" fill="none" stroke="${ink}" stroke-width="1.4"/></g>`;
      case "box":
        return `<g class="vessel-front">${W("M256,604 L344,604 L338,712 L262,712 Z", "#EDE6D5")}<path d="M250,588 L350,588 L344,610 L256,610 Z" fill="#E2D9C6" stroke="${ink}" stroke-width="1.4"/></g>`;
      case "ribbon":
        return `<g class="vessel-front">${W("M276,560 C272,600 280,660 292,700 C296,712 304,712 308,700 C320,660 328,600 324,560 C314,568 286,568 276,560 Z", "#EFE6D5", 'opacity=".94"')}<path d="M276,560 C286,568 314,568 324,560" fill="none" stroke="${ink}" stroke-width="1.3"/><path d="M300,612 C288,600 270,604 268,618 C266,632 286,636 300,624 C314,636 334,632 332,618 C330,604 312,600 300,612 Z" fill="#D9A79E" stroke="${ink}" stroke-width="1.4"/></g>`;
      case "kraft":
      default:
        return `<g class="vessel-front">${W("M252,556 L348,556 L322,712 L278,712 Z", "#E6DBC2")}<path d="M252,556 C275,548 325,548 348,556" fill="none" stroke="${ink}" stroke-width="1.4"/><path d="M286,610 L314,610 L308,712 L292,712 Z" fill="#DCCFAF" opacity=".7"/></g>`;
    }
  }
  function vesselIcon(id) {
    return `<svg viewBox="244 545 112 185" preserveAspectRatio="xMidYMid meet">${vesselMarkup(id)}</svg>`;
  }

  /* ============================================================
     STUDIO STATE
     items: [{uid, type:'flower'|'foliage'|'vessel'|'note', id, x, y, scale, rot, text?, fontSize?}]
     ============================================================ */
  const BACKDROPS = [
    { id: "bone",  bg: "#F6F1E6", label: "Bone" },
    { id: "blush", bg: "#F1E6E2", label: "Blush" },
    { id: "sage",  bg: "#E9ECE0", label: "Sage" },
    { id: "ink",   bg: "#262019", label: "Ink" },
  ];
  let seq = 0;
  const studio = { items: [], backdrop: "bone", sel: null };

  const DEFAULT_SCALE = { flower: 1.45, foliage: 1.55, vessel: 1.95, note: 1 };

  function newItem(type, id, opts = {}) {
    return Object.assign({
      uid: "i" + (seq++), type, id,
      x: 500, y: type === "vessel" ? 720 : 560,
      scale: DEFAULT_SCALE[type] || 1, rot: 0,
      text: type === "note" ? "your note" : undefined,
      fontSize: type === "note" ? 70 : undefined,
    }, opts);
  }

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener("DOMContentLoaded", init);
  function init() {
    setMotionVar();
    buildIntroLayers();
    buildPetals();
    buildFilters();
    buildLibrary();
    buildBackdrops();
    buildStudioPalette();
    buildOccasions();
    buildStoryArt();
    wireDetail();
    wireStudio();
    wireSend();
    wireNav();
    setupObservers();
    setupScroll();
    if (!loadStudio()) loadPreset("just");
    else renderScene();
    $("#hintFlora").innerHTML = Flora.build("ranunculus", { w: 84, h: 116, anim: false });
    $("#closingArt").innerHTML =
      `<div style="position:absolute;right:6%;top:0;width:54%;">${Flora.build("peony", { w: 300, h: 400, anim: true })}</div>
       <div style="position:absolute;left:2%;bottom:0;width:40%;">${Flora.build("lavender", { w: 200, h: 300, anim: true })}</div>`;
  }
  function setMotionVar() {
    const m = Number(document.documentElement.dataset.motion || 35);
    document.documentElement.style.setProperty("--motion", (0.5 + (m / 100) * 1.1).toFixed(2));
  }

  /* ---------- intro illustration layers ---------- */
  function buildIntroLayers() {
    $$(".intro__layer").forEach((el) => {
      el.innerHTML = Flora.build(el.dataset.flower, { w: 300, h: 420, anim: true });
      const svg = el.querySelector("svg");
      svg.style.width = "100%"; svg.style.height = "auto";
    });
  }
  function buildPetals() {
    if (reduce) return;
    const field = $("#petalField");
    const motion = Number(document.documentElement.dataset.motion || 35);
    const n = Math.round(6 + (motion / 100) * 14);
    const cols = ["#E3B7B0", "#EBC9C8", "#C9BBD2", "#AEB694", "#E8D193"];
    const petal = (c) => `<svg viewBox="0 0 40 60" width="100%" height="100%"><path d="M20,2 C34,14 34,40 20,58 C6,40 6,14 20,2Z" fill="${c}" opacity=".85"/><path d="M20,8 C20,30 20,48 20,54" stroke="#8a7a5a" stroke-width="1" fill="none" opacity=".3"/></svg>`;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("div");
      d.className = "petal";
      const size = 10 + Math.random() * 16;
      d.style.cssText = `left:${Math.random() * 100}vw; width:${size}px; height:${size * 1.5}px; --dx:${(Math.random() * 2 - 1) * 160}px; --dr:${180 + Math.random() * 360}deg; animation-duration:${16 + Math.random() * 16}s; animation-delay:${-Math.random() * 24}s;`;
      d.innerHTML = petal(cols[i % cols.length]);
      field.appendChild(d);
    }
  }

  /* ============================================================
     LIBRARY + DETAIL
     ============================================================ */
  const FILTER_DEFS = {
    Color: ["rose", "blush", "white", "lilac", "lavender", "poppy"],
    Season: ["Spring", "Summer", "Winter", "All"],
    Mood: ["Romantic", "Tender", "Calm", "Striking", "Lavish"],
  };
  const filterState = { Color: "All", Season: "All", Mood: "All" };
  function buildFilters() {
    const root = $("#filters");
    root.innerHTML = Object.entries(FILTER_DEFS).map(([grp, vals]) => {
      const chips = ["All", ...vals].map((v) =>
        `<button class="chip${v === "All" ? " active" : ""}" data-grp="${grp}" data-val="${v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join("");
      return `<div class="filter-group"><span class="label">${grp}</span>${chips}</div>`;
    }).join("");
    root.addEventListener("click", (e) => {
      const c = e.target.closest(".chip"); if (!c) return;
      filterState[c.dataset.grp] = c.dataset.val;
      $$(`.chip[data-grp="${c.dataset.grp}"]`, root).forEach((x) => x.classList.toggle("active", x === c));
      applyFilters();
    });
  }
  function buildLibrary() {
    const grid = $("#libGrid");
    grid.innerHTML = Flora.ids.map((id) => {
      const m = Flora.meta[id];
      return `<button class="bloom-card" data-id="${id}">
        <div class="bloom-card__art">${Flora.build(id, { w: 220, h: 290, anim: true })}<span class="bloom-card__word">${m.word}</span></div>
        <div class="bloom-card__meta"><div class="bloom-card__name">${m.name}</div><div class="bloom-card__latin">${m.latin}</div><div class="bloom-card__mean">${m.meaning}</div></div>
      </button>`;
    }).join("");
    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".bloom-card");
      if (card) openDetail(card.dataset.id);
    });
  }
  function applyFilters() {
    $$("#libGrid .bloom-card").forEach((card) => {
      const m = Flora.meta[card.dataset.id];
      const ok = (filterState.Color === "All" || m.color === filterState.Color) &&
        (filterState.Season === "All" || m.season === filterState.Season || m.season === "All") &&
        (filterState.Mood === "All" || m.mood === filterState.Mood);
      card.classList.toggle("hidden", !ok);
    });
  }

  let detailId = null;
  function openDetail(id) {
    detailId = id;
    const m = Flora.meta[id];
    $("#detailArt").innerHTML = Flora.build(id, { w: 380, h: 520, anim: true });
    $("#dWord").textContent = m.word;
    $("#dName").textContent = m.name;
    $("#dLatin").textContent = m.latin;
    $("#dFacts").innerHTML = [["Meaning", m.meaning], ["Season", m.season], ["Mood", m.mood]]
      .map(([k, v]) => `<div class="detail__fact"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");
    $("#dNote").textContent = "“" + m.note + "”";
    const d = $("#detail");
    d.classList.add("open"); d.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => drawIn(d.querySelector(".flora")));
  }
  function closeDetail() {
    const d = $("#detail");
    d.classList.remove("open"); d.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function wireDetail() {
    $("#detailClose").addEventListener("click", closeDetail);
    $("#dAdd").addEventListener("click", () => {
      const type = Flora.foliage[detailId] ? "foliage" : "flower";
      placeOnPaper(type, detailId);
      closeDetail();
      goToStudio();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeDetail(); closeSend(); }
      if (studio.sel && (e.key === "Backspace" || e.key === "Delete") && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        e.preventDefault(); deleteItem(studio.sel);
      }
    });
    $("#detail").addEventListener("click", (e) => { if (e.target === $("#detail")) closeDetail(); });
  }

  /* ============================================================
     STUDIO PALETTE + BACKDROPS
     ============================================================ */
  function buildBackdrops() {
    const root = $("#backdropTones");
    root.insertAdjacentHTML("beforeend", BACKDROPS.map((b) =>
      `<button class="tone${b.id === studio.backdrop ? " sel" : ""}" data-bg="${b.id}" title="${b.label}" style="background:${b.bg}"></button>`).join(""));
    root.addEventListener("click", (e) => {
      const t = e.target.closest(".tone"); if (!t) return;
      studio.backdrop = t.dataset.bg;
      $$(".tone", root).forEach((x) => x.classList.toggle("sel", x === t));
      applyBackdrop(); saveStudio();
    });
  }
  function applyBackdrop() {
    const b = BACKDROPS.find((x) => x.id === studio.backdrop) || BACKDROPS[0];
    const wrap = $("#canvasWrap");
    wrap.style.backgroundColor = b.bg;
    wrap.classList.toggle("on-ink", studio.backdrop === "ink");
  }

  let palTab = "flowers";
  function buildStudioPalette() {
    $("#palTabs").addEventListener("click", (e) => {
      const t = e.target.closest(".pal-tab"); if (!t) return;
      palTab = t.dataset.tab;
      $$(".pal-tab").forEach((x) => x.classList.toggle("active", x === t));
      renderPalette();
    });
    renderPalette();
  }
  function renderPalette() {
    const grid = $("#palGrid");
    let list;
    if (palTab === "flowers") list = Flora.ids.map((id) => ({ type: "flower", id }));
    else if (palTab === "foliage") list = Flora.foliageIds.map((id) => ({ type: "foliage", id }));
    else list = VESSELS.map((v) => ({ type: "vessel", id: v.id }));
    grid.innerHTML = list.map((it) => {
      const name = it.type === "vessel" ? (VESSELS.find((v) => v.id === it.id) || {}).name : metaOf(it.id).name;
      const art = it.type === "vessel" ? vesselIcon(it.id) : Flora.build(it.id, { w: 70, h: 92, anim: false });
      return `<button class="pal-item" data-type="${it.type}" data-id="${it.id}" title="${name}">
        <div class="pal-art">${art}</div><div class="pal-name">${name}</div></button>`;
    }).join("");
  }

  /* ============================================================
     SCENE RENDER
     ============================================================ */
  function itemInner(it) {
    if (it.type === "vessel") return `<g transform="translate(-300 -634)">${vesselMarkup(it.id)}</g>`;
    if (it.type === "note") {
      const lines = (it.text || "").split("\n");
      const lh = it.fontSize * 1.04;
      const y0 = -((lines.length - 1) / 2) * lh;
      const tspans = lines.map((ln, i) =>
        `<tspan x="0" y="${(y0 + i * lh).toFixed(1)}">${escapeXML(ln || " ")}</tspan>`).join("");
      const col = getVar("--rose-deep") || "#97625A";
      return `<text class="note-text" text-anchor="middle" dominant-baseline="middle" font-family="'Pinyon Script', cursive" font-size="${it.fontSize}" fill="${col}">${tspans}</text>`;
    }
    // flower / foliage
    return `<g transform="translate(-100 -156)">${Flora.art(it.id)}</g>`;
  }
  // single source of truth for an item's SVG transform
  function itemTransform(it) {
    const sx = it.scale * (it.flip ? -1 : 1);
    return `translate(${it.x} ${it.y}) rotate(${it.rot}) scale(${sx} ${it.scale})`;
  }
  function vesselForegroundInner(it) {
    return `<g transform="translate(-300 -634)">${vesselForegroundMarkup(it.id)}</g>`;
  }
  function escapeXML(s) { return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])); }

  const gEls = new Map();
  function renderVesselForegrounds() {
    const scene = $("#scene");
    $("#vesselForegrounds", scene)?.remove();
    const foregrounds = document.createElementNS(SVGNS, "g");
    foregrounds.id = "vesselForegrounds";
    foregrounds.setAttribute("pointer-events", "none");
    studio.items.filter((it) => it.type === "vessel").forEach((it) => {
      foregrounds.insertAdjacentHTML("beforeend", `<g transform="${itemTransform(it)}">${vesselForegroundInner(it)}</g>`);
    });
    scene.appendChild(foregrounds);
  }
  function renderScene() {
    const scene = $("#scene");
    $("#vesselForegrounds", scene)?.remove();
    const live = new Set(studio.items.map((i) => i.uid));
    gEls.forEach((g, uid) => { if (!live.has(uid)) { g.remove(); gEls.delete(uid); } });
    studio.items.forEach((it) => {
      let g = gEls.get(it.uid);
      if (!g) {
        g = document.createElementNS(SVGNS, "g");
        g.classList.add("item", "flora");
        g.dataset.uid = it.uid;
        g.dataset.type = it.type;
        g.innerHTML = itemInner(it);
        if (!reduce) { g.classList.add("place-anim"); }
        scene.appendChild(g);
        gEls.set(it.uid, g);
        // draw-in
        requestAnimationFrame(() => { g.classList.add("drawn"); g.classList.remove("place-anim"); });
      } else if (g.dataset.dirty) {
        g.innerHTML = itemInner(it);
        g.classList.add("drawn");
        delete g.dataset.dirty;
      }
      g.setAttribute("transform", itemTransform(it));
      // keep DOM order == items order (z-order)
      scene.appendChild(g);
    });
    renderVesselForegrounds();
    $("#canvasHint").style.opacity = studio.items.length ? "0" : "1";
    $("#canvasHint").style.pointerEvents = studio.items.length ? "none" : "auto";
    $("#navCount").textContent = studio.items.filter((i) => i.type === "flower" || i.type === "foliage").length;
    positionSelection();
    saveStudio();
  }

  /* ---------- placement ---------- */
  function placeOnPaper(type, id, at) {
    const it = newItem(type, id);
    if (at) { it.x = at.x; it.y = at.y; }
    else if (type === "flower" || type === "foliage") {
      const vessel = studio.items.find((item) => item.type === "vessel");
      if (vessel) {
        const mouthY = vessel.id === "budvase" ? 528 : vessel.id === "box" ? 588 : vessel.id === "ceramic" ? 566 : 560;
        const mouthOffset = (mouthY - 634) * vessel.scale;
        it.rot = (Math.random() * 2 - 1) * 10;
        const stemLength = 144 * it.scale;
        const rad = it.rot * Math.PI / 180;
        it.x = vessel.x + (Math.random() * 2 - 1) * 34 + Math.sin(rad) * stemLength;
        it.y = vessel.y + mouthOffset - Math.cos(rad) * stemLength + 10;
      } else {
        it.x = 500 + (Math.random() * 2 - 1) * 150;
        it.y = 540 + (Math.random() * 2 - 1) * 120;
      }
    }
    else {
      // gentle scatter near centre so repeated adds don't perfectly stack
      it.x = 500 + (Math.random() * 2 - 1) * 150;
      it.y = (type === "vessel" ? 760 : 540) + (Math.random() * 2 - 1) * 120;
    }
    // vessels go to the back, everything else to the front
    if (type === "vessel") studio.items.unshift(it);
    else studio.items.push(it);
    renderScene();
    select(it.uid);
    buzz(10);
    return it;
  }

  /* ============================================================
     SELECTION + DIRECT MANIPULATION
     ============================================================ */
  function select(uid) {
    studio.sel = uid;
    $("#selLayer").classList.toggle("active", !!uid);
    const isNote = uid && (studio.items.find((i) => i.uid === uid) || {}).type === "note";
    $("#actEdit").style.display = isNote ? "" : "none";
    syncTransformPanel();
    positionSelection();
  }
  function deselect() {
    studio.sel = null;
    $("#selLayer").classList.remove("active");
    clearGuides();
    syncTransformPanel();
  }

  function selectedItem() { return studio.items.find((i) => i.uid === studio.sel); }
  function itemName(it) {
    if (!it) return "";
    if (it.type === "note") return "Handwritten note";
    if (it.type === "vessel") return (VESSELS.find((v) => v.id === it.id) || {}).name || "Vessel";
    return (metaOf(it.id) || {}).name || "Flower";
  }
  function syncTransformPanel() {
    const it = selectedItem();
    $("#transformPanel").hidden = !it;
    if (!it) return;
    $("#transformName").textContent = itemName(it);
    const meta = it.id && metaOf(it.id);
    $("#transformMeaning").textContent = meta ? meta.meaning : (it.type === "note" ? "A message in your own hand" : "The finishing touch");
    $("#rotateControl").value = Math.round(it.rot);
    $("#rotateValue").textContent = `${Math.round(it.rot)}°`;
    $("#sizeControl").value = Math.round(it.scale * 100);
    $("#sizeValue").textContent = `${Math.round(it.scale * 100)}%`;
  }
  function applySelectedTransform() {
    const it = selectedItem();
    if (!it) return;
    const g = gEls.get(it.uid);
    if (g) g.setAttribute("transform", itemTransform(it));
    if (it.type === "vessel") renderVesselForegrounds();
    syncTransformPanel();
    positionSelection();
    saveStudio();
  }

  function svgScale() { return $("#scene").getBoundingClientRect().width / 1000; }
  function toSVG(clientX, clientY) {
    const r = $("#scene").getBoundingClientRect();
    const sc = r.width / 1000;
    return { x: (clientX - r.left) / sc, y: (clientY - r.top) / sc };
  }

  function positionSelection() {
    const uid = studio.sel;
    if (!uid) return;
    const it = studio.items.find((i) => i.uid === uid);
    const g = gEls.get(uid);
    if (!it || !g) { deselect(); return; }
    let bb;
    try { bb = g.getBBox(); } catch (e) { return; }
    if (!bb || !bb.width) return;
    const sc = svgScale();
    const bcx = bb.x + bb.width / 2, bcy = bb.y + bb.height / 2;
    const rad = it.rot * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    const rx = bcx * it.scale * cos - bcy * it.scale * sin;
    const ry = bcx * it.scale * sin + bcy * it.scale * cos;
    const cx = (it.x + rx) * sc, cy = (it.y + ry) * sc;
    const w = bb.width * it.scale * sc, h = bb.height * it.scale * sc;
    const box = $("#selBox");
    box.style.left = cx + "px"; box.style.top = cy + "px";
    box.style.width = w + "px"; box.style.height = h + "px";
    box.style.transform = `translate(-50%,-50%) rotate(${it.rot}deg)`;
    // unrotated actions bar above the rotated bbox
    const halfH = (Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad))) / 2;
    const acts = $("#selActions");
    // lift the bar clear of the rotate handle, which reaches 1.65x its height
    // above the box top (see .sel-rotate transform), so the two never overlap
    const rotH = $(".sel-rotate");
    const rotReach = (rotH ? rotH.offsetHeight : 34) * 1.65 + 10;
    acts.style.left = cx + "px";
    acts.style.top = Math.max(6, cy - halfH - rotReach) + "px";
    syncTransformPanel();
  }

  let drag = null;
  function wireStudio() {
    applyBackdrop();
    const scene = $("#scene");

    // active pointers over the canvas — enables two-finger pinch/rotate
    const pointers = new Map();
    const gPts = () => [...pointers.values()];
    function gestureDist() { const p = gPts(); return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1; }
    function gestureAng() { const p = gPts(); return Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x); }

    // pointer down on an item → start drag (or deselect on empty)
    scene.addEventListener("pointerdown", (e) => {
      const g = e.target.closest(".item");
      if (!g) { deselect(); return; }
      const uid = g.dataset.uid;
      if (studio.sel !== uid) select(uid);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const it = studio.items.find((i) => i.uid === uid);
      if (pointers.size >= 2 && it) {
        // second finger down → pinch-to-zoom + twist-to-rotate
        drag = { mode: "gesture", uid, oscale: it.scale, orot: it.rot, dist0: gestureDist(), ang0: gestureAng() };
      } else {
        const p = toSVG(e.clientX, e.clientY);
        drag = { mode: "move", uid, ox: it.x, oy: it.y, px: p.x, py: p.y };
        scene.setPointerCapture(e.pointerId);
      }
      e.preventDefault();
    });

    // handles
    $("#selBox").addEventListener("pointerdown", (e) => {
      const h = e.target.closest(".sel-h"); if (!h) return;
      e.stopPropagation();
      const it = studio.items.find((i) => i.uid === studio.sel); if (!it) return;
      const c = itemCenterScreen(it);
      const p = { x: e.clientX, y: e.clientY };
      const ang = Math.atan2(p.y - c.y, p.x - c.x);
      const dist = Math.hypot(p.x - c.x, p.y - c.y);
      drag = { mode: h.dataset.h, uid: it.uid, orot: it.rot, oscale: it.scale, ang0: ang, dist0: dist || 1 };
      window.addEventListener("pointermove", onHandleMove);
      window.addEventListener("pointerup", onHandleUp, { once: true });
    });

    window.addEventListener("pointermove", (e) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!drag) return;
      if (drag.mode === "gesture") {
        if (pointers.size < 2) return;
        const it = studio.items.find((i) => i.uid === drag.uid); if (!it) return;
        it.scale = clamp(drag.oscale * (gestureDist() / drag.dist0), 0.25, 6);
        it.rot = drag.orot + (gestureAng() - drag.ang0) * 180 / Math.PI;
        gEls.get(it.uid).setAttribute("transform", itemTransform(it));
        if (it.type === "vessel") renderVesselForegrounds();
        positionSelection(); syncTransformPanel();
        return;
      }
      if (drag.mode !== "move") return;
      const it = studio.items.find((i) => i.uid === drag.uid); if (!it) return;
      const p = toSVG(e.clientX, e.clientY);
      it.x = clamp(drag.ox + (p.x - drag.px), 40, 960);
      it.y = clamp(drag.oy + (p.y - drag.py), 40, 1210);
      applySnap(it);
      gEls.get(it.uid).setAttribute("transform", itemTransform(it));
      if (it.type === "vessel") renderVesselForegrounds();
      positionSelection();
    });
    function endPointer(e) {
      pointers.delete(e.pointerId);
      if (!drag) return;
      if (drag.mode === "gesture") { saveStudio(); if (pointers.size < 2) drag = null; return; }
      if (drag.mode === "move") saveStudio();
      clearGuides(); lastSnapped = false; drag = null;
    }
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("pointercancel", endPointer);

    function onHandleMove(e) {
      if (!drag) return;
      const it = studio.items.find((i) => i.uid === drag.uid); if (!it) return;
      const c = itemCenterScreen(it);
      if (drag.mode === "rotate") {
        const ang = Math.atan2(e.clientY - c.y, e.clientX - c.x);
        let deg = drag.orot + (ang - drag.ang0) * 180 / Math.PI;
        if (e.shiftKey) deg = Math.round(deg / 15) * 15;
        it.rot = deg;
      } else if (drag.mode === "resize") {
        const dist = Math.hypot(e.clientX - c.x, e.clientY - c.y);
        it.scale = clamp(drag.oscale * (dist / drag.dist0), 0.25, 6);
      }
      gEls.get(it.uid).setAttribute("transform", itemTransform(it));
      if (it.type === "vessel") renderVesselForegrounds();
      positionSelection();
    }
    function onHandleUp() { window.removeEventListener("pointermove", onHandleMove); saveStudio(); drag = null; }

    // action buttons
    $("#selActions").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b || !studio.sel) return;
      const uid = studio.sel;
      const idx = studio.items.findIndex((i) => i.uid === uid);
      const it = studio.items[idx];
      if (b.dataset.act === "del") return deleteItem(uid);
      if (b.dataset.act === "dup") {
        const copy = Object.assign({}, it, { uid: "i" + (seq++), x: it.x + 60, y: it.y + 40 });
        studio.items.splice(idx + 1, 0, copy); renderScene(); select(copy.uid); return;
      }
      if (b.dataset.act === "front") { studio.items.splice(idx, 1); studio.items.push(it); renderScene(); select(uid); }
      if (b.dataset.act === "back") { studio.items.splice(idx, 1); studio.items.unshift(it); renderScene(); select(uid); }
      if (b.dataset.act === "edit") openNoteEditor(uid);
    });

    // palette → click adds; drag drops at point
    $("#palGrid").addEventListener("click", (e) => {
      const b = e.target.closest(".pal-item"); if (!b) return;
      placeOnPaper(b.dataset.type, b.dataset.id);
      flashCanvas();
    });
    enablePaletteDrag();

    // toolbar
    $("#addNoteBtn").addEventListener("click", () => {
      const it = placeOnPaper("note", null);
      openNoteEditor(it.uid);
    });
    $("#clearBtn").addEventListener("click", () => {
      if (!studio.items.length) return;
      if (confirm("Clear the paper and start again?")) { studio.items = []; deselect(); renderScene(); }
    });
    $("#saveImgBtn").addEventListener("click", () => saveImage());
    $("#sendBtn").addEventListener("click", openSend);
    $("#paletteFab").addEventListener("click", () => {
      const pal = $(".studio__palette");
      pal.classList.toggle("open");
      $("#paletteFab").textContent = pal.classList.contains("open") ? "✕ Close palette" : "＋ Add flowers";
    });
    document.addEventListener("pointerdown", (e) => {
      const pal = $(".studio__palette");
      if (pal.classList.contains("open")) {
        const insidePalette = e.target.closest(".studio__palette");
        const insideFab = e.target.closest("#paletteFab");
        const insideDetail = e.target.closest("#detail");
        const insideModal = e.target.closest("#sendModal");
        if (!insidePalette && !insideFab && !insideDetail && !insideModal) {
          pal.classList.remove("open");
          $("#paletteFab").textContent = "＋ Add flowers";
        }
      }
    });
    $$(".preset-chip").forEach((b) => b.addEventListener("click", () => {
      loadPreset(b.dataset.studioPreset);
      flashCanvas();
    }));
    $("#undoBtn").addEventListener("click", undoStudio);
    $("#redoBtn").addEventListener("click", redoStudio);
    $("#rotateControl").addEventListener("input", (e) => {
      const it = selectedItem(); if (!it) return;
      it.rot = Number(e.target.value);
      applySelectedTransform();
    });
    $("#sizeControl").addEventListener("input", (e) => {
      const it = selectedItem(); if (!it) return;
      it.scale = Number(e.target.value) / 100;
      applySelectedTransform();
    });
    $("#resetTransform").addEventListener("click", () => {
      const it = selectedItem(); if (!it) return;
      it.rot = 0;
      it.scale = DEFAULT_SCALE[it.type] || 1;
      applySelectedTransform();
    });

    // note editor
    $("#noteDone").addEventListener("click", commitNote);
    $("#noteEditArea").addEventListener("input", () => {
      const it = studio.items.find((i) => i.uid === editingNote);
      if (it) { it.text = $("#noteEditArea").value || "your note"; markDirty(it.uid); renderScene(); }
    });

    // resize → reposition selection
    window.addEventListener("resize", positionSelection, { passive: true });
    $("#canvasWrap").addEventListener("scroll", positionSelection, { passive: true });
    window.addEventListener("keydown", (e) => {
      if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redoStudio(); else undoStudio();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redoStudio(); return; }
      if (mod && e.key.toLowerCase() === "c") { if (selectedItem()) clipboard = Object.assign({}, selectedItem()); return; }
      if (mod && e.key.toLowerCase() === "v") { if (clipboard) { e.preventDefault(); pasteItem(); } return; }
      if (mod && e.key.toLowerCase() === "d") { if (selectedItem()) { e.preventDefault(); duplicateSelected(); } return; }

      // single-item keyboard transforms (no modifier)
      if (mod) return;
      const it = selectedItem(); if (!it) return;
      const step = e.shiftKey ? 10 : 1;
      let handled = true;
      switch (e.key) {
        case "ArrowLeft":  it.x = clamp(it.x - step, 40, 960); break;
        case "ArrowRight": it.x = clamp(it.x + step, 40, 960); break;
        case "ArrowUp":    it.y = clamp(it.y - step, 40, 1210); break;
        case "ArrowDown":  it.y = clamp(it.y + step, 40, 1210); break;
        case "[": it.rot -= e.shiftKey ? 15 : 1; break;
        case "]": it.rot += e.shiftKey ? 15 : 1; break;
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        const g = gEls.get(it.uid); if (g) g.setAttribute("transform", itemTransform(it));
        if (it.type === "vessel") renderVesselForegrounds();
        positionSelection(); syncTransformPanel(); scheduleCommit();
      }
    });
  }

  function itemCenterScreen(it) {
    const r = $("#scene").getBoundingClientRect();
    const sc = r.width / 1000;
    const g = gEls.get(it.uid);
    let bb; try { bb = g.getBBox(); } catch (e) { bb = { x: -90, y: -90, width: 180, height: 180 }; }
    const bcx = bb.x + bb.width / 2, bcy = bb.y + bb.height / 2;
    const rad = it.rot * Math.PI / 180;
    const rx = bcx * it.scale * Math.cos(rad) - bcy * it.scale * Math.sin(rad);
    const ry = bcx * it.scale * Math.sin(rad) + bcy * it.scale * Math.cos(rad);
    return { x: r.left + (it.x + rx) * sc, y: r.top + (it.y + ry) * sc };
  }

  function deleteItem(uid) {
    const idx = studio.items.findIndex((i) => i.uid === uid);
    if (idx < 0) return;
    buzz(15);
    const g = gEls.get(uid);
    if (g && !reduce) {
      g.style.transition = "opacity .3s ease, transform .3s ease";
      g.style.opacity = "0";
      g.style.transformOrigin = "center";
    }
    studio.items.splice(idx, 1);
    deselect();
    setTimeout(renderScene, reduce ? 0 : 220);
    if (reduce) renderScene();
  }
  function markDirty(uid) { const g = gEls.get(uid); if (g) g.dataset.dirty = "1"; }

  function flashCanvas() {
    const w = $("#canvasWrap");
    w.classList.remove("flash"); void w.offsetWidth; w.classList.add("flash");
  }

  /* ---------- haptics ---------- */
  function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

  /* ---------- alignment guides + snapping ----------
     while dragging, snap an item's centre to the canvas centre or to any
     other item's centre, and show a thin guide line on the snapped axis. */
  const SNAP_T = 8; // snap threshold in SVG units
  let lastSnapped = false;
  function clearGuides() { $$(".snap-guide", $("#selLayer")).forEach((el) => el.remove()); }
  function drawGuide(orient, coord) {
    const sc = svgScale();
    const g = document.createElement("div");
    g.className = "snap-guide snap-guide--" + orient;
    if (orient === "v") g.style.left = (coord * sc) + "px";
    else g.style.top = (coord * sc) + "px";
    $("#selLayer").appendChild(g);
  }
  function applySnap(it) {
    clearGuides();
    if (!it) return;
    const xs = [500], ys = [625]; // canvas centre first
    studio.items.forEach((o) => { if (o.uid !== it.uid) { xs.push(o.x); ys.push(o.y); } });
    let snapped = false;
    for (const tx of xs) { if (Math.abs(it.x - tx) <= SNAP_T) { it.x = tx; drawGuide("v", tx); snapped = true; break; } }
    for (const ty of ys) { if (Math.abs(it.y - ty) <= SNAP_T) { it.y = ty; drawGuide("h", ty); snapped = true; break; } }
    if (snapped && !lastSnapped) buzz(6);
    lastSnapped = snapped;
  }

  /* ---------- clipboard + duplicate (keyboard) ---------- */
  let clipboard = null;
  function duplicateSelected() {
    const uid = studio.sel; const idx = studio.items.findIndex((i) => i.uid === uid); if (idx < 0) return;
    const it = studio.items[idx];
    const copy = Object.assign({}, it, { uid: "i" + (seq++), x: clamp(it.x + 40, 40, 960), y: clamp(it.y + 40, 40, 1210) });
    studio.items.splice(idx + 1, 0, copy); renderScene(); select(copy.uid);
  }
  function pasteItem() {
    if (!clipboard) return;
    const copy = Object.assign({}, clipboard, { uid: "i" + (seq++), x: clamp(clipboard.x + 24, 40, 960), y: clamp(clipboard.y + 24, 40, 1210) });
    if (copy.type === "vessel") studio.items.unshift(copy); else studio.items.push(copy);
    renderScene(); select(copy.uid);
  }

  /* ---------- debounced history commit (for keyboard nudges) ---------- */
  let commitTimer = null;
  function scheduleCommit() { clearTimeout(commitTimer); commitTimer = setTimeout(() => saveStudio(), 400); }

  /* ---------- palette drag-to-place ---------- */
  function enablePaletteDrag() {
    let ghost = null, gItem = null;
    $("#palGrid").addEventListener("pointerdown", (e) => {
      const b = e.target.closest(".pal-item"); if (!b) return;
      let moved = false;
      const startX = e.clientX, startY = e.clientY;
      gItem = { type: b.dataset.type, id: b.dataset.id };
      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
        if (!moved) {
          moved = true;
          ghost = document.createElement("div");
          ghost.className = "pal-ghost";
          ghost.innerHTML = b.querySelector(".pal-art").innerHTML;
          document.body.appendChild(ghost);
        }
        ghost.style.left = ev.clientX + "px"; ghost.style.top = ev.clientY + "px";
      };
      const up = (ev) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        if (ghost) { ghost.remove(); ghost = null; }
        if (moved) {
          const r = $("#scene").getBoundingClientRect();
          if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) {
            placeOnPaper(gItem.type, gItem.id, toSVG(ev.clientX, ev.clientY));
            flashCanvas();
          }
        }
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }

  /* ---------- note editor ---------- */
  let editingNote = null;
  function openNoteEditor(uid) {
    editingNote = uid;
    const it = studio.items.find((i) => i.uid === uid);
    $("#noteEditArea").value = (it && it.text && it.text !== "your note") ? it.text : "";
    $("#noteEditor").hidden = false;
    $("#noteEditArea").focus();
    $("#noteEditArea").select();
  }
  function commitNote() {
    const it = studio.items.find((i) => i.uid === editingNote);
    const val = $("#noteEditArea").value.trim();
    if (it) {
      if (!val) { deleteItem(it.uid); }
      else { it.text = val; markDirty(it.uid); renderScene(); }
    }
    $("#noteEditor").hidden = true; editingNote = null;
  }

  /* ============================================================
     EXPORT — rasterise the scene to PNG
     ============================================================ */
  function getVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  function buildExportSVG() {
    const drawInk = getVar("--draw-ink") || "#2A251D";
    const stemInk = getVar("--sage-deep") || "#525a39";
    const fillMode = document.documentElement.dataset.fill;
    const bg = (BACKDROPS.find((b) => b.id === studio.backdrop) || BACKDROPS[0]).bg;
    const washRule = fillMode === "ink" ? ".wc{display:none}" : ".wc{mix-blend-mode:multiply}";
    const inkStroke = fillMode === "ink" ? drawInk : drawInk;
    const style = `<style>
      .ink{fill:none;stroke:${inkStroke};stroke-width:1.15;stroke-linecap:round;stroke-linejoin:round;opacity:.76}
      .ink.vein{stroke-width:.72;opacity:.22}
      .ink.stem{stroke:${stemInk};stroke-width:1.35;opacity:.68}
      .ink.fil{stroke-width:.7;opacity:.42}
      .dot{opacity:.72} .wash{filter:url(#watercolorWash)} .wc-soft{opacity:.78} ${washRule}
    </style>`;
    let body = "";
    studio.items.forEach((it) => {
      // notes are drawn on canvas afterwards (web font), skip here
      if (it.type === "note") return;
      body += `<g transform="${itemTransform(it)}">${itemInner(it)}</g>`;
    });
    studio.items.filter((it) => it.type === "vessel").forEach((it) => {
      body += `<g transform="${itemTransform(it)}">${vesselForegroundInner(it)}</g>`;
    });
    return `<svg xmlns="${SVGNS}" width="1000" height="1250" viewBox="0 0 1000 1250"><defs><filter id="watercolorWash" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation=".32"/></filter><filter id="bouquetShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#4c3d2c" flood-opacity=".10"/></filter></defs>${style}<rect width="1000" height="1250" fill="${bg}"/><rect x="30" y="30" width="940" height="1190" rx="2" fill="none" stroke="#d8ccb5" stroke-width="1.5"/><g filter="url(#bouquetShadow)">${body}</g></svg>`;
  }

  async function rasterise() {
    await (document.fonts ? document.fonts.load('70px "Pinyon Script"').catch(() => {}) : Promise.resolve());
    const svg = buildExportSVG();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const canvas = $("#exportCanvas");
    canvas.width = 1000; canvas.height = 1250;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1000, 1250);
    ctx.drawImage(img, 0, 0, 1000, 1250);
    URL.revokeObjectURL(url);
    // notes via canvas (real web font)
    const rose = getVar("--rose-deep") || "#97625A";
    studio.items.filter((i) => i.type === "note").forEach((it) => {
      ctx.save();
      ctx.translate(it.x, it.y); ctx.rotate(it.rot * Math.PI / 180); ctx.scale(it.scale, it.scale);
      ctx.fillStyle = rose; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `${it.fontSize}px "Pinyon Script", cursive`;
      const lines = (it.text || "").split("\n"); const lh = it.fontSize * 1.04;
      const y0 = -((lines.length - 1) / 2) * lh;
      lines.forEach((ln, i) => ctx.fillText(ln, 0, y0 + i * lh));
      ctx.restore();
    });
    return canvas;
  }

  async function saveImage() {
    if (!studio.items.length) { flashCanvas(); return; }
    const btn = $("#saveImgBtn"); const label = btn.textContent; btn.textContent = "Saving…";
    try {
      const canvas = await rasterise();
      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "latelier-de-fleurs.png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        showSaveToast();
      }, "image/png");
    } finally { btn.textContent = label; }
  }
  let saveToastTimer = null;
  function showSaveToast() {
    const toast = $("#saveToast");
    toast.classList.add("show");
    clearTimeout(saveToastTimer);
    saveToastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  /* ============================================================
     SEND MODAL
     ============================================================ */
  function openSend() {
    if (!studio.items.length) { goToStudio(); flashCanvas(); return; }
    const m = $("#sendModal");
    $("#sendForm").hidden = false; $("#sendSent").hidden = true;
    // preview: clone current scene as a static svg
    const bg = (BACKDROPS.find((b) => b.id === studio.backdrop) || BACKDROPS[0]).bg;
    const prev = $("#sendPreview");
    prev.style.backgroundColor = bg;
    prev.innerHTML = `<svg viewBox="0 0 1000 1250" class="flora" style="width:100%;height:100%"><defs><filter id="previewWatercolorWash" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation=".32"/></filter><filter id="previewBouquetShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#4c3d2c" flood-opacity=".10"/></filter></defs><g class="preview-bouquet">${cloneSceneInner()}</g></svg>`;
    m.classList.add("open"); m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function cloneSceneInner() {
    let body = "";
    studio.items.forEach((it) => {
      body += `<g transform="${itemTransform(it)}">${itemInner(it)}</g>`;
    });
    studio.items.filter((it) => it.type === "vessel").forEach((it) => {
      body += `<g transform="${itemTransform(it)}">${vesselForegroundInner(it)}</g>`;
    });
    return body;
  }
  function closeSend() {
    const m = $("#sendModal");
    m.classList.remove("open"); m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function wireSend() {
    $("#sendClose").addEventListener("click", closeSend);
    $("#sendModal").addEventListener("click", (e) => { if (e.target === $("#sendModal")) closeSend(); });
    $("#sendDownload").addEventListener("click", () => { saveImage(); });
    $("#sendDo").addEventListener("click", () => {
      const to = $("#sName").value.trim() || "your recipient";
      const from = $("#sFrom").value.trim();
      $("#sentFlora").innerHTML = Flora.build("sweetpea", { w: 120, h: 160, anim: true });
      $("#sentWord").textContent = "On its way.";
      $("#sentMsg").innerHTML = `Your arrangement has been sent to <em>${escapeHTML(to)}</em>${from ? `, with love from ${escapeHTML(from)}` : ""}. We've kept a copy for you to download below.`;
      $("#sendForm").hidden = true; $("#sendSent").hidden = false;
      requestAnimationFrame(() => drawIn($("#sentFlora .flora")));
    });
    $("#sentBack").addEventListener("click", closeSend);
    $("#footSend") && $("#footSend").addEventListener("click", (e) => { e.preventDefault(); openSend(); });
    $("#footSave") && $("#footSave").addEventListener("click", (e) => { e.preventDefault(); goToStudio(); saveImage(); });
    $("#closingSend") && $("#closingSend").addEventListener("click", openSend);
  }
  function escapeHTML(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  /* ============================================================
     OCCASIONS — presets that load onto the paper
     ============================================================ */
  const OCCASIONS = [
    { key: "anniv", f: "peony", title: "Anniversaries", word: "to abundance", copy: "Lavish and a little undone — peony, garden rose and sweet pea, gathered to be remembered." },
    { key: "symp", f: "lavender", title: "Sympathy", word: "with stillness", copy: "Quiet and dried to last — lavender and eucalyptus, an arrangement that keeps." },
    { key: "just", f: "ranunculus", title: "Just because", word: "no reason at all", copy: "A handful of ranunculus and tulip — the smallest gesture, for an ordinary day." },
    { key: "celeb", f: "poppy", title: "Celebration", word: "for the moment", copy: "Striking and brief — poppy and anemone, drawn to mark something worth marking." },
  ];
  const PRESETS = {
    anniv: { backdrop: "blush", items: [
      ["vessel", "ribbon", 500, 770, 2.1, 0], ["foliage", "eucalyptus", 360, 560, 1.5, -24], ["foliage", "eucalyptus", 650, 560, 1.5, 26],
      ["flower", "peony", 500, 470, 1.7, 0], ["flower", "rose", 380, 540, 1.35, -16], ["flower", "rose", 620, 540, 1.35, 16],
      ["flower", "sweetpea", 460, 600, 1.1, -8], ["flower", "sweetpea", 560, 600, 1.1, 10] ] },
    symp: { backdrop: "sage", items: [
      ["vessel", "ceramic", 500, 760, 2.0, 0], ["foliage", "eucalyptus", 420, 540, 1.6, -16], ["foliage", "eucalyptus", 590, 540, 1.6, 16],
      ["flower", "lavender", 460, 470, 1.5, -10], ["flower", "lavender", 540, 470, 1.5, 10], ["flower", "anemone", 500, 540, 1.3, 0] ] },
    just: { backdrop: "bone", items: [
      ["vessel", "budvase", 500, 770, 1.9, 0], ["flower", "ranunculus", 478, 382, 1.4, -7], ["flower", "ranunculus", 528, 398, 1.28, 8],
      ["flower", "tulip", 486, 418, 1.2, -4], ["foliage", "fern", 525, 404, 1.18, 10] ] },
    celeb: { backdrop: "bone", items: [
      ["vessel", "kraft", 500, 780, 2.1, 0], ["flower", "poppy", 470, 500, 1.5, -14], ["flower", "poppy", 580, 540, 1.4, 18],
      ["flower", "anemone", 430, 560, 1.3, -8], ["foliage", "fern", 620, 540, 1.4, 24], ["foliage", "eucalyptus", 380, 560, 1.4, -26] ] },
  };
  function loadPreset(key) {
    const p = PRESETS[key]; if (!p) return;
    studio.items = p.items.map(([type, id, x, y, scale, rot]) => newItem(type, id, { x, y, scale, rot }));
    studio.backdrop = p.backdrop;
    $$(".tone").forEach((t) => t.classList.toggle("sel", t.dataset.bg === studio.backdrop));
    applyBackdrop();
    deselect();
    gEls.forEach((g) => g.remove()); gEls.clear();
    renderScene();
  }
  function buildOccasions() {
    $("#occGrid").innerHTML = OCCASIONS.map((o) =>
      `<article class="occ">
        <div class="occ__art">${Flora.build(o.f, { w: 110, h: 150, anim: true })}</div>
        <div>
          <h3 class="occ__title">${o.title}<span class="word">${o.word}</span></h3>
          <p class="occ__copy">${o.copy}</p>
          <button class="occ__link link-underline" data-preset="${o.key}" type="button">Start from this →</button>
        </div>
      </article>`).join("");
    $("#occGrid").addEventListener("click", (e) => {
      const b = e.target.closest("[data-preset]"); if (!b) return;
      loadPreset(b.dataset.preset); goToStudio();
    });
  }

  function buildStoryArt() {
    $("#storyArt").innerHTML =
      `<div style="position:absolute; right:4%; top:0; width:46%;">${Flora.build("anemone", { w: 280, h: 380, anim: true })}</div>
       <div style="position:absolute; left:0; bottom:-4%; width:40%;">${Flora.build("eucalyptus", { w: 220, h: 320, anim: true })}</div>
       <div style="position:absolute; left:30%; top:18%; width:34%;">${Flora.build("sweetpea", { w: 200, h: 280, anim: true })}</div>`;
  }

  /* ---------- nav ---------- */
  function goToStudio() {
    const el = $("#studio");
    window.scrollTo({ top: el.offsetTop - 60, behavior: reduce ? "auto" : "smooth" });
  }
  function wireNav() {
    $("#navCart").addEventListener("click", goToStudio);
  }

  /* ============================================================
     PERSISTENCE
     ============================================================ */
  const LS = "latelier-studio-v2";
  const history = [];
  let historyIndex = -1;
  let restoringHistory = false;
  function studioSnapshot() {
    return JSON.stringify({ items: studio.items, backdrop: studio.backdrop, seq });
  }
  function updateHistoryButtons() {
    $("#undoBtn").disabled = historyIndex <= 0;
    $("#redoBtn").disabled = historyIndex >= history.length - 1;
  }
  function saveStudio(record = true) {
    const snapshot = studioSnapshot();
    try { localStorage.setItem(LS, snapshot); } catch (e) {}
    if (record && !restoringHistory && snapshot !== history[historyIndex]) {
      history.splice(historyIndex + 1);
      history.push(snapshot);
      if (history.length > 50) history.shift();
      historyIndex = history.length - 1;
    }
    updateHistoryButtons();
  }
  function restoreStudio(snapshot) {
    restoringHistory = true;
    const d = JSON.parse(snapshot);
    studio.items = d.items || [];
    studio.backdrop = d.backdrop || "bone";
    seq = d.seq || studio.items.length + 1;
    $$(".tone").forEach((t) => t.classList.toggle("sel", t.dataset.bg === studio.backdrop));
    applyBackdrop();
    deselect();
    gEls.forEach((g) => g.remove()); gEls.clear();
    renderScene();
    restoringHistory = false;
    saveStudio(false);
  }
  function undoStudio() {
    if (historyIndex <= 0) return;
    historyIndex--;
    restoreStudio(history[historyIndex]);
  }
  function redoStudio() {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    restoreStudio(history[historyIndex]);
  }
  function loadStudio() {
    try {
      const raw = localStorage.getItem(LS);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d && Array.isArray(d.items)) {
        if (d.items.length === 0) return false; // Fallback to default preset if saved canvas is empty
        studio.items = d.items; studio.backdrop = d.backdrop || "bone";
        seq = d.seq || studio.items.length + 1;
        $$(".tone").forEach((t) => t.classList.toggle("sel", t.dataset.bg === studio.backdrop));
        applyBackdrop();
        history.push(studioSnapshot());
        historyIndex = 0;
        updateHistoryButtons();
        return true;
      }
    } catch (e) {}
    return false;
  }

  /* ============================================================
     OBSERVERS + SCROLL
     ============================================================ */
  function drawIn(el) {
    if (!el) return;
    if (el.classList.contains("flora")) el.classList.add("drawn");
    $$(".flora", el).forEach((f) => f.classList.add("drawn"));
  }
  function setupObservers() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          drawIn(e.target);
          if (e.target.matches(".flora")) e.target.classList.add("drawn");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal, .bloom-card .flora.anim, .occ .flora.anim, .story__art .flora.anim, .closing__art .flora.anim").forEach((el) => io.observe(el));
  }

  function setupScroll() {
    const nav = $("#nav"), intro = $("#intro"), cue = $("#scrollCue");
    const layers = $$(".intro__layer"), scenes = $$(".scene");
    function update() {
      const y = window.scrollY;
      nav.classList.toggle("solid", y > innerHeight * 0.7);
      const introH = intro.offsetHeight - innerHeight;
      const p = clamp((y - intro.offsetTop) / Math.max(1, introH), 0, 1);
      if (y < intro.offsetTop + intro.offsetHeight) {
        layers.forEach((l) => {
          const depth = parseFloat(l.dataset.depth);
          const ty = -p * depth * 520;
          const tx = Math.sin(p * Math.PI) * depth * 60 * (l.dataset.flower === "rose" ? -1 : 1);
          l.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${1 + p * depth * 0.5})`;
          l.style.opacity = String(clamp(1 - p * 1.15 + depth, 0.05, 1));
        });
        const sceneIdx = p < 0.34 ? 0 : p < 0.7 ? 1 : 2;
        scenes.forEach((s, i) => {
          const on = i === sceneIdx;
          s.classList.toggle("on", on);
          if (on) $$(".reveal", s).forEach((r) => r.classList.add("in"));
        });
        cue.style.opacity = p > 0.04 ? "0" : "1";
      }
      // mobile palette FAB only while studio is in view
      const sb = $("#studio").getBoundingClientRect();
      $("#paletteFab").hidden = !(sb.top < innerHeight - 100 && sb.bottom > 100 && innerWidth <= 920);
    }
    layers.forEach((l) => drawIn(l.querySelector(".flora")));
    $$(".scene-1 .reveal").forEach((r) => r.classList.add("in"));
    update();
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
  }

  // hooks for tweaks panel
  window.Atelier = {
    setFill: (m) => { document.documentElement.dataset.fill = m; },
    setMotion: (m) => { document.documentElement.dataset.motion = m; setMotionVar(); },
  };
})();
