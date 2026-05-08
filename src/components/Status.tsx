import { useState } from 'react'
import Sprite from './Sprite'

const STATS: { label: string; v: number; max: number; tip: string }[] = [
  { label: 'IGA',  v: 92, max: 99, tip: 'identity governance, joiner-mover-leaver' },
  { label: 'ARS',  v: 88, max: 99, tip: 'access request workflows, SoD-aware carts' },
  { label: 'CERT', v: 84, max: 99, tip: 'certification campaigns at scale' },
  { label: 'CONN', v: 90, max: 99, tip: 'REST / SOAP / JDBC connector forging' },
  { label: 'ANLY', v: 76, max: 99, tip: 'custom queries, dashboards, role mining' },
  { label: 'DIPL', v: 71, max: 99, tip: 'diplomacy with auditors and app owners' },
]

export default function Status({ onCoin }: { onCoin: () => void }) {
  const [pops, setPops] = useState<number[]>([])
  const tap = () => {
    onCoin()
    const id = Date.now() + Math.random()
    setPops((p) => [...p, id])
    window.setTimeout(() => setPops((p) => p.filter((x) => x !== id)), 900)
  }
  return (
    <section id="status" className="px-4 py-16 max-w-[1080px] mx-auto">
      <h2 className="font-pixel text-coin text-[20px] sm:text-[28px] pixel-h-sm mb-8">
        ❖ STATUS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* portrait */}
        <button
          type="button"
          onClick={tap}
          className="md:col-span-4 box-dark text-center relative shake-on-hover cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-coin"
        >
          <div className="border-4 border-coin p-3 inline-block bg-deep">
            <Sprite size={140} className="mx-auto" />
          </div>
          <div className="mt-4 font-pixel text-[14px] text-coin">NIK</div>
          <div className="mt-1 font-body text-2xl text-cream">the saviynt mage</div>
          <div className="mt-4 font-mono text-xs text-cream/60">★ tap me for a coin ★</div>

          {/* floating coin bursts */}
          {pops.map((id) => (
            <span
              key={id}
              className="coin-pop absolute left-1/2 top-1/3 pointer-events-none font-pixel text-[18px] text-coin"
              style={{ textShadow: '2px 2px 0 #1f0a3a' }}
            >
              +1 ●
            </span>
          ))}
        </button>

        {/* stat sheet */}
        <div className="md:col-span-8 box">
          <div className="flex items-baseline justify-between border-b-2 border-deep pb-2 mb-4">
            <div className="font-pixel text-[12px]">CLASS · IGA MAGE</div>
            <div className="font-mono text-sm">LV.07 · EXP 6420 / 9999</div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-6 font-body text-[20px]">
            <div className="flex justify-between"><span>HP</span><span>248 / 248</span></div>
            <div className="flex justify-between"><span>MP</span><span>120 / 120</span></div>
            <div className="flex justify-between"><span>HOMETOWN</span><span>nik.io</span></div>
            <div className="flex justify-between"><span>STATUS</span><span className="text-green">ONLINE</span></div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {STATS.map((s) => (
              <div key={s.label} className="font-mono text-[14px]">
                <div className="flex items-baseline justify-between">
                  <span className="font-pixel text-[10px]">{s.label}</span>
                  <span>{s.v}/{s.max}</span>
                </div>
                <div className="bar mt-1"><i style={{ width: `${(s.v / s.max) * 100}%` }} /></div>
                <div className="text-deep/70 mt-1">{s.tip}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t-2 border-deep pt-3 flex flex-wrap gap-2">
            {['saviynt eic', 'workday', 'AD', 'OIDC', 'SAML', 'OPA', 'python', 'sql'].map((t) => (
              <span key={t} className="font-mono text-[14px] px-2 py-1 bg-deep text-cream">
                ⚙ {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
