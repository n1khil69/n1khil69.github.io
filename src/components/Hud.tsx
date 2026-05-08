export default function Hud({ coins }: { coins: number }) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-sm bg-deep/80 border-b-4 border-cream">
      <div className="max-w-[1080px] mx-auto px-4 py-2 flex items-center justify-between font-pixel text-[10px] text-cream tracking-widest">
        <div className="flex items-center gap-3">
          <span className="text-coin">★</span>
          <span>NIK</span>
          <span className="text-cream/40">/</span>
          <span>LV 7</span>
        </div>
        <nav className="hidden sm:flex items-center gap-5">
          <a href="#status"   className="hover:text-coin transition-colors">[STATUS]</a>
          <a href="#quests"   className="hover:text-coin transition-colors">[QUESTS]</a>
          <a href="#talk"     className="hover:text-coin transition-colors">[TALK]</a>
        </nav>
        <div className="flex items-center gap-2">
          <span className="text-coin text-xl leading-none">●</span>
          <span>x{String(coins).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  )
}
