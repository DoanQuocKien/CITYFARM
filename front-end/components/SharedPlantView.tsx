import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import type { Plant } from '../App';

interface SharedPlantViewProps {
  plant: Plant & { journal?: Array<{ photo: string; date: string }> };
  onBack: () => void;
}

export function SharedPlantView({ plant, onBack }: SharedPlantViewProps) {
  const [activeTab, setActiveTab] = useState<'Timeline' | 'Journal'>('Timeline');

  const growthTimeline = [
    { day: 1, stage: 'Planted', date: plant.plantedDate, completed: true },
    { day: 7, stage: 'Sprouting', date: new Date(new Date(plant.plantedDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: plant.daysGrowing >= 7 },
    { day: 14, stage: 'Vegetative Growth', date: new Date(new Date(plant.plantedDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: plant.daysGrowing >= 14 },
    { day: Math.floor(plant.harvestDays * 0.75), stage: 'Flowering', date: new Date(new Date(plant.plantedDate).getTime() + Math.floor(plant.harvestDays * 0.75) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: plant.daysGrowing >= Math.floor(plant.harvestDays * 0.75) },
    { day: plant.harvestDays, stage: 'Harvest Ready', date: new Date(new Date(plant.plantedDate).getTime() + plant.harvestDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: plant.daysGrowing >= plant.harvestDays },
  ];

  return (
    <div className="min-h-screen bg-white relative pb-20">
      {/* HERO SECTION (Image & Header) */}
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

        {/* Plant Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
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
        </div>
      </div>

      {/* KEY METRICS */}
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

      {/* PROGRESS BAR */}
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

      {/* TABS NAVIGATION */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex px-6">
          {['Timeline', 'Journal'].map((tab) => (
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

      {/* TAB CONTENT */}
      <div className="px-6 py-6 space-y-4">
        {/* Timeline */}
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

        {/* Journal */}
        {activeTab === 'Journal' && (
          <div className="space-y-4">
            {plant.journal && plant.journal.length > 0 ? (
              plant.journal.map((entry, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    <img
                      src={entry.photo}
                      alt={`Journal entry ${entry.date}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                      {entry.date}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No journal entries yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note: Read-only, cannot edit or interact beyond viewing */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-200 text-center text-xs text-blue-700">
        📖 This is a shared view of someone's garden. You can't modify this plant.
      </div>
    </div>
  );
}
