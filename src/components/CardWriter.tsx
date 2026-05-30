import React, { useState } from 'react';

interface CardWriterProps {
  cardTo: string;
  cardFrom: string;
  cardMessage: string;
  cardTheme: 'ivory' | 'petal' | 'gold';
  onUpdateCard: (field: string, value: string) => void;
}

export const CardWriter: React.FC<CardWriterProps> = ({
  cardTo,
  cardFrom,
  cardMessage,
  cardTheme,
  onUpdateCard,
}) => {
  const getTextureClass = () => {
    switch (cardTheme) {
      case 'petal':
        return 'card-texture-petal text-[#5b1d28]';
      case 'gold':
        return 'card-texture-gold text-[#faf7f2]';
      case 'ivory':
      default:
        return 'card-texture-ivory text-[#0b1a13]';
    }
  };

  const getBorderColor = () => {
    switch (cardTheme) {
      case 'gold':
        return 'border-[#c5a880]';
      case 'petal':
        return 'border-[#e8c5c8]';
      case 'ivory':
      default:
        return 'border-[#0b1a13]/10';
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-stretch">
      {/* Inputs (Left Panel) */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h3 className="font-serif text-xl text-[#faf7f2] font-semibold tracking-wide">
            Note Card Calligraphy
          </h3>
          <p className="text-xs text-[#eadecd]/60 font-sans mt-0.5">
            Pen a handwritten card to accompany your floral creation
          </p>
        </div>

        {/* Card Style Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-sans tracking-widest text-[#eadecd]/60">Card Texture</span>
          <div className="flex gap-2.5">
            {[
              { id: 'ivory', name: 'Pressed Ivory', desc: 'Classic textured' },
              { id: 'petal', name: 'Blush Petal', desc: 'Soft romantic' },
              { id: 'gold', name: 'Golden Night', desc: 'Deep velvet' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => onUpdateCard('cardTheme', theme.id)}
                className={`flex-1 text-left p-2.5 rounded-xl border transition-all duration-300 ${
                  cardTheme === theme.id
                    ? 'bg-[#162d22]/40 border-[#c5a880]'
                    : 'bg-black/20 border-[#c5a880]/15 hover:border-[#c5a880]/40'
                }`}
              >
                <div className="font-serif text-xs font-semibold text-[#faf7f2]">{theme.name}</div>
                <div className="text-[9px] text-[#eadecd]/50 font-sans mt-0.5">{theme.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* To & From */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-sans tracking-widest text-[#eadecd]/60" htmlFor="card-to">
              Recipient Name (To)
            </label>
            <input
              id="card-to"
              type="text"
              value={cardTo}
              maxLength={25}
              onChange={(e) => onUpdateCard('cardTo', e.target.value)}
              placeholder="e.g. Eleanor"
              className="bg-[#09090b]/45 border border-white/5 focus:border-[#c5a880] rounded-xl px-4 py-2.5 text-sm font-sans text-[#faf7f2] focus:outline-none transition-all placeholder:text-[#a19d95]/40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-sans tracking-widest text-[#eadecd]/60" htmlFor="card-from">
              Your Name (From)
            </label>
            <input
              id="card-from"
              type="text"
              value={cardFrom}
              maxLength={25}
              onChange={(e) => onUpdateCard('cardFrom', e.target.value)}
              placeholder="e.g. Julian"
              className="bg-[#09090b]/45 border border-white/5 focus:border-[#c5a880] rounded-xl px-4 py-2.5 text-sm font-sans text-[#faf7f2] focus:outline-none transition-all placeholder:text-[#a19d95]/40"
            />
          </div>
        </div>

        {/* Message Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-sans tracking-widest text-[#eadecd]/60" htmlFor="card-message">
            Calligraphy Message
          </label>
          <textarea
            id="card-message"
            rows={4}
            value={cardMessage}
            maxLength={180}
            onChange={(e) => onUpdateCard('cardMessage', e.target.value)}
            placeholder="Type your luxurious message here..."
            className="bg-[#09090b]/45 border border-white/5 focus:border-[#c5a880] rounded-xl px-4 py-3 text-sm font-sans text-[#faf7f2] focus:outline-none transition-all resize-none placeholder:text-[#a19d95]/40 leading-relaxed"
          />
          <div className="text-right text-[9px] text-[#eadecd]/40 font-sans">
            {cardMessage.length}/180 characters
          </div>
        </div>
      </div>

      {/* Calligraphy Card Live Preview (Right Panel) */}
      <div className="flex-1 flex items-center justify-center p-4 bg-black/15 rounded-2xl border border-[#c5a880]/10 min-h-[260px]">
        {/* The Luxury Card */}
        <div
          className={`w-full max-w-[340px] aspect-[1.58] rounded-xl p-5 shadow-2xl border flex flex-col justify-between select-none relative overflow-hidden transition-all duration-500 hover:rotate-1 hover:scale-[1.02] ${getTextureClass()} ${getBorderColor()}`}
        >
          {/* Decorative Gold Border Line if gold style */}
          {cardTheme === 'gold' && (
            <div className="absolute inset-1.5 border border-[#c5a880]/40 rounded-lg pointer-events-none" />
          )}

          {/* Header */}
          <div className="flex justify-between items-start">
            <span className="font-serif text-[10px] uppercase tracking-widest opacity-60">
              L'Atelier de Fleurs
            </span>
            <span className="text-xs opacity-75">✒️</span>
          </div>

          {/* Main Message Box (Cursive / Hand-written) */}
          <div className="my-auto text-center px-2 py-1">
            <p className="font-cursive text-xl md:text-2xl leading-relaxed tracking-wide break-words">
              {cardMessage || "Your hand-crafted calligraphy note will be written here..."}
            </p>
          </div>

          {/* Bottom To & From Details */}
          <div className="flex justify-between items-end border-t border-dashed border-current/25 pt-2.5">
            <div className="flex flex-col text-left">
              <span className="text-[8px] uppercase tracking-widest font-sans opacity-50">To</span>
              <span className="font-serif text-xs font-semibold tracking-wide">
                {cardTo || "________"}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[8px] uppercase tracking-widest font-sans opacity-50">From</span>
              <span className="font-serif text-xs font-semibold tracking-wide">
                {cardFrom || "________"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CardWriter;
