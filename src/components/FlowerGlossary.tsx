import React, { useState } from 'react';
import { FLOWER_TYPES, FlowerType } from '../data/floralData';
import { FlowerSVG } from './FlowerSVG';

export const FlowerGlossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'bloom' | 'accent' | 'green'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredGlossary = FLOWER_TYPES.filter((flower) => {
    const matchesSearch =
      flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flower.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flower.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || flower.type === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full flex flex-col gap-8 py-4">
      {/* Glossary Masthead */}
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
        <span className="text-xs uppercase font-sans tracking-widest text-[#c5a880]">
          The Botanist's Ledger
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#faf7f2] font-semibold leading-tight">
          Flora Compendium
        </h2>
        <p className="text-sm text-[#eadecd]/60 font-sans leading-relaxed">
          Unlock the lore, deep cultural meanings, and careful preservation instructions for each exquisite species in our collection.
        </p>
      </div>

      {/* Search & Filtering Panel */}
      <div className="glass rounded-2xl p-4 border border-[#c5a880]/15 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="w-full md:flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search flora name, lineage, or meaning..."
            className="w-full bg-black/25 border border-[#c5a880]/20 rounded-xl px-4 py-3 pl-10 text-sm font-sans text-[#faf7f2] focus:outline-none focus:border-[#c5a880]/60 placeholder:text-[#eadecd]/30"
          />
          <span className="absolute left-3.5 top-3.5 text-[#eadecd]/30 text-xs">🔍</span>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {([
            { id: 'all', name: 'All Flora' },
            { id: 'bloom', name: 'Luxury Blooms' },
            { id: 'accent', name: 'Accents' },
            { id: 'green', name: 'Greens & Foliage' },
          ] as const).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedType(filter.id)}
              className={`px-3 py-2 rounded-xl text-xs font-sans font-medium uppercase tracking-wider transition-all duration-300 border ${
                selectedType === filter.id
                  ? 'bg-[#c5a880] border-[#c5a880] text-[#0b1a13] font-semibold'
                  : 'bg-black/15 text-[#eadecd]/60 border-[#c5a880]/10 hover:border-[#c5a880]/40'
              }`}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredGlossary.map((flower) => {
          const isExpanded = expandedId === flower.id;
          return (
            <div
              key={flower.id}
              onClick={() => toggleExpand(flower.id)}
              className={`glass rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer hover:bg-white/[0.02] ${
                isExpanded
                  ? 'border-[#c5a880] shadow-xl shadow-[#c5a880]/5'
                  : 'border-[#c5a880]/15 hover:border-[#c5a880]/40'
              }`}
            >
              {/* Card Summary Line */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Small vector thumbnail */}
                  <div className="w-12 h-16 shrink-0 bg-[#09090b]/60 rounded-lg p-1 border border-[#c5a880]/10 flex items-center justify-center">
                    <div className="w-8 h-12">
                      <FlowerSVG id={flower.id} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h3 className="font-serif text-lg text-[#faf7f2] font-semibold tracking-wide">
                        {flower.name}
                      </h3>
                      <span className="font-sans text-xs italic text-[#c5a880] font-light">
                        {flower.scientificName}
                      </span>
                    </div>
                    <p className="text-xs text-[#eadecd]/70 font-sans mt-1 leading-relaxed truncate">
                      <span className="text-[#c5a880]/80 font-medium">Sovereignty:</span> {flower.meaning}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-sans text-[#eadecd]/40 hidden sm:inline-block">
                    {isExpanded ? 'Collapse Journal' : 'Expand Journal'}
                  </span>
                  <span className={`text-[#c5a880] text-sm transition-transform duration-300 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Card Expanded Detail Section */}
              {isExpanded && (
                <div
                  className="px-5 pb-6 border-t border-[#c5a880]/15 pt-5 bg-black/25 flex flex-col md:flex-row gap-6 items-stretch animate-fade-in"
                  onClick={(e) => e.stopPropagation()} // prevent collapsing when inner content clicked
                >
                  {/* Detailed Vector Graphic (Left) */}
                  <div className="flex-1 md:max-w-[200px] flex items-center justify-center p-4 rounded-xl bg-[#09090b]/50 border border-[#c5a880]/10 h-72">
                    <div className="w-28 h-56 glow-flower">
                      <FlowerSVG id={flower.id} />
                    </div>
                  </div>

                  {/* Scientific Profile Content (Right) */}
                  <div className="flex-[2] flex flex-col justify-between gap-5 font-sans">
                    <div className="flex flex-col gap-4">
                      {/* Historic Lore */}
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-semibold block mb-1">
                          Historic Lore & Cultural Mythos
                        </span>
                        <p className="text-xs text-[#eadecd]/80 leading-relaxed font-light">
                          {flower.lore}
                        </p>
                      </div>

                      {/* Botanist Details */}
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-semibold block mb-1">
                          Botanist Profile
                        </span>
                        <p className="text-xs text-[#eadecd]/80 leading-relaxed font-light">
                          {flower.botanistNotes}
                        </p>
                      </div>

                      {/* Scent Profiles */}
                      <div className="flex flex-wrap gap-4 pt-1">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-[#eadecd]/50 font-semibold block mb-0.5">
                            Aromatherapy Profile
                          </span>
                          <span className="text-xs text-[#faf7f2] font-medium flex items-center gap-1">
                            🍯 {flower.aromaNotes}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-[#eadecd]/50 font-semibold block mb-0.5">
                            Sourcing Profile
                          </span>
                          <span className="text-xs text-[#faf7f2] font-medium flex items-center gap-1">
                            🌎 Greenhouse Grown / Custom Botanical
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Master Care Guide */}
                    <div className="bg-[#c5a880]/5 border border-[#c5a880]/15 rounded-xl p-3.5 mt-2 flex items-start gap-2.5">
                      <span className="text-base">🛡️</span>
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-bold block mb-0.5">
                          Preservation & Care Tips
                        </span>
                        <p className="text-xs text-[#faf7f2]/90 leading-relaxed font-light">
                          {flower.careTip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredGlossary.length === 0 && (
          <div className="text-center py-10">
            <span className="text-2xl block mb-2">🌿</span>
            <p className="text-sm text-[#eadecd]/50 font-sans">
              No flora found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default FlowerGlossary;
