import { useState } from 'react';
import { createPortal } from 'react-dom'; // CRITICAL IMPORT
import { Plus, TrendingUp, Droplet, Sun, QrCode, X, Loader2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import type { Screen, Plant } from '../App';

interface MyGardenScreenProps {
  onNavigate: (screen: Screen) => void;
  onPlantClick: (plant: Plant) => void;
}

export function MyGardenScreen({ onNavigate, onPlantClick }: MyGardenScreenProps) {
  // --- STATE ---
  const [isScanning, setIsScanning] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial Data
  const [plants, setPlants] = useState<Plant[]>([
    {
      id: '1',
      name: 'Cherry Tomato',
      type: 'Vegetable',
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
      plantedDate: '2025-12-20',
      daysGrowing: 23,
      harvestDays: 45,
      health: 'warning',
      imageUrl: 'https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=1000&q=80',
      nextWatering: 'Today, 3:00 PM',
      nextFertilizing: 'Tomorrow',
      progress: 51,
    }
  ]);

  const stats = {
    totalPlants: plants.length,
    healthyPlants: plants.filter((p) => p.health === 'healthy').length,
    needsAttention: plants.filter((p) => p.health === 'warning').length,
    avgCareRate: 87,
  };

  // --- HANDLERS ---
  const handleScanSubmit = async (code: string) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('code', code);
      
      const res = await fetch('http://localhost:8000/api/kit/scan', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPlants(prev => [data.plant, ...prev]);
        setIsScanning(false);
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Could not connect to server.");
    } finally {
      setIsProcessing(false);
      setScanInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-gray-900">My Garden</h2>
           <p className="text-sm text-gray-600">{stats.totalPlants} plants growing</p>
        </div>
        
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

      {/* --- QR SCANNER MODAL (Fixed with Portal) --- */}
      {isScanning && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-200 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                 <h3 className="font-bold text-lg text-gray-900">Activate Smart Kit</h3>
                 <button onClick={() => setIsScanning(false)} className="p-2 hover:bg-gray-200 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                 </button>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* Camera Placeholder */}
                 <div className="aspect-square bg-gray-900 rounded-xl relative flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none z-10"></div>
                    <div className="w-48 h-48 border-2 border-green-500 rounded-lg relative z-0">
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_#22c55e] animate-scan-down"></div>
                    </div>
                    <p className="absolute bottom-4 text-white/80 text-xs font-medium z-20">Align QR Code within frame</p>
                 </div>

                 {/* MVP Simulation Controls */}
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-center text-gray-400 mb-2 uppercase font-bold tracking-wider">
                        Developer Mode: Simulate Scan
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                       <Button 
                         variant="outline" 
                         className="text-xs h-auto py-2 flex-col gap-1 hover:border-green-500 hover:bg-green-50 hover:text-green-700 bg-white"
                         onClick={() => handleScanSubmit("CITYFARM-TOMATO-01")}
                         disabled={isProcessing}
                       >
                         <span className="text-lg">🍅</span>
                         Tomato
                       </Button>
                       <Button 
                         variant="outline" 
                         className="text-xs h-auto py-2 flex-col gap-1 hover:border-green-500 hover:bg-green-50 hover:text-green-700 bg-white"
                         onClick={() => handleScanSubmit("CITYFARM-LETTUCE-01")}
                         disabled={isProcessing}
                       >
                         <span className="text-lg">🥬</span>
                         Lettuce
                       </Button>
                       <Button 
                         variant="outline" 
                         className="text-xs h-auto py-2 flex-col gap-1 hover:border-green-500 hover:bg-green-50 hover:text-green-700 bg-white"
                         onClick={() => handleScanSubmit("CITYFARM-MINT-01")}
                         disabled={isProcessing}
                       >
                         <span className="text-lg">🌿</span>
                         Mint
                       </Button>
                    </div>
                 </div>

                 {/* Manual Input */}
                 <div className="flex gap-2">
                    <Input 
                        placeholder="Or enter Kit ID manually..." 
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        className="text-sm"
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
        </div>,
        document.body // Portal Target
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
        <div className="space-y-4">
          {plants.map((plant) => (
            <Card
              key={plant.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ring-1 ring-gray-100 hover:ring-green-100 relative z-0" // Ensure z-0 here
              onClick={() => onPlantClick(plant)}
            >
              <div className="relative h-48">
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <Badge
                  className={`absolute top-3 right-3 ${
                    plant.health === 'healthy'
                      ? 'bg-green-600/90 backdrop-blur-sm'
                      : plant.health === 'warning'
                      ? 'bg-yellow-600/90 backdrop-blur-sm'
                      : 'bg-red-600/90 backdrop-blur-sm'
                  } text-white border-0`}
                >
                  {plant.health === 'healthy' ? '● Healthy' : plant.health === 'warning' ? '⚠ Warning' : '✕ Critical'}
                </Badge>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-0.5 shadow-sm">{plant.name}</h3>
                  <p className="text-xs text-green-100 font-medium tracking-wide uppercase">{plant.type}</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-500 font-medium">Growth Progress</span>
                    <span className="font-bold text-gray-900">
                      Day {plant.daysGrowing} <span className="text-gray-400 font-normal">/ {plant.harvestDays}</span>
                    </span>
                  </div>
                  <Progress value={Math.min(100, (plant.daysGrowing / (plant.harvestDays || 1)) * 100)} className="h-2" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <Card className="p-8 border-dashed border-2 border-gray-200 bg-gray-50/50 text-center hover:bg-green-50/50 hover:border-green-200 transition-colors">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <Plus className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Grow Something New</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
             Start a new pot by scanning your environment or activating a smart kit.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
                onClick={() => onNavigate('scan')}
                variant="outline"
                className="bg-white border-gray-200 text-gray-700 hover:text-green-700 hover:border-green-300"
            >
                Scan Space
            </Button>
            <Button
                onClick={() => setIsScanning(true)}
                className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
            >
                Activate Kit
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}