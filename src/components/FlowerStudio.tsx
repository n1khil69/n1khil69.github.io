import { useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ *
 *  Flower Studio — a premium digital flower-arrangement workshop.
 *  Drag blossoms from the shop into the vase, fan them out to arrange,
 *  add a gift tag, then export the bouquet as a picture or send it.
 * ------------------------------------------------------------------ */

const VIEW_W = 800
const VIEW_H = 600
const VASE_MOUTH_Y = 470
const ANCHOR_Y = 540 // stems are rooted below the rim so they read as "inside"

type FlowerType =
  | 'tulip'
  | 'daisy'
  | 'sunflower'
  | 'rose'
  | 'lavender'
  | 'blossom'
  | 'lily'
  | 'leaf'

type Placed = {
  id: number
  type: FlowerType
  x: number
  y: number
  rot: number
  scale: number
  z: number
}

const SHOP: { type: FlowerType; name: string; swatch: string }[] = [
  { type: 'tulip', name: 'tulip', swatch: '#ff5dac' },
  { type: 'rose', name: 'rose', swatch: '#ff3a4f' },
  { type: 'daisy', name: 'daisy', swatch: '#f7eed1' },
  { type: 'sunflower', name: 'sunflower', swatch: '#ffd84a' },
  { type: 'lily', name: 'lily', swatch: '#ffb6e0' },
  { type: 'lavender', name: 'lavender', swatch: '#9a7bff' },
  { type: 'blossom', name: 'blossom', swatch: '#ff9ecb' },
  { type: 'leaf', name: 'fern', swatch: '#4cc474' },
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
          {stem}
          {sideLeaf}
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
          {stem}
          {sideLeaf}
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
          {stem}
          {sideLeaf}
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
          {stem}
          {sideLeaf}
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
          {stem}
          {sideLeaf}
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
          {stem}
          {sideLeaf}
          {[
            { x: 0, y: -150, s: 1 },
            { x: -26, y: -126, s: 0.78 },
            { x: 24, y: -130, s: 0.82 },
            { x: 6, y: -178, s: 0.7 },
          ].map((b, bi) => (
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
          {stem}
          {sideLeaf}
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
      <linearGradient id="vaseSheen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.55} />
        <stop offset="40%" stopColor="#ffffff" stopOpacity={0.12} />
        <stop offset="100%" stopColor="#000000" stopOpacity={0.22} />
      </linearGradient>
      <linearGradient id="vaseBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={vaseColor} stopOpacity={0.95} />
        <stop offset="100%" stopColor={vaseColor} stopOpacity={1} />
      </linearGradient>
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

function Vase() {
  return (
    <g transform={`translate(${VIEW_W / 2} ${VASE_MOUTH_Y})`}>
      {/* contact shadow on the table */}
      <ellipse cx={0} cy={196} rx={120} ry={20} fill="#000000" opacity={0.35} />
      {/* opening */}
      <ellipse cx={0} cy={0} rx={92} ry={16} fill="#08030f" stroke={OUTLINE} strokeWidth={4} />
      {/* body */}
      <path
        d="M-92 0 C -92 60 -120 70 -78 150 C -60 184 60 184 78 150 C 120 70 92 60 92 0 C 60 22 -60 22 -92 0 Z"
        fill="url(#vaseBody)"
        stroke={OUTLINE}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* glass sheen */}
      <path
        d="M-92 0 C -92 60 -120 70 -78 150 C -60 184 60 184 78 150 C 120 70 92 60 92 0 C 60 22 -60 22 -92 0 Z"
        fill="url(#vaseSheen)"
        stroke="none"
      />
      {/* highlight streak */}
      <path d="M-58 26 C -72 70 -76 112 -54 152" fill="none" stroke="#ffffff" strokeWidth={7} opacity={0.5} strokeLinecap="round" />
      <path d="M-40 30 C -50 70 -52 108 -38 146" fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.3} strokeLinecap="round" />
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
    } else {
      line = (line + ' ' + w).trim()
    }
    if (lines.length >= maxLines) break
  }
  if (line && lines.length < maxLines) lines.push(line)
  return lines.slice(0, maxLines)
}

export default function FlowerStudio() {
  const [flowers, setFlowers] = useState<Placed[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [vaseColor, setVaseColor] = useState(VASE_COLORS[0])
  const [bg, setBg] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [sound, setSound] = useState(true)
  const [ghost, setGhost] = useState<{ type: FlowerType; x: number; y: number } | null>(null)

  // gift tag
  const [showTag, setShowTag] = useState(false)
  const [to, setTo] = useState('')
  const [from, setFrom] = useState('')
  const [note, setNote] = useState('')

  const svgRef = useRef<SVGSVGElement | null>(null)
  const nextId = useRef(1)
  const zTop = useRef(1)
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null)
  const audioCtx = useRef<AudioContext | null>(null)

  const playPluck = () => {
    if (!sound) return
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!audioCtx.current) audioCtx.current = new AC()
      const ctx = audioCtx.current
      if (ctx.state === 'suspended') ctx.resume()
      const t = ctx.currentTime
      const notes = [523.25, 783.99] // C5 -> G5, a soft chime
      notes.forEach((f, i) => {
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
    } catch {
      /* audio unavailable — no-op */
    }
  }

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: clientX, y: clientY }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  const rootInVase = (x: number, y: number) => {
    const cx = VIEW_W / 2
    const rx = Math.max(cx - 86, Math.min(cx + 86, x))
    const ry = Math.max(ANCHOR_Y - 24, Math.min(ANCHOR_Y + 14, y))
    return { x: rx, y: ry, rot: (rx - cx) * 0.22 }
  }

  const addFlowerAt = (type: FlowerType, x: number, y: number) => {
    const z = ++zTop.current
    const { x: rx, y: ry, rot } = rootInVase(x, y)
    const id = nextId.current++
    setFlowers((f) => [...f, { id, type, x: rx, y: ry, rot, scale: 1, z }])
    setSelected(id)
    playPluck()
  }

  const addFlower = (type: FlowerType) => {
    const spread = (Math.random() - 0.5) * 110
    addFlowerAt(type, VIEW_W / 2 + spread, ANCHOR_Y)
  }

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
        const over = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom
        if (over) {
          const p = clientToSvg(ev.clientX, ev.clientY)
          addFlowerAt(type, p.x, p.y)
          return
        }
      }
      if (!moved) addFlower(type) // a plain click drops one in the vase
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // ----- drag a placed flower to fan it out -----
  const onPointerDownFlower = (e: React.PointerEvent, id: number) => {
    e.stopPropagation()
    const f = flowers.find((fl) => fl.id === id)
    if (!f) return
    const p = clientToSvg(e.clientX, e.clientY)
    drag.current = { id, dx: f.x - p.x, dy: f.y - p.y }
    setSelected(id)
    const z = ++zTop.current
    setFlowers((arr) => arr.map((fl) => (fl.id === id ? { ...fl, z } : fl)))
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const p = clientToSvg(e.clientX, e.clientY)
    const { id, dx, dy } = drag.current
    const { x, y, rot } = rootInVase(p.x + dx, p.y + dy)
    setFlowers((arr) => arr.map((fl) => (fl.id === id ? { ...fl, x, y, rot } : fl)))
  }

  const onPointerUp = () => {
    drag.current = null
  }

  const mutateSelected = (fn: (f: Placed) => Placed) =>
    setFlowers((arr) => arr.map((fl) => (fl.id === selected ? fn(fl) : fl)))

  const deleteSelected = () => {
    setFlowers((arr) => arr.filter((fl) => fl.id !== selected))
    setSelected(null)
  }

  const undo = () => {
    setFlowers((arr) => {
      if (arr.length === 0) return arr
      const maxId = Math.max(...arr.map((f) => f.id))
      return arr.filter((f) => f.id !== maxId)
    })
    setSelected(null)
  }

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  // Render the stage SVG to a PNG blob (decorations / selection ring stripped).
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
    if (flowers.length === 0) return flash('add some flowers first ✿')
    try {
      const blob = await renderBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bouquet.png'
      a.click()
      URL.revokeObjectURL(url)
      flash('saved bouquet.png ✓')
    } catch {
      flash('export failed — try again')
    }
  }

  const share = async () => {
    if (flowers.length === 0) return flash('add some flowers first ✿')
    try {
      const blob = await renderBlob()
      const file = new File([blob], 'bouquet.png', { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      const text = note ? note : 'I arranged this bouquet for you ✿'
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
          'mailto:' +
          (to ? '' : '') +
          '?subject=' +
          encodeURIComponent('A bouquet for you ✿') +
          '&body=' +
          encodeURIComponent(text + '\n\n(the picture bouquet.png just downloaded — attach it to this email!)')
        flash('sharing not supported here — image saved, email opened')
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') flash('could not share')
    }
  }

  const clearAll = () => {
    setFlowers([])
    setSelected(null)
  }

  // keyboard: delete selected, escape to deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected != null) {
        e.preventDefault()
        deleteSelected()
      } else if (e.key === 'Escape') {
        setSelected(null)
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const ordered = [...flowers].sort((a, b) => a.z - b.z)
  const preset = BG_PRESETS[bg]
  const tagLines = wrapText(note, 18, 3)
  const tagVisible = showTag && (to || from || note)

  return (
    <div className="crt min-h-screen starfield">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <a href="#/" className="btn btn-blue">← back</a>
          <h1 className="font-pixel text-cream text-2xl sm:text-3xl pixel-h-sm text-center">FLOWER STUDIO</h1>
          <div className="flex gap-2">
            <button className="btn" onClick={() => setSound((s) => !s)} title="toggle sound">
              {sound ? '♪ on' : '♪ off'}
            </button>
            <button className="btn btn-green" onClick={exportPng}>⤓ export</button>
            <button className="btn btn-pink" onClick={share}>✉ send</button>
          </div>
        </div>
        <p className="font-body text-coin text-xl mt-1 text-center">
          ✿ drag a flower into the vase, then drag it sideways to fan the bouquet ✿
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[268px_1fr]">
          {/* ---- shop / palette ---- */}
          <aside className="box-dark">
            <div className="font-pixel text-xs text-coin mb-3">FLOWER SHOP</div>
            <div className="grid grid-cols-2 gap-2">
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
                <button
                  key={c}
                  onClick={() => setVaseColor(c)}
                  className={`w-7 h-7 border-2 transition-transform hover:scale-110 ${vaseColor === c ? 'border-coin scale-110' : 'border-cream/40'}`}
                  style={{ background: c }}
                  aria-label="vase color"
                />
              ))}
            </div>

            <div className="font-pixel text-xs text-coin mt-4 mb-2">BACKDROP</div>
            <div className="flex flex-wrap gap-2">
              {BG_PRESETS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setBg(i)}
                  title={p.name}
                  className={`w-7 h-7 border-2 transition-transform hover:scale-110 ${bg === i ? 'border-coin scale-110' : 'border-cream/40'}`}
                  style={{ background: `linear-gradient(${p.from}, ${p.to})` }}
                  aria-label={`${p.name} backdrop`}
                />
              ))}
            </div>

            {/* gift tag */}
            <div className="flex items-center justify-between mt-5 mb-2">
              <span className="font-pixel text-xs text-coin">GIFT TAG</span>
              <button
                onClick={() => setShowTag((v) => !v)}
                className={`font-mono text-[10px] px-2 py-0.5 border-2 ${showTag ? 'border-coin text-coin' : 'border-cream/40 text-cream/70'}`}
              >
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
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onPointerDown={() => setSelected(null)}
              >
                <StageDefs vaseColor={vaseColor} />

                {/* backdrop gradient */}
                <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={preset.from} />
                  <stop offset="100%" stopColor={preset.to} />
                </linearGradient>
                <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#bgGrad)" />
                <ellipse cx={VIEW_W / 2} cy={300} rx={520} ry={300} fill="url(#spotlight)" />
                {/* table */}
                <rect x={0} y={VIEW_H - 70} width={VIEW_W} height={70} fill="#000000" opacity={0.3} />

                {/* drifting petals (decorative, not exported) */}
                {[0, 1, 2, 3].map((i) => (
                  <g key={i} data-export-hide opacity={0.5}>
                    <circle cx={120 + i * 180} cy={-20} r={5} fill={['#ff9ecb', '#ffd84a', '#c4b2ff', '#ffffff'][i]}>
                      <animateTransform attributeName="transform" type="translate" values={`0 0; 30 ${VIEW_H + 60}`} dur={`${9 + i * 2}s`} begin={`${i * 1.5}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                ))}

                {/* empty-state hint */}
                {flowers.length === 0 && (
                  <text data-export-hide x={VIEW_W / 2} y={250} textAnchor="middle" fill="#f7eed1" opacity={0.55} fontFamily="VT323, monospace" fontSize={30}>
                    drag a flower from the shop into the vase ↓
                  </text>
                )}

                {/* flowers (rendered behind the vase front) */}
                {ordered.map((f) => {
                  const dur = 3.6 + (f.id % 5) * 0.4
                  const delay = (f.id % 7) * 0.3
                  const amp = 1.6 + (f.id % 3) * 0.7
                  return (
                    <g
                      key={f.id}
                      transform={`translate(${f.x} ${f.y})`}
                      onPointerDown={(e) => onPointerDownFlower(e, f.id)}
                      style={{ cursor: 'grab' }}
                    >
                      <g transform={`rotate(${f.rot}) scale(${f.scale})`}>
                        <rect x={-60} y={-210} width={120} height={230} fill="transparent" />
                        {selected === f.id && (
                          <rect data-export-hide x={-58} y={-205} width={116} height={222} fill="none" stroke="#ffd84a" strokeWidth={2} strokeDasharray="6 6" />
                        )}
                        {/* pop-in grow from the base */}
                        <g filter="url(#drop)">
                          <animateTransform attributeName="transform" type="scale" from="0.4" to="1" dur="0.4s" fill="freeze" calcMode="spline" keySplines="0.2 0.9 0.3 1" keyTimes="0;1" />
                          {/* gentle idle sway around the base */}
                          <g>
                            <animateTransform attributeName="transform" type="rotate" values={`${-amp};${amp};${-amp}`} dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" keyTimes="0;0.5;1" />
                            <FlowerShape type={f.type} />
                          </g>
                        </g>
                      </g>
                    </g>
                  )
                })}

                <Vase />

                {/* gift tag tied to the vase */}
                {tagVisible && (
                  <g transform={`translate(${VIEW_W / 2 + 132} 392) rotate(-5)`}>
                    {/* string from the vase neck to the tag's hole */}
                    <path d="M-68 86 Q -30 28 12 12" fill="none" stroke="#d8c9a0" strokeWidth={2} />
                    <rect x={0} y={0} width={150} height={108} rx={8} fill="#f7eed1" stroke={OUTLINE} strokeWidth={3} />
                    <circle cx={14} cy={14} r={5} fill="#08030f" />
                    {to && (
                      <text x={26} y={30} fontFamily="VT323, monospace" fontSize={20} fill="#1f0a3a">To {to}</text>
                    )}
                    {tagLines.map((ln, i) => (
                      <text key={i} x={20} y={52 + i * 18} fontFamily="VT323, monospace" fontSize={18} fill="#3a2a14">{ln}</text>
                    ))}
                    {from && (
                      <text x={140} y={98} textAnchor="end" fontFamily="VT323, monospace" fontSize={18} fill="#b81e30">♥ {from}</text>
                    )}
                  </g>
                )}

                {/* cinematic vignette */}
                <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#vignette)" pointerEvents="none" />
              </svg>
            </div>

            {/* ---- selected-flower controls ---- */}
            <div className="box-dark mt-4 flex items-center gap-2 flex-wrap min-h-[64px]">
              {selected == null ? (
                <span className="font-body text-cream/70 text-xl px-1">
                  ✿ tap a flower in the vase to rotate, resize or remove it
                </span>
              ) : (
                <>
                  <span className="font-pixel text-[10px] text-coin mr-1">SELECTED</span>
                  <button className="btn" onClick={() => mutateSelected((f) => ({ ...f, rot: f.rot - 10 }))}>⟲ left</button>
                  <button className="btn" onClick={() => mutateSelected((f) => ({ ...f, rot: f.rot + 10 }))}>⟳ right</button>
                  <button className="btn btn-green" onClick={() => mutateSelected((f) => ({ ...f, scale: Math.min(1.8, f.scale + 0.12) }))}>＋ bigger</button>
                  <button className="btn btn-blue" onClick={() => mutateSelected((f) => ({ ...f, scale: Math.max(0.5, f.scale - 0.12) }))}>－ smaller</button>
                  <button className="btn btn-pink" onClick={deleteSelected}>🗑 remove</button>
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
        <div
          className="fixed z-[95] pointer-events-none"
          style={{ left: ghost.x, top: ghost.y, transform: 'translate(-50%, -70%) scale(0.7)', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))' }}
        >
          <svg viewBox="-70 -210 140 230" width={120} height={196}>
            <StageDefs vaseColor={vaseColor} />
            <FlowerShape type={ghost.type} />
          </svg>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] box font-mono text-sm px-4 py-2">
          {toast}
        </div>
      )}
    </div>
  )
}
