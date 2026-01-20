import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; // CRITICAL IMPORT
import { Plus, TrendingUp, Droplet, Sun, QrCode, X, Loader2, ArrowRight, Trash2, Box, Tag, ChevronRight, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import type { Screen, Plant } from '../App';
import { Scanner } from '@yudiel/react-qr-scanner';

const PLANT_DATABASE: Record<string, Partial<Plant>> = {
  'TOMATO': { 
    name: 'Cherry Tomato', type: 'Vegetable', harvestDays: 60, 
    imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=80',
    nextWatering: 'Today, 5:00 PM', nextFertilizing: 'In 14 days'
  },
  'LETTUCE': { 
    name: 'Green Lettuce', type: 'Vegetable', harvestDays: 35, 
    imageUrl: 'https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?auto=format&fit=crop&w=1000&q=80',
    nextWatering: 'Tomorrow, 8:00 AM', nextFertilizing: 'In 7 days'
  },
  'MINT': { 
    name: 'Peppermint', type: 'Herb', harvestDays: 45, 
    imageUrl: 'https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=1000&q=80',
    nextWatering: 'Today, 7:00 AM', nextFertilizing: 'In 30 days'
  },
  'ONION': { 
    name: 'Green Onion', type: 'Herb', harvestDays: 55, 
    imageUrl: 'https://www.almanac.com/sites/default/files/styles/or/public/image_nodes/Untitled%20design%20%288%29_1.jpg?itok=leansz0S',
    nextWatering: 'Tomorrow, 7:00 AM', nextFertilizing: 'In 15 days'
  }
};

const getKitName = (code: string) => {
  if (!code) return 'Unknown Kit';
  const prefix = code.split('-')[0]?.toUpperCase();
  switch (prefix) {
    case 'STAND': return 'Standing Garden';
    case 'HANG': return 'Hanging Garden';
    case 'TINY': return 'Tiny Garden';
    case 'UPGR': return 'Upgraded Tiny';
    case 'START': return 'Green Starter';
    case 'CITYFARM': return 'Standard Kit';
    default: return 'Custom Kit';
  }
};

interface MyGardenScreenProps {
  onNavigate: (screen: Screen) => void;
  onPlantClick: (plant: Plant) => void;
}

export function MyGardenScreen({ onNavigate, onPlantClick }: MyGardenScreenProps) {
  // --- STATE ---
  const [isScanning, setIsScanning] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [plantToSell, setPlantToSell] = useState<Plant | null>(null);
  const [sellFormData, setSellFormData] = useState({ price: '', quantity: '', productName: '' });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsScanning(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Initial Data
  const [plants, setPlants] = useState<Plant[]>(() => {
    const saved = localStorage.getItem('my_garden_plants');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Cherry Tomato',
        type: 'Vegetable',
        code: 'CITYFARM-TOMATO-01',
        plantedDate: '2026-01-01',
        daysGrowing: 11,
        harvestDays: 60,
        health: 'healthy',
        imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=80',
        nextWatering: 'Today, 5:00 PM',
        nextFertilizing: 'In 3 days',
        progress: 18,
      },
      {
        id: '2',
        name: 'Green Lettuce',
        type: 'Vegetable',
        code: 'CITYFARM-LETTUCE-02',
        plantedDate: '2025-12-28',
        daysGrowing: 15,
        harvestDays: 35,
        health: 'healthy',
        imageUrl: 'https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?auto=format&fit=crop&w=1000&q=80',
        nextWatering: 'Tomorrow, 8:00 AM',
        nextFertilizing: 'In 5 days',
        progress: 43,
      },
      {
        id: '3',
        name: 'Fresh Mint',
        type: 'Herb',
        code: 'CITYFARM-MINT-03',
        plantedDate: '2025-12-20',
        daysGrowing: 23,
        harvestDays: 45,
        health: 'warning',
        imageUrl: 'https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=1000&q=80',
        nextWatering: 'Today, 3:00 PM',
        nextFertilizing: 'Tomorrow',
        progress: 51,
      },
      {
        id: '4',
        name: 'Green Onion',
        type: 'Herb',
        code: 'CITYFARM-ONION-04',
        plantedDate: '2025-12-24',
        daysGrowing: 27,
        harvestDays: 55,
        health: 'warning',
        imageUrl: 'https://www.almanac.com/sites/default/files/styles/or/public/image_nodes/Untitled%20design%20%288%29_1.jpg?itok=leansz0S',
        nextWatering: 'Tomorrow, 7:00 AM',
        nextFertilizing: 'In 6 days',
        progress: 49,
      },
      {
        id: '5',
        name: 'Heirloom Tomato',
        type: 'Vegetable',
        code: 'CITYFARM-TOMATO-05',
        plantedDate: '2025-11-21',
        daysGrowing: 60,
        harvestDays: 60,
        health: 'healthy',
        imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=80',
        nextWatering: 'Ready to harvest!',
        nextFertilizing: 'N/A',
        progress: 100,
      },
      {
        id: '6',
        name: 'Crispy Lettuce',
        type: 'Vegetable',
        code: 'CITYFARM-LETTUCE-06',
        plantedDate: '2025-12-16',
        daysGrowing: 35,
        harvestDays: 35,
        health: 'healthy',
        imageUrl: 'https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?auto=format&fit=crop&w=1000&q=80',
        nextWatering: 'Ready to harvest!',
        nextFertilizing: 'N/A',
        progress: 100,
      },
      {
        id: '7',
        name: 'Spearmint',
        type: 'Herb',
        code: 'CITYFARM-MINT-07',
        plantedDate: '2025-12-06',
        daysGrowing: 45,
        harvestDays: 45,
        health: 'healthy',
        imageUrl: 'https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=1000&q=80',
        nextWatering: 'Ready to harvest!',
        nextFertilizing: 'N/A',
        progress: 100,
      },
      {
        id: '8',
        name: 'Spring Onion',
        type: 'Herb',
        code: 'CITYFARM-ONION-08',
        plantedDate: '2025-12-01',
        daysGrowing: 55,
        harvestDays: 55,
        health: 'healthy',
        imageUrl: 'https://www.almanac.com/sites/default/files/styles/or/public/image_nodes/Untitled%20design%20%288%29_1.jpg?itok=leansz0S',
        nextWatering: 'Ready to harvest!',
        nextFertilizing: 'N/A',
        progress: 100,
      }
  ]});

  useEffect(() => {
    localStorage.setItem('my_garden_plants', JSON.stringify(plants));
  }, [plants]);

  const stats = {
    totalPlants: plants.length,
    healthyPlants: plants.filter((p) => p.health === 'healthy').length,
    needsAttention: plants.filter((p) => p.health === 'warning').length,
    avgCareRate: 87,
  };

  // --- HANDLERS ---

  // RESET BUTTON HANDLER (For Demo Prep)
  const handleResetData = () => {
    if(confirm("Reset Demo Data? This will clear all plants and restore the default.")) {
        localStorage.removeItem('my_garden_plants');
        window.location.reload(); // Reload to fetch fresh default data
    }
  };
  
  const handleScanSubmit = async (inputCode: string) => {
    if (isProcessing) return;

    // 1. Normalize
    const code = inputCode.trim().toUpperCase();

    // 2. Check Duplicates
    const isDuplicate = plants.some(p => p.code === code);
    if (isDuplicate) {
        alert(`⚠️ This kit (${code}) is already in your garden!`);
        setIsScanning(false);
        setScanInput('');
        return;
    }

    setIsProcessing(true);

    // 3. LOOKUP (Replaces API Call)
    // Logic: Look for "TOMATO", "LETTUCE", etc. inside the code string
    let plantTypeKey = 'TOMATO'; // Default fallback
    if (code.includes('LET')) plantTypeKey = 'LETTUCE';
    else if (code.includes('MIN')) plantTypeKey = 'MINT';
    else if (code.includes('ONI')) plantTypeKey = 'ONION';
    else if (code.includes('TOM')) plantTypeKey = 'TOMATO';

    const template = PLANT_DATABASE[plantTypeKey];

    // Simulate a tiny delay so it feels like "processing" (UX Best Practice)
    setTimeout(() => {
        if (template) {
            const newPlant: Plant = {
                id: Date.now().toString(), // Simple ID generation
                name: template.name!,
                type: template.type as any,
                code: code,
                plantedDate: new Date().toISOString().split('T')[0],
                daysGrowing: 0,
                harvestDays: template.harvestDays!,
                health: 'healthy',
                imageUrl: template.imageUrl!,
                nextWatering: template.nextWatering || 'Tomorrow',
                nextFertilizing: template.nextFertilizing || 'Next week',
                progress: 0
            };

            setPlants(prev => [newPlant, ...prev]);
            setIsScanning(false);
            
            // Auto-redirect
            setTimeout(() => {
                onPlantClick(newPlant);
            }, 100);
        } else {
            alert("Unknown QR Code format.");
        }
        
        setIsProcessing(false);
        setScanInput('');
    }, 300); // 300ms fake delay
  };
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Stop the click from opening the plant details
    if (window.confirm("Remove this plant from your garden?")) {
        setPlants(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSellPlant = (plant: Plant) => {
    if (plant.progress < 100) {
      alert("Plant must be 100% mature to harvest and sell!");
      return;
    }
    setPlantToSell(plant);
    setSellFormData({ price: '', quantity: '', productName: plant.name });
    setIsSellModalOpen(true);
  };

  const handleSubmitListing = () => {
    if (!sellFormData.price || !sellFormData.quantity || !sellFormData.productName) {
      alert("Please fill in all fields");
      return;
    }
    // Save to localStorage for market listings
    const listings = JSON.parse(localStorage.getItem('market_listings') || '[]');
    const newListing = {
      id: Date.now().toString(),
      seller: {
        name: 'You',
        avatar: 'https://i.pravatar.cc/150?u=you',
        district: 'Dĩ An',
        verifiedGrower: true
      },
      plantName: sellFormData.productName,
      quantity: sellFormData.quantity,
      price: sellFormData.price,
      imageUrl: plantToSell?.imageUrl || '',
      description: `Harvested from my CityFarm ${plantToSell?.type}. Fresh and organic!`,
      postedTime: 'Just now',
      sourcePlantId: plantToSell?.id
    };
    listings.push(newListing);
    localStorage.setItem('market_listings', JSON.stringify(listings));
    
    setIsSellModalOpen(false);
    setPlantToSell(null);
    setSellFormData({ price: '', quantity: '', productName: '' });
    alert("✅ Plant listed on Fresh Market!");
  };
  return (
    <div className="min-h-screen bg-gray-50 relative pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-gray-900">My Garden</h2>
           <p className="text-sm text-gray-600">{stats.totalPlants} plants growing</p>
        </div>
        <Button size="icon" variant="ghost" onClick={handleResetData} className="text-gray-400 hover:text-red-500">
                <RefreshCw className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-green-600 text-green-700 hover:bg-green-50"
          onClick={() => setIsScanning(true)}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Activate Kit
        </Button>
      </header>

      {/* --- QR SCANNER MODAL --- */}
      {isScanning && createPortal(
        <div 
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm"
            onClick={() => setIsScanning(false)}
        >
           <div 
             className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative"
             onClick={(e) => e.stopPropagation()}
           >
              {/* HEADER */}
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-lg text-gray-900">Scan QR Code</h3>
                 <button 
                    onClick={() => setIsScanning(false)} 
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                 >
                    <X className="w-5 h-5 text-gray-500" />
                 </button>
              </div>
              
              <div className="p-0 relative">
                 {/* 2. THE REAL SCANNER */}
                 <div className="aspect-square relative overflow-hidden bg-black">
                    {isProcessing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 z-20">
                            <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-2" />
                            <p className="font-medium">Activating Kit...</p>
                        </div>
                    ) : (
                        <Scanner 
                            onScan={(result) => {
                                if (result && result.length > 0) {
                                    handleScanSubmit(result[0].rawValue);
                                }
                            }}
                            onError={(error) => console.log(error)}
                            components={{
                                torch: true,  // Flashlight button
                                finder: false // We use our own overlay below
                            }}
                            styles={{
                                container: { width: '100%', height: '100%' },
                                video: { objectFit: 'cover' }
                            }}
                        />
                    )}

                    {/* Custom Overlay (Green Box) */}
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-green-500 rounded-lg relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_#22c55e] animate-scan-down"></div>
                        </div>
                    </div>
                 </div>

                 {/* Fallback Manual Input */}
                 <div className="p-4 bg-gray-50 border-t">
                    <p className="text-xs text-gray-500 mb-2 text-center">Camera not working? Enter code manually:</p>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="e.g. CITYFARM-TOMATO-01" 
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            className="text-sm bg-white"
                        />
                        <Button 
                            size="sm" 
                            disabled={!scanInput || isProcessing}
                            onClick={() => handleScanSubmit(scanInput)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}
      
      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.healthyPlants}</p>
                <p className="text-xs text-gray-600 font-medium">Healthy Plants</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center shadow-sm">
                <Droplet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.needsAttention}</p>
                <p className="text-xs text-gray-600 font-medium">Needs Care</p>
              </div>
            </div>
          </Card>
        </div>

      {/* Plant List */}
      <div className="px-1 py-6 space-y-6">
        <div className="space-y-4">
          {plants.map((plant) => (
            <Card
              key={plant.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ring-1 ring-gray-100 hover:ring-green-100 relative group flex flex-col"
              onClick={() => onPlantClick(plant)}
            >
              <div className="relative h-48 w-full">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <button
                    onClick={(e) => handleDelete(e, plant.id)}
                    className="absolute top-3 left-3 z-30 w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                    title="Remove Plant"
                >
                    <Trash2 className="w-4 h-4" />
                </button>

                <Badge className="absolute top-3 right-3 bg-green-600/90 text-white border-0 backdrop-blur-sm">
                  {plant.health === 'healthy' ? '● Healthy' : '⚠ Warning'}
                </Badge>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-0.5 shadow-sm">{plant.name}</h3>
                  <p className="text-xs text-green-100 font-medium tracking-wide uppercase">{plant.type}</p>
                </div>
              </div>

              <div className="p-4 space-y-4 flex-1">
                {plant.code && (
                    <div className="flex gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px] text-gray-500 bg-gray-50 gap-1">
                            <Box className="w-3 h-3" /> {getKitName(plant.code)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] text-gray-400 gap-1 font-mono">
                            <Tag className="w-3 h-3" /> {plant.code}
                        </Badge>
                    </div>
                )}
                <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Growth</span>
                        <span className="font-bold">{plant.daysGrowing} / {plant.harvestDays} days</span>
                    </div>
                    <Progress value={(plant.daysGrowing / plant.harvestDays!) * 100} className="h-2" />
                </div>

                <Button 
                    variant="secondary" 
                    className="w-full mt-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onPlantClick(plant);
                    }}
                >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                {plant.progress === 100 && (
                  <Button 
                    variant="outline"
                    className="w-full mt-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleSellPlant(plant);
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Sell on Market
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

        {/* Grow New Card */}
        <Card className="p-8 border-dashed border-2 border-gray-200 bg-gray-50/50 text-center hover:bg-green-50/50 hover:border-green-200 transition-colors">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                <Plus className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Grow Something New</h3>
            <div className="flex gap-3 justify-center">
                <Button onClick={() => onNavigate('scan')} variant="outline">Scan Space</Button>
                <Button onClick={() => setIsScanning(true)} className="bg-green-600 hover:bg-green-700">Activate Kit</Button>
            </div>
        </Card>
      </div>

      {/* SELL MODAL */}
      {isSellModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsSellModalOpen(false)}
        >
          <Card 
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">List on Fresh Market</h3>
              <button 
                onClick={() => setIsSellModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Product Name</label>
                <Input 
                  value={sellFormData.productName}
                  onChange={(e) => setSellFormData({...sellFormData, productName: e.target.value})}
                  placeholder="e.g. Organic Bok Choy"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Quantity</label>
                <Input 
                  value={sellFormData.quantity}
                  onChange={(e) => setSellFormData({...sellFormData, quantity: e.target.value})}
                  placeholder="e.g. 500g"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Price</label>
                <Input 
                  value={sellFormData.price}
                  onChange={(e) => setSellFormData({...sellFormData, price: e.target.value})}
                  placeholder="e.g. 30,000₫"
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleSubmitListing}
                className="w-full bg-green-600 hover:bg-green-700 h-11"
              >
                List Product
              </Button>
            </div>
          </Card>
        </div>,
        document.body
      )}
    </div>
  );
}