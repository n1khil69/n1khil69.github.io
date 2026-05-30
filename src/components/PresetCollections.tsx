import React from 'react';
import { PresetBouquet, PRESET_BOUQUETS, FLOWER_TYPES, VESSEL_TYPES } from '../data/floralData';

interface PresetCollectionsProps {
  onLoadPreset: (preset: PresetBouquet) => void;
}

export const PresetCollections: React.FC<PresetCollectionsProps> = ({ onLoadPreset }) => {
  const getStemSummary = (preset: PresetBouquet) => {
    const summary: { [key: string]: number } = {};
    preset.stems.forEach((stem) => {
      const flower = FLOWER_TYPES.find((f) => f.id === stem.flowerId);
      if (flower) {
        summary[flower.name] = (summary[flower.name] || 0) + 1;
      }
    });
    return summary;
  };

  const getVesselName = (vesselId: string) => {
    return VESSEL_TYPES.find((v) => v.id === vesselId)?.name || 'Standard Pot';
  };

  return (
    <div className="w-full flex flex-col gap-8 py-4">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
        <span className="text-xs uppercase font-sans tracking-widest text-[#c5a880]">
          Seasonal Curations
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#faf7f2] font-semibold leading-tight">
          Designer Presets
        </h2>
        <p className="text-sm text-[#eadecd]/60 font-sans leading-relaxed">
          Pre-arranged signature collections curated by our Master Florists. Click any preset to load it directly into the Atelier Canvas and make it your own!
        </p>
      </div>

      {/* Preset Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PRESET_BOUQUETS.map((preset) => {
          const stemsSummary = getStemSummary(preset);
          return (
            <div
              key={preset.id}
              className="group glass rounded-2xl p-6 border border-[#c5a880]/15 hover:border-[#c5a880]/40 transition-all duration-500 flex flex-col justify-between hover:bg-[#162d22]/10 hover:shadow-2xl hover:shadow-[#c5a880]/5 relative overflow-hidden"
            >
              {/* Top Section */}
              <div>
                {/* Decorative Floral Emblem background */}
                <div className="absolute -top-10 -right-10 text-[100px] text-[#faf7f2]/[0.01] pointer-events-none group-hover:scale-125 transition-transform duration-700">
                  🌸
                </div>

                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="font-serif text-lg md:text-xl text-[#faf7f2] font-semibold group-hover:text-[#c5a880] transition-colors leading-tight">
                      {preset.name}
                    </h3>
                    <span className="text-[10px] text-[#c5a880] font-sans tracking-widest uppercase font-semibold mt-1 inline-block">
                      {preset.tagline}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#eadecd]/70 font-sans leading-relaxed mb-6">
                  {preset.description}
                </p>

                {/* Stems & Housing Breakdown Details */}
                <div className="bg-black/25 rounded-xl p-4 border border-[#c5a880]/10 flex flex-col gap-3 mb-6">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#eadecd]/40 block font-sans mb-1.5">
                      Vessel Housing
                    </span>
                    <span className="text-xs font-sans text-[#faf7f2] font-medium pl-1 block">
                      🏺 {getVesselName(preset.vesselId)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#eadecd]/40 block font-sans mb-1.5">
                      Florals Contained
                    </span>
                    <div className="flex flex-col gap-1 pl-1">
                      {Object.entries(stemsSummary).map(([flowerName, count]) => (
                        <div key={flowerName} className="text-xs text-[#eadecd]/80 font-sans flex justify-between">
                          <span>• {flowerName}</span>
                          <span className="text-[#c5a880]/70 font-semibold">x{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => onLoadPreset(preset)}
                  className="w-full py-3 rounded-xl bg-[#162d22] hover:bg-[#204232] border border-[#c5a880]/30 hover:border-[#c5a880]/70 text-[#faf7f2] text-xs font-sans font-semibold uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-1.5"
                >
                  🖌️ Load in Atelier
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default PresetCollections;
