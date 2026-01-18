import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ScanScreen } from './components/ScanScreen';
import { MyGardenScreen } from './components/MyGardenScreen';
import { CommunityScreen } from './components/CommunityScreen';
import { PlantDetailScreen } from './components/PlantDetailScreen';
import { Camera, Home, Sprout, Users } from 'lucide-react';

export type Screen = 'home' | 'scan' | 'garden' | 'community' | 'plant-detail';

export interface Plant {
  id: string;
  name: string;
  type: string;
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

  const navigateToPlantDetail = (plant: Plant) => {
    setSelectedPlant(plant);
    setCurrentScreen('plant-detail');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} onPlantClick={navigateToPlantDetail} />;
      case 'scan':
        return <ScanScreen onNavigate={setCurrentScreen} />;
      case 'garden':
        return <MyGardenScreen onNavigate={setCurrentScreen} onPlantClick={navigateToPlantDetail} />;
      case 'community':
        return <CommunityScreen onNavigate={setCurrentScreen} />;
      case 'plant-detail':
        return selectedPlant ? (
          <PlantDetailScreen plant={selectedPlant} onBack={() => setCurrentScreen('garden')} />
        ) : null;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} onPlantClick={navigateToPlantDetail} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App Container - iPhone Safe Area */}
      <div className="mx-auto max-w-md min-h-screen bg-white shadow-2xl relative pb-20">
        {/* Screen Content */}
        <div className="h-full">
          {renderScreen()}
        </div>

        {/* Bottom Navigation - iOS Style */}
        {currentScreen !== 'plant-detail' && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 safe-area-bottom">
            <div className="flex justify-around items-center h-20 px-6">
              <button
                onClick={() => setCurrentScreen('home')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  currentScreen === 'home' ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <Home className={`w-6 h-6 ${currentScreen === 'home' ? 'fill-green-600' : ''}`} />
                <span className="text-xs font-medium">Home</span>
              </button>

              <button
                onClick={() => setCurrentScreen('scan')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  currentScreen === 'scan' ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs font-medium">Scan</span>
              </button>

              <button
                onClick={() => setCurrentScreen('garden')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  currentScreen === 'garden' ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <Sprout className="w-6 h-6" />
                <span className="text-xs font-medium">My Garden</span>
              </button>

              <button
                onClick={() => setCurrentScreen('community')}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  currentScreen === 'community' ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="text-xs font-medium">Community</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export default App;
