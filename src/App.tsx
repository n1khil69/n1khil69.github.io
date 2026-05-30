import { useState } from 'react';
import { AtelierCanvas, PlacedStem } from './components/AtelierCanvas';
import { FlowerPalette } from './components/FlowerPalette';
import { VesselSelector } from './components/VesselSelector';
import { CardWriter } from './components/CardWriter';
import { OrderSummary } from './components/OrderSummary';
import { PresetCollections } from './components/PresetCollections';
import { FlowerGlossary } from './components/FlowerGlossary';
import { PresetBouquet } from './data/floralData';

type MainTab = 'atelier' | 'presets' | 'journal';
type AtelierSubTab = 'stems' | 'vessels' | 'card' | 'invoice';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('atelier');
  const [activeSubTab, setActiveSubTab] = useState<AtelierSubTab>('stems');

  // Atelier Canvas State
  const [stems, setStems] = useState<PlacedStem[]>([]);
  const [selectedStemId, setSelectedStemId] = useState<string | null>(null);
  const [vesselId, setVesselId] = useState<string>('ceramic-minimalist');
  const [wrappingId, setWrappingId] = useState<string>('none');

  // Note Card Calligraphy State
  const [cardTo, setCardTo] = useState('');
  const [cardFrom, setCardFrom] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [cardTheme, setCardTheme] = useState<'ivory' | 'petal' | 'gold'>('ivory');

  // Add a new stem to the arrangement with natural coordinates and dynamic scaling
  const handleAddStem = (flowerId: string) => {
    // Generate slight random placement and rotation to make arrangement look organic
    const jitterX = (Math.random() - 0.5) * 12; // -6% to 6%
    const jitterY = (Math.random() - 0.5) * 8;   // -4% to 4%
    const randomRot = (Math.random() - 0.5) * 20; // -10deg to 10deg

    const newStem: PlacedStem = {
      id: `${flowerId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      flowerId,
      x: 50 + jitterX,
      y: 40 + jitterY,
      scale: 1.0,
      rotation: randomRot,
      zIndex: stems.length,
    };

    setStems((prev) => [...prev, newStem]);
    setSelectedStemId(newStem.id); // Auto-select newly added stem
  };

  const handleMoveStem = (id: string, x: number, y: number) => {
    setStems((prev) =>
      prev.map((stem) => (stem.id === id ? { ...stem, x, y } : stem))
    );
  };

  const handleUpdateStem = (id: string, updates: Partial<PlacedStem>) => {
    setStems((prev) =>
      prev.map((stem) => (stem.id === id ? { ...stem, ...updates } : stem))
    );
  };

  const handleRemoveStem = (id: string) => {
    setStems((prev) => prev.filter((stem) => stem.id !== id));
    setSelectedStemId(null);
  };

  const handleClearCanvas = () => {
    setStems([]);
    setSelectedStemId(null);
  };

  const handleUpdateCard = (field: string, value: string) => {
    if (field === 'cardTo') setCardTo(value);
    if (field === 'cardFrom') setCardFrom(value);
    if (field === 'cardMessage') setCardMessage(value);
    if (field === 'cardTheme') setCardTheme(value as 'ivory' | 'petal' | 'gold');
  };

  // Load a curated preset collection into the atelier workspace
  const handleLoadPreset = (preset: PresetBouquet) => {
    const formattedStems: PlacedStem[] = preset.stems.map((stem, index) => ({
      id: `${stem.flowerId}-preset-${index}-${Date.now()}`,
      flowerId: stem.flowerId,
      x: stem.x,
      y: stem.y,
      scale: stem.scale,
      rotation: stem.rotation,
      zIndex: stem.zIndex,
    }));

    setStems(formattedStems);
    setVesselId(preset.vesselId);
    setWrappingId(preset.wrappingId);
    setSelectedStemId(null);
    setActiveTab('atelier');
    setActiveSubTab('invoice'); // Take them directly to invoice to see details
  };

  // Reset the entire atelier to start blank
  const handleResetAll = () => {
    setStems([]);
    setSelectedStemId(null);
    setVesselId('ceramic-minimalist');
    setWrappingId('none');
    setCardTo('');
    setCardFrom('');
    setCardMessage('');
    setCardTheme('ivory');
  };

  // Pre-calculate count of stems used
  const stemCounts = stems.reduce((acc, stem) => {
    acc[stem.flowerId] = (acc[stem.flowerId] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="min-h-screen bg-[#070f0b] text-[#faf7f2] relative overflow-hidden flex flex-col justify-between">
      {/* 1. STICKY BRAND HEADER */}
      <header className="sticky top-0 z-50 glass border-b border-[#c5a880]/15 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding Logo */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left select-none">
          <h1 className="font-serif text-2xl md:text-3xl text-gradient bg-gradient-to-r from-[#faf7f2] via-[#eadecd] to-[#c5a880] bg-clip-text text-transparent font-medium tracking-widest uppercase">
            L'Atelier de Fleurs
          </h1>
          <span className="text-[10px] uppercase font-sans tracking-widest text-[#c5a880]/85 mt-0.5">
            Artisan Custom Bouquet Design Studio
          </span>
        </div>

        {/* Global Main Navigation */}
        <nav className="flex gap-2">
          {[
            { id: 'atelier', label: 'Design Atelier', icon: '🎨' },
            { id: 'presets', label: 'Curated Presets', icon: '🌸' },
            { id: 'journal', label: "Botanist's Journal", icon: '📖' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MainTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-sans font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#c5a880] to-[#8c7352] text-[#0b1a13] shadow-md shadow-[#c5a880]/10 font-bold'
                  : 'text-[#eadecd]/60 hover:text-white hover:bg-[#162d22]/30'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline-block">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* 2. DYNAMIC WORKSPACE LAYOUT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 relative z-10 flex flex-col gap-6">
        
        {/* Main Tab 1: Custom Arrangement Studio */}
        {activeTab === 'atelier' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Drag-and-drop Canvas (takes 7 columns) */}
            <div className="lg:col-span-7 flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h2 className="font-serif text-2xl text-[#faf7f2] font-semibold tracking-wide">
                    Arrangement Canvas
                  </h2>
                  <p className="text-xs text-[#eadecd]/60 font-sans mt-0.5">
                    Drag elements around the vase neck to sculpt your masterpiece
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-sans text-[#c5a880]/90 uppercase font-semibold">
                    Stems added: {stems.length}
                  </span>
                </div>
              </div>

              <AtelierCanvas
                stems={stems}
                selectedStemId={selectedStemId}
                vesselId={vesselId}
                wrappingId={wrappingId}
                onSelectStem={setSelectedStemId}
                onMoveStem={handleMoveStem}
                onUpdateStem={handleUpdateStem}
                onRemoveStem={handleRemoveStem}
                onClear={handleClearCanvas}
              />
            </div>

            {/* Right Side: Atelier Controls (takes 5 columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              {/* Controls Tab Bar */}
              <div className="flex border-b border-[#c5a880]/15 pb-2.5 overflow-x-auto gap-1">
                {[
                  { id: 'stems', label: '1. Stems' },
                  { id: 'vessels', label: '2. Vessel' },
                  { id: 'card', label: '3. Note' },
                  { id: 'invoice', label: '4. Order' },
                ].map((subTab) => (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveSubTab(subTab.id as AtelierSubTab)}
                    className={`px-3 py-2 rounded-lg text-xs font-sans uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
                      activeSubTab === subTab.id
                        ? 'text-[#c5a880] border border-[#c5a880]/40 bg-[#162d22]/35'
                        : 'text-[#eadecd]/50 hover:text-white'
                    }`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* Controls Panels */}
              <div className="w-full">
                {activeSubTab === 'stems' && (
                  <FlowerPalette onAddStem={handleAddStem} stemsCount={stemCounts} />
                )}
                {activeSubTab === 'vessels' && (
                  <VesselSelector
                    selectedVesselId={vesselId}
                    selectedWrappingId={wrappingId}
                    onSelectVessel={setVesselId}
                    onSelectWrapping={setWrappingId}
                  />
                )}
                {activeSubTab === 'card' && (
                  <CardWriter
                    cardTo={cardTo}
                    cardFrom={cardFrom}
                    cardMessage={cardMessage}
                    cardTheme={cardTheme}
                    onUpdateCard={handleUpdateCard}
                  />
                )}
                {activeSubTab === 'invoice' && (
                  <OrderSummary
                    stems={stems}
                    vesselId={vesselId}
                    wrappingId={wrappingId}
                    cardTo={cardTo}
                    cardFrom={cardFrom}
                    cardMessage={cardMessage}
                    onResetAtelier={handleResetAll}
                  />
                )}
              </div>
            </div>

          </div>
        )}

        {/* Main Tab 2: Designer Collections */}
        {activeTab === 'presets' && (
          <PresetCollections onLoadPreset={handleLoadPreset} />
        )}

        {/* Main Tab 3: Flora Glossary */}
        {activeTab === 'journal' && (
          <FlowerGlossary />
        )}

      </main>

      {/* 3. PREMIUM FOOTER */}
      <footer className="w-full border-t border-[#c5a880]/15 py-8 mt-10 bg-black/40 text-center font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left text-xs text-[#eadecd]/40">
            <p className="font-semibold text-[#faf7f2]/60 uppercase tracking-widest font-serif mb-1">L'Atelier de Fleurs</p>
            <p>© {new Date().getFullYear()} L'Atelier de Fleurs. Built with absolute premium aesthetics.</p>
          </div>
          <div className="text-right text-[10px] uppercase tracking-widest text-[#c5a880]/85">
            <span>🌹 curated by master florists · shipped in refrigerated vaults 🌹</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
