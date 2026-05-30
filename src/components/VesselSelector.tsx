import React from 'react';
import { VesselType, WrappingType, VESSEL_TYPES, WRAPPING_TYPES } from '../data/floralData';

interface VesselSelectorProps {
  selectedVesselId: string;
  selectedWrappingId: string;
  onSelectVessel: (id: string) => void;
  onSelectWrapping: (id: string) => void;
}

export const VesselSelector: React.FC<VesselSelectorProps> = ({
  selectedVesselId,
  selectedWrappingId,
  onSelectVessel,
  onSelectWrapping,
}) => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Vessel Selector */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-serif text-xl text-white font-medium tracking-wide">
            Select Vessel
          </h3>
          <p className="text-xs text-[#b8b1a5]/50 font-sans mt-0.5">
            The foundation of your arrangement
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VESSEL_TYPES.map((vessel) => {
            const isSelected = vessel.id === selectedVesselId;
            return (
              <div
                key={vessel.id}
                onClick={() => onSelectVessel(vessel.id)}
                className={`group rounded-2xl p-4.5 border cursor-pointer transition-all duration-455 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#09090b]/80 border-[#c5a880] shadow-2xl shadow-[#c5a880]/5'
                    : 'bg-black/10 border-white/5 hover:border-[#c5a880]/20'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h4 className={`font-serif text-sm font-semibold transition-colors ${
                      isSelected ? 'text-[#c5a880]' : 'text-[#faf7f2] group-hover:text-[#c5a880]'
                    }`}>
                      {vessel.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#b8b1a5]/60 font-sans leading-relaxed">
                    {vessel.description}
                  </p>
                </div>

                {/* Selected highlight line */}
                {isSelected && (
                  <div className="w-full h-[1px] bg-[#c5a880] mt-4 shadow-[0_0_8px_rgba(197,168,128,0.5)] animate-fade-in" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Ribbon Wrapping Selector */}
      <div className="flex flex-col gap-4 border-t border-white/5 pt-5">
        <div>
          <h3 className="font-serif text-xl text-white font-medium tracking-wide">
            Wrapping Ribbon
          </h3>
          <p className="text-xs text-[#b8b1a5]/50 font-sans mt-0.5">
            Add a designer silk or velvet bow
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {WRAPPING_TYPES.map((wrap) => {
            const isSelected = wrap.id === selectedWrappingId;
            return (
              <div
                key={wrap.id}
                onClick={() => onSelectWrapping(wrap.id)}
                className={`group rounded-xl p-3 border cursor-pointer transition-all duration-400 flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#09090b]/80 border-[#c5a880] shadow-xl'
                    : 'bg-black/10 border-white/5 hover:border-[#c5a880]/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Ribbon color dot */}
                  {wrap.id !== 'none' ? (
                    <div
                      className={`w-3 h-3 rounded-full border border-white/20`}
                      style={{ backgroundColor: wrap.color }}
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-dashed border-[#c5a880]/40" />
                  )}
                  <span className={`font-sans text-xs font-medium transition-colors ${
                    isSelected ? 'text-[#c5a880]' : 'text-[#b8b1a5] group-hover:text-[#c5a880]'
                  }`}>
                    {wrap.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default VesselSelector;
