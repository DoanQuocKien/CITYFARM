import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShoppingBag, Leaf, ChevronRight, Package, Copy, Droplet, Sprout, Recycle } from 'lucide-react';
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
  { id: 'TOMATO', name: 'Cherry Tomato', icon: '🍅', price: '15.000₫' },
  { id: 'LETTUCE', name: 'Green Lettuce', icon: '🥬', price: '12.000₫' },
  { id: 'MINT', name: 'Fresh Mint', icon: '🌿', price: '10.000₫' },
  { id: 'ONION', name: 'Green Onion', icon: '🧅', price: '8.000₫' },
];

const DIRT_OPTIONS = [
  { id: 'DIRT_250G', name: '250g Soil', quantity: '250g', price: '25.000₫' },
  { id: 'DIRT_1KG', name: '1kg Soil', quantity: '1kg', price: '80.000₫' },
  { id: 'DIRT_2KG', name: '2kg Soil', quantity: '2kg', price: '150.000₫' },
  { id: 'DIRT_5KG', name: '5kg Soil', quantity: '5kg', price: '350.000₫' },
];

const RECYCLED_POTS = [
  { id: 'POT_SMALL', name: 'Small Pot', size: '500ml', decoration: '🌸', price: '20.000₫' },
  { id: 'POT_MEDIUM', name: 'Medium Pot', size: '1L', decoration: '🎨', price: '35.000₫' },
  { id: 'POT_LARGE', name: 'Large Pot', size: '2L', decoration: '🌈', price: '50.000₫' },
  { id: 'POT_HANGING', name: 'Hanging Pot', size: '1.5L', decoration: '⭐', price: '45.000₫' },
];

const KITS = [
  {
    id: 'STAND',
    name: 'Standing Garden',
    price: '199.000₫',
    image: '/img/kit/standing.jpg', 
    components: ['5x 5L Bottles', 'Seeds', '12kg Soil', 'Wooden Stand'],
    allowedSeeds: ['TOMATO', 'ONION', 'LETTUCE', 'MINT']
  },
  {
    id: 'HANG',
    name: 'Hanging Garden',
    price: '149.000₫',
    image: '/img/kit/hanging.jpg',
    components: ['5x Bottles', 'Seeds', '2kg Soil', 'Wall Mount'],
    allowedSeeds: ['LETTUCE', 'MINT', 'ONION']
  },
  {
    id: 'TINY',
    name: 'Tiny Garden',
    price: '99.000₫',
    image: '/img/kit/tiny.jpg',
    components: ['5x 500ml Bottles', 'Seeds', '1kg Soil'],
    allowedSeeds: ['MINT', 'ONION']
  },
  {
    id: 'UPGR',
    name: 'Upgraded Tiny',
    price: '119.000₫',
    image: '/img/kit/tiny_plus.jpg',
    components: ['5x 1L Bottles', 'Seeds', '2kg Soil'],
    allowedSeeds: ['MINT', 'ONION', 'LETTUCE']
  },
  {
    id: 'START',
    name: 'Green Starter',
    price: '49.000₫',
    image: '/img/kit/start.jpg',
    components: ['1x 1L Bottle', 'Seeds', '250g Soil', '1 Month AI'],
    allowedSeeds: ['MINT', 'ONION', 'LETTUCE']
  }
];

export function OrderScreen({ onNavigate, preSelectedPlant }: OrderScreenProps) {
  const [productType, setProductType] = useState<'kit' | 'seed' | 'dirt' | 'pot'>('kit');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [selectedKit, setSelectedKit] = useState<typeof KITS[0] | null>(null);
  const [selectedSeed, setSelectedSeed] = useState<typeof SEEDS[0] | null>(null);
  const [selectedDirt, setSelectedDirt] = useState<typeof DIRT_OPTIONS[0] | null>(null);
  const [selectedPot, setSelectedPot] = useState<typeof RECYCLED_POTS[0] | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');

  // Handle Pre-selection Logic
  useEffect(() => {
    if (preSelectedPlant) {
      const seed = SEEDS.find(s => s.name.toLowerCase().includes(preSelectedPlant.toLowerCase())) || 
                   SEEDS.find(s => preSelectedPlant.toUpperCase().includes(s.id));
      
      if (seed) {
        setSelectedSeed(seed);
        setProductType('kit');
      }
    }
  }, [preSelectedPlant]);

  const handleOrder = () => {
    let productId = '';
    if (productType === 'kit' && selectedKit) productId = selectedKit.id;
    else if (productType === 'seed' && selectedSeed) productId = selectedSeed.id;
    else if (productType === 'dirt' && selectedDirt) productId = selectedDirt.id;
    else if (productType === 'pot' && selectedPot) productId = selectedPot.id;
    
    const uniqueId = Math.floor(1000 + Math.random() * 9000);
    const code = `${productType.toUpperCase()}-${productId}-${uniqueId}`;
    setGeneratedCode(code);
    setStep('success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    alert("Code copied! Go to 'My Garden' -> 'Activate Kit' to use it.");
  };

  const getSelectedProduct = () => {
    if (productType === 'kit') return selectedKit;
    if (productType === 'seed') return selectedSeed;
    if (productType === 'dirt') return selectedDirt;
    if (productType === 'pot') return selectedPot;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          {step !== 'select' && (
            <button onClick={() => setStep('select')}>
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'select' ? 'Shop' : step === 'confirm' ? 'Confirm Order' : 'Order Placed!'}
          </h2>
        </div>

        {/* Product Type Tabs */}
        {step === 'select' && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setProductType('kit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                productType === 'kit' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Kits
            </button>
            <button
              onClick={() => setProductType('seed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                productType === 'seed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sprout className="w-4 h-4" />
              Seeds
            </button>
            <button
              onClick={() => setProductType('dirt')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                productType === 'dirt' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Droplet className="w-4 h-4" />
              Soil
            </button>
            <button
              onClick={() => setProductType('pot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                productType === 'pot' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Recycle className="w-4 h-4" />
              Recycled Pots
            </button>
          </div>
        )}
      </header>

      <div className="p-4 space-y-4">
        
        {/* SELECT PRODUCTS */}
        {step === 'select' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            
            {/* KITS */}
            {productType === 'kit' && KITS.map(kit => (
              <Card 
                key={kit.id} 
                className="overflow-hidden hover:border-green-500 cursor-pointer transition-all active:scale-[0.98]"
                onClick={() => { setSelectedKit(kit); setStep('confirm'); }}
              >
                <div className="flex">
                  <div className="w-32 bg-gray-100 relative">
                    <img 
                      src={kit.image} 
                      className="w-full h-full object-cover" 
                      alt={kit.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=No+Image';
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
                        Select <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* SEEDS */}
            {productType === 'seed' && (
              <div className="grid grid-cols-2 gap-3">
                {SEEDS.map(seed => (
                  <Card 
                    key={seed.id}
                    className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all active:scale-[0.98]"
                    onClick={() => { setSelectedSeed(seed); setStep('confirm'); }}
                  >
                    <div className="text-5xl">{seed.icon}</div>
                    <span className="font-medium text-gray-900 text-center text-sm">{seed.name}</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{seed.price}</Badge>
                  </Card>
                ))}
              </div>
            )}

            {/* DIRT/SOIL */}
            {productType === 'dirt' && (
              <div className="space-y-3">
                {DIRT_OPTIONS.map(dirt => (
                  <Card 
                    key={dirt.id}
                    className="p-4 flex items-center justify-between cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all active:scale-[0.98]"
                    onClick={() => { setSelectedDirt(dirt); setStep('confirm'); }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Droplet className="w-6 h-6 text-amber-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{dirt.name}</h3>
                        <p className="text-sm text-gray-500">{dirt.quantity}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{dirt.price}</Badge>
                  </Card>
                ))}
              </div>
            )}

            {/* RECYCLED POTS */}
            {productType === 'pot' && (
              <div className="grid grid-cols-2 gap-3">
                {RECYCLED_POTS.map(pot => (
                  <Card 
                    key={pot.id}
                    className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all active:scale-[0.98]"
                    onClick={() => { setSelectedPot(pot); setStep('confirm'); }}
                  >
                    <div className="text-4xl">{pot.decoration}</div>
                    <div className="text-center">
                      <h3 className="font-medium text-gray-900 text-sm">{pot.name}</h3>
                      <p className="text-xs text-gray-500">{pot.size}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{pot.price}</Badge>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONFIRM ORDER */}
        {step === 'confirm' && getSelectedProduct() && (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
             <Card className="p-6">
                <h3 className="text-gray-500 text-sm uppercase font-bold tracking-wider mb-4">Order Summary</h3>
                
                {productType === 'kit' && selectedKit && (
                  <div className="flex items-center gap-4 mb-6">
                    <img src={selectedKit.image} className="w-16 h-16 rounded-lg object-cover bg-gray-100" alt={selectedKit.name} />
                    <div>
                      <h4 className="font-bold text-lg">{selectedKit.name}</h4>
                      <p className="text-gray-600">{selectedKit.price}</p>
                    </div>
                  </div>
                )}

                {productType === 'seed' && selectedSeed && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">{selectedSeed.icon}</div>
                    <div>
                      <h4 className="font-bold text-lg">{selectedSeed.name}</h4>
                      <p className="text-gray-600">{selectedSeed.price}</p>
                    </div>
                  </div>
                )}

                {productType === 'dirt' && selectedDirt && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Droplet className="w-8 h-8 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{selectedDirt.name}</h4>
                      <p className="text-gray-600">{selectedDirt.price}</p>
                    </div>
                  </div>
                )}

                {productType === 'pot' && selectedPot && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">{selectedPot.decoration}</div>
                    <div>
                      <h4 className="font-bold text-lg">{selectedPot.name}</h4>
                      <p className="text-sm text-gray-500 mb-1">{selectedPot.size}</p>
                      <p className="text-gray-600">{selectedPot.price}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mt-6">
                    <Button onClick={handleOrder} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                        Confirm Order
                    </Button>
                    <Button variant="ghost" onClick={() => setStep('select')} className="w-full text-gray-500">
                        Cancel
                    </Button>
                </div>
             </Card>
          </div>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center pt-10 text-center animate-in fade-in zoom-in-95">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h3>
             <p className="text-gray-500 max-w-xs mb-8">
                Your order is ready. Use the code below {productType === 'kit' ? 'to activate your digital garden' : 'for your records'}.
             </p>

             <Card className="p-6 bg-gray-900 text-white w-full max-w-xs mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500" />
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Order Code</p>
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