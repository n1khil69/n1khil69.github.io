import React, { useState } from 'react';
import { FlowerType, FLOWER_TYPES } from '../data/floralData';
import { FlowerSVG } from './FlowerSVG';

interface FlowerPaletteProps {
  onAddStem: (flowerId: string) => void;
  stemsCount: { [key: string]: number };
}

export const FlowerPalette: React.FC<FlowerPaletteProps> = ({ onAddStem, stemsCount }) => {
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
        return 'bg-[#5b1d28]/40 border-[#e8c5c8]/30 text-[#e8c5c8]';
      case 'green':
        return 'bg-[#162d22]/40 border-[#839b8c]/30 text-[#839b8c]';
      case 'accent':
        return 'bg-[#534b3c]/40 border-[#c5a880]/30 text-[#c5a880]';
      default:
        return 'bg-[#1c2421] border-gray-700 text-gray-400';
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl md:text-2xl text-[#faf7f2] font-semibold tracking-wide">
            Select Botanicals
          </h3>
          <span className="text-xs font-sans text-[#eadecd]/60">
            Click to add stem to arrangement
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex p-1 bg-black/35 rounded-xl border border-[#c5a880]/15 w-full">
          {(['all', 'bloom', 'accent', 'green'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-sans font-medium uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#c5a880] text-[#0b1a13] shadow-md font-semibold'
                  : 'text-[#eadecd]/70 hover:text-white hover:bg-[#162d22]/30'
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
          return (
            <div
              key={flower.id}
              onClick={() => onAddStem(flower.id)}
              className="group glass rounded-2xl p-3 md:p-4 border border-[#c5a880]/15 hover:border-[#c5a880]/50 hover:bg-[#162d22]/20 cursor-pointer transition-all duration-300 flex flex-col justify-between items-center text-center relative overflow-hidden active:scale-[0.98]"
            >
              {/* Added Stem Count Indicator */}
              {count > 0 && (
                <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-[#c5a880] text-[#0b1a13] text-xs font-sans font-bold flex items-center justify-center shadow-md animate-fade-in">
                  {count}
                </div>
              )}

              {/* Flower Miniature SVG Display */}
              <div className="w-16 h-28 md:w-20 md:h-32 mb-2 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 relative">
                {/* Spotlight background behind flower */}
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                  style={{ backgroundColor: flower.color }}
                />
                <FlowerSVG id={flower.id} />
              </div>

              {/* Info Details */}
              <div className="w-full">
                <span
                  className={`inline-block text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full border mb-1.5 font-sans font-medium ${getTypeBadgeColor(
                    flower.type
                  )}`}
                >
                  {getTypeLabel(flower.type)}
                </span>
                <h4 className="font-serif text-sm text-[#faf7f2] font-medium leading-tight group-hover:text-[#c5a880] transition-colors truncate w-full mb-0.5">
                  {flower.name}
                </h4>
                <p className="text-[10px] text-[#eadecd]/60 italic font-sans truncate mb-2">
                  {flower.meaning}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-sans font-semibold text-[#c5a880]">
                    ${flower.price.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-[#eadecd]/40 font-sans uppercase">
                    / stem
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default FlowerPalette;
