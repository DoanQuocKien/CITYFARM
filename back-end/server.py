import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageEnhance, ImageOps
import random
import io
import os
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

from fastapi.responses import JSONResponse
from google import genai
from google.genai import types

API_KEY = "AIzaSyBxV4aiIhlc6-CBLItHDikRWi0CBTZj8w0" 

client = genai.Client(api_key=API_KEY)

# --- HELPER: Convert UploadFile to Bytes ---
async def read_image_file(file: UploadFile) -> bytes:
    return await file.read()

# --- 1. REAL ANALYSIS (Replaces the Mock Logic) ---
@app.post("/api/scan/analyze")
async def analyze_space(
    file: UploadFile = File(...),
    lat: str = Form("10.82"),
    lon: str = Form("106.62")
):
    print(f"Analyzing plant suitability for: {lat}, {lon}...")
    
    try:
        # 1. Read the image
        image_bytes = await read_image_file(file)

        # 2. Construct the Plant List for the AI
        # We tell the AI strictly about the 3 plants you have.
        plant_list_text = """
        1. Cherry Tomato (ID: CITYFARM-TOMATO-01) - Needs full sun (6-8 hours).
        2. Green Lettuce (ID: CITYFARM-LETTUCE-01) - Prefers partial shade, cooler soil.
        3. Peppermint (ID: CITYFARM-MINT-01) - Thrives in shade/partial sun, loves moisture.
        """

        # 3. The Prompt
        prompt = f"""
        You are an expert gardener. Look at this photo of a space.
        
        I have these 3 specific plants:
        {plant_list_text}
        
        TASK:
        1. Analyze the light and environment in the photo.
        2. Rank the 3 plants above from 'Best Fit' (highest match) to 'Worst Fit' (lowest match).
        3. Provide a logic score (0-100) and reason (in short sentences) for each.

        OUTPUT JSON format (Do not use Markdown):
        {{
            "analysis": {{
                "lightLevel": "High Sunlight/Partial Shade/Low Light",
                "lightScore": 85,
                "areaSize": "approx m2",
                "climate": "predicted climate",
                "explanation": "Brief reason about the light."
            }},
            "recommendations": [
                {{
                    "id": "CITYFARM-TOMATO-01",
                    "name": "Cherry Tomato",
                    "matchScore": 95,
                    "reason": "This spot has intense direct sun, perfect for tomatoes.",
                    "imageUrl": "",
                    "difficulty": "Medium",
                    "harvestDays": "60"
                }},
                {{
                    "id": "CITYFARM-LETTUCE-01",
                    "name": "Green Lettuce",
                    "matchScore": 40,
                    "reason": "Too hot and sunny here; lettuce would bolt.",
                    "imageUrl": "",
                    "difficulty": "Easy",
                    "harvestDays": "35"
                }},
                {{
                    "id": "CITYFARM-MINT-01",
                    "name": "Peppermint",
                    "matchScore": 30,
                    "reason": "Likely to dry out too fast in this full sun.",
                    "imageUrl": "",
                    "difficulty": "Easy",
                    "harvestDays": "45"
                }}
            ]
        }}
        """

        # 4. Call Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        # 5. Parse JSON
        import json
        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            lines = raw_text.split('\n')
            if lines[0].startswith("```"): lines = lines[1:]
            if lines[-1].startswith("```"): lines = lines[:-1]
            raw_text = "\n".join(lines)

        result_data = json.loads(raw_text)

        # 6. Re-attach your correct Image URLs and Data
        # The AI does the sorting, but we ensure the image/data is 100% correct from your DB.
        for rec in result_data.get("recommendations", []):
            plant_id = rec.get("id")
            if plant_id in SMART_KITS:
                original_data = SMART_KITS[plant_id]
                rec["imageUrl"] = original_data["imageUrl"] # Restore correct image
                rec["harvestDays"] = f"{original_data['harvestDays']} days"
                rec["name"] = original_data["name"] # Ensure accurate name
        
        return result_data

    except Exception as e:
        print(f"Error: {e}")
        # Safe fallback to prevent crash
        return {
            "error": str(e),
            "analysis": {"lightLevel": "Error", "lightScore": 0},
            "recommendations": []
        }
    
import base64
import json

# --- 2. SMART "AR" VISUALIZATION (With Safety Margins) ---
@app.post("/api/visualize")
async def visualize_garden(
    file: UploadFile = File(...),
    plantName: str = Form(...)
):
    print(f"Generating Lush Garden for {plantName}...")
    
    try:
        # 1. SETUP: Identify Plant & Load Local Image
        filename = "tomato.png"
        name_lower = plantName.lower()
        
        if "lettuce" in name_lower: filename = "lettuce.png"
        elif "mint" in name_lower:    filename = "mint.png"
        elif "tomato" in name_lower:  filename = "tomato.png"

        server_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(server_dir, "..", "img", filename)
        
        try:
            plant_img = Image.open(file_path).convert("RGBA")
        except FileNotFoundError:
            return {"error": f"Image {filename} not found"}, 404

        # Extract stats
        p_width, p_height = plant_img.size
        aspect_ratio = p_width / p_height

        # 2. PREPARE ROOM IMAGE
        room_bytes = await read_image_file(file)
        room_img = Image.open(io.BytesIO(room_bytes)).convert("RGBA")
        img_w, img_h = room_img.size

        # 3. ASK GEMINI (The "Landscape Architect")
        # We ask for a LIST of boxes this time.
        prompt = f"""
        Act as a landscape architect. Look at this room/balcony photo.
        I want to create a LUSH GARDEN by filling the available floor/surface space with MANY pots of the same plant.
        
        PLANT INFO:
        - Name: "{plantName}"
        - Image Aspect Ratio: {aspect_ratio:.2f} (Width/Height)
        
        TASK:
        1. Identify the floor or ground surface. Apply good logic to avoid walls, furniture, obstacles, and potential pathways if identified.
        2. Generate 5 to 15 bounding boxes to place this plant to create a full, natural garden look.
           - Group them naturally (rows if neat, clusters if organic).
           - VARY the sizes: Plants further back (higher in image) must be SMALLER. Plants in front (lower) must be LARGER.
           - Respect perspective and depth.
           - Keep boxes far away from the edges of the photo.
        3. Estimate room brightness (0.0-1.0).

        Return JSON:
        {{
            "layout": [
                [ymin, xmin, ymax, xmax], // Pot #1
                [ymin, xmin, ymax, xmax], // Pot #2
                ...
            ], 
            "brightness_score": 0.5
        }}
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[types.Part.from_bytes(data=room_bytes, mime_type="image/jpeg"), prompt],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )

        vision_data = json.loads(response.text)
        boxes = vision_data.get("layout", [])
        brightness = vision_data.get("brightness_score", 0.5)

        # 4. SORT BY DEPTH (Painter's Algorithm)
        # We must paste the plants "in the back" first, and "in the front" last.
        # In images, "back" usually means higher up (smaller y_max), and "front" means lower down (larger y_max).
        # So we sort by y_max ascending.
        boxes.sort(key=lambda b: b[2]) 

        # 5. COMPOSITE LOOP
        final_comp = Image.new("RGBA", room_img.size)
        final_comp.paste(room_img, (0,0))

        for box in boxes:
            # Parse Coords
            y_min, x_min = (box[0]/1000 * img_h), (box[1]/1000 * img_w)
            y_max, x_max = (box[2]/1000 * img_h), (box[3]/1000 * img_w)
            
            box_width = x_max - x_min
            box_height = y_max - y_min
            
            # Fit Image to Box
            scale_w = (box_width / p_width) * 2.5
            scale_h = (box_height / p_height) * 2.5 # Slightly over-scale to ensure coverage
            scale = min(scale_w, scale_h)
            
            new_w = int(p_width * scale)
            new_h = int(p_height * scale)
            
            # Resize
            current_plant = plant_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # Natural Variation (Optional but looks great)
            # Randomly flip horizontally sometimes so they don't look like clones
            if random.choice([True, False]):
                current_plant = ImageOps.mirror(current_plant)

            # Lighting
            if brightness < 0.6:
                enhancer = ImageEnhance.Brightness(current_plant)
                current_plant = enhancer.enhance(max(0.5, brightness + 0.2))

            # Position
            center_x = x_min + (box_width / 2)
            final_x = int(center_x - (new_w / 2))
            final_y = int(y_max - new_h)

            # Paste (using itself as mask)
            final_comp.paste(current_plant, (final_x, final_y), current_plant)

        # 6. RETURN
        buffered = io.BytesIO()
        final_comp.convert("RGB").save(buffered, format="PNG")
        b64_img = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return {"image": f"data:image/png;base64,{b64_img}"}

    except Exception as e:
        print(f"Error visualizing: {e}")
        return {"error": str(e)}, 500

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