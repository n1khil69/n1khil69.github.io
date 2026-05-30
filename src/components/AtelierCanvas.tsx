import React, { useRef, useState } from 'react';
import { FlowerType, VesselType, WrappingType, FLOWER_TYPES, VESSEL_TYPES, WRAPPING_TYPES } from '../data/floralData';
import { FlowerSVG } from './FlowerSVG';

export interface PlacedStem {
  id: string;
  flowerId: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  scale: number;
  rotation: number;
  zIndex: number;
}

interface AtelierCanvasProps {
  stems: PlacedStem[];
  selectedStemId: string | null;
  vesselId: string;
  wrappingId: string;
  onSelectStem: (id: string | null) => void;
  onMoveStem: (id: string, x: number, y: number) => void;
  onUpdateStem: (id: string, updates: Partial<PlacedStem>) => void;
  onRemoveStem: (id: string) => void;
  onClear: () => void;
}

export const AtelierCanvas: React.FC<AtelierCanvasProps> = ({
  stems,
  selectedStemId,
  vesselId,
  wrappingId,
  onSelectStem,
  onMoveStem,
  onUpdateStem,
  onRemoveStem,
  onClear,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    stemId: string;
    startX: number;
    startY: number;
    startStemX: number;
    startStemY: number;
  } | null>(null);

  const selectedVessel = VESSEL_TYPES.find(v => v.id === vesselId) || VESSEL_TYPES[0];
  const selectedWrapping = WRAPPING_TYPES.find(w => w.id === wrappingId) || WRAPPING_TYPES[0];

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, stem: PlacedStem) => {
    e.stopPropagation();
    onSelectStem(stem.id);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragState({
        stemId: stem.id,
        startX: e.clientX,
        startY: e.clientY,
        startStemX: stem.x,
        startStemY: stem.y,
      });
      // Capture pointer events so dragging is smooth even outside bounds
      (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    // Convert pixels to percentage on canvas
    const pctX = (dx / rect.width) * 100;
    const pctY = (dy / rect.height) * 100;

    let newX = dragState.startStemX + pctX;
    let newY = dragState.startStemY + pctY;

    // Clamp coordinates to keep arrangement realistic
    newX = Math.max(5, Math.min(95, newX));
    newY = Math.max(5, Math.min(85, newY));

    onMoveStem(dragState.stemId, newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState) {
      try {
        (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
      setDragState(null);
    }
  };

  // Render the selected vessel (Back Layer)
  const renderVesselBack = () => {
    switch (selectedVessel.svgType) {
      case 'glass':
        return (
          // Transparent glass back
          <svg className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-[1] pointer-events-none" width="130" height="200" viewBox="0 0 130 200">
            <ellipse cx="65" cy="15" rx="50" ry="10" fill="#2d2218" opacity="0.3" />
            <path d="M15 15 C15 15 5 180 15 190 C25 200 105 200 115 190 C125 180 115 15 115 15" fill="#fcf6ec" opacity="0.08" />
          </svg>
        );
      case 'ceramic':
        return (
          // Inside of pot
          <svg className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-[1] pointer-events-none" width="140" height="180" viewBox="0 0 140 180">
            <ellipse cx="70" cy="15" rx="55" ry="12" fill="#0f1613" />
          </svg>
        );
      case 'terracotta':
        return (
          // Inside of terracotta pot
          <svg className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-[1] pointer-events-none" width="150" height="170" viewBox="0 0 150 170">
            <ellipse cx="75" cy="15" rx="60" ry="12" fill="#1b120c" />
          </svg>
        );
      case 'kraft':
        return (
          // Back origami wrapping
          <svg className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-[1] pointer-events-none" width="160" height="190" viewBox="0 0 160 190">
            <path d="M10 50 L80 190 L150 50 Z" fill="#8c7355" opacity="0.75" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Render the selected vessel (Front Layer, overlays stems)
  const renderVesselFront = () => {
    switch (selectedVessel.svgType) {
      case 'glass':
        return (
          <svg className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-[10] pointer-events-none" width="130" height="200" viewBox="0 0 130 200">
            <defs>
              <linearGradient id="glass-reflection" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="25%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
                <stop offset="85%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="gold-rim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8c7352" />
                <stop offset="30%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#faf7f2" />
                <stop offset="70%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#8c7352" />
              </linearGradient>
            </defs>
            {/* Water Line */}
            <path d="M11 90 Q 65 98 119 90 C 119 90 120 180 115 190 C105 200 25 200 15 190 C 10 180 11 90 11 90 Z" fill="#839b8c" fillOpacity="0.15" />
            <path d="M11 90 Q 65 98 119 90" fill="none" stroke="#faf7f2" strokeWidth="0.75" strokeOpacity="0.4" />

            {/* Amber Glass Body with Fluting */}
            <path d="M15 15 C15 15 5 180 15 190 C25 200 105 200 115 190 C125 180 115 15 115 15 Z" fill="url(#glass-reflection)" />
            <path d="M15 15 C15 15 5 180 15 190 C25 200 105 200 115 190 C125 180 115 15 115 15 Z" fill="#ffb74d" fillOpacity="0.12" stroke="rgba(197, 168, 128, 0.4)" strokeWidth="1.5" />
            
            {/* Ribbed fluting lines */}
            <line x1="30" y1="18" x2="25" y2="188" stroke="#faf7f2" strokeWidth="1" strokeOpacity="0.15" />
            <line x1="48" y1="18" x2="45" y2="194" stroke="#faf7f2" strokeWidth="1" strokeOpacity="0.15" />
            <line x1="65" y1="18" x2="65" y2="196" stroke="#faf7f2" strokeWidth="1.5" strokeOpacity="0.2" />
            <line x1="82" y1="18" x2="85" y2="194" stroke="#faf7f2" strokeWidth="1" strokeOpacity="0.15" />
            <line x1="100" y1="18" x2="105" y2="188" stroke="#faf7f2" strokeWidth="1" strokeOpacity="0.15" />

            {/* Glass Highlights */}
            <path d="M22 25 Q 16 100 22 175" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3" />
            
            {/* Top Gold Rim */}
            <ellipse cx="65" cy="15" rx="50" ry="10" fill="none" stroke="url(#gold-rim)" strokeWidth="3" />
            
            {/* Ribbon Render */}
            {renderRibbon()}
          </svg>
        );
      case 'ceramic':
        return (
          <svg className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-[10] pointer-events-none" width="140" height="180" viewBox="0 0 140 180">
            <defs>
              <linearGradient id="ceramic-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d9cec1" />
                <stop offset="30%" stopColor="#faf7f2" />
                <stop offset="70%" stopColor="#f3eae0" />
                <stop offset="100%" stopColor="#beb1a0" />
              </linearGradient>
            </defs>
            {/* Ceramic Pot Body */}
            <path d="M15 15 C15 15 -10 120 15 160 C35 185 105 185 125 160 C150 120 125 15 125 15 Z" fill="url(#ceramic-grad)" stroke="rgba(140, 115, 82, 0.25)" strokeWidth="1.5" />
            {/* Ceramic Texture Shadow */}
            <path d="M15 15 C15 15 -10 120 15 160 C25 170 60 178 70 178 C 70 178 135 155 125 15 Z" fill="black" fillOpacity="0.04" />
            {/* Rim Overlay */}
            <ellipse cx="70" cy="15" rx="55" ry="12" fill="none" stroke="#c5a880" strokeWidth="2.5" />
            <ellipse cx="70" cy="15" rx="55" ry="12" fill="none" stroke="#faf7f2" strokeWidth="1" strokeOpacity="0.5" />
            
            {/* Ribbon Render */}
            {renderRibbon()}
          </svg>
        );
      case 'terracotta':
        return (
          <svg className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-[10] pointer-events-none" width="150" height="170" viewBox="0 0 150 170">
            <defs>
              <linearGradient id="terra-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#41564d" />
                <stop offset="35%" stopColor="#638073" />
                <stop offset="70%" stopColor="#4d665a" />
                <stop offset="100%" stopColor="#2b3b33" />
              </linearGradient>
            </defs>
            {/* Terracotta Body */}
            <path d="M15 15 C15 15 0 120 20 155 C35 175 115 175 130 155 C150 120 135 15 135 15 Z" fill="url(#terra-grad)" stroke="rgba(197, 168, 128, 0.15)" strokeWidth="1.5" />
            {/* Horizontal Ribbing Lines */}
            <path d="M22 60 Q 75 70 128 60" fill="none" stroke="#22332a" strokeWidth="1.5" strokeOpacity="0.4" />
            <path d="M24 100 Q 75 110 126 100" fill="none" stroke="#22332a" strokeWidth="1.5" strokeOpacity="0.4" />
            <path d="M28 135 Q 75 142 122 135" fill="none" stroke="#22332a" strokeWidth="1.5" strokeOpacity="0.4" />

            {/* Rim Overlay */}
            <ellipse cx="75" cy="15" rx="60" ry="12" fill="none" stroke="#374a41" strokeWidth="2.5" />

            {/* Ribbon Render */}
            {renderRibbon()}
          </svg>
        );
      case 'kraft':
        return (
          <svg className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-[10] pointer-events-none" width="160" height="190" viewBox="0 0 160 190">
            <defs>
              <linearGradient id="kraft-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4be9a" />
                <stop offset="50%" stopColor="#bd9f75" />
                <stop offset="100%" stopColor="#967954" />
              </linearGradient>
            </defs>
            {/* Folded paper sheets (Front origami wraps) */}
            <path d="M10 50 L80 190 L50 40 Z" fill="url(#kraft-grad)" stroke="#806543" strokeWidth="1" />
            <path d="M150 50 L80 190 L110 40 Z" fill="url(#kraft-grad)" stroke="#806543" strokeWidth="1" />
            <path d="M30 65 L80 190 L130 65 Z" fill="#bd9f75" opacity="0.9" stroke="#9c805a" strokeWidth="1" />

            {/* Ribbon/Rope Render */}
            {renderRibbon()}
          </svg>
        );
      default:
        return null;
    }
  };

  // Draw Ribbon depending on selected option
  const renderRibbon = () => {
    if (selectedWrapping.id === 'none') return null;

    const ribbonColor = selectedWrapping.color;

    return (
      <g>
        {/* Ribbon Band Wrapped around Vase Neck */}
        <rect x="35" y="30" width="70" height="15" rx="4" fill={ribbonColor} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        
        {/* Bow knot */}
        <circle cx="70" cy="37.5" r="8" fill={ribbonColor} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

        {/* Elegant Ribbon Wings (Bow Loops) */}
        <path d="M 70 37.5 C 55 20 40 30 70 37.5" fill={ribbonColor} opacity="0.95" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
        <path d="M 70 37.5 C 85 20 100 30 70 37.5" fill={ribbonColor} opacity="0.95" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />

        {/* Ribbon tails hanging down */}
        <path d="M 68 37.5 Q 60 70 48 90" fill="none" stroke={ribbonColor} strokeWidth="6" strokeLinecap="round" />
        <path d="M 72 37.5 Q 80 70 92 90" fill="none" stroke={ribbonColor} strokeWidth="6" strokeLinecap="round" />
      </g>
    );
  };

  const selectedStem = stems.find(s => s.id === selectedStemId);
  const selectedFlowerType = selectedStem ? FLOWER_TYPES.find(f => f.id === selectedStem.flowerId) : null;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Interactive Canvas Frame */}
      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onClick={() => onSelectStem(null)}
        className="atelier-canvas-container grid-bg h-[450px] md:h-[550px] w-full rounded-2xl border border-[#c5a880]/30 shadow-2xl relative select-none"
      >
        {/* Dynamic Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="font-serif text-[10vw] uppercase tracking-widest font-light text-center">L'ATELIER</span>
        </div>

        {/* Dynamic Clear Button */}
        {stems.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Would you like to clear your current arrangement and start fresh?')) {
                onClear();
              }
            }}
            className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-[#5b1d28] border border-[#c5a880]/20 hover:border-[#e8c5c8]/50 transition-colors text-xs font-sans uppercase tracking-wider text-[#eadecd] hover:text-white"
          >
            Clear Art
          </button>
        )}

        {/* Instructions Overlay if Canvas is Empty */}
        {stems.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none animate-float">
            <span className="text-4xl mb-4">🌸</span>
            <h3 className="font-serif text-2xl text-[#c5a880] mb-2 font-medium">Bespoke Floral Atelier</h3>
            <p className="text-sm text-[#eadecd]/60 max-w-sm font-sans leading-relaxed">
              Select premium stems below to compose your arrangement. Click to select, drag to place, and style each stem with fine precision.
            </p>
          </div>
        )}

        {/* 1. Vase Back Layer */}
        {renderVesselBack()}

        {/* 2. Placed Stems Layer */}
        {stems
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((stem) => {
            const isSelected = stem.id === selectedStemId;
            return (
              <div
                key={stem.id}
                onPointerDown={(e) => handlePointerDown(e, stem)}
                style={{
                  left: `${stem.x}%`,
                  top: `${stem.y}%`,
                  transform: `translate(-50%, -50%) rotate(${stem.rotation}deg) scale(${stem.scale})`,
                  zIndex: stem.zIndex + 2, // offset by 2 to stay above Vessel Back (zIndex 1)
                }}
                className={`stem-wrapper group ${isSelected ? 'selected' : ''}`}
              >
                {/* Flower SVG Wrapper */}
                <div
                  className={`w-28 h-56 transition-transform duration-100 ${
                    isSelected
                      ? 'glow-flower-selected'
                      : 'glow-flower group-hover:scale-[1.03] active:scale-[0.98]'
                  }`}
                >
                  <FlowerSVG id={stem.flowerId} />
                </div>
              </div>
            );
          })}

        {/* 3. Vase Front Layer (Overlays Stems) */}
        {renderVesselFront()}
      </div>

      {/* Selected Stem Action Panel (shows up when a stem is selected) */}
      {selectedStem && selectedFlowerType && (
        <div className="glass rounded-xl p-4 border border-[#c5a880]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#162d22] border border-[#c5a880]/40 flex items-center justify-center text-lg">
              🌸
            </div>
            <div>
              <h4 className="font-serif text-base text-[#faf7f2] font-semibold flex items-center gap-2">
                {selectedFlowerType.name}
                <span className="text-[10px] uppercase font-sans tracking-widest text-[#c5a880] border border-[#c5a880]/30 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </h4>
              <p className="text-xs text-[#eadecd]/60 font-sans italic">{selectedFlowerType.meaning}</p>
            </div>
          </div>

          {/* Precision Controls */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
            {/* Rotation Control */}
            <div className="flex flex-col gap-1 flex-1 sm:flex-initial min-w-[100px]">
              <span className="text-[10px] uppercase font-sans tracking-widest text-[#eadecd]/60">Angle ({selectedStem.rotation}°)</span>
              <input
                type="range"
                min="-90"
                max="90"
                value={selectedStem.rotation}
                onChange={(e) => onUpdateStem(selectedStem.id, { rotation: parseInt(e.target.value) })}
                className="w-full h-1 bg-[#162d22] rounded-lg appearance-none cursor-pointer accent-[#c5a880]"
              />
            </div>

            {/* Scale Control */}
            <div className="flex flex-col gap-1 flex-1 sm:flex-initial min-w-[100px]">
              <span className="text-[10px] uppercase font-sans tracking-widest text-[#eadecd]/60">Size ({(selectedStem.scale * 100).toFixed(0)}%)</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={selectedStem.scale}
                onChange={(e) => onUpdateStem(selectedStem.id, { scale: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[#162d22] rounded-lg appearance-none cursor-pointer accent-[#c5a880]"
              />
            </div>

            {/* Layering Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateStem(selectedStem.id, { zIndex: Math.max(0, selectedStem.zIndex - 1) })}
                title="Send Backward"
                className="p-1.5 rounded bg-[#162d22] hover:bg-[#c5a880] hover:text-[#0b1a13] border border-[#c5a880]/30 transition-colors text-xs"
              >
                ▼ Down
              </button>
              <button
                onClick={() => onUpdateStem(selectedStem.id, { zIndex: selectedStem.zIndex + 1 })}
                title="Bring Forward"
                className="p-1.5 rounded bg-[#162d22] hover:bg-[#c5a880] hover:text-[#0b1a13] border border-[#c5a880]/30 transition-colors text-xs"
              >
                ▲ Up
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemoveStem(selectedStem.id)}
              className="px-3 py-1.5 rounded bg-[#5b1d28] hover:bg-[#722432] text-xs font-sans uppercase tracking-widest text-white border border-[#e8c5c8]/30 transition-colors flex items-center gap-1"
            >
              🗑️ Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AtelierCanvas;
