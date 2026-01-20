import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ScanScreen } from './components/ScanScreen';
import { MyGardenScreen } from './components/MyGardenScreen';
import { CommunityScreen } from './components/CommunityScreen';
import { PlantDetailScreen } from './components/PlantDetailScreen';
import { OrderScreen } from './components/OrderScreen'; // NEW
import { Home, Sprout, Users, Camera, ShoppingBag } from 'lucide-react';

export type Screen = 'home' | 'scan' | 'garden' | 'community' | 'plant-detail' | 'order';

export interface Plant {
  id: string;
  name: string;
  type: string;
  code: string;
  plantedDate: string;
  daysGrowing: number;
  harvestDays: number;
  health: 'healthy' | 'warning' | 'critical';
  imageUrl: string;
  nextWatering: string;
  nextFertilizing: string;
  progress: number;
}

export interface CommunityPost {
  id: string;
  seller: {
    name: string;
    avatar: string;
    district: string;
    verifiedGrower: boolean;
  };
  plant: string;
  quantity: string;
  price: string;
  imageUrl: string;
  description: string;
  postedTime: string;
  plantingLogs: number;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [orderPreSelection, setOrderPreSelection] = useState<string | null>(null);

  const navigateToPlantDetail = (plant: Plant) => {
    setSelectedPlant(plant);
    setCurrentScreen('plant-detail');
  };

  const navigateToOrder = (plantName?: string) => {
      if (plantName) setOrderPreSelection(plantName);
      else setOrderPreSelection(null);
      setCurrentScreen('order');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen onNavigate={setCurrentScreen} onPlantClick={navigateToPlantDetail} />;
      case 'scan': return <ScanScreen onNavigate={setCurrentScreen} onNavigateToOrder={navigateToOrder} />;
      case 'garden': return <MyGardenScreen onNavigate={setCurrentScreen} onPlantClick={navigateToPlantDetail} />;
      case 'community': return <CommunityScreen onNavigate={setCurrentScreen} />;
      case 'order': return <OrderScreen onNavigate={setCurrentScreen} preSelectedPlant={orderPreSelection} />;
      case 'plant-detail': return selectedPlant ? <PlantDetailScreen plant={selectedPlant} onBack={() => setCurrentScreen('garden')} /> : null;
      default: return <HomeScreen onNavigate={setCurrentScreen} onPlantClick={navigateToPlantDetail} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Mobile App Container */}
      <div className="w-full max-w-md min-h-screen bg-white shadow-2xl relative flex flex-col pb-24">
        
        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {renderScreen()}
        </div>

        {/* --- BOTTOM NAVIGATION --- */}
        {currentScreen !== 'plant-detail' && (
          // Added 'overflow-visible' to prevent clipping the floating button
          <nav className="fixed bottom-0 w-full max-w-md z-50 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] h-20 overflow-visible">
             <div className="relative w-full h-full flex items-center justify-between px-2">
                
                {/* Left Group */}
                <div className="flex-1 flex justify-around items-end pb-2">
                  <NavBtn 
                    icon={Home} 
                    label="Home" 
                    active={currentScreen === 'home'} 
                    onClick={() => setCurrentScreen('home')} 
                  />
                  <NavBtn 
                    icon={ShoppingBag} 
                    label="Order" 
                    active={currentScreen === 'order'} 
                    onClick={() => navigateToOrder()} 
                  />
                </div>

                {/* Center Spacer for Floating Button */}
                <div className="w-20 relative flex justify-center h-full">
                   {/* BIG FLOATING CAMERA BUTTON */}
                   {/* -top-10 pulls it UP. border-[6px] creates the gap effect. */}
                   <button
                      onClick={() => setCurrentScreen('scan')}
                      className={`
                        absolute -top-10 left-1/2 -translate-x-1/2
                        w-16 h-16 rounded-full flex items-center justify-center 
                        shadow-2xl transition-transform active:scale-95
                        border-[6px] border-white  /* This border matches the nav bg to look like a cutout */
                        ${currentScreen === 'scan' 
                          ? 'bg-green-700 text-white ring-2 ring-green-100' 
                          : 'bg-green-600 text-white hover:bg-green-500'
                        }
                      `}
                    >
                      <Camera className="w-8 h-8" />
                    </button>
                    
                </div>

                {/* Right Group */}
                <div className="flex-1 flex justify-around items-end pb-2">
                  <NavBtn 
                    icon={Sprout} 
                    label="Garden" 
                    active={currentScreen === 'garden'} 
                    onClick={() => setCurrentScreen('garden')} 
                  />
                  <NavBtn 
                    icon={Users} 
                    label="Social" 
                    active={currentScreen === 'community'} 
                    onClick={() => setCurrentScreen('community')} 
                  />
                </div>

             </div>
          </nav>
        )}
      </div>
    </div>
  );
}

// Helper Component for Nav Buttons
const NavBtn = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-end gap-1 w-16 h-12 transition-colors duration-200 active:scale-95 ${
      active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    <Icon className={`w-6 h-6 ${active ? 'fill-green-100 stroke-green-600 stroke-[2px]' : 'stroke-[1.5px]'}`} />
    <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
  </button>
);

export default App;