import { Camera, Leaf, TrendingUp, AlertCircle, Droplet, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import type { Screen, Plant } from '../App';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  onPlantClick: (plant: Plant) => void;
}

export function HomeScreen({ onNavigate, onPlantClick }: HomeScreenProps) {
  // Mock data for active plants
  const activePlants: Plant[] = [
    {
      id: '1',
      name: 'Cherry Tomato',
      type: 'Vegetable',
      plantedDate: '2026-01-01',
      daysGrowing: 11,
      harvestDays: 60,
      health: 'healthy',
      imageUrl: 'https://images.unsplash.com/photo-1748432171507-c1d62fe2e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG8lMjBwbGFudCUyMGdyb3dpbmd8ZW58MXx8fHwxNzY4MjMzNjc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
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
      imageUrl: 'https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXR0dWNlJTIwZ3Jvd2luZyUyMHVyYmFufGVufDF8fHx8MTc2ODIzMzY3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      nextWatering: 'Tomorrow, 8:00 AM',
      nextFertilizing: 'In 5 days',
      progress: 43,
    },
  ];

  // Mock reminders for today
  const todayReminders = [
    { id: '1', plant: 'Cherry Tomato', action: 'Water', time: '5:00 PM', icon: Droplet },
    { id: '2', plant: 'Mint', action: 'Check sunlight', time: '6:00 PM', icon: Sun },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-700">CITYFARM</h1>
            <p className="text-sm text-gray-600">Grow clean, live green 🌱</p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Hero CTA - Scan Space */}
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 border-0 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Start Your Garden</h2>
              <p className="text-green-100 text-sm">
                Scan your space & get AI-powered plant recommendations
              </p>
            </div>
            <Camera className="w-8 h-8 text-green-200" />
          </div>
          <Button
            onClick={() => onNavigate('scan')}
            className="w-full bg-white text-green-700 hover:bg-green-50 font-semibold"
            size="lg"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Your Space
          </Button>
        </Card>

        {/* Today's Reminders */}
        {todayReminders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Today's Care Tasks</h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {todayReminders.length} pending
              </Badge>
            </div>
            <div className="space-y-2">
              {todayReminders.map((reminder) => (
                <Card key={reminder.id} className="p-4 border border-orange-200 bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                        <reminder.icon className="w-5 h-5 text-orange-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reminder.plant}</p>
                        <p className="text-sm text-gray-600">{reminder.action}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{reminder.time}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My Garden Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">My Garden</h3>
            <button
              onClick={() => onNavigate('garden')}
              className="text-sm text-green-600 font-medium"
            >
              View All →
            </button>
          </div>

          {activePlants.length > 0 ? (
            <div className="space-y-3">
              {activePlants.map((plant) => (
                <Card
                  key={plant.id}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onPlantClick(plant)}
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={plant.imageUrl}
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{plant.name}</h4>
                          <p className="text-xs text-gray-600">Day {plant.daysGrowing} of {plant.harvestDays}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            plant.health === 'healthy'
                              ? 'bg-green-100 text-green-700'
                              : plant.health === 'warning'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }
                        >
                          {plant.health === 'healthy' ? '● Healthy' : plant.health === 'warning' ? '⚠ Warning' : '✕ Critical'}
                        </Badge>
                      </div>
                      <Progress value={plant.progress} className="h-2 mb-2" />
                      <p className="text-xs text-gray-600">
                        <Droplet className="inline w-3 h-3 mr-1" />
                        {plant.nextWatering}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed border-2">
              <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No plants yet. Start your garden!</p>
              <Button
                onClick={() => onNavigate('scan')}
                variant="outline"
                className="border-green-600 text-green-600"
              >
                Scan Your Space
              </Button>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center bg-green-50 border-green-200">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{activePlants.length}</p>
            <p className="text-xs text-gray-600">Active Plants</p>
          </Card>
          <Card className="p-4 text-center bg-blue-50 border-blue-200">
            <Droplet className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">85%</p>
            <p className="text-xs text-gray-600">Care Rate</p>
          </Card>
          <Card className="p-4 text-center bg-yellow-50 border-yellow-200">
            <Sun className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">28°C</p>
            <p className="text-xs text-gray-600">HCMC Today</p>
          </Card>
        </div>

        {/* Community Teaser */}
        <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Local Green Market</h3>
              <p className="text-sm text-gray-600">
                Fresh produce from verified growers in your district
              </p>
            </div>
            <Leaf className="w-6 h-6 text-emerald-600" />
          </div>
          <Button
            onClick={() => onNavigate('community')}
            variant="outline"
            className="w-full border-emerald-600 text-emerald-700"
          >
            Browse Community →
          </Button>
        </Card>
      </div>
    </div>
  );
}
