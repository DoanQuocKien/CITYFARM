import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import httpx  # For making weather API calls

app = FastAPI()

# Enable CORS (Allows your React app to talk to Python)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
OPENWEATHER_API_KEY = "eed42e8c8c01866bc6725bd6298c7c6a" # Replace with a free key for the MVP

# --- EXTENDED PLANT DATABASE ---
# Now includes temperature and humidity preferences
PLANT_DATABASE = [
    {
        "id": "1", "name": "Green Lettuce", "scientificName": "Lactuca sativa",
        "imageUrl": "https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?auto=format&fit=crop&w=1000&q=80",
        "minLight": 0.3, "maxLight": 0.8,
        "minTemp": 15, "maxTemp": 28, # Lettuce hates heat (Vietnam risk!)
        "difficulty": "Easy", "harvestDays": "30-35 days"
    },
    {
        "id": "2", "name": "Thai Chili", "scientificName": "Capsicum annuum",
        "imageUrl": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=80",
        "minLight": 0.7, "maxLight": 1.0, 
        "minTemp": 20, "maxTemp": 35, # Loves heat
        "difficulty": "Medium", "harvestDays": "60-80 days"
    },
    {
        "id": "3", "name": "Mint", "scientificName": "Mentha",
        "imageUrl": "https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=1000&q=80",
        "minLight": 0.2, "maxLight": 0.7,
        "minTemp": 15, "maxTemp": 32,
        "difficulty": "Easy", "harvestDays": "40-50 days"
    }
]

async def get_weather_data(lat: str, lon: str):
    """Fetches real weather. Defaults to HCMC mock data if API fails."""
    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "YOUR_API_KEY_HERE":
        # Mock Data (HCMC Typical Weather)
        return {"temp": 32, "humidity": 80, "desc": "Hot & Humid"}
    
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={OPENWEATHER_API_KEY}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            data = resp.json()
            return {
                "temp": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "desc": data["weather"][0]["description"]
            }
    except:
        return {"temp": 30, "humidity": 75, "desc": "Warm"}

def analyze_light_level(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert('L')
    return np.mean(np.array(image)) / 255.0

# --- MOCK KIT DATABASE ---
# These are the "3 types of QR code" you requested
SMART_KITS = {
    "CITYFARM-TOMATO-01": {
        "name": "Cherry Tomato",
        "type": "Vegetable",
        "harvestDays": 60,
        "daysGrowing": 0, # Fresh kit starts at 0
        "health": "healthy",
        "imageUrl": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=80",
        "nextWatering": "Today, 5:00 PM",
        "nextFertilizing": "In 14 days",
        "progress": 0
    },
    "CITYFARM-LETTUCE-01": {
        "name": "Green Lettuce",
        "type": "Vegetable",
        "harvestDays": 35,
        "daysGrowing": 0,
        "health": "healthy",
        "imageUrl": "https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?auto=format&fit=crop&w=1000&q=80",
        "nextWatering": "Tomorrow, 8:00 AM",
        "nextFertilizing": "In 7 days",
        "progress": 0
    },
    "CITYFARM-MINT-01": {
        "name": "Peppermint",
        "type": "Herb",
        "harvestDays": 45,
        "daysGrowing": 0,
        "health": "healthy",
        "imageUrl": "https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=1000&q=80",
        "nextWatering": "Today, 7:00 AM",
        "nextFertilizing": "In 30 days",
        "progress": 0
    }
}

@app.post("/api/kit/scan")
async def scan_kit(code: str = Form(...)):
    """
    Simulates scanning a QR code.
    Input: The text string from the QR (e.g., "CITYFARM-TOMATO-01")
    """
    kit = SMART_KITS.get(code)
    
    if not kit:
        return {"error": "Invalid or Unknown Kit ID"}, 404
    
    # Return the full plant object to be added to the frontend
    import uuid
    new_plant = kit.copy()
    new_plant["id"] = str(uuid.uuid4()) # Generate unique ID for this specific pot
    new_plant["plantedDate"] = "2026-01-16" # Today's date (mocked)
    
    return {"status": "success", "plant": new_plant}

@app.post("/api/scan/analyze")
async def analyze_space(
    file: UploadFile = File(...),
    lat: str = Form("10.82"), # Default to HCMC latitude
    lon: str = Form("106.62")
):
    # 1. Parallel Processing: Analyze Image + Fetch Weather
    contents = await file.read()
    brightness = analyze_light_level(contents)
    weather = await get_weather_data(lat, lon)
    
    current_temp = weather['temp']

    # 2. Logic: The "Smart" Scoring Engine
    recommendations = []
    for plant in PLANT_DATABASE:
        score = 100
        reasons = []

        # --- Light Check ---
        if plant["minLight"] <= brightness <= plant["maxLight"]:
            reasons.append("Perfect light match")
        elif abs(brightness - plant["minLight"]) < 0.2:
            score -= 20
            reasons.append("Light is okay, but not ideal")
        else:
            score -= 50
            reasons.append("Lighting is poor for this plant")

        # --- Weather Check (The new logic) ---
        if current_temp > plant["maxTemp"]:
            score -= 40 # Heavy penalty for heat sensitivity
            reasons.append(f"Too hot right now ({current_temp}°C)")
        elif current_temp < plant["minTemp"]:
            score -= 40
            reasons.append("Too cold right now")
        else:
            reasons.append("Climate friendly")

        # Finalize Plant Object
        plant_copy = plant.copy()
        plant_copy["matchScore"] = max(0, score) # No negative scores
        plant_copy["reason"] = ". ".join(reasons[:2]) # Show top 2 reasons
        
        recommendations.append(plant_copy)

    # Sort: Highest score first
    recommendations.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "analysis": {
            "lightLevel": "High Sunlight" if brightness > 0.6 else "Partial Shade",
            "lightScore": round(brightness * 100),
            "weather": weather, # Pass weather back to frontend
            "climate": f"{weather['temp']}°C, {weather['desc']}"
        },
        "recommendations": recommendations
    }

from pydantic import BaseModel

# --- 1. UPDATE THE REQUEST MODEL ---
class ChatRequest(BaseModel):
    message: str
    plantType: str
    plantName: str  # NEW: We need the specific name (e.g., "Cherry Tomato")

# --- 2. UPDATE KNOWLEDGE BASE ---
# Ensure keys are lowercase for easier matching
KNOWLEDGE_BASE = {
    "tomato": {
        "water": "Tomatoes need deep watering. Keep the soil consistently moist but not waterlogged to prevent blossom end rot.",
        "sun": "They love sun! Ensure at least 6-8 hours of direct sunlight.",
        "yellow": "Yellow leaves on tomatoes often indicate Nitrogen deficiency or early blight. Check the lower leaves first.",
        "pests": "Watch out for aphids and hornworms. Neem oil is a good organic treatment.",
        "default": "I am your Tomato Expert. Ask me about watering, pruning suckers, or pests!"
    },
    "lettuce": {
        "water": "Lettuce has shallow roots. Water frequently/lightly to keep soil cool and moist.",
        "sun": "Partial shade is best in hot climates like HCMC. Too much sun makes it bitter (bolting).",
        "yellow": "Yellowing often means overwatering or lack of nitrogen.",
        "pests": "Slugs love lettuce. Try crushing eggshells around the base.",
        "default": "I am your Lettuce Specialist. Keep me cool and I'll grow fast!"
    },
    "mint": {
        "water": "Mint loves moisture. Don't let it dry out completely.",
        "sun": "Mint is hardy but prefers partial shade in the afternoon.",
        "yellow": "Yellow leaves? You might be overwatering, or it's root bound.",
        "pests": "Mint is actually a natural pest repellent! But watch for spider mites.",
        "default": "I'm your Mint Buddy. Warning: I spread fast, so keep me in a pot!"
    }
}

@app.post("/api/chat")
async def chat_agent(chat: ChatRequest):
    # 1. SEARCH LOGIC: Check Plant Name FIRST, then Type
    plant_knowledge = None
    
    # Combine name and type for a broad search (e.g., "Cherry Tomato Vegetable")
    search_context = (chat.plantName + " " + chat.plantType).lower()

    for key in KNOWLEDGE_BASE:
        if key in search_context:
            plant_knowledge = KNOWLEDGE_BASE[key]
            break
            
    if not plant_knowledge:
        return {"response": f"I don't have specific data for {chat.plantName} yet, but I can help with general gardening!"}

    # 2. KEYWORD MATCHING
    msg = chat.message.lower()
    if "water" in msg:
        return {"response": plant_knowledge["water"]}
    elif "sun" in msg or "light" in msg:
        return {"response": plant_knowledge["sun"]}
    elif "yellow" in msg or "sick" in msg or "dying" in msg:
        return {"response": plant_knowledge["yellow"]}
    elif "bug" in msg or "pest" in msg:
        return {"response": plant_knowledge["pests"]}
    else:
        return {"response": plant_knowledge["default"]}