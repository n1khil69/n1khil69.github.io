import { useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ *
 *  Flower Studio — a digital flower-arrangement workshop.
 *  Pick blossoms from the shop, drop them in the vase, drag to arrange,
 *  then export the bouquet as a picture or share it with someone.
 * ------------------------------------------------------------------ */

const VIEW_W = 800
const VIEW_H = 600

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
  { type: 'tulip',     name: 'tulip',      swatch: '#ff5dac' },
  { type: 'rose',      name: 'rose',       swatch: '#ff3a4f' },
  { type: 'daisy',     name: 'daisy',      swatch: '#f7eed1' },
  { type: 'sunflower', name: 'sunflower',  swatch: '#ffd84a' },
  { type: 'lily',      name: 'lily',       swatch: '#ffb6e0' },
  { type: 'lavender',  name: 'lavender',   swatch: '#9a7bff' },
  { type: 'blossom',   name: 'blossom',    swatch: '#ff9ecb' },
  { type: 'leaf',      name: 'fern',       swatch: '#4cc474' },
]

const OUTLINE = '#1f0a3a'
const STEM = '#3f9e57'

/* ---- A single flower drawn around its base at the origin (0,0). ---- *
 * The blossom sits above the origin; the stem hangs down into the vase. */
function FlowerShape({ type }: { type: FlowerType }) {
  const stroke = { stroke: OUTLINE, strokeWidth: 3, strokeLinejoin: 'round' as const }
  const stem = (
    <>
      <path d="M0 0 C -6 -50 6 -90 0 -140" fill="none" stroke={STEM} strokeWidth={8} strokeLinecap="round" />
      <path d="M0 0 C -6 -50 6 -90 0 -140" fill="none" {...stroke} strokeWidth={2} opacity={0.35} />
    </>
  )
  const sideLeaf = (
    <path d="M2 -55 C 30 -60 42 -78 46 -96 C 26 -92 8 -78 2 -62 Z" fill={STEM} {...stroke} />
  )

  switch (type) {
    case 'tulip':
      return (
        <g>
          {stem}
          {sideLeaf}
          <g transform="translate(0 -150)">
            <path d="M-22 14 C -28 -22 -10 -34 0 -34 C 10 -34 28 -22 22 14 C 12 22 -12 22 -22 14 Z" fill="#ff5dac" {...stroke} />
            <path d="M-22 14 C -20 -10 -8 -22 0 -22 C 8 -22 20 -10 22 14" fill="#ff8ec9" stroke="none" />
            <path d="M0 -34 L0 6" fill="none" stroke="#d63e93" strokeWidth={2} />
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
              <ellipse key={i} transform={`rotate(${(360 / 10) * i})`} cx={0} cy={-26} rx={8} ry={18} fill="#f7eed1" {...stroke} />
            ))}
            <circle r={13} fill="#ffd84a" {...stroke} />
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
              <path key={i} transform={`rotate(${(360 / 16) * i})`} d="M-7 -22 C -9 -42 9 -42 7 -22 Z" fill="#ffb800" {...stroke} strokeWidth={2} />
            ))}
            <circle r={18} fill="#7a4a22" {...stroke} />
            <circle r={18} fill="#5e3618" opacity={0.5} stroke="none" />
          </g>
        </g>
      )
    case 'rose':
      return (
        <g>
          {stem}
          {sideLeaf}
          <g transform="translate(0 -150)">
            <circle r={24} fill="#ff3a4f" {...stroke} />
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
            return <circle key={i} cx={off} cy={yy} r={7} fill="#9a7bff" {...stroke} strokeWidth={2} />
          })}
          <circle cx={0} cy={-200} r={6} fill="#b9a3ff" {...stroke} strokeWidth={2} />
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
                <circle key={i} transform={`rotate(${(360 / 5) * i})`} cx={0} cy={-15} r={11} fill="#ff9ecb" {...stroke} strokeWidth={2} />
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
              <path key={i} transform={`rotate(${(360 / 6) * i})`} d="M0 -8 C -13 -26 -8 -48 0 -56 C 8 -48 13 -26 0 -8 Z" fill="#ffb6e0" {...stroke} />
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
          <path d="M0 0 C 0 -60 0 -120 0 -170" fill="none" stroke={STEM} strokeWidth={6} strokeLinecap="round" />
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

function Vase({ color }: { color: string }) {
  return (
    <g transform={`translate(${VIEW_W / 2} 470)`}>
      {/* opening */}
      <ellipse cx={0} cy={0} rx={92} ry={16} fill="#0a0420" stroke={OUTLINE} strokeWidth={4} />
      {/* body */}
      <path
        d="M-92 0 C -92 60 -120 70 -78 150 C -60 184 60 184 78 150 C 120 70 92 60 92 0 C 60 22 -60 22 -92 0 Z"
        fill={color}
        stroke={OUTLINE}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* highlight */}
      <path d="M-62 30 C -74 70 -78 110 -58 150" fill="none" stroke="#ffffff" strokeWidth={6} opacity={0.35} strokeLinecap="round" />
    </g>
  )
}

const VASE_COLORS = ['#7ac1ff', '#ff5dac', '#ffd84a', '#7be67b', '#c9a0ff', '#f7eed1']
const BG_COLORS = ['#0a0420', '#1f3a5f', '#3a1f4f', '#244a2e', '#5f3a1f', '#101820']

export default function FlowerStudio() {
  const [flowers, setFlowers] = useState<Placed[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [vaseColor, setVaseColor] = useState(VASE_COLORS[0])
  const [bg, setBg] = useState(BG_COLORS[0])
  const [toast, setToast] = useState<string | null>(null)

  const svgRef = useRef<SVGSVGElement | null>(null)
  const nextId = useRef(1)
  const zTop = useRef(1)
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null)

  // convert a pointer event to SVG user-space coordinates
  const toSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current!
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: clientX, y: clientY }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  // Stems are anchored a little below the vase mouth so the lower stem is
  // hidden behind the vase front (drawn on top) — it reads as "inserted".
  const VASE_MOUTH_Y = 470
  const ANCHOR_Y = 540

  const addFlower = (type: FlowerType) => {
    const z = ++zTop.current
    // root inside the vase, fanning out with a little spread + matching tilt
    const spread = (Math.random() - 0.5) * 90
    setFlowers((f) => [
      ...f,
      { id: nextId.current, type, x: VIEW_W / 2 + spread, y: ANCHOR_Y + (Math.random() - 0.5) * 12, rot: spread / 10, scale: 1, z },
    ])
    setSelected(nextId.current)
    nextId.current++
  }

  const onPointerDownFlower = (e: React.PointerEvent, id: number) => {
    e.stopPropagation()
    const f = flowers.find((fl) => fl.id === id)
    if (!f) return
    const p = toSvg(e.clientX, e.clientY)
    drag.current = { id, dx: f.x - p.x, dy: f.y - p.y }
    setSelected(id)
    // bring to front while interacting
    const z = ++zTop.current
    setFlowers((arr) => arr.map((fl) => (fl.id === id ? { ...fl, z } : fl)))
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const p = toSvg(e.clientX, e.clientY)
    const { id, dx, dy } = drag.current
    // keep the stem rooted in the vase mouth; sideways drag fans the flower out
    const cx = VIEW_W / 2
    const x = Math.max(cx - 86, Math.min(cx + 86, p.x + dx))
    const y = Math.max(ANCHOR_Y - 24, Math.min(ANCHOR_Y + 14, p.y + dy))
    const rot = (x - cx) * 0.22
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
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'A bouquet for you', text: 'I arranged this for you ✿' })
        flash('shared ✓')
      } else {
        // fallback: download the image + open an email draft
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bouquet.png'
        a.click()
        URL.revokeObjectURL(url)
        window.location.href =
          'mailto:?subject=' +
          encodeURIComponent('A bouquet for you ✿') +
          '&body=' +
          encodeURIComponent('I arranged a digital bouquet for you — the picture (bouquet.png) just downloaded; attach it to this email!')
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
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected != null) {
        e.preventDefault()
        deleteSelected()
      } else if (e.key === 'Escape') {
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const ordered = [...flowers].sort((a, b) => a.z - b.z)

  return (
    <div className="crt min-h-screen starfield">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <a href="#/" className="btn btn-blue">← back to quest</a>
          <h1 className="font-pixel text-cream text-2xl sm:text-3xl pixel-h-sm text-center">FLOWER STUDIO</h1>
          <div className="flex gap-2">
            <button className="btn btn-green" onClick={exportPng}>⤓ export</button>
            <button className="btn btn-pink" onClick={share}>✉ send</button>
          </div>
        </div>
        <p className="font-body text-coin text-xl mt-1 text-center">
          ✿ pick blossoms, drop them in the vase, drag to arrange ✿
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
          {/* ---- shop / palette ---- */}
          <aside className="box-dark">
            <div className="font-pixel text-xs text-coin mb-3">FLOWER SHOP</div>
            <div className="grid grid-cols-2 gap-2">
              {SHOP.map((s) => (
                <button
                  key={s.type}
                  onClick={() => addFlower(s.type)}
                  title={`add ${s.name}`}
                  className="group flex flex-col items-center gap-1 border-2 border-cream/40 hover:border-coin bg-deep/60 hover:bg-deep p-2 transition-colors"
                >
                  <svg viewBox="-70 -210 140 230" className="w-full h-20">
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
                  className={`w-7 h-7 border-2 ${vaseColor === c ? 'border-coin' : 'border-cream/40'}`}
                  style={{ background: c }}
                  aria-label="vase color"
                />
              ))}
            </div>

            <div className="font-pixel text-xs text-coin mt-4 mb-2">BACKDROP</div>
            <div className="flex flex-wrap gap-2">
              {BG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setBg(c)}
                  className={`w-7 h-7 border-2 ${bg === c ? 'border-coin' : 'border-cream/40'}`}
                  style={{ background: c }}
                  aria-label="backdrop color"
                />
              ))}
            </div>

            <button className="btn w-full mt-5" onClick={clearAll}>✕ clear vase</button>
          </aside>

          {/* ---- stage ---- */}
          <main>
            <div className="box p-2">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="w-full touch-none select-none rounded-sm"
                style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}`, display: 'block' }}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onPointerDown={() => setSelected(null)}
              >
                {/* backdrop (exported) */}
                <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill={bg} />
                <rect x={0} y={VIEW_H - 80} width={VIEW_W} height={80} fill="#000000" opacity={0.25} />

                {/* helper text when empty (hidden from export) */}
                {flowers.length === 0 && (
                  <text
                    data-export-hide
                    x={VIEW_W / 2}
                    y={230}
                    textAnchor="middle"
                    fill="#f7eed1"
                    opacity={0.5}
                    fontFamily="VT323, monospace"
                    fontSize={30}
                  >
                    ← tap a flower to add it to the vase
                  </text>
                )}

                {/* flowers behind the vase rim */}
                {ordered.map((f) => (
                  <g
                    key={f.id}
                    transform={`translate(${f.x} ${f.y}) rotate(${f.rot}) scale(${f.scale})`}
                    onPointerDown={(e) => onPointerDownFlower(e, f.id)}
                    style={{ cursor: 'grab' }}
                  >
                    {/* invisible fat hit-area for easy grabbing */}
                    <rect x={-60} y={-210} width={120} height={230} fill="transparent" />
                    <FlowerShape type={f.type} />
                    {selected === f.id && (
                      <rect
                        data-export-hide
                        x={-58}
                        y={-205}
                        width={116}
                        height={222}
                        fill="none"
                        stroke="#ffd84a"
                        strokeWidth={2}
                        strokeDasharray="6 6"
                      />
                    )}
                  </g>
                ))}

                <Vase color={vaseColor} />
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
                  <button className="btn" onClick={() => mutateSelected((f) => ({ ...f, rot: f.rot - 12 }))}>⟲ left</button>
                  <button className="btn" onClick={() => mutateSelected((f) => ({ ...f, rot: f.rot + 12 }))}>⟳ right</button>
                  <button className="btn btn-green" onClick={() => mutateSelected((f) => ({ ...f, scale: Math.min(1.8, f.scale + 0.12) }))}>＋ bigger</button>
                  <button className="btn btn-blue" onClick={() => mutateSelected((f) => ({ ...f, scale: Math.max(0.5, f.scale - 0.12) }))}>－ smaller</button>
                  <button className="btn btn-pink" onClick={deleteSelected}>🗑 remove</button>
                </>
              )}
            </div>
          </main>
        </div>

        <footer className="text-center font-mono text-xs text-cream/40 py-8">
          ✿ {flowers.length} stem{flowers.length === 1 ? '' : 's'} in the vase ✿ made in the flower studio
        </footer>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] box font-mono text-sm px-4 py-2">
          {toast}
        </div>
      )}
    </div>
  )
}
