// A tiny pixel hero — drawn with rects so it crisps at any size.
// Palette is intentionally limited (NES-ish).
type Props = { size?: number; className?: string }

const W = 16
const H = 16
// 0 = transparent
// 1 = outline (deep purple)
// 2 = skin
// 3 = hair (dark)
// 4 = shirt (magenta)
// 5 = shirt highlight
// 6 = pants (royal)
// 7 = boots
// 8 = white (eye/shine)
const PIX = [
  '0001111000000000',
  '0011333110000000',
  '0133333331000000',
  '0133333331000000',
  '0122332221000000',
  '0128228281000000',
  '0122222221000000',
  '0014444410000000',
  '0145555410000000',
  '0145555410000000',
  '0145555410000000',
  '0014444100000000',
  '0016666100000000',
  '0016666100000000',
  '0017007100000000',
  '0011001100000000',
].map((r) => r.padEnd(W, '0').slice(0, W))

const COLOR: Record<string, string> = {
  '1': '#1f0a3a',
  '2': '#ffc69b',
  '3': '#3a1f1a',
  '4': '#ff5dac',
  '5': '#ffb6e0',
  '6': '#3a3aff',
  '7': '#1a1a1a',
  '8': '#ffffff',
}

export default function Sprite({ size = 96, className = '' }: Props) {
  const cells: JSX.Element[] = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = PIX[y][x]
      if (c === '0') continue
      cells.push(
        <rect key={x + ',' + y} x={x} y={y} width={1.02} height={1.02} fill={COLOR[c]} />
      )
    }
  }
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      {cells}
    </svg>
  )
}
