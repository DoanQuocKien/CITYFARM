import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShoppingBag, Leaf, ChevronRight, Package, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { Screen } from '../App';

interface OrderScreenProps {
  onNavigate: (screen: Screen) => void;
  preSelectedPlant?: string | null;
}

// --- DATA CONFIGURATION ---

const SEEDS = [
  { id: 'TOMATO', name: 'Cherry Tomato', icon: '🍅' },
  { id: 'LETTUCE', name: 'Green Lettuce', icon: '🥬' },
  { id: 'MINT', name: 'Fresh Mint', icon: '🌿' },
  { id: 'ONION', name: 'Green Onion', icon: '🧅' },
];

const KITS = [
  {
    id: 'STAND',
    name: 'Standing Garden',
    price: '199.000₫',
    // CHANGED: Local path
    image: '/img/kit/standing.jpg', 
    components: ['5x 5L Bottles', 'Seeds', '12kg Soil', 'Wooden Stand'],
    allowedSeeds: ['TOMATO', 'ONION', 'LETTUCE', 'MINT']
  },
  {
    id: 'HANG',
    name: 'Hanging Garden',
    price: '149.000₫',
    // CHANGED: Local path
    image: '/img/kit/hanging.jpg',
    components: ['5x Bottles', 'Seeds', '2kg Soil', 'Wall Mount'],
    allowedSeeds: ['LETTUCE', 'MINT', 'ONION']
  },
  {
    id: 'TINY',
    name: 'Tiny Garden',
    price: '99.000₫',
    // CHANGED: Local path
    image: '/img/kit/tiny.jpg',
    components: ['5x 500ml Bottles', 'Seeds', '1kg Soil'],
    allowedSeeds: ['MINT', 'ONION']
  },
  {
    id: 'UPGR',
    name: 'Upgraded Tiny',
    price: '119.000₫',
    // CHANGED: Local path
    image: '/img/kit/tiny_plus.jpg',
    components: ['5x 1L Bottles', 'Seeds', '2kg Soil'],
    allowedSeeds: ['MINT', 'ONION', 'LETTUCE']
  },
  {
    id: 'START',
    name: 'Green Starter',
    price: '49.000₫',
    // CHANGED: Local path
    image: '/img/kit/start.jpg',
    components: ['1x 1L Bottle', 'Seeds', '250g Soil', '1 Month AI'],
    allowedSeeds: ['MINT', 'ONION', 'LETTUCE']
  }
];

export function OrderScreen({ onNavigate, preSelectedPlant }: OrderScreenProps) {
  const [step, setStep] = useState<'kit' | 'seed' | 'confirm' | 'success'>('kit');
  const [selectedKit, setSelectedKit] = useState<typeof KITS[0] | null>(null);
  const [selectedSeed, setSelectedSeed] = useState<typeof SEEDS[0] | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');

  // Handle Pre-selection Logic
  useEffect(() => {
    if (preSelectedPlant) {
      const seed = SEEDS.find(s => s.name.toLowerCase().includes(preSelectedPlant.toLowerCase())) || 
                   SEEDS.find(s => preSelectedPlant.toUpperCase().includes(s.id));
      
      if (seed) {
        setSelectedSeed(seed);
        setStep('kit');
      }
    }
  }, [preSelectedPlant]);

  const handleKitSelect = (kit: typeof KITS[0]) => {
    setSelectedKit(kit);
    if (preSelectedPlant || selectedSeed) {
        setStep('confirm');
    } else {
        setStep('seed');
    }
  };

  const handleOrder = () => {
    const uniqueId = Math.floor(1000 + Math.random() * 9000);
    const code = `${selectedKit?.id}-${selectedSeed?.id}-${uniqueId}`;
    setGeneratedCode(code);
    setStep('success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    alert("Code copied! Go to 'My Garden' -> 'Activate Kit' to use it.");
  };

  const displayedKits = selectedSeed 
    ? KITS.filter(k => k.allowedSeeds.includes(selectedSeed.id))
    : KITS;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex items-center gap-3">
        {step !== 'kit' && step !== 'success' && (
           <button onClick={() => setStep(step === 'confirm' ? (preSelectedPlant ? 'kit' : 'seed') : 'kit')}>
             <ArrowLeft className="w-5 h-5 text-gray-600" />
           </button>
        )}
        <h2 className="text-xl font-bold text-gray-900">
            {step === 'kit' ? 'Select a Kit' : 
             step === 'seed' ? 'Choose Seeds' : 
             step === 'confirm' ? 'Confirm Order' : 'Order Placed!'}
        </h2>
      </header>

      <div className="p-4 space-y-4">
        
        {/* STEP 1: SELECT KIT */}
        {step === 'kit' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            {preSelectedPlant && (
               <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-2 text-sm text-green-800">
                  <Leaf className="w-4 h-4" />
                  Showing kits compatible with <strong>{selectedSeed?.name}</strong>
               </div>
            )}

            {displayedKits.map(kit => (
              <Card 
                key={kit.id} 
                className="overflow-hidden hover:border-green-400 cursor-pointer transition-all active:scale-[0.98]"
                onClick={() => handleKitSelect(kit)}
              >
                <div className="flex">
                  <div className="w-32 bg-gray-100 relative">
                    {/* Error handling for missing images */}
                    <img 
                      src={kit.image} 
                      className="w-full h-full object-cover" 
                      alt={kit.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=No+Image'; // Fallback
                      }} 
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{kit.name}</h3>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{kit.price}</Badge>
                    </div>
                    <ul className="text-xs text-gray-500 space-y-1 mb-3">
                        {kit.components.slice(0, 3).map((c, i) => (
                            <li key={i}>• {c}</li>
                        ))}
                    </ul>
                    <div className="flex items-center text-xs font-medium text-green-600">
                        View Details <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* STEP 2: SELECT SEED */}
        {step === 'seed' && selectedKit && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-4">
            {SEEDS.filter(s => selectedKit.allowedSeeds.includes(s.id)).map(seed => (
              <Card 
                key={seed.id}
                className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
                onClick={() => { setSelectedSeed(seed); setStep('confirm'); }}
              >
                 <div className="text-4xl">{seed.icon}</div>
                 <span className="font-medium text-gray-900 text-center">{seed.name}</span>
              </Card>
            ))}
          </div>
        )}

        {/* STEP 3: CONFIRM */}
        {step === 'confirm' && selectedKit && selectedSeed && (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
             <Card className="p-6">
                <h3 className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-4">Summary</h3>
                <div className="flex items-center gap-4 mb-6">
                    <img src={selectedKit.image} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                    <div>
                        <h4 className="font-bold text-lg">{selectedKit.name}</h4>
                        <p className="text-gray-600">{selectedKit.price}</p>
                    </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between mb-6">
                    <span className="text-sm text-gray-600">Selected Seed:</span>
                    <div className="flex items-center gap-2 font-bold text-green-800">
                        <span>{selectedSeed.icon}</span>
                        {selectedSeed.name}
                    </div>
                </div>

                <div className="space-y-3">
                    <Button onClick={handleOrder} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                        Confirm Order
                    </Button>
                    <Button variant="ghost" onClick={() => setStep('kit')} className="w-full text-gray-500">
                        Cancel
                    </Button>
                </div>
             </Card>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center pt-10 text-center animate-in fade-in zoom-in-95">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h3>
             <p className="text-gray-500 max-w-xs mb-8">
                Your kit is ready. Use the code below to activate your digital garden.
             </p>

             <Card className="p-6 bg-gray-900 text-white w-full max-w-xs mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500" />
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Activation Code</p>
                <p className="text-2xl font-mono font-bold tracking-wider text-green-400">{generatedCode}</p>
             </Card>

             <Button variant="outline" onClick={handleCopy} className="mb-4">
                <Copy className="w-4 h-4 mr-2" /> Copy Code
             </Button>

             <Button onClick={() => onNavigate('garden')} variant="link" className="text-green-600">
                Go to My Garden
             </Button>
          </div>
        )}

      </div>
      <div className="h-24"/>
    </div>
  );
}