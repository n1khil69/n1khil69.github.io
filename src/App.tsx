import { useState } from 'react';
import { AtelierCanvas, PlacedStem } from './components/AtelierCanvas';
import { FlowerPalette } from './components/FlowerPalette';
import { VesselSelector } from './components/VesselSelector';
import { CardWriter } from './components/CardWriter';
import { SharePlayground } from './components/SharePlayground';
import { PresetCollections } from './components/PresetCollections';
import { FlowerGlossary } from './components/FlowerGlossary';
import { PresetBouquet } from './data/floralData';

type MainTab = 'atelier' | 'presets' | 'journal';
type AtelierSubTab = 'stems' | 'vessels' | 'card' | 'share';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('atelier');
  const [activeSubTab, setActiveSubTab] = useState<AtelierSubTab>('stems');

  // Active Flower Brush Tool State
  const [activeFlowerId, setActiveFlowerId] = useState<string>('majestic-rose');

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

  // Add a new stem at the default center position (fallback/palette add)
  const handleAddStem = (flowerId: string) => {
    const jitterX = (Math.random() - 0.5) * 12; // -6% to 6%
    const jitterY = (Math.random() - 0.5) * 8;   // -4% to 4%
    const randomRot = (Math.random() - 0.5) * 20; // -10deg to 10deg

    const newStem: PlacedStem = {
      id: `${flowerId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      flowerId,
      x: 50 + jitterX,
      y: 69 + jitterY, // Anchored near vase neck
      scale: 1.0,
      rotation: randomRot,
      zIndex: stems.length,
    };

    setStems((prev) => [...prev, newStem]);
    setSelectedStemId(newStem.id); // Auto-select newly added stem
  };

  // Add stem precisely at the clicked/tapped coordinates on the canvas
  const handleAddStemAtPosition = (flowerId: string, x: number, y: number) => {
    const randomRot = (Math.random() - 0.5) * 20; // -10deg to 10deg
    const newStem: PlacedStem = {
      id: `${flowerId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      flowerId,
      x,
      y,
      scale: 1.0,
      rotation: randomRot,
      zIndex: stems.length,
    };

    setStems((prev) => [...prev, newStem]);
    setSelectedStemId(newStem.id); // Focus/select the placed flower
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
    setActiveSubTab('share'); // Take them directly to share to see details
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
    <div className="min-h-screen bg-[#040405] text-[#faf7f2] relative overflow-hidden flex flex-col justify-between">
      {/* 1. STICKY BRAND HEADER */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding Logo */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left select-none">
          <h1 className="font-serif text-2xl md:text-3xl text-gradient bg-gradient-to-r from-white via-[#faf7f2] to-[#c5a880] bg-clip-text text-transparent font-light tracking-[0.2em] uppercase">
            L'Atelier de Fleurs
          </h1>
          <span className="text-[8px] uppercase font-sans tracking-[0.3em] text-[#c5a880] mt-1.5 font-light">
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
              className={`px-4 py-2.5 rounded-xl text-[10px] font-sans tracking-widest uppercase transition-all duration-400 flex items-center gap-2 cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-black/60 border-[#c5a880] text-white font-semibold shadow-xl shadow-black/60 shadow-[0_0_20px_rgba(197,168,128,0.08)]'
                  : 'bg-transparent border-transparent text-[#b8b1a5]/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline-block">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* 2. DYNAMIC WORKSPACE LAYOUT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 relative z-10 flex flex-col gap-8">
        
        {/* Main Tab 1: Custom Arrangement Studio */}
        {activeTab === 'atelier' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: Drag-and-drop Canvas (takes 7 columns) */}
            <div className="lg:col-span-7 flex flex-col gap-4 w-full">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h2 className="font-serif text-2xl text-white font-medium tracking-wide">
                    Arrangement Canvas
                  </h2>
                  <p className="text-xs text-[#b8b1a5]/50 font-sans mt-0.5">
                    Click anywhere on the canvas to place flowers, drag to arrange them
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-sans text-[#c5a880] uppercase tracking-wider font-medium">
                    Stems: {stems.length}
                  </span>
                </div>
              </div>

              <AtelierCanvas
                stems={stems}
                selectedStemId={selectedStemId}
                vesselId={vesselId}
                wrappingId={wrappingId}
                activeFlowerId={activeFlowerId}
                onSelectStem={setSelectedStemId}
                onMoveStem={handleMoveStem}
                onUpdateStem={handleUpdateStem}
                onRemoveStem={handleRemoveStem}
                onAddStemAtPosition={handleAddStemAtPosition}
                onClear={handleClearCanvas}
              />
            </div>

            {/* Right Side: Atelier Controls (takes 5 columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              {/* Controls Tab Bar */}
              <div className="flex border-b border-white/5 pb-2.5 overflow-x-auto gap-4">
                {[
                  { id: 'stems', label: '1. Stems' },
                  { id: 'vessels', label: '2. Vessel' },
                  { id: 'card', label: '3. Note' },
                  { id: 'share', label: '4. Save & Share' },
                ].map((subTab) => (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveSubTab(subTab.id as AtelierSubTab)}
                    className={`px-1 py-1 text-[10px] font-sans uppercase tracking-widest font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                      activeSubTab === subTab.id
                        ? 'text-[#faf7f2] border-b-2 border-[#c5a880] pb-2.5 -mb-[12px]'
                        : 'text-[#b8b1a5]/40 hover:text-white pb-2.5'
                    }`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* Controls Panels */}
              <div className="w-full mt-2">
                {activeSubTab === 'stems' && (
                  <FlowerPalette
                    activeFlowerId={activeFlowerId}
                    onSelectActiveFlower={setActiveFlowerId}
                    onAddStem={handleAddStem}
                    stemsCount={stemCounts}
                  />
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
                {activeSubTab === 'share' && (
                  <SharePlayground
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

        {/* Main Tab 2: Curated Presets */}
        {activeTab === 'presets' && (
          <PresetCollections onLoadPreset={handleLoadPreset} />
        )}

        {/* Main Tab 3: Flora Glossary */}
        {activeTab === 'journal' && (
          <FlowerGlossary />
        )}

      </main>

      {/* 3. PREMIUM FOOTER */}
      <footer className="w-full border-t border-white/5 py-8 mt-12 bg-black/40 text-center font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left text-xs text-[#b8b1a5]/40">
            <p className="font-semibold text-white/60 uppercase tracking-widest font-serif mb-1">L'Atelier de Fleurs</p>
            <p>© {new Date().getFullYear()} L'Atelier de Fleurs. Minimal Dark Luxury Design.</p>
          </div>
          <div className="text-right text-[9px] uppercase tracking-[0.2em] text-[#c5a880]">
            <span>🌹 custom digital flower arrangement playground and art atelier 🌹</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
