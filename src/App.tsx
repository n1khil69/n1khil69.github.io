import { useEffect, useState } from 'react'
import Title from './components/Title'
import Status from './components/Status'
import QuestLog from './components/QuestLog'
import Talk from './components/Talk'
import Hud from './components/Hud'
import FlowerStudio from './components/FlowerStudio'

export default function App() {
  const [started, setStarted] = useState(false)
  const [coins, setCoins] = useState(0)
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const start = () => {
    setStarted(true)
    // wait a tick so the post-start sections mount, then scroll to STATUS
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById('status')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  useEffect(() => {
    const SECTION_IDS = ['title', 'status', 'quests', 'talk']
    const currentSectionIndex = () => {
      const mid = window.scrollY + window.innerHeight / 2
      let best = 0, bestDist = Infinity
      SECTION_IDS.forEach((id, i) => {
        const el = document.getElementById(id)
        if (!el) return
        const center = el.offsetTop + el.offsetHeight / 2
        const d = Math.abs(center - mid)
        if (d < bestDist) { bestDist = d; best = i }
      })
      return best
    }
    const goTo = (i: number) => {
      const id = SECTION_IDS[Math.max(0, Math.min(SECTION_IDS.length - 1, i))]
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const onKey = (e: KeyboardEvent) => {
      if (!started && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); start(); return }
      if (!started) return
      const cur = SECTION_IDS[currentSectionIndex()]
      // While the Quest Log is in view, ↑/↓ switch quests — QuestLog handles them.
      // PageUp/Down and j/k still navigate sections.
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && cur === 'quests') return
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault(); goTo(currentSectionIndex() + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault(); goTo(currentSectionIndex() - 1)
      } else if (e.key === 'Home') {
        e.preventDefault(); goTo(0)
      } else if (e.key === 'End') {
        e.preventDefault(); goTo(SECTION_IDS.length - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started])

  if (route.startsWith('#/flowers')) return <FlowerStudio />

  return (
    <div className="crt min-h-screen">
      <Title started={started} onStart={start} />
      {started && (
        <>
          <Hud coins={coins} />
          <Status onCoin={() => setCoins((c) => c + 1)} />
          <QuestLog onCoin={() => setCoins((c) => c + 1)} />
          <Talk onCoin={() => setCoins((c) => c + 1)} />
          <footer className="text-center font-mono text-xs text-cream/40 py-10">
            © {new Date().getFullYear()} ★ a save file by nik.io ★ press <kbd className="px-1 border border-cream/30">↑</kbd> to scroll up
          </footer>
        </>
      )}
    </div>
  )
}
