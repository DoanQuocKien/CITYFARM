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
        "minLight": 0.3, "maxLight": 0.8, "minTemp": 15, "maxTemp": 28,
        "difficulty": "Easy", "harvestDays": "30-35 days"
    },
    {
        "id": "2", "name": "Thai Chili", "scientificName": "Capsicum annuum",
        "imageUrl": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=80",
        "minLight": 0.7, "maxLight": 1.0, "minTemp": 20, "maxTemp": 35,
        "difficulty": "Medium", "harvestDays": "60-80 days"
    },
    {
        "id": "3", "name": "Mint", "scientificName": "Mentha",
        "imageUrl": "https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=1000&q=80",
        "minLight": 0.2, "maxLight": 0.7, "minTemp": 15, "maxTemp": 32,
        "difficulty": "Easy", "harvestDays": "40-50 days"
    },
    # NEW PLANT ADDED
    {
        "id": "4", "name": "Green Onion", "scientificName": "Allium fistulosum",
        "imageUrl": "https://www.almanac.com/sites/default/files/styles/or/public/image_nodes/Untitled%20design%20%288%29_1.jpg?itok=leansz0S",
        "minLight": 0.4, "maxLight": 1.0, "minTemp": 10, "maxTemp": 30,
        "difficulty": "Easy", "harvestDays": "50-60 days"
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
SMART_KITS = {
    "CITYFARM-TOMATO-01": {
        "name": "Cherry Tomato", "type": "Vegetable", "harvestDays": 60, "daysGrowing": 0, "health": "healthy",
        "imageUrl": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=80",
        "nextWatering": "Today, 5:00 PM", "nextFertilizing": "In 14 days", "progress": 0
    },
    "CITYFARM-LETTUCE-01": {
        "name": "Green Lettuce", "type": "Vegetable", "harvestDays": 35, "daysGrowing": 0, "health": "healthy",
        "imageUrl": "https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?auto=format&fit=crop&w=1000&q=80",
        "nextWatering": "Tomorrow, 8:00 AM", "nextFertilizing": "In 7 days", "progress": 0
    },
    "CITYFARM-MINT-01": {
        "name": "Peppermint", "type": "Herb", "harvestDays": 45, "daysGrowing": 0, "health": "healthy",
        "imageUrl": "https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=1000&q=80",
        "nextWatering": "Today, 7:00 AM", "nextFertilizing": "In 30 days", "progress": 0
    },
    # NEW KIT ADDED
    "CITYFARM-ONION-01": {
        "name": "Green Onion", "type": "Herb", "harvestDays": 55, "daysGrowing": 0, "health": "healthy",
        "imageUrl": "https://www.almanac.com/sites/default/files/styles/or/public/image_nodes/Untitled%20design%20%288%29_1.jpg?itok=leansz0S",
        "nextWatering": "Tomorrow, 7:00 AM", "nextFertilizing": "In 15 days", "progress": 0
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
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")

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
    try:
        image_bytes = await read_image_file(file)

        # UPDATED PROMPT WITH GREEN ONION
        plant_list_text = """
        1. Cherry Tomato (ID: CITYFARM-TOMATO-01) - Needs full sun.
        2. Green Lettuce (ID: CITYFARM-LETTUCE-01) - Prefers partial shade, cool.
        3. Peppermint (ID: CITYFARM-MINT-01) - Thrives in shade/moist.
        4. Green Onion (ID: CITYFARM-ONION-01) - Versatile, likes sun, easy to grow.
        """

        prompt = f"""
        You are an expert gardener. Look at this photo.
        I have these 4 specific plants:
        {plant_list_text}
        
        TASK:
        1. Analyze the light and environment in the photo.
        2. Rank the 4 plants above from 'Best Fit' (highest match) to 'Worst Fit' (lowest match).
        3. Provide a logic score (0-100) and reason (in one short sentence) for each.

        OUTPUT JSON format (DO NOT USE MARKDOWN QUOTES ``` ```):
        {{
            "analysis": {{
                "lightLevel": "High/Partial/Low",
                "lightScore": 85,
                "areaSize": "approx m2",
                "climate": "predicted climate",
                "explanation": "Reason."
            }},
            "recommendations": [
                {{
                    "id": "CITYFARM-ONION-01",
                    "name": "Green Onion",
                    "matchScore": 90,
                    "reason": "Great spot for onions.",
                    "imageUrl": "",
                    "difficulty": "Easy",
                    "harvestDays": "55"
                }},
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
        elif "onion" in name_lower:   filename = "onion.png"

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
        "water": (
            "Tomatoes are thirsty but hate 'wet feet'. Water deeply 2-3 times a week rather than sprinkling daily. "
            "Consistency is key—if you water irregularly, the fruit skins might split or you'll get Blossom End Rot "
            "(black bottoms on fruits). Avoid getting water on the leaves to prevent fungus."
        ),
        "sun": (
            "Tomatoes are sun-worshippers! They need 6-8 hours of direct, intense sunlight. "
            "If your plant looks 'leggy' (tall and thin with few leaves), it's reaching for light. "
            "In extreme heat (>35°C), they might stop setting fruit—provide some afternoon shade if that happens."
        ),
        "yellow": (
            "Yellow leaves can mean a few things. 1) Bottom leaves turning yellow? Usually just lack of Nitrogen or old age—snip them off. "
            "2) Yellow spots with brown centers? Could be Early Blight (fungus). "
            "3) Yellowing between veins? Magnesium deficiency. Try adding a bit of Epsom salts."
        ),
        "pests": (
            "Common enemies: 1) Aphids (sticky sap on leaves)—spray with soapy water. "
            "2) Tomato Hornworms (huge green caterpillars)—pick them off by hand! "
            "3) Whiteflies—try planting basil nearby as a companion to repel them."
        ),
        "default": (
            "I'm your Cherry Tomato expert. Remember to 'prune the suckers' (the little shoots between the main stem and branches) "
            "to focus energy on fruit production. Shake the flowers gently to help pollination!"
        )
    },
    "lettuce": {
        "water": (
            "Lettuce has shallow roots, so it needs consistent moisture. If the soil dries out, the leaves turn bitter. "
            "Water gently in the morning so leaves dry off before nightfall—this prevents mold. "
            "Mulch around the base to keep the soil cool."
        ),
        "sun": (
            "In hot climates like HCMC, Lettuce prefers morning sun and afternoon shade. "
            "If it gets too hot/sunny, the plant will 'bolt' (send up a flower stalk), making the leaves bitter and inedible. "
            "If you see a tall stalk forming, harvest immediately!"
        ),
        "yellow": (
            "Yellowing is tricky with Lettuce. 1) Pale/Yellow overall? Likely Nitrogen deficiency or not enough light. "
            "2) Yellow/Brown mushy lower leaves? Root rot from overwatering. Let the soil dry slightly. "
            "3) Tip burn (brown edges)? Inconsistent watering."
        ),
        "pests": (
            "Slugs and snails love salad as much as you do. Check underneath leaves and pots. "
            "If you see squiggly white lines on leaves, that's Leaf Miners—pinch off those leaves. "
            "Aphids also hide in the center folds."
        ),
        "default": (
            "I'm your Lettuce specialist. Pro-tip: Don't pull the whole plant! Use the 'Cut and Come Again' method—"
            "harvest just the outer leaves, and the center will keep growing new ones for weeks."
        )
    },
    "mint": {
        "water": (
            "Mint is hard to kill but loves moisture. Keep the soil consistently damp, like a wrung-out sponge. "
            "If it wilts, water immediately, and it will likely bounce back within hours. "
            "However, never let it sit in stagnant water."
        ),
        "sun": (
            "Mint is versatile. It tolerates full sun but actually produces better flavor in partial shade. "
            "If stems are stretching out long and thin, move it to a brighter spot. "
            "If leaves look scorched/crispy, it's getting too much direct noon sun."
        ),
        "yellow": (
            "1) Orange/Yellow dusty spots? That's Mint Rust fungus—remove infected leaves immediately and improve airflow. "
            "2) Yellowing near the bottom? Your pot might be too small! Mint roots are aggressive and might be 'root bound'."
        ),
        "pests": (
            "Mint is a natural pest repellent for other plants! But it can get Spider Mites (look for tiny webs) "
            "or Loopers (small green caterpillars). A strong spray of water usually knocks them off."
        ),
        "default": (
            "I'm your Mint Buddy. Warning: I have aggressive roots called 'runners'. "
            "ALWAYS keep me in my own pot, or I will take over your entire garden! "
            "Pinch off the top leaves regularly to make me grow bushier."
        )
    },
    "onion": {
        "water": (
            "Green Onions have a small root system. Keep the soil evenly moist but well-drained. "
            "Soggy soil causes the bulbs to rot and smell bad. "
            "If the tips turn brown and dry, you might be underwatering."
        ),
        "sun": (
            "We need energy! Give us at least 6 hours of sun. "
            "If the stalks are floppy and pale, they aren't getting enough light. "
            "They tolerate heat well but appreciate a breeze."
        ),
        "yellow": (
            "1) Silver/White patches? Thrips (tiny bugs) are eating the green pigment. "
            "2) Yellowing from the tip down? Natural aging, or inconsistent watering. "
            "3) Mushy yellow base? Bulb rot—stop watering immediately."
        ),
        "pests": (
            "Thrips are the main enemy—they look like tiny dark threads in the folds of the onion. "
            "Onion Maggots can also attack the roots. "
            "Generally, we are very hardy against most pests."
        ),
        "default": (
            "I'm your Green Onion assistant. Did you know you can regrow me? "
            "Cut the green stalk for cooking, leave 1 inch of the white base, and I'll grow back in days! "
            "Harvest the outer leaves first to let the center keep growing."
        )
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