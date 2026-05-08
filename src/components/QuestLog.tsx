import { useEffect, useRef, useState } from 'react'

type Quest = {
  id: string
  glyph: string
  title: string
  status: 'CLEARED' | 'IN PROGRESS'
  loot: string
  body: string
  drops: string[]
}

const QUESTS: Quest[] = [
  {
    id: 'q1',
    glyph: '⚔',
    title: 'Tame the Birthright Engine',
    status: 'CLEARED',
    loot: '+ Day-One Access ×12k',
    body:
      'Vanquished a chain of brittle Workday→AD scripts. Built a rule-driven birthright engine on Saviynt EIC so new hires get correct access on day one — by location, function, and contract. Auditors approved without a sigh.',
    drops: ['saviynt eic', 'workday', 'AD', 'custom REST', 'OPA'],
  },
  {
    id: 'q2',
    glyph: '🛡',
    title: 'The SoD Heatmap',
    status: 'CLEARED',
    loot: '+ Pre-approval SoD',
    body:
      'Re-platformed ARS so segregation-of-duties evaluates at submit time, not after approval. Risk owners see a heatmap, requesters see why their cart fails before a manager does.',
    drops: ['saviynt ARS', 'SoD ruleset', 'analytics queries'],
  },
  {
    id: 'q3',
    glyph: '📜',
    title: 'Certification at Scale',
    status: 'CLEARED',
    loot: '+ 40k items / cycle',
    body:
      'Built quarterly certification campaigns spanning 40k entitlements across 200 apps. Bulk-decision UX, evidence packs auto-attached, expired-by-default for non-responders.',
    drops: ['saviynt CERT', 'custom queries', 'power BI'],
  },
  {
    id: 'q4',
    glyph: '🔧',
    title: 'Connector Forge',
    status: 'IN PROGRESS',
    loot: '14 / ?? forged',
    body:
      'Authoring a library of REST / SOAP / JDBC connectors for niche internal apps that lack first-party support. Self-healing tokens, schema-drift alarms, idempotent writes — the unglamorous plumbing.',
    drops: ['saviynt SDK', 'OAuth2', 'postgres'],
  },
]

export default function QuestLog({ onCoin }: { onCoin: () => void }) {
  const [openIdx, setOpenIdx] = useState<number>(0)
  const [claimed, setClaimed] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const q = QUESTS[openIdx]

  useEffect(() => {
    const isInView = () => {
      const el = sectionRef.current
      if (!el) return false
      const r = el.getBoundingClientRect()
      const mid = window.innerHeight / 2
      return r.top < mid && r.bottom > mid
    }
    const onKey = (e: KeyboardEvent) => {
      if (!isInView()) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setOpenIdx((i) => {
          if (i >= QUESTS.length - 1) {
            // at the bottom: drop down to next section
            document.getElementById('talk')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            return i
          }
          return i + 1
        })
        onCoin()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setOpenIdx((i) => {
          if (i <= 0) {
            document.getElementById('status')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            return i
          }
          return i - 1
        })
        onCoin()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onCoin()
        setClaimed(true)
        window.setTimeout(() => setClaimed(false), 700)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCoin])

  return (
    <section id="quests" className="px-4 py-16 max-w-[1080px] mx-auto">
      <h2 className="font-pixel text-coin text-[20px] sm:text-[28px] pixel-h-sm mb-8">
        ❖ QUEST LOG
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* list */}
        <ul className="md:col-span-5 box space-y-2">
          {QUESTS.map((qq, i) => {
            const on = i === openIdx
            return (
              <li key={qq.id}>
                <button
                  onClick={() => { setOpenIdx(i); onCoin() }}
                  className={
                    'w-full text-left py-3 px-2 flex items-center gap-3 font-body text-[20px] ' +
                    (on
                      ? 'bg-coin text-deep'
                      : 'hover:bg-pinky/40 text-deep')
                  }
                >
                  <span className={'select-arrow ' + (on ? '' : 'invisible')}>▶</span>
                  <span className="text-2xl">{qq.glyph}</span>
                  <span className="flex-1">{qq.title}</span>
                  <span
                    className={
                      'font-pixel text-[8px] px-2 py-1 ' +
                      (qq.status === 'CLEARED'
                        ? 'bg-green text-deep'
                        : 'bg-magenta text-cream')
                    }
                  >
                    {qq.status}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* detail */}
        <div className="md:col-span-7 box-dark">
          <div className="flex items-baseline justify-between border-b-2 border-cream pb-2 mb-3">
            <span className="font-pixel text-[12px] text-coin">QUEST · {q.id.toUpperCase()}</span>
            <span className="font-mono text-sm text-cream/70">{q.loot}</span>
          </div>
          <h3 className="font-pixel text-[16px] sm:text-[20px] text-cream mb-3">
            {q.glyph} {q.title}
          </h3>
          <p className="font-body text-[22px] leading-snug text-cream/95">{q.body}</p>

          <div className="mt-5">
            <div className="font-pixel text-[10px] text-coin mb-2">★ DROPS</div>
            <div className="flex flex-wrap gap-2">
              {q.drops.map((d) => (
                <span key={d} className="font-mono text-[14px] px-2 py-1 bg-cream text-deep">
                  ⚙ {d}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t-2 border-cream pt-2 font-mono text-[12px] text-cream/55">
            press [{q.id.toUpperCase()}] · ↑↓ to switch · ⏎ to claim
          </div>
        </div>
      </div>
    </section>
  )
}
