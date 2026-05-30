import React, { useState } from 'react';
import { FlowerType, FLOWER_TYPES } from '../data/floralData';
import { FlowerSVG } from './FlowerSVG';

interface FlowerPaletteProps {
  activeFlowerId: string;
  onSelectActiveFlower: (id: string) => void;
  onAddStem: (flowerId: string) => void;
  stemsCount: { [key: string]: number };
}

export const FlowerPalette: React.FC<FlowerPaletteProps> = ({
  activeFlowerId,
  onSelectActiveFlower,
  onAddStem,
  stemsCount,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'bloom' | 'green' | 'accent'>('all');

  const filteredFlowers = FLOWER_TYPES.filter(
    (f) => activeTab === 'all' || f.type === activeTab
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bloom':
        return 'Luxury Blooms';
      case 'green':
        return 'Fresh Foliage';
      case 'accent':
        return 'Delicate Accents';
      default:
        return '';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'bloom':
        return 'border-[#c5a880]/20 text-[#c5a880] bg-transparent';
      case 'green':
        return 'border-white/10 text-[#a19d95] bg-transparent';
      case 'accent':
        return 'border-white/10 text-[#faf7f2] bg-transparent';
      default:
        return 'border-white/5 text-gray-500 bg-transparent';
    }
  };

  const handleCardClick = (flowerId: string) => {
    onSelectActiveFlower(flowerId);
    onAddStem(flowerId); // also place one automatically in center for convenience!
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl md:text-2xl text-white font-medium tracking-wide">
              Botanical Brushes
            </h3>
            <span className="text-[10px] font-sans text-[#b8b1a5]/50 uppercase tracking-widest font-light">
              Tap canvas to place
            </span>
          </div>
          {/* Active Brush Status */}
          <div className="text-[10px] font-sans text-[#c5a880] flex items-center gap-1.5 pl-0.5 mt-1 font-light tracking-[0.12em] uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-pulse" />
            <span>Brush: <span className="underline font-normal text-white">
              {FLOWER_TYPES.find(f => f.id === activeFlowerId)?.name}
            </span></span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex p-0.5 bg-black/45 rounded-xl border border-white/5 w-full">
          {(['all', 'bloom', 'accent', 'green'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-2.5 rounded-lg text-[9px] font-sans font-medium uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#09090b] text-[#faf7f2] font-semibold border border-white/5 shadow-lg shadow-black/40'
                  : 'text-[#a19d95]/50 hover:text-white'
              }`}
            >
              {tab === 'all'
                ? 'All Stems'
                : tab === 'bloom'
                ? 'Blooms'
                : tab === 'accent'
                ? 'Accents'
                : 'Foliage'}
            </button>
          ))}
        </div>
      </div>

      {/* Flower Stems Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[350px] md:max-h-[420px] overflow-y-auto pr-1">
        {filteredFlowers.map((flower) => {
          const count = stemsCount[flower.id] || 0;
          const isActive = flower.id === activeFlowerId;
          return (
            <div
              key={flower.id}
              onClick={() => handleCardClick(flower.id)}
              className={`group glass rounded-2xl p-4.5 border cursor-pointer transition-all duration-400 flex flex-col justify-between items-center text-center relative overflow-hidden active:scale-[0.98] ${
                isActive
                  ? 'border-[#c5a880] bg-[#09090b]/80 shadow-2xl shadow-[#c5a880]/5'
                  : 'border-white/5 hover:border-[#c5a880]/20 hover:bg-black/20'
              }`}
            >
              {/* Added Stem Count Indicator */}
              {count > 0 && (
                <div className="absolute top-2.5 right-2.5 z-10 w-5.5 h-5.5 rounded-full bg-[#c5a880] text-[#040405] text-[10px] font-sans font-bold flex items-center justify-center shadow-md animate-fade-in">
                  {count}
                </div>
              )}

              {/* Flower Miniature SVG Display */}
              <div className="w-16 h-28 md:w-18 md:h-30 mb-2 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 relative">
                {/* Spotlight background behind flower */}
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{ backgroundColor: flower.color }}
                />
                <FlowerSVG id={flower.id} />
              </div>

              {/* Info Details */}
              <div className="w-full">
                <span
                  className={`inline-block text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-full border mb-1.5 font-sans font-medium ${getTypeBadgeColor(
                    flower.type
                  )}`}
                >
                  {getTypeLabel(flower.type)}
                </span>
                <h4 className="font-serif text-sm text-[#faf7f2] font-light leading-tight group-hover:text-[#c5a880] transition-colors truncate w-full mb-0.5">
                  {flower.name}
                </h4>
                <p className="text-[10px] text-[#b8b1a5]/50 italic font-sans truncate">
                  {flower.meaning}
                </p>
              </div>

              {/* Active Brush Label */}
              {isActive && (
                <div className="absolute bottom-0 inset-x-0 bg-[#c5a880] text-[#040405] text-[8px] uppercase tracking-widest font-sans font-semibold py-0.5 animate-fade-in">
                  Active Brush
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default FlowerPalette;
