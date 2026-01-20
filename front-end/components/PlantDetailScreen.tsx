import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, Droplet, Sun, TrendingUp, CheckCircle2, Clock, Bot, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ChatOverlay } from './ChatOverlay';
import type { Plant } from '../App';
import { get, set } from 'idb-keyval';

interface PlantDetailScreenProps {
  plant: Plant;
  onBack: () => void;
}

interface JournalEntry {
  id: string;
  date: string;
  photo: string; 
  aiAnalysis: {
    health: 'Healthy' | 'Warning' | 'Critical';
    leafColor: string;
    issues: string;
    recommendation: string;
  };
}

export function PlantDetailScreen({ plant, onBack }: PlantDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<'Timeline' | 'Care' | 'Journal'>('Timeline');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = `journal_${plant.id}`;

  // Mock Data for Timeline
  const growthTimeline = [
    { day: 1, stage: 'Planted', date: plant.plantedDate, completed: true },
    { day: 7, stage: 'Sprouting', date: '2026-01-07', completed: plant.daysGrowing >= 7 },
    { day: 14, stage: 'Vegetative Growth', date: '2026-01-14', completed: plant.daysGrowing >= 14 },
    { day: 30, stage: 'Flowering', date: '2026-01-30', completed: false },
    { day: 60, stage: 'Harvest Ready', date: '2026-03-01', completed: false },
  ];

  // Mock Data for Care History
  const careHistory = [
    {
      id: '1',
      date: '2026-01-12',
      action: 'Watered',
      time: '8:00 AM',
      aiDetection: 'Soil moisture optimal',
      status: 'completed',
    },
    {
      id: '2',
      date: '2026-01-10',
      action: 'Watered',
      time: '8:00 AM',
      aiDetection: 'Plant health: Good',
      status: 'completed',
    }
  ];

  // Mock Data for Journal
  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await get(storageKey); // <--- Reads from Disk
        if (saved) {
          setJournal(saved);
        } else {
          // Default entry if empty
          setJournal([{
            id: 'default-1',
            date: plant.plantedDate,
            photo: plant.imageUrl,
            aiAnalysis: {
              health: 'Healthy',
              leafColor: 'Vibrant green',
              issues: 'None detected',
              recommendation: 'Planting day! Soil looks good.',
            },
          }]);
        }
      } catch (err) {
        console.error("Failed to load journal:", err);
      } finally {
        setIsLoading(false); // <--- UI is ready
      }
    };
    loadData();
  }, [plant.id, plant.plantedDate, plant.imageUrl]);

  // --- 4. SAVE DATA (Async Trigger) ---
  // We trigger this whenever 'journal' changes, but only AFTER initial load
  useEffect(() => {
    if (!isLoading) {
      set(storageKey, journal).catch(err => console.error("Save failed", err));
    }
  }, [journal, storageKey, isLoading]);

  // Image Compression (Still good practice, but you can be less aggressive now)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // You can arguably store higher quality now (e.g. 1000px instead of 800)
          const MAX_WIDTH = 1000; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.8)); 
        };
      };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const compressedPhoto = await compressImage(file);
      
      const mockHealth = Math.random() > 0.2 ? 'Healthy' : 'Warning';
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        photo: compressedPhoto,
        aiAnalysis: {
          health: mockHealth,
          leafColor: mockHealth === 'Healthy' ? 'Vibrant Green' : 'Slight Yellowing',
          issues: mockHealth === 'Healthy' ? 'None detected' : 'Possible nutrient deficiency',
          recommendation: mockHealth === 'Healthy' ? 'Great job!' : 'Check soil moisture.',
        }
      };

      setJournal(prev => [newEntry, ...prev]);
      setActiveTab('Journal');
    }
  };

  // --- NEW: DELETE HANDLER ---
  const handleDeleteEntry = async (entryId: string) => {
    if (confirm("Are you sure you want to delete this memory?")) {
        const newJournal = journal.filter(entry => entry.id !== entryId);
        setJournal(newJournal);
        // We force a save immediately to be safe
        await set(storageKey, newJournal);
    }
  };

  // --- 5. RENDER (Handle Loading State) ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-gray-500 animate-pulse">Loading Journal...</p>
        </div>
    );
  }

  return (
  <div className="min-h-screen bg-white relative pb-32">
    
    {/* Hidden file input for camera */}
    <input 
      type="file" 
      ref={fileInputRef}
      accept="image/*"
      capture="environment"
      style={{ display: 'none' }}
      onChange={handlePhotoUpload}
    />

    {/* --- 1. HERO SECTION (Image & Header) --- */}
    <div className="relative h-64">
      <img
        src={plant.imageUrl}
        alt={plant.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Plant Info & AI Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
        <div className="text-white flex-1 mr-4">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold shadow-black drop-shadow-md">
              {plant.name}
            </h1>
            <Badge
              className={`border-0 ${
                plant.health === 'healthy'
                  ? 'bg-green-500'
                  : plant.health === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              } text-white shadow-sm`}
            >
              {plant.health === 'healthy' ? 'Healthy' : 'Warning'}
            </Badge>
          </div>
          <p className="text-sm text-gray-200 font-medium">
            {plant.type} • Day {plant.daysGrowing}
          </p>
        </div>

        <Button
          onClick={() => setIsChatOpen(true)}
          size="sm"
          className="h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-lg transition-all"
        >
          <Bot className="w-4 h-4 mr-2 text-yellow-300" />
          AI Expert
        </Button>
      </div>
    </div>

    {/* --- 2. KEY METRICS --- */}
    <div className="px-6 py-4 bg-gray-50 border-b">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-green-600">
            {plant.progress || 0}%
          </p>
          <p className="text-xs text-gray-600">Progress</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {plant.daysGrowing}
          </p>
          <p className="text-xs text-gray-600">Days Growing</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.max(0, plant.harvestDays - plant.daysGrowing)}
          </p>
          <p className="text-xs text-gray-600">Days to Harvest</p>
        </div>
      </div>
    </div>

    {/* --- 3. PROGRESS BAR --- */}
    <div className="px-6 py-4 bg-white">
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-gray-600">Growth to Harvest</span>
        <span className="font-semibold text-gray-900">
          {plant.daysGrowing} / {plant.harvestDays} days
        </span>
      </div>
      <Progress
        value={Math.min(100, (plant.daysGrowing / (plant.harvestDays || 1)) * 100)}
        className="h-3"
      />
    </div>

    {/* --- 4. TABS NAVIGATION --- */}
    <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex px-6">
        {['Timeline', 'Care', 'Journal'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>

    {/* --- 5. TAB CONTENT --- */}
    <div className="px-6 py-6 space-y-4">
      
      {/* Tab 1: Timeline (Existing) */}
      {activeTab === 'Timeline' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Growth Stages</h3>
          <div className="relative">
            {growthTimeline.map((stage, index) => (
              <div key={stage.day} className="flex gap-4 pb-6 last:pb-0 relative">
                {index < growthTimeline.length - 1 && (
                  <div className={`absolute left-5 top-12 w-0.5 h-full ${stage.completed ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${stage.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {stage.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <Card className={`flex-1 p-4 ${stage.completed ? 'bg-green-50 border-green-200' : ''}`}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{stage.stage}</h4>
                    <Badge variant="outline" className="text-xs bg-white">Day {stage.day}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{new Date(stage.date).toLocaleDateString()}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Care (Existing) */}
      {activeTab === 'Care' && (
        <div className="space-y-4">
          {careHistory.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{entry.action}</h4>
                    <span className="text-xs text-gray-500">{entry.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{new Date(entry.date).toLocaleDateString()}</p>
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>{entry.aiDetection}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 3: Journal / Album (NEW FEATURE) */}
      {activeTab === 'Journal' && (
        <div className="space-y-6">
          
          {/* Empty State */}
          {journal.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-8 h-8 text-gray-300" />
              </div>
              <p>No photos yet.</p>
              <p className="text-sm">Capture your first daily update below!</p>
            </div>
          )}

          {/* Photo Feed */}
          {journal.map((entry) => (
            <Card key={entry.id} className="overflow-hidden border-green-100 shadow-sm">
              {/* Photo */}
              <button
                onClick={() => handleDeleteEntry(entry.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                  <Trash2 className="w-4 h-4" />
              </button>
              <div className="aspect-video relative bg-gray-100">
                <img
                  src={entry.photo}
                  alt={`Journal entry ${entry.date}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                  {entry.date}
                </div>
              </div>

              {/* AI Analysis Details */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-gray-900">
                      AI Health Check
                    </span>
                  </div>
                  <Badge className={
                    entry.aiAnalysis.health === 'Healthy' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }>
                    {entry.aiAnalysis.health}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Leaf Color:</span>
                    <span className="font-medium text-gray-900">
                      {entry.aiAnalysis.leafColor}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-gray-500 text-xs uppercase font-bold mb-1">
                      Recommendation
                    </p>
                    <p className="text-gray-800">
                      {entry.aiAnalysis.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>

    {/* --- 6. OVERLAYS --- */}
    
    {isChatOpen && (
      <ChatOverlay
        plantName={plant.name}
        plantType={plant.type}
        onClose={() => setIsChatOpen(false)}
      />
    )}

    {/* Fixed Bottom Action Bar */}
    <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white border-t p-4 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <Button
        className="w-full bg-green-600 hover:bg-green-700 shadow-lg h-12 text-lg transition-all active:scale-[0.98]"
        onClick={() => fileInputRef.current?.click()} // Trigger the hidden input
      >
        <Camera className="w-5 h-5 mr-2" />
        Capture Daily Photo
      </Button>
    </div>
    
    <div className="h-24" /> {/* Spacer for safe area */}
  </div>
);
}