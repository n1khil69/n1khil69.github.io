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
          <h3 className="font-serif text-xl text-[#faf7f2] font-semibold tracking-wide">
            Select Vessel
          </h3>
          <p className="text-xs text-[#eadecd]/60 font-sans mt-0.5">
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
                className={`group rounded-2xl p-4 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#162d22]/40 border-[#c5a880] shadow-lg shadow-[#c5a880]/5'
                    : 'bg-black/20 border-[#c5a880]/15 hover:border-[#c5a880]/40'
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
                  <p className="text-[11px] text-[#eadecd]/60 font-sans leading-relaxed">
                    {vessel.description}
                  </p>
                </div>

                {/* Selected highlight line */}
                {isSelected && (
                  <div className="w-full h-0.5 bg-[#c5a880] mt-3 rounded-full animate-fade-in" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Ribbon Wrapping Selector */}
      <div className="flex flex-col gap-4 border-t border-[#c5a880]/15 pt-5">
        <div>
          <h3 className="font-serif text-xl text-[#faf7f2] font-semibold tracking-wide">
            Wrapping Ribbon
          </h3>
          <p className="text-xs text-[#eadecd]/60 font-sans mt-0.5">
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
                className={`group rounded-xl p-3 border cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#162d22]/40 border-[#c5a880] shadow-md shadow-[#c5a880]/5'
                    : 'bg-black/20 border-[#c5a880]/15 hover:border-[#c5a880]/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Ribbon color dot */}
                  {wrap.id !== 'none' ? (
                    <div
                      className={`w-3.5 h-3.5 rounded-full border border-white/20`}
                      style={{ backgroundColor: wrap.color }}
                    />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-dashed border-[#c5a880]/50" />
                  )}
                  <span className={`font-sans text-xs font-medium transition-colors ${
                    isSelected ? 'text-[#c5a880]' : 'text-[#eadecd] group-hover:text-[#c5a880]'
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
