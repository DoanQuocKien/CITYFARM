import { useState } from 'react';
import { ArrowLeft, Camera, Droplet, Sun, TrendingUp, CheckCircle2, Clock, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ChatOverlay } from './ChatOverlay';
import type { Plant } from '../App';

interface PlantDetailScreenProps {
  plant: Plant;
  onBack: () => void;
}

export function PlantDetailScreen({ plant, onBack }: PlantDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<'Timeline' | 'Care' | 'Journal'>('Timeline');
  const [isChatOpen, setIsChatOpen] = useState(false);

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
  const journal = [
    {
      id: '1',
      date: '2026-01-11',
      photo: plant.imageUrl,
      aiAnalysis: {
        health: 'Healthy',
        leafColor: 'Vibrant green',
        issues: 'None detected',
        recommendation: 'Continue current care routine',
      },
    }
  ];

  return (
    <div className="min-h-screen bg-white relative pb-32">
      {/* Header Image Area */}
      <div className="relative h-56">
        <img
          src={plant.imageUrl}
          alt={plant.name}
          className="w-full h-full object-cover"
        />
        {/* Dark Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* HEADER CONTENT ROW */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          {/* Left Side: Plant Info */}
          <div className="text-white flex-1 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold shadow-black drop-shadow-md">{plant.name}</h1>
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
            <p className="text-sm text-gray-200 font-medium">{plant.type} • Day {plant.daysGrowing}</p>
          </div>

          {/* Right Side: AI Assistant Button (Glassmorphism) */}
          <Button 
            onClick={() => setIsChatOpen(true)}
            size="sm"
            className="h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white shadow-lg transition-all"
          >
             <Bot className="w-4 h-4 mr-2 text-yellow-300" />
             Gardening Assistance
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{plant.progress || 0}%</p>
            <p className="text-xs text-gray-600">Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{plant.daysGrowing}</p>
            <p className="text-xs text-gray-600">Days Growing</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{Math.max(0, plant.harvestDays - plant.daysGrowing)}</p>
            <p className="text-xs text-gray-600">Days to Harvest</p>
          </div>
        </div>
      </div>

      {/* Growth Progress Bar */}
      <div className="px-6 py-4 bg-white">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-600">Growth to Harvest</span>
          <span className="font-semibold text-gray-900">{plant.daysGrowing} / {plant.harvestDays} days</span>
        </div>
        <Progress value={Math.min(100, (plant.daysGrowing / (plant.harvestDays || 1)) * 100)} className="h-3" />
      </div>

      {/* Upcoming Care */}
      <div className="px-6 py-4 bg-yellow-50 border-y border-yellow-200">
        <h3 className="font-semibold text-gray-900 mb-3">Upcoming Care</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-yellow-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Water Plant</p>
              <p className="text-sm text-gray-600">{plant.nextWatering}</p>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Done
            </Button>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-yellow-100 shadow-sm">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Add Fertilizer</p>
              <p className="text-sm text-gray-600">{plant.nextFertilizing}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Tab Content */}
      <div className="px-6 py-6 space-y-4">
        {activeTab === 'Timeline' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Growth Stages</h3>
            <div className="relative">
              {growthTimeline.map((stage, index) => (
                <div key={stage.day} className="flex gap-4 pb-6 last:pb-0 relative">
                  {/* Timeline Line */}
                  {index < growthTimeline.length - 1 && (
                    <div className={`absolute left-5 top-12 w-0.5 h-full ${stage.completed ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${stage.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {stage.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  {/* Card */}
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
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
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

        {activeTab === 'Journal' && (
             <div className="space-y-4">
               {journal.map((entry) => (
                <Card key={entry.id} className="overflow-hidden">
                  <div className="aspect-video">
                    <img
                      src={entry.photo}
                      alt={`Journal entry ${entry.date}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <Badge className="bg-green-100 text-green-700">
                        AI Analyzed
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Health:</span>
                            <span className="font-medium text-green-600">{entry.aiAnalysis.health}</span>
                        </div>
                        <div className="pt-2 border-t">
                            <p className="text-gray-600 mb-1">AI Recommendation:</p>
                            <p className="text-gray-900 font-medium">{entry.aiAnalysis.recommendation}</p>
                        </div>
                    </div>
                  </div>
                </Card>
               ))}
             </div>
        )}
      </div>

      {/* Chat Overlay (Conditional) */}
      {isChatOpen && (
        <ChatOverlay 
            plantName={plant.name}
            plantType={plant.type}
            onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white border-t p-4 z-30">
        <Button className="w-full bg-green-600 hover:bg-green-700 shadow-lg" size="lg">
          <Camera className="w-5 h-5 mr-2" />
          Capture Daily Photo
        </Button>
      </div>
    </div>
  );
}