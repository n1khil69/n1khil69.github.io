import React, { useState } from 'react';
import { VesselType, WrappingType, FLOWER_TYPES, VESSEL_TYPES, WRAPPING_TYPES } from '../data/floralData';
import { PlacedStem } from './AtelierCanvas';

interface OrderSummaryProps {
  stems: PlacedStem[];
  vesselId: string;
  wrappingId: string;
  cardTo: string;
  cardFrom: string;
  cardMessage: string;
  onResetAtelier: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  stems,
  vesselId,
  wrappingId,
  cardTo,
  cardFrom,
  cardMessage,
  onResetAtelier,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'summary' | 'payment' | 'processing' | 'success'>('summary');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const selectedVessel = VESSEL_TYPES.find(v => v.id === vesselId) || VESSEL_TYPES[0];
  const selectedWrapping = WRAPPING_TYPES.find(w => w.id === wrappingId) || WRAPPING_TYPES[0];

  // Group stems by flowerId to display counts and compute prices
  const stemGroups = stems.reduce((acc, stem) => {
    acc[stem.flowerId] = (acc[stem.flowerId] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Calculate pricing
  const vesselPrice = selectedVessel.price;
  const ribbonPrice = selectedWrapping.price;
  const noteCardPrice = cardMessage.trim().length > 0 ? 5.0 : 0.0;
  
  const stemsPrice = stems.reduce((sum, stem) => {
    const flower = FLOWER_TYPES.find(f => f.id === stem.flowerId);
    return sum + (flower ? flower.price : 0);
  }, 0);

  const subtotal = vesselPrice + ribbonPrice + noteCardPrice + stemsPrice;
  const deliveryFee = subtotal > 0 ? 12.0 : 0;
  const total = subtotal + deliveryFee;

  const handleStartCheckout = () => {
    if (stems.length === 0) {
      alert('Please add some flowers to your arrangement first!');
      return;
    }
    setCheckoutStep('payment');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv || !cardHolder) {
      alert('Please fill out all payment details.');
      return;
    }
    setCheckoutStep('processing');
    
    // Simulate luxury transaction
    setTimeout(() => {
      setCheckoutStep('success');
    }, 2500);
  };

  const handleCloseSuccess = () => {
    onResetAtelier();
    setCheckoutStep('summary');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardHolder('');
  };

  return (
    <div className="w-full">
      {checkoutStep === 'summary' && (
        <div className="glass rounded-2xl p-6 border border-[#c5a880]/30 shadow-2xl flex flex-col gap-6 animate-fade-in">
          <div>
            <h3 className="font-serif text-2xl text-[#faf7f2] font-semibold tracking-wide">
              Atelier Invoice
            </h3>
            <p className="text-xs text-[#eadecd]/60 font-sans mt-0.5">
              Live breakdown of your custom bespoke bouquet
            </p>
          </div>

          {/* Line Items */}
          <div className="flex flex-col gap-3 font-sans text-sm">
            {/* Vessel Choice */}
            <div className="flex justify-between items-center border-b border-[#c5a880]/10 pb-2.5">
              <span className="text-[#eadecd]/80">{selectedVessel.name}</span>
              <span className="text-[#c5a880] font-semibold">${vesselPrice.toFixed(2)}</span>
            </div>

            {/* Ribbon Choice */}
            {ribbonPrice > 0 && (
              <div className="flex justify-between items-center border-b border-[#c5a880]/10 pb-2.5">
                <span className="text-[#eadecd]/80">{selectedWrapping.name}</span>
                <span className="text-[#c5a880] font-semibold">${ribbonPrice.toFixed(2)}</span>
              </div>
            )}

            {/* Calligraphy Card */}
            {noteCardPrice > 0 && (
              <div className="flex justify-between items-center border-b border-[#c5a880]/10 pb-2.5">
                <span className="text-[#eadecd]/80">Premium Handwritten Calligraphy Card</span>
                <span className="text-[#c5a880] font-semibold">${noteCardPrice.toFixed(2)}</span>
              </div>
            )}

            {/* Flowers breakdown */}
            {stems.length > 0 ? (
              <div className="flex flex-col gap-2 border-b border-[#c5a880]/10 pb-2.5">
                <span className="text-xs uppercase tracking-widest text-[#eadecd]/40">Bespoke Botanicals</span>
                {Object.entries(stemGroups).map(([flowerId, count]) => {
                  const flower = FLOWER_TYPES.find(f => f.id === flowerId);
                  if (!flower) return null;
                  return (
                    <div key={flowerId} className="flex justify-between items-center text-xs pl-2">
                      <span className="text-[#eadecd]/70">
                        {flower.name} <span className="text-[#c5a880]/60">x{count}</span>
                      </span>
                      <span className="text-[#eadecd]">${(flower.price * count).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-b border-[#c5a880]/10 pb-2.5 py-4 text-center">
                <span className="text-xs italic text-[#eadecd]/40">No stems added to the canvas yet</span>
              </div>
            )}
          </div>

          {/* Pricing Totals */}
          <div className="flex flex-col gap-2 font-sans pt-1">
            <div className="flex justify-between text-xs text-[#eadecd]/60">
              <span>Bespoke Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#eadecd]/60">
              <span>Luxury Courier Packing & Delivery</span>
              <span>{deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : '$0.00'}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-[#c5a880]/25 pt-3.5 text-[#faf7f2]">
              <span className="font-serif">Grand Total</span>
              <span className="text-[#c5a880]">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleStartCheckout}
            disabled={stems.length === 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#d4af37] text-[#0b1a13] font-sans font-semibold text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 shadow-lg shadow-[#d4af37]/10"
          >
            Finalize Arrangement
          </button>
        </div>
      )}

      {/* Payment Stage */}
      {checkoutStep === 'payment' && (
        <div className="glass rounded-2xl p-6 border border-[#c5a880]/30 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-serif text-xl text-[#faf7f2] font-semibold tracking-wide">
                Secure Checkout
              </h3>
              <p className="text-xs text-[#eadecd]/60 font-sans mt-0.5">
                Bespoke Floral Order · ${total.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => setCheckoutStep('summary')}
              className="text-xs font-sans uppercase tracking-widest text-[#eadecd]/40 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Mock Card form */}
          <form onSubmit={handlePay} className="flex flex-col gap-4 font-sans text-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#eadecd]/60">Cardholder Name</label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="bg-black/20 border border-[#c5a880]/20 rounded-xl px-3 py-2 text-[#faf7f2] focus:outline-none focus:border-[#c5a880]/60 placeholder:text-[#eadecd]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#eadecd]/60">Card Number</label>
              <input
                type="text"
                required
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                placeholder="4000 1234 5678 9010"
                className="bg-black/20 border border-[#c5a880]/20 rounded-xl px-3 py-2 text-[#faf7f2] focus:outline-none focus:border-[#c5a880]/60 placeholder:text-[#eadecd]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#eadecd]/60">Expiry (MM/YY)</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value.replace(/[^0-9/]/g, ''))}
                  placeholder="08/29"
                  className="bg-black/20 border border-[#c5a880]/20 rounded-xl px-3 py-2 text-[#faf7f2] focus:outline-none focus:border-[#c5a880]/60 placeholder:text-[#eadecd]/20"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#eadecd]/60">Security CVV</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="***"
                  className="bg-black/20 border border-[#c5a880]/20 rounded-xl px-3 py-2 text-[#faf7f2] focus:outline-none focus:border-[#c5a880]/60 placeholder:text-[#eadecd]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#d4af37] text-[#0b1a13] font-semibold uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all"
            >
              Authorize Secure Payment
            </button>
          </form>
        </div>
      )}

      {/* Processing Transaction */}
      {checkoutStep === 'processing' && (
        <div className="glass rounded-2xl p-8 border border-[#c5a880]/30 shadow-2xl flex flex-col items-center justify-center min-h-[300px] text-center animate-fade-in">
          {/* Glowing Golden Spinning Loader */}
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[#c5a880]/15" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#d4af37] animate-spin" />
            <div className="absolute inset-2 rounded-full bg-[#162d22] flex items-center justify-center text-xl">
              🌸
            </div>
          </div>
          <h4 className="font-serif text-lg text-[#faf7f2] mb-1 font-semibold tracking-wide">
            Encrypting Transaction...
          </h4>
          <p className="text-xs text-[#eadecd]/60 font-sans max-w-xs leading-relaxed">
            Please stand by while L'Atelier secures your premium bespoke floral arrangement.
          </p>
        </div>
      )}

      {/* Success Stage */}
      {checkoutStep === 'success' && (
        <div className="glass rounded-2xl p-8 border border-[#c5a880]/40 shadow-2xl flex flex-col items-center text-center max-w-md mx-auto animate-fade-in relative overflow-hidden">
          {/* Festive particles background simulation */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {Array.from({ length: 15 }).map((_, i) => (
              <span
                key={i}
                style={{
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 90}%`,
                  fontSize: `${10 + Math.random() * 15}px`,
                }}
                className="absolute animate-float"
              >
                🌸
              </span>
            ))}
          </div>

          <div className="w-16 h-16 rounded-full bg-[#c5a880] text-[#0b1a13] text-3xl flex items-center justify-center shadow-lg shadow-[#c5a880]/20 mb-6 relative z-10 animate-bounce">
            ✓
          </div>

          <h3 className="font-serif text-2xl text-[#faf7f2] font-semibold tracking-wide mb-2">
            Arrangement Sealed
          </h3>
          <p className="text-sm text-[#eadecd]/80 font-sans leading-relaxed mb-6">
            Your premium floral creation has been registered at **L'Atelier**. Our Master Florists are hand-selecting your stems at the nursery right now.
          </p>

          {/* Delivery Note */}
          <div className="w-full bg-[#162d22]/30 border border-[#c5a880]/15 rounded-xl p-4 text-left font-sans text-xs flex flex-col gap-2 mb-6">
            <div className="flex justify-between">
              <span className="text-[#eadecd]/50">Order Reference:</span>
              <span className="text-[#faf7f2] font-bold">#LA-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#eadecd]/50">Vessel Style:</span>
              <span className="text-[#faf7f2] font-semibold">{selectedVessel.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#eadecd]/50">Delivery Method:</span>
              <span className="text-[#c5a880] font-semibold">White-Glove Refrigerated Courier</span>
            </div>
            {cardMessage.trim() && (
              <div className="mt-1 pt-1 border-t border-[#c5a880]/10">
                <span className="text-[#eadecd]/50 block mb-0.5">Note Card:</span>
                <p className="italic text-[#faf7f2]">
                  "{cardMessage.substring(0, 40)}..." (To: {cardTo})
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleCloseSuccess}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#d4af37] text-[#0b1a13] font-semibold uppercase tracking-widest hover:brightness-110 transition-all z-10 shadow-lg"
          >
            Design Another Bouquet
          </button>
        </div>
      )}
    </div>
  );
};
export default OrderSummary;
