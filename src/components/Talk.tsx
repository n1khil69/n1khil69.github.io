import { useEffect, useRef, useState } from 'react'
import Sprite from './Sprite'

type Choice = { label: string; reply: string; href?: string }

const SCRIPT: { greeting: string; choices: Choice[] } = {
  greeting:
    "Oh! Hello, traveler. I'm Nik — Saviynt mage, full-time identity wrangler. I forge connectors, herd certifications, and politely revoke standing privilege. What brings you?",
  choices: [
    {
      label: 'I have a hire to onboard',
      reply: "Excellent. I'll need a Workday feed, a target IdP, and ten quiet minutes. The rule set will write itself once we agree on what 'role' means here.",
    },
    {
      label: 'My SoD is on fire',
      reply: "Take a breath. We can put SoD evaluation at submit time so violations surface before approval. Auditors stop sighing; managers stop apologising.",
    },
    {
      label: 'How do I find you?',
      reply: 'Find me at github / n1khil69 — or on discord as nik.io. I answer slowly, on purpose.',
      href: 'https://github.com/n1khil69',
    },
    {
      label: '...nothing, just looking',
      reply: 'No worries. The world is yours. Mind the dragons in /node_modules.',
    },
  ],
}

function useTypewriter(text: string, speed = 22) {
  const [i, setI] = useState(0)
  const ref = useRef(text)
  useEffect(() => {
    ref.current = text
    setI(0)
    const id = window.setInterval(() => {
      setI((p) => {
        if (p >= ref.current.length) { window.clearInterval(id); return p }
        return p + 1
      })
    }, speed)
    return () => window.clearInterval(id)
  }, [text, speed])
  return { shown: text.slice(0, i), done: i >= text.length, skip: () => setI(text.length) }
}

export default function Talk({ onCoin }: { onCoin: () => void }) {
  const [chosen, setChosen] = useState<number | null>(null)
  const message = chosen == null ? SCRIPT.greeting : SCRIPT.choices[chosen].reply
  const tw = useTypewriter(message, 22)

  return (
    <section id="talk" className="px-4 py-16 max-w-[1080px] mx-auto">
      <h2 className="font-pixel text-coin text-[20px] sm:text-[28px] pixel-h-sm mb-8">
        ❖ TALK TO NIK
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* npc */}
        <div className="md:col-span-3 flex md:block items-center gap-4">
          <div className="bob inline-block bg-deep border-4 border-cream p-3">
            <Sprite size={120} />
          </div>
          <div className="font-pixel text-[12px] text-cream mt-3">NIK</div>
          <div className="font-body text-coin text-2xl">friendly NPC</div>
        </div>

        {/* dialog box */}
        <div className="md:col-span-9 space-y-4">
          <div
            className="box font-body text-[24px] leading-tight min-h-[180px] cursor-pointer relative"
            onClick={tw.skip}
          >
            <div className="absolute -top-3 left-4 font-pixel text-[10px] bg-deep text-cream px-2 py-1">
              ▼ SPEAKER · NIK
            </div>
            <div className="pt-2">
              {tw.shown}
              {!tw.done && <span className="caret" />}
              {tw.done && <span className="font-pixel text-[10px] text-magenta ml-2">▼</span>}
            </div>
          </div>

          {/* choices (only show when greeting is done OR chosen) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCRIPT.choices.map((c, i) => {
              const cls =
                i === 0 ? 'btn' : i === 1 ? 'btn btn-pink' : i === 2 ? 'btn btn-blue' : 'btn btn-green'
              const onClick = () => {
                setChosen(i)
                onCoin()
                if (c.href) window.open(c.href, '_blank')
              }
              return (
                <button
                  key={c.label}
                  onClick={onClick}
                  className={cls + ' shake-on-hover w-full text-left'}
                  disabled={!tw.done && chosen == null}
                  style={{ opacity: !tw.done && chosen == null ? 0.55 : 1 }}
                >
                  ▶ {c.label}
                </button>
              )
            })}
          </div>

          {/* contact line */}
          <div className="box-dark mt-4 font-mono text-[14px] flex flex-wrap gap-x-6 gap-y-1">
            <span className="text-coin">★ contact</span>
            <a href="https://github.com/n1khil69" target="_blank" rel="noreferrer" className="hover:text-coin">
              github / n1khil69 ↗
            </a>
            <span className="text-cream/50">·</span>
            <span>discord / nik.io</span>
            <span className="text-cream/50">·</span>
            <span className="text-pinky">remote · staff / lead engagements</span>
          </div>
        </div>
      </div>
    </section>
  )
}
