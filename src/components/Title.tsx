import Sprite from './Sprite'

export default function Title({ started, onStart }: { started: boolean; onStart: () => void }) {
  return (
    <section
      id="title"
      className="starfield relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 overflow-hidden"
    >
      {/* twin moons */}
      <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-coin shadow-[0_0_0_4px_#1f0a3a,0_0_60px_#ffd84a99] bob-slow" />
      <div className="absolute top-24 left-12 w-10 h-10 rounded-full bg-pinky shadow-[0_0_0_4px_#1f0a3a]" />

      {/* logo */}
      <h1 className="font-pixel text-cream text-[40px] sm:text-[64px] md:text-[88px] leading-[1.05] pixel-h">
        NIK<span className="text-magenta">'</span>S
        <br />
        QUEST
      </h1>

      <div className="mt-3 font-body text-coin text-2xl">
        ☆ a saviynt &amp; iga adventure ☆
      </div>

      {/* sprite on grass */}
      <div className="mt-24 relative">
        <div className="tiles w-[260px] h-[60px] border-4 border-deep mx-auto"></div>
        <div className="absolute left-1/2 -translate-x-1/2 -top-[64px] bob">
          <Sprite size={96} />
        </div>
      </div>

      {!started && (
        <button onClick={onStart} className="btn mt-14 shake-on-hover blink">
          ▶ press start
        </button>
      )}

      <a href="#/flowers" className="btn btn-pink mt-6 shake-on-hover">
        ✿ flower studio
      </a>

      <div className="mt-6 font-mono text-cream/60 text-xs">
        v0.2.0 ★ © {new Date().getFullYear()} nik.io ★ press [enter] to begin
      </div>

      {/* corner cartridge label */}
      <div className="absolute bottom-4 left-4 font-mono text-cream/40 text-[10px] tracking-widest">
        CART-ID #N1KH1L69 · region · ANY
      </div>
      <div className="absolute bottom-4 right-4 font-mono text-cream/40 text-[10px] tracking-widest">
        4MB · BATTERY-BACKED RAM
      </div>
    </section>
  )
}
