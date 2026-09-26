/**
 * Miffy (Nijntje), after Dick Bruna: one set of shapes shared by every Miffy
 * on the site so the scene, the delivery card, the hidden peekers and the
 * little icons all match the original character.
 *
 * Bruna's rules this follows: she always faces forward; her two long ears
 * stand upright with rounded tips and a gap between them; her head is wide,
 * broadest at the cheeks; two small dot eyes sit wide apart with a small
 * cross for her mouth between and below them; a plain A-line dress with no
 * sleeves; short white arms and oval feet tucked under the dress.
 *
 * Coordinates are in head units: the head is 100 wide, x = 0 is her centre
 * and y = 0 is the top of her head between the ears (ear tips reach -74, the
 * chin 80, the soles 142). Paths use only absolute M, L, C and Z commands so
 * they can be placed by moving each coordinate pair.
 */

const K = 0.5523; // cubic handle length for a quarter circle

const round = (v) => Math.round(v * 100) / 100;
const fmt = (v) => String(round(v));
const pt = (x, y) => `${fmt(x)} ${fmt(y)}`;

/** Half circle of radius r around c, from c + n·r through c + d·r to c − n·r. */
function cap(cx, cy, dx, dy, nx, ny, r) {
  const h = K * r;
  const [ax, ay] = [cx + nx * r, cy + ny * r];
  const [mx, my] = [cx + dx * r, cy + dy * r];
  const [bx, by] = [cx - nx * r, cy - ny * r];
  return (
    `C${pt(ax + dx * h, ay + dy * h)} ${pt(mx + nx * h, my + ny * h)} ${pt(mx, my)}` +
    `C${pt(mx - nx * h, my - ny * h)} ${pt(bx + dx * h, by + dy * h)} ${pt(bx, by)}`
  );
}

/** A limb from (x0, y0) to (x1, y1), r either side of its centre line, round at both ends. */
function capsule(x0, y0, x1, y1, r) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const [ux, uy] = [(x1 - x0) / len, (y1 - y0) / len];
  const [nx, ny] = [-uy, ux];
  return (
    `M${pt(x0 + nx * r, y0 + ny * r)}L${pt(x1 + nx * r, y1 + ny * r)}` +
    cap(x1, y1, ux, uy, nx, ny, r) +
    `L${pt(x0 - nx * r, y0 - ny * r)}` +
    cap(x0, y0, -ux, -uy, -nx, -ny, r) +
    'Z'
  );
}

/** An ellipse turned clockwise by deg. */
function ellipse(cx, cy, rx, ry, deg = 0) {
  const a = (deg * Math.PI) / 180;
  const [c, s] = [Math.cos(a), Math.sin(a)];
  const at = (x, y) => pt(cx + x * c - y * s, cy + x * s + y * c);
  const [hx, hy] = [K * rx, K * ry];
  return (
    `M${at(rx, 0)}` +
    `C${at(rx, hy)} ${at(hx, ry)} ${at(0, ry)}` +
    `C${at(-hx, ry)} ${at(-rx, hy)} ${at(-rx, 0)}` +
    `C${at(-rx, -hy)} ${at(-hx, -ry)} ${at(0, -ry)}` +
    `C${at(hx, -ry)} ${at(rx, -hy)} ${at(rx, 0)}Z`
  );
}

// The head and both ears are separate shapes in one path, all wound clockwise
// so they fill as one. Draw it twice, first stroked at twice the line width and
// then filled with no stroke: only the outside half of the stroke shows, which
// outlines the whole silhouette and lets the ears grow out of the head with no
// seam. Each ear is an oval that leans out about 4° and is nearly as long as
// the head is tall; the head is widest at the cheeks with a broad, flat chin.
const HEAD =
  'M0 0C29 0 50 17 50 45C50 67 30 80 0 80C-30 80 -50 67 -50 45C-50 17 -29 0 0 0Z' +
  ellipse(-20, -30, 12.5, 44, -4) +
  ellipse(20, -30, 12.5, 44, 4);

const EYE = { x: 23, y: 45, rx: 2.3, ry: 2.9 };
const MOUTH = { y: 59, r: 4.2 };

const DRESS = 'M-27 70L27 70L40.5 124C15 129.5 -15 129.5 -40.5 124Z';
const ARM = capsule(25, 81, 40, 100, 8); // right arm, hanging
const ARM_RAISED = capsule(27, 80, 56, 60, 7.5); // right arm, waving
const ARM_HOLDING = capsule(32, 86, 22, 102, 7); // right arm, holding something at the chest
const ARM_SHY = capsule(29, 83, 38, 64, 7.5); // right arm, paw up on her cheek
// Three little blush strokes on the right cheek, below the eye
const BLUSH = 'M18 60L21 55M23 60L26 55M28 60L31 55';
const FOOT = ellipse(19, 134, 15, 8.5, 8); // right foot

function place(d, x, y, s, flip = false) {
  return d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g, (_, px, py) =>
    pt(x + (flip ? -px : +px) * s, y + py * s)
  );
}

/** Miffy's parts placed with the top of her head at (x, y) and her head s·100 wide. */
export function drawMiffy(x, y, s) {
  const eye = (side) => ({
    cx: round(x + side * EYE.x * s),
    cy: round(y + EYE.y * s),
    rx: round(EYE.rx * s),
    ry: round(EYE.ry * s),
  });
  const m = MOUTH.r;
  return {
    head: place(HEAD, x, y, s),
    eyes: [eye(-1), eye(1)],
    closedEyes: [-1, 1]
      .map((side) => {
        const cx = side * EYE.x;
        return place(`M${cx - 4} ${EYE.y - 0.5}C${cx - 2} ${EYE.y + 2.5} ${cx + 2} ${EYE.y + 2.5} ${cx + 4} ${EYE.y - 0.5}`, x, y, s);
      })
      .join(''),
    mouth: place(`M${-m} ${MOUTH.y - m}L${m} ${MOUTH.y + m}M${m} ${MOUTH.y - m}L${-m} ${MOUTH.y + m}`, x, y, s),
    dress: place(DRESS, x, y, s),
    armLeft: place(ARM, x, y, s, true),
    armRight: place(ARM, x, y, s),
    armRaised: place(ARM_RAISED, x, y, s),
    armsHolding: place(ARM_HOLDING, x, y, s, true) + place(ARM_HOLDING, x, y, s),
    armsShy: place(ARM_SHY, x, y, s, true) + place(ARM_SHY, x, y, s),
    blush: place(BLUSH, x, y, s, true) + place(BLUSH, x, y, s),
    // Eyes squeezed shut in a giggle: little upturned arcs
    happyEyes: [-1, 1]
      .map((side) => {
        const cx = side * EYE.x;
        return place(`M${cx - 4} ${EYE.y + 1.5}C${cx - 2} ${EYE.y - 2.5} ${cx + 2} ${EYE.y - 2.5} ${cx + 4} ${EYE.y + 1.5}`, x, y, s);
      })
      .join(''),
    footLeft: place(FOOT, x, y, s, true),
    footRight: place(FOOT, x, y, s),
  };
}

/**
 * The head-and-ears path as two layers: the stroke at twice the line width
 * underneath, the fill on top (see HEAD). `paint` sets the fill; the stroke
 * colour comes from the surrounding group.
 */
export function outlined(d, lineWidth, paint) {
  return `<path d="${d}" ${paint} stroke-width="${lineWidth * 2}"/><path d="${d}" ${paint} stroke="none"/>`;
}

/**
 * A small Miffy head for icons and badges, sized in em so it sits in text.
 * Her face stays white with an ink outline on light and dark backgrounds.
 */
export function miffyIcon() {
  const m = drawMiffy(50, 71, 0.9);
  const eyes = m.eyes
    .map((e) => `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${fmt(e.rx * 1.3)}" ry="${fmt(e.ry * 1.3)}"/>`)
    .join('');
  return (
    `<svg class="miffy-icon" viewBox="0 0 100 148" width="0.74em" height="1.1em" aria-hidden="true" focusable="false">` +
    `<g stroke="#101010" stroke-linecap="round" stroke-linejoin="round">${outlined(m.head, 4, 'fill="#fafaf6"')}` +
    `<g fill="#101010" stroke="none">${eyes}</g><path d="${m.mouth}" stroke-width="5.5"/></g>` +
    '</svg>'
  );
}
