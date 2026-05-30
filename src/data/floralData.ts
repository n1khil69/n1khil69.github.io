export interface FlowerType {
  id: string;
  name: string;
  scientificName: string;
  type: 'bloom' | 'green' | 'accent';
  meaning: string;
  lore: string;
  color: string;
  aromaNotes: string;
  botanistNotes: string;
  careTip: string;
}

export interface VesselType {
  id: string;
  name: string;
  description: string;
  height: number;
  width: number;
  svgType: string;
}

export interface WrappingType {
  id: string;
  name: string;
  color: string;
  textureClass: string;
}

export interface PresetBouquet {
  id: string;
  name: string;
  tagline: string;
  description: string;
  vesselId: string;
  wrappingId: string;
  stems: Array<{
    flowerId: string;
    x: number; // percentage width on canvas (e.g. 35 to 65)
    y: number; // percentage height on canvas (e.g. 20 to 60)
    scale: number;
    rotation: number;
    zIndex: number;
  }>;
}

export const FLOWER_TYPES: FlowerType[] = [
  {
    id: 'majestic-rose',
    name: 'Majestic Crimson Rose',
    scientificName: 'Rosa rubiginosa',
    type: 'bloom',
    meaning: 'Deep passion, eternal love, & mystery',
    lore: 'Historically linked to Aphrodite, the Greek goddess of love. In ancient Rome, roses were strewn in banquet halls to create a fragrant, luxurious setting for emperors.',
    color: '#9e1b32',
    aromaNotes: 'Rich, velvet damask, classic honeyed floral',
    botanistNotes: 'Possesses dense spiraling petals that open slowly over 5–7 days. Thrives when stems are cut at a 45-degree angle to maximize water absorption.',
    careTip: 'Remove leaves below the water level to prevent bacteria growth and change water every two days.'
  },
  {
    id: 'blush-peony',
    name: 'Blush Silk Peony',
    scientificName: 'Paeonia lactiflora',
    type: 'bloom',
    meaning: 'Prosperity, good fortune, & happy marriage',
    lore: 'Known as the "King of Flowers" in China, peonies were exclusively grown in the imperial gardens of the Sui and Tang dynasties as symbols of high nobility.',
    color: '#e8a5b2',
    aromaNotes: 'Fresh, sweet, watery floral with subtle citrus undertones',
    botanistNotes: 'Features massive, billowy flower heads consisting of hundreds of delicate, paper-thin petals. Often harvested in tight "marshmallow" bud stage.',
    careTip: 'If buds are stubborn to open, gently massage the outer green sepals under lukewarm running water.'
  },
  {
    id: 'royal-lily',
    name: 'Imperial Casablanca Lily',
    scientificName: 'Lilium auratum',
    type: 'bloom',
    meaning: 'Majesty, purity of heart, & rebirth',
    lore: 'Depicted in Minoan frescoes dating back to 1580 BC, lilies have long symbolized sovereignty and divine grace in Mediterranean history.',
    color: '#faf6f0',
    aromaNotes: 'Heady, intoxicatingly sweet, spicy and lingering',
    botanistNotes: 'Large, trumpet-shaped white blooms with elegant recurved petals and long protruding stamens laden with rusty-golden pollen.',
    careTip: 'Gently snip off the orange anthers from the center of the lily. This prevents pollen from staining the petals and extends bloom life.'
  },
  {
    id: 'gold-carnation',
    name: 'Gilded Amber Carnation',
    scientificName: 'Dianthus caryophyllus',
    type: 'bloom',
    meaning: 'Fascination, distinction, & pure devotion',
    lore: 'Its botanical name Dianthus translates to "Flower of the Gods". Used in Greek ceremonial crowns, it represents the timeless elegance of classic flora.',
    color: '#d49b6a',
    aromaNotes: 'Delicate clove-like spice mixed with sweet honey',
    botanistNotes: 'Extremely hardy bloom with heavily ruffled, serrated petals. Noted for its incredible vase life, often lasting up to three weeks.',
    careTip: 'Trim stems just above a node (the swollen joint on the stem) to allow better water intake.'
  },
  {
    id: 'white-tulip',
    name: 'Premium Alabaster Tulip',
    scientificName: 'Tulipa gesneriana',
    type: 'bloom',
    meaning: 'Unconditional forgiveness, peace, & elegance',
    lore: 'At the height of 17th-century "Tulip Mania" in the Netherlands, a single rare tulip bulb could purchase a grand canal house in Amsterdam.',
    color: '#f0f3f5',
    aromaNotes: 'Clean, light, grassy-sweet and minimalist',
    botanistNotes: 'Sleek, cup-shaped flowers that continue to grow and bend toward light sources even after being cut and arranged in a vase.',
    careTip: 'Tulips are phototropic; use a tap vase to support their stems as they stretch toward the light.'
  },
  {
    id: 'wild-chamomile',
    name: 'Wild Chamomile Spray',
    scientificName: 'Matricaria chamomilla',
    type: 'accent',
    meaning: 'Energy in adversity, patience, & calm',
    lore: 'Revered by Anglo-Saxons as one of the nine sacred herbs given to the world by Woden, and utilized by ancient Egyptians to soothe fevers.',
    color: '#eedc82',
    aromaNotes: 'Warm apple, sweet straw, and relaxing herbal tea',
    botanistNotes: 'Dainty daisy-like heads with brilliant yellow conical centers surrounded by small, rayed white petals. Perfect for rustic texturing.',
    careTip: 'Prune away smaller, weaker side shoots to let the main daisy blossoms drink more water.'
  },
  {
    id: 'eucalyptus-stem',
    name: 'Silver Dollar Eucalyptus',
    scientificName: 'Eucalyptus cinerea',
    type: 'green',
    meaning: 'Healing, protection, & cleansing energy',
    lore: 'Indigenous to Australia, the leaves were traditionally burned by Aboriginal communities for their purifying, medicinal smoke.',
    color: '#839b8c',
    aromaNotes: 'Cooling menthol, fresh pine, and earthy camphor',
    botanistNotes: 'Opposite, circular blue-green leaves with a powdery, silvery-waxy coating. Incredible for adding architectural structure to arrangements.',
    careTip: 'Lightly crush the woody bottom of the stem with a mallet to facilitate water uptake.'
  },
  {
    id: 'lavender-sprig',
    name: 'Provincial Lavender Stalk',
    scientificName: 'Lavandula angustifolia',
    type: 'accent',
    meaning: 'Serenity, devotion, grace, & silence',
    lore: 'Favored by Queen Elizabeth I as a royal perfume. Historically placed in linen chests to keep textiles fresh and ward off unwanted moths.',
    color: '#9683ec',
    aromaNotes: 'Relaxing herbal-balsamic, woody, and floral-sweet',
    botanistNotes: 'Slender, linear spikes packed with tiny, aromatic violet blooms. The essential oils are concentrated in glandular hairs on the calyx.',
    careTip: 'Thrives in less water than other flowers. If drying the arrangement, simply hang the stems upside down in a dark room.'
  },
  {
    id: 'babys-breath',
    name: 'Stardust Gypsophila',
    scientificName: 'Gypsophila paniculata',
    type: 'accent',
    meaning: 'Everlasting love, innocence, & stellar dust',
    lore: 'Originally native to central Europe, it became the staple of Victorian romantic bouquets, representing delicate whispers of the heart.',
    color: '#fafafa',
    aromaNotes: 'Very faint, dry herbal with clean organic sweetness',
    botanistNotes: 'A complex, heavily branched, cloud-like spray filled with hundreds of miniature white flowerlets. Excellent filler and soft contrast.',
    careTip: 'Keep away from ripening fruit (which releases ethylene gas) to prevent premature browning of the delicate florets.'
  }
];

export const VESSEL_TYPES: VesselType[] = [
  {
    id: 'ceramic-minimalist',
    name: 'Minimalist Matte Ceramic',
    description: 'An elegant, textured off-white ceramic pot. Perfectly modern and understated, emphasizing the raw natural beauty of the blooms.',
    height: 180,
    width: 140,
    svgType: 'ceramic'
  },
  {
    id: 'glass-gold-rimmed',
    name: 'Ribbed Amber Glass with Gold Rim',
    description: 'A classic, fluted amber glass cylinder topped with a hand-painted 24k gold rim. Reflects light beautifully, providing warm vintage vibes.',
    height: 200,
    width: 130,
    svgType: 'glass'
  },
  {
    id: 'terracotta-ribbed',
    name: 'Ribbed Sage Terracotta',
    description: 'Earthy, coarse terracotta with subtle horizontal ribbing. Provides an organic, Mediterranean accent to wildflower arrangements.',
    height: 170,
    width: 150,
    svgType: 'terracotta'
  },
  {
    id: 'kraft-wrap',
    name: 'Luxury Kraft Craft Wrapping',
    description: 'Bespoke heavy kraft paper folded in origami-style luxury sheets, tied with an organic hemp cord. Ideal for hand-held presentations.',
    height: 190,
    width: 160,
    svgType: 'kraft'
  }
];

export const WRAPPING_TYPES: WrappingType[] = [
  {
    id: 'none',
    name: 'No Ribbon (Pure Display)',
    color: 'transparent',
    textureClass: ''
  },
  {
    id: 'ribbon-gold',
    name: 'French Satin Gold Bow',
    color: '#c5a880',
    textureClass: 'bg-[#c5a880]'
  },
  {
    id: 'ribbon-emerald',
    name: 'Forest Velvet Ribbon',
    color: '#162d22',
    textureClass: 'bg-[#162d22]'
  },
  {
    id: 'ribbon-silk',
    name: 'Hand-dyed Silk Blush Wrap',
    color: '#e8c5c8',
    textureClass: 'bg-[#e8c5c8]'
  }
];

export const PRESET_BOUQUETS: PresetBouquet[] = [
  {
    id: 'midnight-rouge',
    name: 'Midnight Crimson Rouge',
    tagline: 'Velvet romance & high drama',
    description: 'A deeply passionate arrangement featuring Crimson Roses, blush peonies, and cooling eucalyptus leaves, staged in our Minimalist Matte Ceramic vase.',
    vesselId: 'ceramic-minimalist',
    wrappingId: 'ribbon-emerald',
    stems: [
      { flowerId: 'majestic-rose', x: 50, y: 68, scale: 1.25, rotation: 0, zIndex: 4 },
      { flowerId: 'majestic-rose', x: 48, y: 70, scale: 1.15, rotation: -22, zIndex: 3 },
      { flowerId: 'majestic-rose', x: 52, y: 70, scale: 1.15, rotation: 22, zIndex: 5 },
      { flowerId: 'blush-peony', x: 47, y: 71, scale: 1.1, rotation: -38, zIndex: 2 },
      { flowerId: 'blush-peony', x: 53, y: 71, scale: 1.1, rotation: 38, zIndex: 6 },
      { flowerId: 'eucalyptus-stem', x: 45, y: 72, scale: 1.3, rotation: -55, zIndex: 0 },
      { flowerId: 'eucalyptus-stem', x: 55, y: 72, scale: 1.3, rotation: 55, zIndex: 1 },
      { flowerId: 'babys-breath', x: 49, y: 69, scale: 1.05, rotation: -12, zIndex: 2 },
      { flowerId: 'babys-breath', x: 51, y: 69, scale: 1.05, rotation: 12, zIndex: 3 }
    ]
  },
  {
    id: 'golden-solstice',
    name: 'Golden Solstice Dream',
    tagline: 'Warm amber tones & earthy grace',
    description: 'An expansive, warm palette celebrating Dianthus carnations and white lilies nestled among sprigs of lavender and wild chamomile. Set in Ribbed Amber Glass.',
    vesselId: 'glass-gold-rimmed',
    wrappingId: 'ribbon-gold',
    stems: [
      { flowerId: 'royal-lily', x: 50, y: 68, scale: 1.2, rotation: 0, zIndex: 4 },
      { flowerId: 'gold-carnation', x: 48, y: 70, scale: 1.1, rotation: -24, zIndex: 3 },
      { flowerId: 'gold-carnation', x: 52, y: 70, scale: 1.1, rotation: 24, zIndex: 2 },
      { flowerId: 'gold-carnation', x: 50, y: 72, scale: 1.0, rotation: -5, zIndex: 5 },
      { flowerId: 'wild-chamomile', x: 45, y: 73, scale: 1.05, rotation: -45, zIndex: 1 },
      { flowerId: 'wild-chamomile', x: 55, y: 73, scale: 1.05, rotation: 45, zIndex: 1 },
      { flowerId: 'lavender-sprig', x: 47, y: 69, scale: 1.2, rotation: -15, zIndex: 0 },
      { flowerId: 'lavender-sprig', x: 53, y: 69, scale: 1.2, rotation: 15, zIndex: 0 },
      { flowerId: 'babys-breath', x: 49, y: 70, scale: 1.05, rotation: -8, zIndex: 2 },
      { flowerId: 'babys-breath', x: 51, y: 70, scale: 1.05, rotation: 8, zIndex: 1 }
    ]
  },
  {
    id: 'verdant-peace',
    name: 'Verdant Meadow Peace',
    tagline: 'Fresh wildflowers & clean luxury',
    description: 'A calm, ethereal botanical escape. Features premium white tulips, majestic lilies, wild chamomile, and heavy cascades of eucalyptus leaves wrapped in Kraft origami paper.',
    vesselId: 'kraft-wrap',
    wrappingId: 'ribbon-silk',
    stems: [
      { flowerId: 'royal-lily', x: 50, y: 68, scale: 1.15, rotation: -5, zIndex: 3 },
      { flowerId: 'white-tulip', x: 48, y: 70, scale: 1.1, rotation: -25, zIndex: 4 },
      { flowerId: 'white-tulip', x: 52, y: 70, scale: 1.1, rotation: 15, zIndex: 5 },
      { flowerId: 'white-tulip', x: 53, y: 71, scale: 1.05, rotation: 35, zIndex: 2 },
      { flowerId: 'wild-chamomile', x: 45, y: 72, scale: 1.05, rotation: -45, zIndex: 1 },
      { flowerId: 'eucalyptus-stem', x: 44, y: 73, scale: 1.3, rotation: -55, zIndex: 0 },
      { flowerId: 'eucalyptus-stem', x: 56, y: 73, scale: 1.3, rotation: 55, zIndex: 0 },
      { flowerId: 'babys-breath', x: 50, y: 72, scale: 1.15, rotation: 0, zIndex: 1 }
    ]
  }
];
