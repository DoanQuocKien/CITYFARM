from click import prompt
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageEnhance, ImageOps
import random
import io
import os
import httpx
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from google import genai
from google.genai import types
from dotenv import load_dotenv
import base64
import json
import uuid
import time
import asyncio
from functools import wraps

app = FastAPI()

# Enable CORS (Allows your React app to talk to Python)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")

# --- RETRY LOGIC FOR GEMINI API ---
def retry_with_backoff(max_retries=3, initial_delay=2, backoff_factor=2, timeout_seconds=60):
    """
    Retry decorator for Gemini API calls with exponential backoff.
    - max_retries: Maximum number of retry attempts
    - initial_delay: Initial delay in seconds between retries
    - backoff_factor: Multiplier for delay after each retry
    - timeout_seconds: Timeout for the API call
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except (TimeoutError, httpx.TimeoutException) as e:
                    last_exception = e
                    if attempt < max_retries:
                        print(f"Timeout on attempt {attempt + 1}/{max_retries + 1}. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        delay *= backoff_factor
                    else:
                        print(f"Max retries reached. Raising timeout error.")
                        raise
                except Exception as e:
                    # Check if it's a rate limit or server error (5xx, 429)
                    error_str = str(e)
                    if any(indicator in error_str for indicator in ["429", "500", "502", "503", "504", "deadline exceeded", "SERVICE_UNAVAILABLE"]):
                        last_exception = e
                        if attempt < max_retries:
                            print(f"API error on attempt {attempt + 1}/{max_retries + 1}: {error_str}. Retrying in {delay}s...")
                            await asyncio.sleep(delay)
                            delay *= backoff_factor
                        else:
                            print(f"Max retries reached. Raising API error.")
                            raise
                    else:
                        # Re-raise non-retryable errors immediately
                        raise
            
            raise last_exception
        return wrapper
    return decorator

# --- CONFIGURATION ---
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY") # Replace with a free key for the MVP

# --- EXTENDED PLANT DATABASE ---
# Now includes temperature and humidity preferences
# --- 1. PLANT DEFINITIONS (Source of Truth) ---
PLANT_DEFS = {
    "TOMATO": {
        "name": "Cherry Tomato", "type": "Vegetable", "harvestDays": 60,
        "imageUrl": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1000&q=80",
        "nextWatering": "Today, 5:00 PM", "nextFertilizing": "In 14 days"
    },
    "LETTUCE": {
        "name": "Green Lettuce", "type": "Vegetable", "harvestDays": 35,
        "imageUrl": "https://images.unsplash.com/photo-1595735931739-0a99f2f0b0aa?auto=format&fit=crop&w=1000&q=80",
        "nextWatering": "Tomorrow, 8:00 AM", "nextFertilizing": "In 7 days"
    },
    "MINT": {
        "name": "Peppermint", "type": "Herb", "harvestDays": 45,
        "imageUrl": "https://images.unsplash.com/photo-1633916872730-7199a52e483b?auto=format&fit=crop&w=1000&q=80",
        "nextWatering": "Today, 7:00 AM", "nextFertilizing": "In 30 days"
    },
    "ONION": {
        "name": "Green Onion", "type": "Herb", "harvestDays": 55,
        "imageUrl": "https://www.almanac.com/sites/default/files/styles/or/public/image_nodes/Untitled%20design%20%288%29_1.jpg?itok=leansz0S",
        "nextWatering": "Tomorrow, 7:00 AM", "nextFertilizing": "In 15 days"
    }
}

# Legacy support for the dev buttons
LEGACY_MAP = {
    "CITYFARM-TOMATO-01": "STAND-TOMATO-LEGACY",
    "CITYFARM-LETTUCE-01": "HANG-LETTUCE-LEGACY",
    "CITYFARM-MINT-01": "TINY-MINT-LEGACY",
    "CITYFARM-ONION-01": "UPGR-ONION-LEGACY"
}

# --- 2. DYNAMIC PARSER (Replaces Hardcoded Dictionary) ---
@app.post("/api/kit/scan")
async def scan_kit(code: str = Form(...)):
    """
    Parses dynamic codes (e.g., STAND-TOMATO-88219)
    """
    # 1. Map legacy codes if necessary
    if code in LEGACY_MAP:
        code = LEGACY_MAP[code]

    try:
        # 2. Parse: KIT-PLANT-ID
        parts = code.split('-')
        if len(parts) < 2:
            return {"error": "Invalid Code Format"}, 400

        plant_key = parts[1].upper() # e.g., "TOMATO"
        
        # 3. Lookup Data
        plant_info = PLANT_DEFS.get(plant_key)
        
        # Fallback partial matching if key isn't exact
        if not plant_info:
             if "TOM" in code: plant_info = PLANT_DEFS["TOMATO"]
             elif "LET" in code: plant_info = PLANT_DEFS["LETTUCE"]
             elif "MIN" in code: plant_info = PLANT_DEFS["MINT"]
             elif "ONI" in code: plant_info = PLANT_DEFS["ONION"]
             else: return {"error": "Unknown Plant Type in Code"}, 404

        # 4. Generate Instance
        new_plant = plant_info.copy()
        new_plant["id"] = str(uuid.uuid4())
        new_plant["plantedDate"] = "2026-01-20"
        new_plant["daysGrowing"] = 0
        new_plant["health"] = "healthy"
        new_plant["progress"] = 0
        
        return {"status": "success", "plant": new_plant}

    except Exception as e:
        return {"error": str(e)}, 500

# --- 3. HELPER ---
async def read_image_file(file: UploadFile) -> bytes:
    return await file.read()

client = genai.Client(api_key=API_KEY)

# --- HELPER FUNCTIONS FOR GEMINI API CALLS ---
@retry_with_backoff(max_retries=3, initial_delay=2, backoff_factor=2)
async def call_gemini_analyze(image_bytes, prompt):
    """
    Call Gemini API for space analysis with automatic retry on timeout/server errors.
    """
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    types.Part.from_text(text=prompt)
                ]
            )
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    return response

@retry_with_backoff(max_retries=3, initial_delay=2, backoff_factor=2)
async def call_gemini_visualize(image_bytes, prompt):
    """
    Call Gemini API for garden visualization with automatic retry on timeout/server errors.
    """
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    types.Part.from_text(text=prompt)
                ]
            )
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    return response

# --- 4. REAL ANALYSIS (Preserved Logic) ---
@app.post("/api/scan/analyze")
async def analyze_space(
    file: UploadFile = File(...),
    lat: str = Form("10.82"),
    lon: str = Form("106.62")
):
    try:
        image_bytes = await read_image_file(file)

        # We keep the prompt exactly as you had it, ensuring high quality output
        plant_list_text = """
        1. Cherry Tomato (ID: TOMATO) - Needs full sun.
        2. Green Lettuce (ID: LETTUCE) - Prefers partial shade, cool.
        3. Peppermint (ID: MINT) - Thrives in shade/moist.
        4. Green Onion (ID: ONION) - Versatile, likes sun, easy to grow.
        """

        prompt = f"""
        You are an expert gardener. Look at this photo.
        I have these 4 specific plants:
        {plant_list_text}
        
        TASK:
        1. Analyze the light and environment in the photo, but remember to base your analysis, especially on light, to rightfully separate sunlights and artificial light and only looking for direct sunlight or potential sunlight source (window, actual outdoor etc.), also consider the climate at lat {lat}, lon {lon} (fetch real current real-time weather data: temperature, humidity).
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
                    "id": "ONION",
                    "name": "Green Onion",
                    "matchScore": 90,
                    "reason": "Great spot for onions.",
                    "imageUrl": "",
                    "difficulty": "Easy",
                    "harvestDays": "55"
                }},
                {{
                    "id": "TOMATO",
                    "name": "Cherry Tomato",
                    "matchScore": 95,
                    "reason": "This spot has intense direct sun, perfect for tomatoes.",
                    "imageUrl": "",
                    "difficulty": "Medium",
                    "harvestDays": "60"
                }},
                {{
                    "id": "LETTUCE",
                    "name": "Green Lettuce",
                    "matchScore": 40,
                    "reason": "Too hot and sunny here; lettuce would bolt.",
                    "imageUrl": "",
                    "difficulty": "Easy",
                    "harvestDays": "35"
                }},
                {{
                    "id": "MINT",
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

        response = await call_gemini_analyze(image_bytes, prompt)
        
        # JSON Parsing
        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            lines = raw_text.split('\n')
            if lines[0].startswith("```"): lines = lines[1:]
            if lines[-1].startswith("```"): lines = lines[:-1]
            raw_text = "\n".join(lines)

        result_data = json.loads(raw_text)

        # Attach correct images from our new Source of Truth
        for rec in result_data.get("recommendations", []):
            plant_id = rec.get("id", "TOMATO").upper()
            # Normalize ID if AI returns weird stuff
            if "TOM" in plant_id: plant_id = "TOMATO"
            elif "LET" in plant_id: plant_id = "LETTUCE"
            elif "MIN" in plant_id: plant_id = "MINT"
            elif "ONI" in plant_id: plant_id = "ONION"

            if plant_id in PLANT_DEFS:
                original_data = PLANT_DEFS[plant_id]
                rec["imageUrl"] = original_data["imageUrl"]
                rec["harvestDays"] = f"{original_data['harvestDays']} days"
                rec["name"] = original_data["name"]
        
        return result_data

    except Exception as e:
        print(f"Error: {e}")
        return {
            "error": str(e),
            "analysis": {"lightLevel": "Error", "lightScore": 0},
            "recommendations": []
        }

# --- 5. VISUALIZATION (Preserved Logic) ---
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
        file_path = os.path.join(server_dir, "..", "public", "img", filename)
        
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

        # 3. ASK GEMINI
        prompt = f"""
        Act as a landscape architect. Look at this room/balcony photo.
        I want to create a LUSH GARDEN by filling the available floor/surface space with MANY pots of the same plant. 
        
        PLANT INFO:
        - Name: "{plantName}"
        - Image Aspect Ratio: {aspect_ratio:.2f} (Width/Height)
        
        TASK:
        1. Identify the floor or ground surface. Avoid walls/obstacles. Prioritize larger open areas and potential conditions (e.g. sunlight spots) for specific plant species and placement.
        2. Generate 5 to 15 bounding boxes [ymin, xmin, ymax, xmax] (0-1000 scale).
           - Further back = Smaller. Front = Larger.
        3. Estimate brightness (0.0-1.0).

        Return JSON:
        {{
            "layout": [
                [ymin, xmin, ymax, xmax], 
                ...
            ], 
            "brightness_score": 0.5
        }}
        """

        # Using your preferred client syntax (google.genai)
        response = await call_gemini_visualize(room_bytes, prompt)

        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            lines = raw_text.split('\n')
            if lines[0].startswith("```"): lines = lines[1:]
            if lines[-1].startswith("```"): lines = lines[:-1]
            raw_text = "\n".join(lines)

        vision_data = json.loads(raw_text)
        boxes = vision_data.get("layout", [])
        brightness = vision_data.get("brightness_score", 0.5)

        # 4. SORT BY DEPTH
        # Safety: Sort only valid boxes (length >= 4)
        valid_boxes = [b for b in boxes if len(b) >= 4]
        valid_boxes.sort(key=lambda b: b[2]) 

        # 5. COMPOSITE LOOP
        final_comp = Image.new("RGBA", room_img.size)
        final_comp.paste(room_img, (0,0))

        for box in valid_boxes:
            try:
                # Parse Coords & Sanitize (Min/Max swap ensures positive width/height)
                y1, x1 = (box[0]/1000 * img_h), (box[1]/1000 * img_w)
                y2, x2 = (box[2]/1000 * img_h), (box[3]/1000 * img_w)

                y_min, y_max = min(y1, y2), max(y1, y2)
                x_min, x_max = min(x1, x2), max(x1, x2)
                
                box_width = x_max - x_min
                box_height = y_max - y_min
                
                # SAFETY CHECK 1: Skip tiny noise
                if box_width < 10 or box_height < 10:
                    continue

                # Fit Image to Box
                scale_w = (box_width / p_width) * 1.5
                scale_h = (box_height / p_height) * 1.5
                scale = min(scale_w, scale_h)
                
                # SAFETY CHECK 2: Enforce minimum size (prevent 0px crash)
                new_w = max(10, int(p_width * scale))
                new_h = max(10, int(p_height * scale))
                
                # Resize
                current_plant = plant_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

                # Natural Variation
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

                # Paste
                final_comp.paste(current_plant, (final_x, final_y), current_plant)

            except Exception as box_err:
                print(f"Skipping bad box: {box_err}")
                continue

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