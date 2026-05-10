import { useEffect, useRef, useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onCoin: () => void
}

const W = 480
const H = 180
const GROUND_Y = 150
const PLAYER_W = 16
const PLAYER_H = 22
const GRAVITY = 0.6
const JUMP_V = -10.5
const COIN_R = 7
const BEST_KEY = 'nik-runner-best'

type Obstacle = { x: number; y: number; w: number; h: number }
type Coin = { x: number; y: number; collected: boolean; spin: number }

export default function RunnerGame({ open, onClose, onCoin }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const onCoinRef = useRef(onCoin)
  onCoinRef.current = onCoin

  const [score, setScore] = useState(0)
  const [best, setBest] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const v = window.localStorage.getItem(BEST_KEY)
    return v ? parseInt(v, 10) || 0 : 0
  })
  const [gameOver, setGameOver] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let frame = 0
    let nextSpawn = 60
    let speed = 4
    let player = { x: 60, y: GROUND_Y - PLAYER_H, vy: 0, onGround: true }
    let obstacles: Obstacle[] = []
    let coins: Coin[] = []
    let groundOffset = 0
    let localScore = 0
    let dead = false

    const jump = () => {
      if (dead) return
      if (player.onGround) {
        player.vy = JUMP_V
        player.onGround = false
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        e.stopPropagation()
        jump()
      }
    }
    const onPointer = (e: PointerEvent) => {
      e.preventDefault()
      jump()
    }
    window.addEventListener('keydown', onKey, true)
    canvas.addEventListener('pointerdown', onPointer)

    const spawn = () => {
      const r = Math.random()
      if (r < 0.55) {
        const h = 14 + Math.floor(Math.random() * 18)
        const w = 10 + Math.floor(Math.random() * 14)
        obstacles.push({ x: W + 10, y: GROUND_Y - h, w, h })
      } else {
        const y = GROUND_Y - 30 - Math.floor(Math.random() * 50)
        coins.push({ x: W + 10, y, collected: false, spin: 0 })
      }
    }

    const hit = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) =>
      ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by

    const drawPlayer = (px: number, py: number) => {
      // body (deep purple)
      ctx.fillStyle = '#1f0a3a'
      ctx.fillRect(px, py, PLAYER_W, PLAYER_H)
      // hat (coin gold)
      ctx.fillStyle = '#ffd84a'
      ctx.fillRect(px - 1, py, PLAYER_W + 2, 4)
      ctx.fillRect(px + 4, py - 3, PLAYER_W - 8, 3)
      // face
      ctx.fillStyle = '#f7eed1'
      ctx.fillRect(px + 3, py + 6, PLAYER_W - 6, 6)
      // eyes
      ctx.fillStyle = '#1f0a3a'
      ctx.fillRect(px + 5, py + 8, 2, 2)
      ctx.fillRect(px + PLAYER_W - 7, py + 8, 2, 2)
      // legs (animated)
      ctx.fillStyle = '#ff5dac'
      const legPhase = Math.floor(frame / 5) % 2
      if (player.onGround) {
        ctx.fillRect(px + 2, py + PLAYER_H, 4, 3 + legPhase)
        ctx.fillRect(px + PLAYER_W - 6, py + PLAYER_H, 4, 4 - legPhase)
      } else {
        ctx.fillRect(px + 2, py + PLAYER_H, 4, 3)
        ctx.fillRect(px + PLAYER_W - 6, py + PLAYER_H, 4, 3)
      }
    }

    const tick = () => {
      frame++

      // physics
      player.vy += GRAVITY
      player.y += player.vy
      if (player.y >= GROUND_Y - PLAYER_H) {
        player.y = GROUND_Y - PLAYER_H
        player.vy = 0
        player.onGround = true
      }

      // speed ramp
      speed = Math.min(8.5, 4 + localScore * 0.05)
      groundOffset = (groundOffset + speed) % 16

      // spawn
      if (frame >= nextSpawn) {
        spawn()
        nextSpawn = frame + 60 + Math.floor(Math.random() * 50)
      }

      // move + cull
      obstacles.forEach((o) => (o.x -= speed))
      coins.forEach((c) => {
        c.x -= speed
        c.spin += 0.2
      })
      obstacles = obstacles.filter((o) => o.x + o.w > -10)
      coins = coins.filter((c) => c.x + COIN_R > -10 && !c.collected)

      // collisions
      for (const o of obstacles) {
        if (hit(player.x, player.y, PLAYER_W, PLAYER_H, o.x, o.y, o.w, o.h)) {
          dead = true
          break
        }
      }
      for (const c of coins) {
        if (
          hit(
            player.x,
            player.y,
            PLAYER_W,
            PLAYER_H,
            c.x - COIN_R,
            c.y - COIN_R,
            COIN_R * 2,
            COIN_R * 2,
          )
        ) {
          c.collected = true
          localScore++
          setScore(localScore)
          onCoinRef.current()
        }
      }

      // render
      // sky
      ctx.fillStyle = '#1f0a3a'
      ctx.fillRect(0, 0, W, H)
      // stars
      ctx.fillStyle = '#f7eed1'
      for (let i = 0; i < 12; i++) {
        const sx = (i * 53 + 7) % W
        const sy = (i * 31 + 11) % (GROUND_Y - 20)
        ctx.fillRect(sx, sy, 1, 1)
      }
      ctx.fillStyle = '#ffd84a'
      for (let i = 0; i < 4; i++) {
        const sx = (i * 121 + 40) % W
        const sy = (i * 17 + 22) % (GROUND_Y - 30)
        ctx.fillRect(sx, sy, 1, 1)
      }

      // ground line
      ctx.fillStyle = '#f7eed1'
      ctx.fillRect(0, GROUND_Y, W, 2)
      // ground tiles
      ctx.fillStyle = '#4cc474'
      ctx.fillRect(0, GROUND_Y + 2, W, H - GROUND_Y - 2)
      ctx.fillStyle = '#1f0a3a'
      for (let x = -groundOffset; x < W; x += 16) {
        ctx.fillRect(x, GROUND_Y + 2, 1, H - GROUND_Y - 2)
      }

      // obstacles (cactus-like blocks in pink)
      for (const o of obstacles) {
        ctx.fillStyle = '#ff5dac'
        ctx.fillRect(o.x, o.y, o.w, o.h)
        ctx.fillStyle = '#1f0a3a'
        ctx.fillRect(o.x, o.y, o.w, 2)
        ctx.fillRect(o.x + o.w - 2, o.y, 2, o.h)
      }

      // coins
      for (const c of coins) {
        if (c.collected) continue
        const sx = Math.max(2, Math.abs(Math.cos(c.spin)) * COIN_R * 2)
        ctx.fillStyle = '#ffd84a'
        ctx.fillRect(c.x - sx / 2, c.y - COIN_R, sx, COIN_R * 2)
        ctx.fillStyle = '#1f0a3a'
        ctx.fillRect(c.x - sx / 2, c.y - 1, sx, 2)
      }

      drawPlayer(player.x, player.y)

      // hud (score top-left in canvas)
      ctx.fillStyle = '#ffd84a'
      ctx.font = '10px "Press Start 2P", monospace'
      ctx.fillText(`x${String(localScore).padStart(3, '0')}`, 8, 16)

      if (dead) {
        cancelAnimationFrame(raf)
        setGameOver(true)
        setBest((b) => {
          const nb = Math.max(b, localScore)
          if (nb !== b) {
            try { window.localStorage.setItem(BEST_KEY, String(nb)) } catch { /* ignore */ }
          }
          return nb
        })
        return
      }

      raf = requestAnimationFrame(tick)
    }

    setScore(0)
    setGameOver(false)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey, true)
      canvas.removeEventListener('pointerdown', onPointer)
    }
  }, [open, resetKey, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  const replay = () => {
    setGameOver(false)
    setScore(0)
    setResetKey((k) => k + 1)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-deep/85 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="box-dark max-w-[560px] w-full text-center">
        <div className="flex items-baseline justify-between mb-3">
          <div className="font-pixel text-coin text-[14px]">❖ COIN RUN</div>
          <div className="font-mono text-sm text-cream">
            SCORE x{String(score).padStart(3, '0')} · BEST x{String(best).padStart(3, '0')}
          </div>
        </div>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full max-w-[480px] border-4 border-coin bg-deep"
            style={{ imageRendering: 'pixelated', aspectRatio: `${W} / ${H}`, touchAction: 'none' }}
          />
        </div>
        <div className="mt-3 font-mono text-xs text-cream/70">
          SPACE / TAP to jump · ESC to quit
        </div>
        {gameOver && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="font-pixel text-[12px] text-coin">GAME OVER</div>
            <button type="button" className="btn btn-green" onClick={replay}>Replay</button>
            <button type="button" className="btn btn-pink" onClick={onClose}>Close</button>
          </div>
        )}
        {!gameOver && (
          <div className="mt-4">
            <button type="button" className="btn btn-pink" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}
