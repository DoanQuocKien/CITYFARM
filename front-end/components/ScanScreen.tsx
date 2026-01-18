import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Sparkles, Sun, CloudRain, MapPin, ArrowRight, CheckCircle2, Upload, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import type { Screen } from '../App';

interface ScanScreenProps {
  onNavigate: (screen: Screen) => void;
}

type ScanStep = 'camera' | 'analyzing' | 'results' | 'visualization';

export function ScanScreen({ onNavigate }: ScanScreenProps) {
  const [scanStep, setScanStep] = useState<ScanStep>('camera');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Camera & Image State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null); // Keep track of stream to stop it later

  // 1. CLEANUP: Stop camera when component unmounts or state changes
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // 2. INITIALIZATION: This effect runs ONLY when isCameraActive becomes true
  useEffect(() => {
    const initCamera = async () => {
      if (isCameraActive) {
        setPermissionError(false);
        try {
          // Check if browser supports mediaDevices
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
             throw new Error("Camera API not supported");
          }

          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment', // Prefer back camera
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
          
          streamRef.current = stream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera failed:", err);
          setPermissionError(true);
          setIsCameraActive(false); // Revert UI if failed
        }
      }
    };

    initCamera();
  }, [isCameraActive]);

  // 3. USER ACTION: Just trigger the state change. The Effect above handles the rest.
  const handleStartCameraClick = () => {
    setIsCameraActive(true);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        setCapturedImage(imageDataUrl);
        stopCamera();
        
        // IMPORTANT: Pass the result directly here too
        startAnalysis(imageDataUrl);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // 1. Set state for the UI
        setCapturedImage(result);
        
        // 2. Stop camera
        stopCamera();
        
        // 3. IMPORTANT: Pass the result directly to the function
        startAnalysis(result); 
      };
      reader.readAsDataURL(file);
    }
  };


  // 1. Add state for dynamic data
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Replace the old startAnalysis with this real API call
  const startAnalysis = async (imageSrc?: string) => {
    // Use the passed argument directly, fallback to state only if necessary
    const activeImage = imageSrc || capturedImage;
    
    if (!activeImage) {
        console.error("No image to analyze");
        return;
    }

    setScanStep('analyzing');
    setAnalysisProgress(0);

    // 1. Get Location (Geolocation API)
    let userLat = "10.82"; 
    let userLon = "106.62";

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        userLat = position.coords.latitude.toString();
        userLon = position.coords.longitude.toString();
      } catch (e) {
        console.warn("Location access denied, using default.");
      }
    }

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => Math.min(prev + 5, 90));
    }, 100);

    try {
      // MODIFIED: Use activeImage instead of capturedImage
      const res = await fetch(activeImage);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, 'scan.jpg');
      
      formData.append('lat', userLat);
      formData.append('lon', userLon);

      const response = await fetch('http://localhost:8000/api/scan/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setAnalysisResults(data); 
      
      setTimeout(() => {
          setScanStep('results');
      }, 500);

    } catch (error) {
      console.error("Analysis failed:", error);
      clearInterval(progressInterval);
      // Optional: Add error state handling here
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setScanStep('camera');
    setAnalysisProgress(0);
    setIsCameraActive(false); 
  };

  // Mock Data
  const recommendations = [
    {
      id: '1',
      name: 'Green Lettuce',
      scientificName: 'Lactuca sativa',
      difficulty: 'Easy',
      harvestDays: '30-35 days',
      matchScore: 95,
      reason: 'Perfect for partial shade areas',
      imageUrl: 'https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      sunlight: 'Partial Shade',
      water: 'Daily',
      climate: 'HCMC Friendly',
    },
    {
      id: '2',
      name: 'Mint',
      scientificName: 'Mentha',
      difficulty: 'Easy',
      harvestDays: '40-50 days',
      matchScore: 92,
      reason: 'Thrives in humid environments',
      imageUrl: 'https://images.unsplash.com/photo-1633916872730-7199a52e483b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      sunlight: 'Partial Shade',
      water: 'Daily',
      climate: 'HCMC Friendly',
    },
    {
      id: '3',
      name: 'Cherry Tomato',
      scientificName: 'Solanum lycopersicum',
      difficulty: 'Medium',
      harvestDays: '60-80 days',
      matchScore: 78,
      reason: 'Needs more sunlight - place near window',
      imageUrl: 'https://images.unsplash.com/photo-1748432171507-c1d62fe2e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      sunlight: 'Full Sun',
      water: 'Every 2 days',
      climate: 'HCMC Friendly',
    },
  ];

  const [selectedPlantForViz, setSelectedPlantForViz] = useState<any>(null); // NEW: Track selected plant
  const handleVisualize = (plant: any) => {
  setSelectedPlantForViz(plant);
  setScanStep('visualization');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Scan Your Space</h2>
        <button
          onClick={() => { stopCamera(); onNavigate('home'); }}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* HIDDEN INPUTS */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Step 1: Camera View */}
      {scanStep === 'camera' && (
        <div className="relative h-[calc(100vh-80px)] bg-gray-900 overflow-hidden flex flex-col">
          
          {/* STATE A: Camera Inactive (Permission Request) */}
          {!isCameraActive ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-white space-y-6 w-full max-w-md">
                
                {/* Clickable Icon Area */}
                <div 
                  onClick={handleStartCameraClick}
                  className="cursor-pointer group"
                >
                  <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-700 transition-colors ring-4 ring-transparent group-hover:ring-green-500/30">
                    <Camera className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
                
                {permissionError ? (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
                    <p className="font-medium text-red-200">Camera Access Denied</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Check your browser settings or use the upload button below.
                      <br/>
                      <span className="text-xs opacity-70">(Note: Camera requires HTTPS or localhost)</span>
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold">Ready to analyze?</h3>
                    <p className="text-gray-400">
                      Tap the camera to scan your balcony for light, dimensions, and climate data.
                    </p>
                    <Button 
                      onClick={handleStartCameraClick}
                      className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-semibold shadow-lg shadow-green-900/20"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Start Camera
                    </Button>
                  </>
                )}
                
                <div className="flex items-center gap-4 w-full py-2">
                  <div className="h-px bg-gray-800 flex-1" />
                  <span className="text-gray-600 text-sm font-medium">OR</span>
                  <div className="h-px bg-gray-800 flex-1" />
                </div>

                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-gray-700 bg-transparent text-white hover:bg-gray-800 h-12"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload from Gallery
                </Button>
              </div>
            </div>
          ) : (
            /* STATE B: Active Camera Feed */
            <div className="relative w-full h-full flex flex-col bg-black animate-in fade-in duration-300">
              {/* Video Feed */}
              <div className="flex-1 relative overflow-hidden">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Guide Frame Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-[80%] aspect-square max-w-sm border-2 border-white/50 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                     <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 -mt-1 -ml-1 rounded-tl-lg" />
                     <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 -mt-1 -mr-1 rounded-tr-lg" />
                     <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 -mb-1 -ml-1 rounded-bl-lg" />
                     <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 -mb-1 -mr-1 rounded-br-lg" />
                  </div>
                </div>
              </div>

              {/* Camera Controls Bar */}
              <div className="h-32 bg-black flex items-center justify-around px-8 z-20 pb-4">
                {/* Gallery Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>

                {/* SHUTTER BUTTON */}
                <button
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full border-[6px] border-white flex items-center justify-center hover:scale-105 transition-transform active:scale-95 touch-manipulation"
                  aria-label="Take Photo"
                >
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-200" />
                </button>

                {/* Close/Stop Button */}
                <button 
                  onClick={stopCamera}
                  className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Analyzing */}
      {scanStep === 'analyzing' && capturedImage && (
        <div className="p-6 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
          <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95">
            <div className="relative">
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={capturedImage}
                  alt="Captured space"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-green-900/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                <div className="text-white text-center p-4">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 animate-pulse text-yellow-300" />
                  <p className="font-semibold text-lg">AI is analyzing your space...</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Progress value={analysisProgress} className="h-3 bg-gray-100" indicatorClassName="bg-green-600" />
              <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full transition-colors duration-300 ${analysisProgress >= 30 ? 'bg-green-100' : 'bg-gray-200'}`}>
                     <Sun className={`w-4 h-4 ${analysisProgress >= 30 ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <span className={analysisProgress >= 30 ? 'text-gray-900 font-medium' : ''}>Detecting light intensity...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full transition-colors duration-300 ${analysisProgress >= 60 ? 'bg-green-100' : 'bg-gray-200'}`}>
                     <MapPin className={`w-4 h-4 ${analysisProgress >= 60 ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <span className={analysisProgress >= 60 ? 'text-gray-900 font-medium' : ''}>Measuring available area...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full transition-colors duration-300 ${analysisProgress >= 90 ? 'bg-green-100' : 'bg-gray-200'}`}>
                     <CloudRain className={`w-4 h-4 ${analysisProgress >= 90 ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <span className={analysisProgress >= 90 ? 'text-gray-900 font-medium' : ''}>Matching HCMC climate data...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Results View - Integrated with Python Backend Data */}
      {scanStep === 'results' && analysisResults && (
        <div className="pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Analysis Summary Card */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <h3 className="text-xl font-bold">Analysis Complete</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Dynamic Light Level */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <Sun className="w-5 h-5 mb-2 text-yellow-300" />
                <p className="text-xs text-green-100">Light Level</p>
                <p className="font-semibold text-sm">
                  {analysisResults.analysis.lightLevel} ({analysisResults.analysis.lightScore}%)
                </p>
              </div>

              {/* Area Size (Mocked/Static for MVP) */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <MapPin className="w-5 h-5 mb-2 text-green-300" />
                <p className="text-xs text-green-100">Area Size</p>
                <p className="font-semibold text-sm">
                  {analysisResults.analysis.areaSize || "2.5 m²"}
                </p>
              </div>

              {/* Dynamic Weather/Climate */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <CloudRain className="w-5 h-5 mb-2 text-blue-300" />
                <p className="text-xs text-green-100">Climate</p>
                <p className="font-semibold text-sm capitalize">
                  {/* Shows: "32°C, Scattered Clouds" */}
                  {analysisResults.analysis.climate || "Hot & Humid"}
                </p>
              </div>

              {/* Capacity (Static for MVP) */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <CheckCircle2 className="w-5 h-5 mb-2 text-emerald-300" />
                <p className="text-xs text-green-100">Capacity</p>
                <p className="font-semibold text-sm">3 plants</p>
              </div>
            </div>
          </div>

          <div className="px-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Top Matches
                </h3>
                <p className="text-sm text-gray-600">
                  Based on your balcony conditions
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRetake} className="text-green-600 hover:text-green-700">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Scan Again
              </Button>
            </div>

            {/* Dynamic Plant Recommendations */}
            <div className="space-y-4 mb-6">
              {analysisResults.recommendations.map((plant: any) => (
                <Card key={plant.id} className="overflow-hidden border-0 shadow-md ring-1 ring-gray-100">
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
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
                          <Badge
                            className={`mt-1 ${
                              plant.matchScore >= 90
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            {plant.matchScore}% Match
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{plant.reason}</p>
                      
                      {/* NEW: Individual Visualize Button */}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full border-green-600 text-green-700 hover:bg-green-50"
                        onClick={() => handleVisualize(plant)}
                      >
                        <Sparkles className="w-3 h-3 mr-2" />
                        Visualize This
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Removed the generic "See Your Future Garden" button from here */}
            
            {/* Visualization Button (Leading to Step 4) */}
            <div className="space-y-3">
              <Button
                onClick={() => setScanStep('visualization')}
                className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                See Your Future Garden (AI Preview)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: AI Visualization */}
      {scanStep === 'visualization' && capturedImage && selectedPlantForViz && (
        <div className="pb-6 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Back Button Header */}
          <div className="px-6 py-2">
             <Button 
               variant="ghost" 
               onClick={() => setScanStep('results')}
               className="text-gray-600 pl-0 hover:text-green-600"
             >
               <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> {/* Back Arrow */}
               Back to Results
             </Button>
          </div>

          {/* Step 4: AI Visualization (Improved Realism) */}
          {scanStep === 'visualization' && capturedImage && selectedPlantForViz && (
            <div className="pb-6 animate-in fade-in zoom-in-95 duration-500 h-full bg-white flex flex-col">

              {/* AR Viewport */}
              <div className="relative w-full flex-1 bg-gray-900 overflow-hidden">
                
                  {/* 1. User's Photo (The Room) */}
                  <img
                    src={capturedImage}
                    alt="Room"
                    className="w-full h-full object-cover opacity-90"
                  />
                  
                  {/* 2. "Floor" Gradient - Helps blend the feet */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                  {/* 3. The Plant Overlay (Positioned on "Floor") */}
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ 
                        bottom: '15%', // Heuristic: Floor is usually at the bottom
                        perspective: '1000px' // Enables 3D rotation effect
                    }}
                  >
                    {/* Container for Perspective Tricks */}
                    <div className="relative group flex flex-col items-center">
                        
                        {/* A. The Contact Shadow (Crucial for realism) */}
                        <div className="absolute -bottom-4 w-32 h-8 bg-black/60 blur-md rounded-[100%] transform scale-x-150" />
                        
                        {/* B. The Plant Image */}
                        {/* We remove the 'rounded-full' to let the plant shape stand naturally */}
                        <img 
                          src={selectedPlantForViz.imageUrl} 
                          className="w-48 h-48 object-cover rounded-2xl drop-shadow-2xl z-10" // Add rounded-2xl if using square photos
                          style={{
                              // Visual Trick: Tilt it slightly back to match floor perspective
                              transform: 'rotateX(10deg)', 
                              transformOrigin: 'bottom center'
                          }}
                          alt="Projected plant"
                        />

                        {/* C. The Label (Floating above) */}
                        <div className="absolute -top-12 bg-white/90 backdrop-blur text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg border border-white/50 text-green-800 animate-bounce">
                          Start {selectedPlantForViz.name} here?
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/90 rotate-45"></div>
                        </div>
                    </div>
                  </div>
              </div>

          {/* Bottom Action Sheet */}
          <div className="p-6 bg-white rounded-t-2xl -mt-6 relative z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center border border-green-100">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Great Spot!</h3>
                    <p className="text-sm text-gray-600">
                        {selectedPlantForViz.name} will get optimal light here.
                    </p>
                </div>
            </div>

            <Button
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-lg shadow-green-600/20"
                size="lg"
            >
                Add to My Garden
            </Button>
          </div>
        </div>
      )}

          <div className="px-6 pt-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Your {selectedPlantForViz.name} Corner
              </h3>
              <p className="text-sm text-gray-600">
                This spot has the perfect {analysisResults?.analysis.lightLevel} conditions for {selectedPlantForViz.name}. 
                We project a harvest in approx {selectedPlantForViz.harvestDays || "45 days"}.
              </p>
            </div>

            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">Ready to grow this?</p>
                  <p className="text-sm text-gray-600">
                    Get the specific soil mix and pot size for {selectedPlantForViz.name} delivered tomorrow.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-3 pt-2">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-lg shadow-green-600/20"
                size="lg"
              >
                Order {selectedPlantForViz.name} Kit - ₫150,000
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}