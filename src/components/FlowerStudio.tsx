import { useCallback, useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ *
 *  Flower Studio — a premium digital flower-arrangement workshop.
 *  Drag blossoms from the shop into the vase, grab a flower's handle to
 *  rotate / resize it, add a gift tag, then export or send the bouquet.
 * ------------------------------------------------------------------ */

const VIEW_W = 800
const VIEW_H = 600
const VASE_MOUTH_Y = 462
const ANCHOR_Y = 548 // stems are rooted well below the rim so they read as "inside"

type FlowerType =
  | 'tulip' | 'daisy' | 'sunflower' | 'rose' | 'lavender' | 'blossom' | 'lily' | 'leaf'
  | 'poppy' | 'carnation' | 'orchid' | 'hydrangea' | 'dahlia' | 'eucalyptus'

type Placed = {
  id: number
  type: FlowerType
  x: number
  y: number
  rot: number
  scale: number
  z: number
}

const SHOP: { type: FlowerType; name: string }[] = [
  { type: 'tulip', name: 'tulip' },
  { type: 'rose', name: 'rose' },
  { type: 'daisy', name: 'daisy' },
  { type: 'sunflower', name: 'sunflower' },
  { type: 'lily', name: 'lily' },
  { type: 'lavender', name: 'lavender' },
  { type: 'blossom', name: 'blossom' },
  { type: 'poppy', name: 'poppy' },
  { type: 'carnation', name: 'carnation' },
  { type: 'orchid', name: 'orchid' },
  { type: 'hydrangea', name: 'hydrangea' },
  { type: 'dahlia', name: 'dahlia' },
  { type: 'eucalyptus', name: 'eucalyptus' },
  { type: 'leaf', name: 'fern' },
]

const OUTLINE = '#1f0a3a'
const STEM = '#3f9e57'
const STEM_DARK = '#2c6f3d'

/* ---- A single flower drawn around its base at the origin (0,0). ---- *
 * The blossom sits above the origin; the stem hangs down into the vase. */
function FlowerShape({ type }: { type: FlowerType }) {
  const stroke = { stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: 'round' as const }
  const stem = (
    <>
      <path d="M0 0 C -6 -50 6 -90 0 -140" fill="none" stroke={STEM_DARK} strokeWidth={9} strokeLinecap="round" />
      <path d="M0 0 C -6 -50 6 -90 0 -140" fill="none" stroke={STEM} strokeWidth={6} strokeLinecap="round" />
      <path d="M-1 -2 C -6 -50 5 -90 -1 -138" fill="none" stroke="#6fd089" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    </>
  )
  const sideLeaf = (
    <>
      <path d="M2 -55 C 30 -60 42 -78 46 -96 C 26 -92 8 -78 2 -62 Z" fill={STEM} {...stroke} />
      <path d="M6 -62 C 22 -68 33 -80 40 -92" fill="none" stroke={STEM_DARK} strokeWidth={2} />
    </>
  )

  switch (type) {
    case 'tulip':
      return (
        <g>
          {stem}{sideLeaf}
          <g transform="translate(0 -150)">
            <path d="M-22 14 C -28 -22 -10 -34 0 -34 C 10 -34 28 -22 22 14 C 12 22 -12 22 -22 14 Z" fill="url(#gradTulip)" {...stroke} />
            <path d="M-22 14 C -20 -8 -10 -20 0 -22 C 8 -22 14 -14 16 -2" fill="#ffa9d6" stroke="none" opacity={0.8} />
            <path d="M0 -34 L0 8" fill="none" stroke="#d63e93" strokeWidth={2} />
            <path d="M-12 -30 C -16 -10 -16 0 -12 12 M12 -30 C 16 -10 16 0 12 12" fill="none" stroke="#d63e93" strokeWidth={1.5} opacity={0.6} />
          </g>
        </g>
      )
    case 'daisy':
      return (
        <g>
          {stem}{sideLeaf}
          <g transform="translate(0 -150)">
            {Array.from({ length: 10 }).map((_, i) => (
              <ellipse key={i} transform={`rotate(${(360 / 10) * i})`} cx={0} cy={-26} rx={8} ry={18} fill="url(#gradDaisy)" {...stroke} />
            ))}
            <circle r={13} fill="url(#gradCenterY)" {...stroke} />
            <circle r={9} fill="#e0a91f" stroke="none" opacity={0.5} />
          </g>
        </g>
      )
    case 'sunflower':
      return (
        <g>
          {stem}{sideLeaf}
          <path d="M-2 -75 C -32 -80 -46 -100 -50 -120 C -28 -116 -8 -100 -2 -82 Z" fill={STEM} {...stroke} transform="scale(-1 1)" />
          <g transform="translate(0 -150)">
            {Array.from({ length: 16 }).map((_, i) => (
              <path key={i} transform={`rotate(${(360 / 16) * i})`} d="M-7 -22 C -9 -44 9 -44 7 -22 Z" fill="url(#gradSun)" {...stroke} strokeWidth={2} />
            ))}
            <circle r={18} fill="#7a4a22" {...stroke} />
            <circle r={18} fill="url(#gradSunCore)" stroke="none" />
          </g>
        </g>
      )
    case 'rose':
      return (
        <g>
          {stem}{sideLeaf}
          <g transform="translate(0 -150)">
            <circle r={24} fill="url(#gradRose)" {...stroke} />
            <path d="M-24 0 A24 24 0 0 1 24 0 A16 16 0 0 1 -16 0 A10 10 0 0 1 12 0" fill="none" stroke="#b81e30" strokeWidth={3} strokeLinecap="round" />
            <circle r={7} fill="#ff8a96" stroke="none" />
            <path d="M-24 4 C -34 18 -20 30 -6 24 M24 4 C 34 18 20 30 6 24" fill="#ff6b78" {...stroke} strokeWidth={2} />
          </g>
        </g>
      )
    case 'lavender':
      return (
        <g>
          {stem}{sideLeaf}
          {Array.from({ length: 9 }).map((_, i) => {
            const yy = -100 - i * 11
            const off = i % 2 === 0 ? -7 : 7
            return <circle key={i} cx={off} cy={yy} r={7} fill="url(#gradLav)" {...stroke} strokeWidth={2} />
          })}
          <circle cx={0} cy={-200} r={6} fill="#c4b2ff" {...stroke} strokeWidth={2} />
        </g>
      )
    case 'blossom':
      return (
        <g>
          {stem}{sideLeaf}
          {[{ x: 0, y: -150, s: 1 }, { x: -26, y: -126, s: 0.78 }, { x: 24, y: -130, s: 0.82 }, { x: 6, y: -178, s: 0.7 }].map((b, bi) => (
            <g key={bi} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <circle key={i} transform={`rotate(${(360 / 5) * i})`} cx={0} cy={-15} r={11} fill="url(#gradBlossom)" {...stroke} strokeWidth={2} />
              ))}
              <circle r={6} fill="#ffd84a" {...stroke} strokeWidth={2} />
            </g>
          ))}
        </g>
      )
    case 'lily':
      return (
        <g>
          {stem}{sideLeaf}
          <g transform="translate(0 -150)">
            {Array.from({ length: 6 }).map((_, i) => (
              <path key={i} transform={`rotate(${(360 / 6) * i})`} d="M0 -8 C -13 -26 -8 -48 0 -56 C 8 -48 13 -26 0 -8 Z" fill="url(#gradLily)" {...stroke} />
            ))}
            <circle r={9} fill="#fff4fb" {...stroke} strokeWidth={2} />
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={i} transform={`rotate(${(360 / 5) * i})`} x1={0} y1={0} x2={0} y2={-16} stroke="#d96aa6" strokeWidth={3} strokeLinecap="round" />
            ))}
          </g>
        </g>
      )
    case 'poppy':
      return (
        <g>
          {stem}{sideLeaf}
          <g transform="translate(0 -150)">
            {[0, 90, 180, 270].map((a) => (
              <path key={a} transform={`rotate(${a})`} d="M-26 2 C -30 -30 -14 -44 0 -44 C 14 -44 30 -30 26 2 C 14 12 -14 12 -26 2 Z" fill="url(#gradPoppy)" {...stroke} />
            ))}
            <circle r={11} fill="#2a1208" {...stroke} strokeWidth={2} />
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={i} transform={`rotate(${(360 / 8) * i})`} cx={0} cy={-9} r={1.8} fill="#1a0a04" />
            ))}
          </g>
        </g>
      )
    case 'carnation':
      return (
        <g>
          {stem}{sideLeaf}
          <g transform="translate(0 -150)">
            {[24, 17, 10].map((r, ri) => (
              <g key={ri}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <path key={i} transform={`rotate(${(360 / 12) * i + ri * 8})`} d={`M-5 0 C -6 ${-r} 6 ${-r} 5 0 Z`} fill="url(#gradCarn)" stroke={OUTLINE} strokeWidth={1.5} strokeLinejoin="round" />
                ))}
              </g>
            ))}
            <circle r={5} fill="#ffd6ea" stroke="none" />
          </g>
        </g>
      )
    case 'orchid':
      return (
        <g>
          {stem}{sideLeaf}
          <g transform="translate(0 -150)">
            {[0, 72, 144, 216, 288].map((a) => (
              <path key={a} transform={`rotate(${a})`} d="M0 -6 C -16 -20 -16 -44 0 -52 C 16 -44 16 -20 0 -6 Z" fill="url(#gradOrchid)" {...stroke} />
            ))}
            <path d="M0 2 C -12 8 -12 22 0 26 C 12 22 12 8 0 2 Z" fill="#ffe14a" {...stroke} strokeWidth={2} />
            <circle r={5} fill="#ff8ad0" stroke="none" />
          </g>
        </g>
      )
    case 'hydrangea':
      return (
        <g>
          {stem}{sideLeaf}
          <g transform="translate(0 -150)">
            {[[0, 0], [-20, -6], [20, -6], [-12, 16], [12, 16], [0, -22], [0, 20]].map(([cx, cy], fi) => (
              <g key={fi} transform={`translate(${cx} ${cy})`}>
                {[0, 90, 180, 270].map((a) => (
                  <circle key={a} transform={`rotate(${a})`} cx={0} cy={-7} r={6} fill="url(#gradHydr)" stroke={OUTLINE} strokeWidth={1.5} />
                ))}
                <circle r={2.4} fill="#fff7c0" stroke="none" />
              </g>
            ))}
          </g>
        </g>
      )
    case 'dahlia':
      return (
        <g>
          {stem}{sideLeaf}
          <g transform="translate(0 -150)">
            {Array.from({ length: 16 }).map((_, i) => (
              <path key={`o${i}`} transform={`rotate(${(360 / 16) * i})`} d="M-6 -10 C -8 -34 8 -34 6 -10 Z" fill="url(#gradDahlia)" stroke={OUTLINE} strokeWidth={1.5} strokeLinejoin="round" />
            ))}
            {Array.from({ length: 12 }).map((_, i) => (
              <path key={`i${i}`} transform={`rotate(${(360 / 12) * i + 15})`} d="M-5 -4 C -6 -22 6 -22 5 -4 Z" fill="#ffd07a" stroke={OUTLINE} strokeWidth={1.2} strokeLinejoin="round" />
            ))}
            <circle r={6} fill="#c9551f" {...stroke} strokeWidth={2} />
          </g>
        </g>
      )
    case 'eucalyptus':
      return (
        <g>
          <path d="M0 0 C 4 -60 -4 -120 0 -180" fill="none" stroke={STEM_DARK} strokeWidth={6} strokeLinecap="round" />
          <path d="M0 0 C 4 -60 -4 -120 0 -180" fill="none" stroke="#7fae8f" strokeWidth={3} strokeLinecap="round" />
          {Array.from({ length: 7 }).map((_, i) => {
            const yy = -30 - i * 22
            const r = 13 - i
            return (
              <g key={i}>
                <circle cx={-14} cy={yy} r={r} fill="url(#gradEuca)" stroke={STEM_DARK} strokeWidth={2} />
                <circle cx={14} cy={yy - 10} r={r} fill="url(#gradEuca)" stroke={STEM_DARK} strokeWidth={2} />
              </g>
            )
          })}
          <circle cx={0} cy={-182} r={5} fill="url(#gradEuca)" stroke={STEM_DARK} strokeWidth={2} />
        </g>
      )
    case 'leaf':
      return (
        <g>
          <path d="M0 0 C 0 -60 0 -120 0 -170" fill="none" stroke={STEM_DARK} strokeWidth={7} strokeLinecap="round" />
          <path d="M0 0 C 0 -60 0 -120 0 -170" fill="none" stroke={STEM} strokeWidth={4} strokeLinecap="round" />
          {Array.from({ length: 7 }).map((_, i) => {
            const yy = -24 - i * 22
            const len = 40 - i * 3
            return (
              <g key={i}>
                <path d={`M0 ${yy} C ${-len * 0.6} ${yy - 4} ${-len} ${yy - 16} ${-len} ${yy - 22}`} fill="none" stroke={STEM} strokeWidth={5} strokeLinecap="round" />
                <path d={`M0 ${yy} C ${len * 0.6} ${yy - 4} ${len} ${yy - 16} ${len} ${yy - 22}`} fill="none" stroke={STEM} strokeWidth={5} strokeLinecap="round" />
              </g>
            )
          })}
        </g>
      )
  }
}

/* Gradients & filters shared by every flower / the vase / the stage. */
function StageDefs({ vaseColor }: { vaseColor: string }) {
  const radial = (id: string, light: string, dark: string) => (
    <radialGradient id={id} cx="38%" cy="30%" r="75%">
      <stop offset="0%" stopColor={light} />
      <stop offset="100%" stopColor={dark} />
    </radialGradient>
  )
  return (
    <defs>
      {radial('gradTulip', '#ff8ec9', '#e23e93')}
      {radial('gradDaisy', '#ffffff', '#e7dcb6')}
      {radial('gradCenterY', '#ffe98a', '#f0b91f')}
      {radial('gradSun', '#ffd24a', '#f08a00')}
      {radial('gradSunCore', '#8a5a2c', '#4a2c12')}
      {radial('gradRose', '#ff6b78', '#c4122a')}
      {radial('gradLav', '#b9a3ff', '#7a5cf0')}
      {radial('gradBlossom', '#ffc2de', '#ff7eb6')}
      {radial('gradLily', '#ffd0ea', '#ff9ed0')}
      {radial('gradPoppy', '#ff7a3a', '#d61f1f')}
      {radial('gradCarn', '#ffb0d6', '#ff5b9e')}
      {radial('gradOrchid', '#d6a3ff', '#9a4cf0')}
      {radial('gradHydr', '#9ec7ff', '#5a7ef0')}
      {radial('gradDahlia', '#ffa24a', '#e8551f')}
      {radial('gradEuca', '#bfe0c9', '#7fae8f')}
      <linearGradient id="vaseSheen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.5} />
        <stop offset="42%" stopColor="#ffffff" stopOpacity={0.1} />
        <stop offset="100%" stopColor="#000000" stopOpacity={0.25} />
      </linearGradient>
      <linearGradient id="vaseBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={vaseColor} stopOpacity={1} />
        <stop offset="100%" stopColor={vaseColor} stopOpacity={1} />
      </linearGradient>
      {/* the vase mouth: a soft shadowed opening (not a black hole) */}
      <radialGradient id="vaseMouth" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#000000" stopOpacity={0.5} />
        <stop offset="70%" stopColor={vaseColor} stopOpacity={0.85} />
        <stop offset="100%" stopColor={vaseColor} stopOpacity={1} />
      </radialGradient>
      <radialGradient id="spotlight" cx="50%" cy="42%" r="55%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.16} />
        <stop offset="60%" stopColor="#ffffff" stopOpacity={0.04} />
        <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="vignette" cx="50%" cy="48%" r="72%">
        <stop offset="60%" stopColor="#000000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000000" stopOpacity={0.5} />
      </radialGradient>
      <filter id="drop" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.32" />
      </filter>
    </defs>
  )
}

/* The vase. Two parts: a BACK rim (drawn behind the stems so they appear to
 * dip inside) and a FRONT body (drawn over the stems so they're tucked in). */
function VaseBack() {
  return (
    <g transform={`translate(${VIEW_W / 2} ${VASE_MOUTH_Y})`}>
      <ellipse cx={0} cy={0} rx={96} ry={18} fill="url(#vaseMouth)" stroke={OUTLINE} strokeWidth={4} />
    </g>
  )
}
function VaseFront() {
  return (
    <g transform={`translate(${VIEW_W / 2} ${VASE_MOUTH_Y})`}>
      {/* contact shadow on the table */}
      <ellipse cx={0} cy={200} rx={124} ry={20} fill="#000000" opacity={0.35} />
      {/* front half of the rim + body (opaque, so stems tuck behind it) */}
      <path
        d="M-96 0 C -96 64 -124 74 -80 156 C -60 192 60 192 80 156 C 124 74 96 64 96 0 C 96 22 -96 22 -96 0 Z"
        fill="url(#vaseBody)" stroke={OUTLINE} strokeWidth={5} strokeLinejoin="round"
      />
      <path
        d="M-96 0 C -96 64 -124 74 -80 156 C -60 192 60 192 80 156 C 124 74 96 64 96 0 C 96 22 -96 22 -96 0 Z"
        fill="url(#vaseSheen)" stroke="none"
      />
      {/* highlight streaks */}
      <path d="M-60 28 C -74 74 -78 118 -54 158" fill="none" stroke="#ffffff" strokeWidth={7} opacity={0.5} strokeLinecap="round" />
      <path d="M-42 32 C -52 74 -54 112 -38 150" fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.3} strokeLinecap="round" />
    </g>
  )
}

const VASE_COLORS = ['#7ac1ff', '#ff5dac', '#ffd84a', '#7be67b', '#c9a0ff', '#f7eed1']
const BG_PRESETS: { name: string; from: string; to: string }[] = [
  { name: 'midnight', from: '#1a0f3d', to: '#0a0420' },
  { name: 'dusk', from: '#3a1f4f', to: '#160a26' },
  { name: 'ocean', from: '#123a5f', to: '#071826' },
  { name: 'forest', from: '#1f4a2e', to: '#0c1f14' },
  { name: 'sunset', from: '#5f2f1f', to: '#2a1410' },
  { name: 'rose', from: '#5f1f3f', to: '#260a18' },
]

function wrapText(s: string, max: number, maxLines: number): string[] {
  const words = s.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      if (line) lines.push(line)
      line = w
    } else line = (line + ' ' + w).trim()
    if (lines.length >= maxLines) break
  }
  if (line && lines.length < maxLines) lines.push(line)
  return lines.slice(0, maxLines)
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export default function FlowerStudio() {
  const [flowers, setFlowers] = useState<Placed[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [vaseColor, setVaseColor] = useState(VASE_COLORS[0])
  const [bg, setBg] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [sound, setSound] = useState(true)
  const [ghost, setGhost] = useState<{ type: FlowerType; x: number; y: number } | null>(null)

  const [showTag, setShowTag] = useState(false)
  const [to, setTo] = useState('')
  const [from, setFrom] = useState('')
  const [note, setNote] = useState('')

  const svgRef = useRef<SVGSVGElement | null>(null)
  const nextId = useRef(1)
  const zTop = useRef(1)
  const audioCtx = useRef<AudioContext | null>(null)

  // ----- multi-pointer interaction state -----
  // one finger on a stem = move; two fingers on a stem = pinch (scale) + twist (rotate)
  const ptPos = useRef<Map<number, { x: number; y: number }>>(new Map()) // svg coords by pointerId
  const ptFlower = useRef<Map<number, number>>(new Map()) // pointerId -> flowerId
  const drag = useRef<{ id: number; dx: number; dy: number; pid: number } | null>(null)
  const gesture = useRef<{ id: number; a: number; b: number; dist0: number; ang0: number; scale0: number; rot0: number } | null>(null)
  const listening = useRef(false)

  const playPluck = () => {
    if (!sound) return
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!audioCtx.current) audioCtx.current = new AC()
      const ctx = audioCtx.current
      if (ctx.state === 'suspended') ctx.resume()
      const t = ctx.currentTime
      ;[523.25, 783.99].forEach((f, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = f
        const start = t + i * 0.06
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(0.12, start + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)
        osc.connect(gain).connect(ctx.destination)
        osc.start(start)
        osc.stop(start + 0.45)
      })
    } catch { /* audio unavailable */ }
  }

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: clientX, y: clientY }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }, [])

  const rootInVase = (x: number, y: number) => ({
    x: clamp(x, VIEW_W / 2 - 88, VIEW_W / 2 + 88),
    y: clamp(y, ANCHOR_Y - 22, ANCHOR_Y + 12),
  })

  const addFlowerAt = (type: FlowerType, x: number, y: number) => {
    const z = ++zTop.current
    const { x: rx, y: ry } = rootInVase(x, y)
    const id = nextId.current++
    const rot = (rx - VIEW_W / 2) * 0.18 // gentle initial fan from where it lands
    setFlowers((f) => [...f, { id, type, x: rx, y: ry, rot, scale: 1, z }])
    setSelected(id)
    playPluck()
  }

  const addFlower = (type: FlowerType) => addFlowerAt(type, VIEW_W / 2 + (Math.random() - 0.5) * 120, ANCHOR_Y)

  // ----- drag a flower OUT of the shop and INTO the vase -----
  const startShopDrag = (e: React.PointerEvent, type: FlowerType) => {
    e.preventDefault()
    const start = { x: e.clientX, y: e.clientY }
    let moved = false
    setGhost({ type, x: e.clientX, y: e.clientY })
    const move = (ev: PointerEvent) => {
      if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 6) moved = true
      setGhost((g) => (g ? { ...g, x: ev.clientX, y: ev.clientY } : g))
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setGhost(null)
      const svg = svgRef.current
      if (svg) {
        const r = svg.getBoundingClientRect()
        if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) {
          const p = clientToSvg(ev.clientX, ev.clientY)
          addFlowerAt(type, p.x, p.y)
          return
        }
      }
      if (!moved) addFlower(type)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // ----- one finger moves a stem; two fingers pinch-resize & twist-rotate it -----
  const winMove = useCallback((ev: PointerEvent) => {
    if (!ptPos.current.has(ev.pointerId)) return
    ptPos.current.set(ev.pointerId, clientToSvg(ev.clientX, ev.clientY))
    const g = gesture.current
    if (g) {
      const a = ptPos.current.get(g.a)
      const b = ptPos.current.get(g.b)
      if (a && b) {
        const dist = Math.hypot(b.x - a.x, b.y - a.y)
        const ang = Math.atan2(b.y - a.y, b.x - a.x)
        const scale = clamp((g.scale0 * dist) / (g.dist0 || 1), 0.5, 2)
        const rot = g.rot0 + ((ang - g.ang0) * 180) / Math.PI
        setFlowers((arr) => arr.map((fl) => (fl.id === g.id ? { ...fl, scale, rot } : fl)))
      }
      return
    }
    const d = drag.current
    if (d && d.pid === ev.pointerId) {
      const p = ptPos.current.get(ev.pointerId)!
      const { x, y } = rootInVase(p.x + d.dx, p.y + d.dy)
      setFlowers((arr) => arr.map((fl) => (fl.id === d.id ? { ...fl, x, y } : fl)))
    }
  }, [clientToSvg])

  const winUp = useCallback((ev: PointerEvent) => {
    ptPos.current.delete(ev.pointerId)
    ptFlower.current.delete(ev.pointerId)
    const g = gesture.current
    if (g && (ev.pointerId === g.a || ev.pointerId === g.b)) {
      gesture.current = null
      // if one finger remains on the same flower, continue moving with it
      const rest = [...ptFlower.current.entries()].find(([, fid]) => fid === g.id)
      if (rest) {
        const [pid] = rest
        const p = ptPos.current.get(pid)!
        setFlowers((arr) => {
          const f = arr.find((fl) => fl.id === g.id)
          if (f) drag.current = { id: g.id, dx: f.x - p.x, dy: f.y - p.y, pid }
          return arr
        })
      }
    }
    if (drag.current && drag.current.pid === ev.pointerId) drag.current = null
    if (ptPos.current.size === 0) {
      listening.current = false
      window.removeEventListener('pointermove', winMove)
      window.removeEventListener('pointerup', winUp)
      window.removeEventListener('pointercancel', winUp)
    }
  }, [winMove])

  const onPointerDownFlower = (e: React.PointerEvent, id: number) => {
    e.stopPropagation()
    const p = clientToSvg(e.clientX, e.clientY)
    ptPos.current.set(e.pointerId, p)
    ptFlower.current.set(e.pointerId, id)
    setSelected(id)
    const z = ++zTop.current
    setFlowers((arr) => arr.map((fl) => (fl.id === id ? { ...fl, z } : fl)))

    const onThis = [...ptFlower.current.entries()].filter(([, fid]) => fid === id).map(([pid]) => pid)
    setFlowers((arr) => {
      const f = arr.find((fl) => fl.id === id)
      if (!f) return arr
      if (onThis.length >= 2) {
        // begin pinch/twist with the two most recent fingers on this flower
        const a = onThis[onThis.length - 2]
        const b = onThis[onThis.length - 1]
        const pa = ptPos.current.get(a)!
        const pb = ptPos.current.get(b)!
        drag.current = null
        gesture.current = {
          id, a, b,
          dist0: Math.hypot(pb.x - pa.x, pb.y - pa.y),
          ang0: Math.atan2(pb.y - pa.y, pb.x - pa.x),
          scale0: f.scale, rot0: f.rot,
        }
      } else {
        drag.current = { id, dx: f.x - p.x, dy: f.y - p.y, pid: e.pointerId }
      }
      return arr
    })

    if (!listening.current) {
      listening.current = true
      window.addEventListener('pointermove', winMove)
      window.addEventListener('pointerup', winUp)
      window.addEventListener('pointercancel', winUp)
    }
  }

  // ----- grab the handle to ROTATE + RESIZE with one finger / the mouse -----
  const startTransform = (e: React.PointerEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSelected(id)
    const move = (ev: PointerEvent) => {
      setFlowers((arr) =>
        arr.map((fl) => {
          if (fl.id !== id) return fl
          const p = clientToSvg(ev.clientX, ev.clientY)
          const vx = p.x - fl.x
          const vy = p.y - fl.y
          const rot = (Math.atan2(vy, vx) * 180) / Math.PI + 90 // up-axis -> 0°
          const scale = clamp((Math.hypot(vx, vy) - 24) / 150, 0.5, 2)
          return { ...fl, rot, scale }
        }),
      )
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const deleteSelected = () => {
    setFlowers((arr) => arr.filter((fl) => fl.id !== selected))
    setSelected(null)
  }

  const undo = () => {
    setFlowers((arr) => {
      if (!arr.length) return arr
      const maxId = Math.max(...arr.map((f) => f.id))
      return arr.filter((f) => f.id !== maxId)
    })
    setSelected(null)
  }

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const renderBlob = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const svg = svgRef.current
      if (!svg) return reject(new Error('no stage'))
      const clone = svg.cloneNode(true) as SVGSVGElement
      clone.querySelectorAll('[data-export-hide]').forEach((n) => n.remove())
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      const xml = new XMLSerializer().serializeToString(clone)
      const src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)))
      const img = new Image()
      img.onload = () => {
        const scale = 2
        const canvas = document.createElement('canvas')
        canvas.width = VIEW_W * scale
        canvas.height = VIEW_H * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
      }
      img.onerror = () => reject(new Error('image load failed'))
      img.src = src
    })

  const exportPng = async () => {
    if (!flowers.length) return flash('add some flowers first ✿')
    try {
      const blob = await renderBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bouquet.png'
      a.click()
      URL.revokeObjectURL(url)
      flash('saved bouquet.png ✓')
    } catch { flash('export failed — try again') }
  }

  const share = async () => {
    if (!flowers.length) return flash('add some flowers first ✿')
    try {
      const blob = await renderBlob()
      const file = new File([blob], 'bouquet.png', { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      const text = note || 'I arranged this bouquet for you ✿'
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'A bouquet for you', text })
        flash('shared ✓')
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bouquet.png'
        a.click()
        URL.revokeObjectURL(url)
        window.location.href =
          'mailto:?subject=' + encodeURIComponent('A bouquet for you ✿') +
          '&body=' + encodeURIComponent(text + '\n\n(the picture bouquet.png just downloaded — attach it to this email!)')
        flash('sharing not supported here — image saved, email opened')
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') flash('could not share')
    }
  }

  const clearAll = () => { setFlowers([]); setSelected(null) }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected != null) { e.preventDefault(); deleteSelected() }
      else if (e.key === 'Escape') setSelected(null)
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  // tidy up any dangling drag listeners if the studio unmounts mid-gesture
  useEffect(() => () => {
    window.removeEventListener('pointermove', winMove)
    window.removeEventListener('pointerup', winUp)
    window.removeEventListener('pointercancel', winUp)
  }, [winMove, winUp])

  const ordered = [...flowers].sort((a, b) => a.z - b.z)
  const preset = BG_PRESETS[bg]
  const tagLines = wrapText(note, 18, 3)
  const tagVisible = showTag && (to || from || note)
  const sel = flowers.find((f) => f.id === selected) || null
  // handle position: out along the selected flower's axis, past the blossom
  let handle = { x: 0, y: 0 }
  if (sel) {
    const rad = ((sel.rot - 90) * Math.PI) / 180
    const d = 150 * sel.scale + 24
    handle = { x: sel.x + Math.cos(rad) * d, y: sel.y + Math.sin(rad) * d }
  }

  return (
    <div className="crt min-h-screen starfield">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <a href="#/" className="btn btn-blue">← back</a>
          <h1 className="font-pixel text-cream text-2xl sm:text-3xl pixel-h-sm text-center">FLOWER STUDIO</h1>
          <div className="flex gap-2">
            <button className="btn" onClick={() => setSound((s) => !s)} title="toggle sound">{sound ? '♪ on' : '♪ off'}</button>
            <button className="btn btn-green" onClick={exportPng}>⤓ export</button>
            <button className="btn btn-pink" onClick={share}>✉ send</button>
          </div>
        </div>
        <p className="font-body text-coin text-xl mt-1 text-center">
          ✿ drag a flower into the vase · drag the ✿ handle — or pinch &amp; twist with two fingers — to resize &amp; rotate ✿
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[268px_1fr]">
          {/* ---- shop / palette ---- */}
          <aside className="box-dark">
            <div className="font-pixel text-xs text-coin mb-3">FLOWER SHOP</div>
            <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
              {SHOP.map((s) => (
                <button
                  key={s.type}
                  onPointerDown={(e) => startShopDrag(e, s.type)}
                  title={`drag ${s.name} into the vase`}
                  className="group flex flex-col items-center gap-1 border-2 border-cream/40 hover:border-coin bg-deep/60 hover:bg-deep p-2 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 touch-none"
                  style={{ cursor: 'grab' }}
                >
                  <svg viewBox="-70 -210 140 230" className="w-full h-20 pointer-events-none">
                    <StageDefs vaseColor={vaseColor} />
                    <FlowerShape type={s.type} />
                  </svg>
                  <span className="font-mono text-[10px] text-cream group-hover:text-coin uppercase">{s.name}</span>
                </button>
              ))}
            </div>

            <div className="font-pixel text-xs text-coin mt-5 mb-2">VASE</div>
            <div className="flex flex-wrap gap-2">
              {VASE_COLORS.map((c) => (
                <button key={c} onClick={() => setVaseColor(c)} aria-label="vase color"
                  className={`w-7 h-7 border-2 transition-transform hover:scale-110 ${vaseColor === c ? 'border-coin scale-110' : 'border-cream/40'}`} style={{ background: c }} />
              ))}
            </div>

            <div className="font-pixel text-xs text-coin mt-4 mb-2">BACKDROP</div>
            <div className="flex flex-wrap gap-2">
              {BG_PRESETS.map((p, i) => (
                <button key={p.name} onClick={() => setBg(i)} title={p.name} aria-label={`${p.name} backdrop`}
                  className={`w-7 h-7 border-2 transition-transform hover:scale-110 ${bg === i ? 'border-coin scale-110' : 'border-cream/40'}`}
                  style={{ background: `linear-gradient(${p.from}, ${p.to})` }} />
              ))}
            </div>

            {/* gift tag */}
            <div className="flex items-center justify-between mt-5 mb-2">
              <span className="font-pixel text-xs text-coin">GIFT TAG</span>
              <button onClick={() => setShowTag((v) => !v)}
                className={`font-mono text-[10px] px-2 py-0.5 border-2 ${showTag ? 'border-coin text-coin' : 'border-cream/40 text-cream/70'}`}>
                {showTag ? 'shown' : 'hidden'}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <input value={to} onChange={(e) => setTo(e.target.value)} maxLength={18} placeholder="To…"
                className="font-body text-lg bg-deep/70 border-2 border-cream/30 focus:border-coin outline-none px-2 py-1 text-cream placeholder:text-cream/40" />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={70} placeholder="A short message…" rows={2}
                className="font-body text-lg bg-deep/70 border-2 border-cream/30 focus:border-coin outline-none px-2 py-1 text-cream placeholder:text-cream/40 resize-none" />
              <input value={from} onChange={(e) => setFrom(e.target.value)} maxLength={18} placeholder="From…"
                className="font-body text-lg bg-deep/70 border-2 border-cream/30 focus:border-coin outline-none px-2 py-1 text-cream placeholder:text-cream/40" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <button className="btn" onClick={undo}>↶ undo</button>
              <button className="btn btn-pink" onClick={clearAll}>✕ clear</button>
            </div>
          </aside>

          {/* ---- stage ---- */}
          <main>
            <div className="box p-2">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="w-full touch-none select-none rounded-sm"
                style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}`, display: 'block', imageRendering: 'auto' }}
                onPointerDown={() => setSelected(null)}
              >
                <StageDefs vaseColor={vaseColor} />

                <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={preset.from} />
                  <stop offset="100%" stopColor={preset.to} />
                </linearGradient>
                <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#bgGrad)" />
                <ellipse cx={VIEW_W / 2} cy={300} rx={520} ry={300} fill="url(#spotlight)" />
                <rect x={0} y={VIEW_H - 70} width={VIEW_W} height={70} fill="#000000" opacity={0.3} />

                {/* drifting petals (decorative, not exported) */}
                {[0, 1, 2, 3].map((i) => (
                  <g key={i} data-export-hide opacity={0.5}>
                    <circle cx={120 + i * 180} cy={-20} r={5} fill={['#ff9ecb', '#ffd84a', '#c4b2ff', '#ffffff'][i]}>
                      <animateTransform attributeName="transform" type="translate" values={`0 0; 30 ${VIEW_H + 60}`} dur={`${9 + i * 2}s`} begin={`${i * 1.5}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                ))}

                {flowers.length === 0 && (
                  <text data-export-hide x={VIEW_W / 2} y={250} textAnchor="middle" fill="#f7eed1" opacity={0.55} fontFamily="VT323, monospace" fontSize={30}>
                    drag a flower from the shop into the vase ↓
                  </text>
                )}

                {/* back rim — stems dip behind this */}
                <VaseBack />

                {/* flowers */}
                {ordered.map((f) => {
                  const dur = 3.6 + (f.id % 5) * 0.4
                  const delay = (f.id % 7) * 0.3
                  const amp = 1.6 + (f.id % 3) * 0.7
                  return (
                    <g key={f.id} transform={`translate(${f.x} ${f.y})`} onPointerDown={(e) => onPointerDownFlower(e, f.id)} style={{ cursor: 'grab' }}>
                      <g transform={`rotate(${f.rot}) scale(${f.scale})`}>
                        <rect x={-60} y={-210} width={120} height={230} fill="transparent" />
                        <g filter="url(#drop)">
                          <animateTransform attributeName="transform" type="scale" from="0.4" to="1" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.9 0.3 1" keyTimes="0;1" />
                          <g>
                            <animateTransform attributeName="transform" type="rotate" values={`${-amp};${amp};${-amp}`} dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" keyTimes="0;0.5;1" />
                            <FlowerShape type={f.type} />
                          </g>
                        </g>
                      </g>
                    </g>
                  )
                })}

                {/* front body — stems tuck inside */}
                <VaseFront />

                {/* gift tag tied to the vase (baked into exports) */}
                {tagVisible && (
                  <g transform={`translate(${VIEW_W / 2 + 134} 392) rotate(-5)`}>
                    <path d="M-70 88 Q -30 28 12 12" fill="none" stroke="#d8c9a0" strokeWidth={2} />
                    <rect x={0} y={0} width={152} height={108} rx={8} fill="#f7eed1" stroke={OUTLINE} strokeWidth={3} />
                    <circle cx={14} cy={14} r={5} fill="#08030f" />
                    {to && <text x={26} y={30} fontFamily="VT323, monospace" fontSize={20} fill="#1f0a3a">To {to}</text>}
                    {tagLines.map((ln, i) => (
                      <text key={i} x={20} y={52 + i * 18} fontFamily="VT323, monospace" fontSize={18} fill="#3a2a14">{ln}</text>
                    ))}
                    {from && <text x={142} y={100} textAnchor="end" fontFamily="VT323, monospace" fontSize={18} fill="#b81e30">♥ {from}</text>}
                  </g>
                )}

                {/* selection + transform handle (not exported) */}
                {sel && (
                  <g data-export-hide>
                    <line x1={sel.x} y1={sel.y} x2={handle.x} y2={handle.y} stroke="#ffd84a" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.7} />
                    <circle cx={sel.x} cy={sel.y} r={5} fill="#ffd84a" stroke={OUTLINE} strokeWidth={1.5} />
                    {/* large invisible touch target */}
                    <circle cx={handle.x} cy={handle.y} r={26} fill="transparent" style={{ cursor: 'grab' }} onPointerDown={(e) => startTransform(e, sel.id)} />
                    <circle cx={handle.x} cy={handle.y} r={15} fill="#ffd84a" stroke={OUTLINE} strokeWidth={2.5} style={{ cursor: 'grab' }} onPointerDown={(e) => startTransform(e, sel.id)} />
                    <text x={handle.x} y={handle.y + 5} textAnchor="middle" fontSize={16} fill={OUTLINE} style={{ pointerEvents: 'none' }} fontFamily="VT323, monospace">✿</text>
                  </g>
                )}

                <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#vignette)" pointerEvents="none" />
              </svg>
            </div>

            {/* controls / hint */}
            <div className="box-dark mt-4 flex items-center gap-3 flex-wrap min-h-[64px]">
              {sel == null ? (
                <span className="font-body text-cream/70 text-xl px-1">
                  ✿ tap a flower, then drag its glowing ✿ handle to twist &amp; resize · drag the stem to move it
                </span>
              ) : (
                <>
                  <span className="font-pixel text-[10px] text-coin mr-1">SELECTED</span>
                  <span className="font-body text-cream/80 text-lg">drag the ✿ handle, or pinch &amp; twist with two fingers, to rotate &amp; resize</span>
                  <button className="btn btn-pink ml-auto" onClick={deleteSelected}>🗑 remove</button>
                </>
              )}
            </div>
          </main>
        </div>

        <footer className="text-center font-mono text-xs text-cream/40 py-8">
          ✿ {flowers.length} stem{flowers.length === 1 ? '' : 's'} arranged ✿ made in the flower studio
        </footer>
      </div>

      {/* floating drag preview from the shop */}
      {ghost && (
        <div className="fixed z-[95] pointer-events-none"
          style={{ left: ghost.x, top: ghost.y, transform: 'translate(-50%, -70%) scale(0.7)', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))' }}>
          <svg viewBox="-70 -210 140 230" width={120} height={196}>
            <StageDefs vaseColor={vaseColor} />
            <FlowerShape type={ghost.type} />
          </svg>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] box font-mono text-sm px-4 py-2">{toast}</div>
      )}
    </div>
  )
}
