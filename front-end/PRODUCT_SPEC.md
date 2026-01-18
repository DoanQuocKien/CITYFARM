# CITYFARM - AI-Powered Urban Gardening Platform
## Product Requirements & Technical Architecture

**Version:** MVP 1.0  
**Target Launch:** Q2 2026 (3 months)  
**Platform:** iOS Mobile-First  
**Market:** Ho Chi Minh City, Vietnam

---

## 1. EXECUTIVE SUMMARY

### Mission
Help urban residents in HCMC grow clean food at home using AI technology, while promoting sustainability through recycled materials and hyper-local community exchange.

### Core Value Proposition
- **For Users:** Stop wasting money on dead plants. AI tells you exactly what to grow and how to care for it.
- **For Community:** Create a trusted, hyper-local marketplace where neighbors exchange verified organic produce.
- **For Environment:** Promote upcycled planting materials (recycled bottles) and reduce food miles.

### Success Metrics (MVP)
- **Acquisition:** 5,000 downloads in HCMC (Month 1)
- **Activation:** 60% scan their space within first session
- **Retention:** 40% return daily for care reminders (D7)
- **Revenue:** 1,000 planting kit sales @ ₫299,000 = ₫299M (~$12,500 USD)
- **Community:** 200 active marketplace listings

---

## 2. PROBLEM STATEMENT

### User Pain Points (Validated)
1. **Lack of Knowledge:** "What can I grow on my shaded balcony?"
2. **Fear of Failure:** "My plants always die. I'm wasting money."
3. **Space Constraints:** "I don't know if I have enough space/light."
4. **Food Safety:** "Is the vegetable from the market really clean?"
5. **No Accountability:** Traditional gardening = no tracking, no motivation

### Market Context: HCMC
- **Climate:** Hot (28-35°C), humid (70-80%), tropical
- **Urban Density:** Limited balcony/rooftop space (avg 2-4 m²)
- **Food Concern:** High pesticide residue reports in local media
- **Demographics:** Young professionals (25-40), middle-income, tech-savvy

---

## 3. PRODUCT FEATURES (MoSCoW)

### MUST HAVE (MVP Launch)

#### 3.1 Scan Space with AI
**User Story:** As a beginner, I want to scan my balcony and instantly know what plants will thrive there.

**Features:**
- Camera integration (native iOS)
- AI analysis of:
  - **Light intensity** (Computer Vision - brightness detection)
  - **Available area** (Object detection for space measurement)
  - **HCMC climate matching** (Rule-based system + weather API)
- Plant recommendation engine (top 3-5 matches with % score)

**Technical Flow:**
```
1. User captures photo → Upload to backend
2. CV model analyzes:
   - Brightness levels (40-60% = partial shade)
   - Spatial dimensions (bounding boxes)
   - Window/obstacle detection
3. Recommendation Service:
   - Matches plant database (30+ HCMC-suitable plants)
   - Filters by light, space, humidity tolerance
   - Returns ranked list with care requirements
4. Display results with "match score"
```

**Acceptance Criteria:**
- Shade space (< 50% light) → Lettuce, mint, Vietnamese herbs
- Partial sun (50-70%) → Tomato, pepper, eggplant
- Full sun (> 70%) → Chili, okra, bitter melon
- Response time < 5 seconds

---

#### 3.2 Generative AI Visualization
**User Story:** I want to see how my space will look with plants before I start.

**Features:**
- AI-generated "future garden" preview
- Overlay recommended plants into user's real photo
- Show growth progression (Day 1 → Day 60)

**Technical Approach:**
- **Option A (MVP):** Simple image overlay with transparency masks
- **Option B (Advanced):** ControlNet + Stable Diffusion for realistic rendering
  - Use Canny edge detection on original photo
  - Generate plant textures conditioned on edges
  - Blend with original image

**Implementation (MVP):**
```
- Pre-rendered plant PNG assets (transparent backgrounds)
- Position plants in detected "planting zones" using bounding boxes
- Apply perspective transform for realism
- Add green tint overlay to indicate growth zones
```

**Why it matters:** Increases conversion by 40% (visual commitment = action)

---

#### 3.3 Smart Planting Kit
**User Story:** I want everything I need to start growing, with zero guesswork.

**Physical Kit Contents:**
- 3x recycled plastic bottle planters (upcycled from PET bottles)
- Organic potting soil (3L)
- Organic fertilizer pellets (100g)
- Seeds/seedlings for recommended plants
- QR code sticker → links to digital plant profile

**Digital Integration:**
- Scan QR → Auto-create plant in "My Garden"
- Pre-fill planting date, expected harvest date
- Activate care reminder schedule

**Pricing:**
- Starter Kit (3 plants): ₫299,000 ($12.50 USD)
- Premium Kit (5 plants + IoT sensor): ₫599,000 ($25 USD)

**Supply Chain (MVP):**
- Partner with local nursery in HCM (e.g., Dalat Hasfarm)
- Manual packaging initially (< 100 kits/week)
- QR codes printed via on-demand service

---

#### 3.4 Planting Progress Tracking
**User Story:** I want to track my plant's growth like a fitness app tracks my health.

**Features:**
- Daily photo capture (in-app camera)
- AI health detection:
  - Leaf color analysis (green = healthy, yellow = warning)
  - Growth rate tracking (compare photos over time)
  - Disease/pest detection (basic: wilting, spots)
- Visual timeline:
  - Day 1 (Planted) → Day 7 (Sprouting) → Day 30 (Flowering) → Day 60 (Harvest)
- Progress bar (% to harvest)
- Care reminders (watering, fertilizing)

**AI Model (MVP):**
- **Plant Health Classifier:**
  - Input: Photo of plant
  - Output: Healthy / Warning / Critical
  - Model: MobileNetV3 (TensorFlow Lite for on-device)
  - Training data: 5K+ plant images (augmented)

**Gamification:**
- Streaks: "You've watered for 7 days straight! 🔥"
- Badges: "First Harvest", "Green Thumb", "Community Grower"
- Share progress to social media

---

#### 3.5 Green Marketplace (Hyper-Local)
**User Story:** I have extra lettuce. I want to sell it to neighbors who trust it's clean.

**Features:**
- Geo-filtered feed (by HCM district)
- Seller listing flow:
  1. Select plant from "My Garden" (with planting logs)
  2. Set quantity, price
  3. Auto-generate "verified" badge (if 30+ days logged)
- Buyer experience:
  - Browse by district
  - View seller's planting journal (transparency)
  - In-app chat
  - Cash on pickup (MVP - no payment integration)

**Trust Mechanism:**
- **Verified Grower Badge:** Requires 30+ days of documented care
- **Auto-generated Source Info:**
  - "Grown in District 1 by Nguyen Mai"
  - "45 days documented with AI health checks"
- **Star Rating System:** Post-transaction (future)

**Marketplace Rules (MVP):**
- Sellers must have active plant in "My Garden"
- Max listing age: 7 days (auto-expire)
- No 3rd-party logistics (buyer picks up)

---

### SHOULD HAVE (Post-MVP)

#### 3.6 Planting Journal
- User can add manual notes to daily photos
- Export journal as PDF for sharing

#### 3.7 IoT Sensor Integration
- Optional soil moisture sensor (Bluetooth Low Energy)
- Auto-detect when to water (no manual checking)
- Sold as add-on: ₫199,000 ($8 USD)

---

### COULD HAVE (Future)

#### 3.8 Community Forum
- Q&A section ("My tomato leaves are curling - help!")
- Expert growers answer questions
- Upvote/downvote system

#### 3.9 Recipe Suggestions
- "You have mint + lettuce → Try Vietnamese spring rolls!"
- Partner with food bloggers for content

---

### WON'T HAVE (MVP)

- 3rd-party delivery (Grab, Gojek) - too complex for MVP
- E-wallet payment (MoMo, ZaloPay) - cash first
- Multi-language support - Vietnamese only

---

## 4. USER FLOWS

### Primary Flow: Scan → Recommend → Visualize → Buy → Track

```
┌─────────────────────────────────────────────────────────────┐
│ ONBOARDING (First Launch)                                   │
├─────────────────────────────────────────────────────────────┤
│ 1. Splash Screen: "Grow clean food at home with AI"        │
│ 2. Permissions: Camera, Notifications, Location (optional)  │
│ 3. Quick Tutorial: "3 Steps to Your First Harvest"         │
│    - Scan your space                                        │
│    - Get AI recommendations                                 │
│    - Track your plants                                      │
│ 4. CTA: "Scan Your Space Now" → Camera                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CORE FLOW 1: Space Scan & Recommendation                    │
├─────────────────────────────────────────────────────────────┤
│ HOME → Tap "Scan Your Space"                                │
│   ↓                                                         │
│ CAMERA VIEW                                                 │
│   - Overlay guide frame (green corners)                    │
│   - Tips: "Include windows for light analysis"             │
│   - Capture button                                          │
│   ↓                                                         │
│ AI ANALYZING (3-5 sec)                                      │
│   - Show captured image with blur overlay                  │
│   - Progress bar with steps:                               │
│     ✓ Detecting light intensity...                         │
│     ✓ Measuring available area...                          │
│     ✓ Matching HCMC climate data...                        │
│   ↓                                                         │
│ RESULTS SCREEN                                              │
│   - Space Analysis Summary:                                │
│     • Light: Moderate (40-60%)                             │
│     • Area: 2.5 m² (3 medium pots)                         │
│     • Climate: HCMC - Hot & Humid                          │
│   - Plant Recommendations (ranked):                        │
│     1. Green Lettuce (95% match)                           │
│        "Perfect for partial shade areas"                   │
│     2. Mint (92% match)                                    │
│        "Thrives in humid environments"                     │
│     3. Cherry Tomato (78% match)                           │
│        "Needs more sunlight - place near window"           │
│   ↓                                                         │
│ CTA 1: "See Your Future Garden (AI Preview)"               │
│   ↓                                                         │
│ VISUALIZATION SCREEN                                        │
│   - Original photo with green plant overlays               │
│   - "Your Garden in 60 Days" header                        │
│   - Green zones highlighted                                │
│   ↓                                                         │
│ CTA 2: "Order Complete Starter Kit - ₫299,000"             │
│   ↓                                                         │
│ ORDER CONFIRMATION (External - not built in MVP)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CORE FLOW 2: Planting Kit → Track Growth                    │
├─────────────────────────────────────────────────────────────┤
│ USER RECEIVES KIT (Physical delivery)                       │
│   ↓                                                         │
│ Scan QR Code on Kit → Deep link to app                     │
│   ↓                                                         │
│ AUTO-CREATE PLANT PROFILE                                  │
│   - Pre-fill: Name, Type, Planting Date                    │
│   - Set reminders: Water (daily 8am), Fertilize (weekly)   │
│   - Show growth timeline                                    │
│   ↓                                                         │
│ MY GARDEN SCREEN                                            │
│   - View all plants                                         │
│   - Today's Care Tasks (yellow banner if pending)          │
│   - Tap plant → PLANT DETAIL                               │
│   ↓                                                         │
│ PLANT DETAIL SCREEN (Main retention feature)               │
│   - Tabs: Timeline / Care History / Journal                │
│   - Timeline Tab:                                           │
│     • Day 1: Planted ✓                                     │
│     • Day 7: Sprouting ✓                                   │
│     • Day 14: Vegetative Growth (current)                  │
│     • Day 30: Flowering (upcoming)                         │
│     • Day 60: Harvest Ready (upcoming)                     │
│   - Care History Tab:                                       │
│     • Jan 12: Watered - "Soil moisture optimal" (AI)       │
│     • Jan 10: Watered - "Plant health: Good" (AI)          │
│     • Jan 8: Fertilized - "Growth rate improving" (AI)     │
│   - Journal Tab:                                            │
│     • Photos with AI analysis:                             │
│       "Health: Healthy | Leaf Color: Vibrant green"        │
│   ↓                                                         │
│ DAILY ACTION: "Capture Daily Photo" (Bottom button)        │
│   ↓                                                         │
│ CAMERA → Take photo → AI analyzes → Add to journal         │
│   - Notification: "Your plant looks healthy! 🌱"           │
│   - Update progress bar                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CORE FLOW 3: Community Marketplace                          │
├─────────────────────────────────────────────────────────────┤
│ MY GARDEN → Plant is harvest-ready                         │
│   ↓                                                         │
│ USER HAS SURPLUS → Want to sell                             │
│   ↓                                                         │
│ COMMUNITY TAB → "List Your Produce" button                 │
│   ↓                                                         │
│ CREATE LISTING                                              │
│   1. Select plant from My Garden (auto-loads photos/logs)  │
│   2. Set quantity & price                                   │
│   3. Add description (optional)                             │
│   4. Auto-generate verification:                            │
│      "Growth verified • 60 days documented with AI"        │
│   5. Publish → Visible to district neighbors               │
│   ↓                                                         │
│ BUYER FLOW                                                  │
│   - Browse Community tab (filtered by district)            │
│   - See listing with seller info + verification badge      │
│   - Tap "View Planting Logs" → See seller's journal        │
│   - Chat with seller (in-app)                              │
│   - Agree on pickup location/time                           │
│   - Cash on pickup (no payment in-app)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. WIREFRAMES (Low-Fidelity)

### 5.1 Home Screen
```
┌────────────────────────────────────────┐
│  CITYFARM        🌱                    │
│  Grow clean, live green                │
├────────────────────────────────────────┤
│                                        │
│  ╔════════════════════════════════╗   │
│  ║  Start Your Garden             ║   │
│  ║  📷 Scan your space & get AI   ║   │
│  ║  recommendations               ║   │
│  ║                                ║   │
│  ║  [  📷 Scan Your Space  ]      ║   │
│  ╚════════════════════════════════╝   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Today's Care Tasks    🔴 2       │ │
│  ├──────────────────────────────────┤ │
│  │ 💧 Water Cherry Tomato - 5:00 PM│ │
│  │ ☀️  Check Mint sunlight - 6:00 PM│ │
│  └──────────────────────────────────┘ │
│                                        │
│  My Garden                 View All → │
│  ┌─────────────┬────────────────────┐ │
│  │ [Tomato Pic]│ Cherry Tomato      │ │
│  │             │ Day 11/60  ● Healthy│ │
│  │             │ ████░░░░░░ 18%     │ │
│  │             │ 💧 Today, 5:00 PM  │ │
│  └─────────────┴────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Quick Stats                       │ │
│  │ ┌─────┬─────┬─────┐              │ │
│  │ │ 2   │ 85% │28°C │              │ │
│  │ │Plants│Care │HCMC │              │ │
│  │ └─────┴─────┴─────┘              │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ╔════════════════════════════════╗   │
│  ║ Local Green Market 🌿          ║   │
│  ║ Fresh produce from verified    ║   │
│  ║ growers in your district       ║   │
│  ║ [  Browse Community →  ]       ║   │
│  ╚════════════════════════════════╝   │
│                                        │
├────────────────────────────────────────┤
│ [🏠] [📷] [🌱] [👥]                    │
│ Home  Scan Garden Community            │
└────────────────────────────────────────┘
```

**Layout Logic:**
- **Hero CTA above fold:** Scan button is primary action (green gradient)
- **Reminders:** Yellow banner creates urgency (pending tasks)
- **My Garden Preview:** Max 2 cards visible → scroll for more → drives navigation to full garden
- **Community Teaser:** Soft sell marketplace without overwhelming
- **Bottom Nav:** iOS standard (4 tabs, icons + labels)

**UX Reasoning:**
- **One-tap to value:** From home → scan → results in 3 taps
- **Gamification visible:** Progress bars create dopamine loop
- **Calm colors:** Green palette reduces anxiety (vs red CTAs)

---

### 5.2 Scan Screen (Analyzing State)
```
┌────────────────────────────────────────┐
│  Scan Your Space            [✕]       │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │    [Captured Balcony Photo]     │ │
│  │         + Blur Overlay           │ │
│  │                                  │ │
│  │         ✨ AI Analyzing...       │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Progress: ████████░░ 80%             │
│                                        │
│  ✓ Detecting light intensity...       │
│  ✓ Measuring available area...        │
│  ⏳ Matching HCMC climate data...     │
│                                        │
└────────────────────────────────────────┘
```

---

### 5.3 Results Screen
```
┌────────────────────────────────────────┐
│  Scan Your Space            [✕]       │
├────────────────────────────────────────┤
│  ╔════════════════════════════════╗   │
│  ║ ✨ Space Analysis Complete    ║   │
│  ║ ┌──────┬──────┬──────┬──────┐ ║   │
│  ║ │☀️ Mod│📍2.5m²│☁️Hot │✓ 3   │ ║   │
│  ║ │erate │      │Humid │plants│ ║   │
│  ║ └──────┴──────┴──────┴──────┘ ║   │
│  ╚════════════════════════════════╝   │
│                                        │
│  Perfect Plants for Your Space         │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ [Lettuce]  Green Lettuce       │   │
│  │            Lactuca sativa      │   │
│  │                                │   │
│  │  95% match - Perfect for       │   │
│  │  partial shade areas           │   │
│  │                                │   │
│  │  ☀️ Partial | Easy | 30-35 days│   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ [Mint Pic]  Fresh Mint         │   │
│  │             Mentha             │   │
│  │  92% match - Thrives in humid  │   │
│  │  environments                  │   │
│  │  ☀️ Partial | Easy | 40-50 days│   │
│  └────────────────────────────────┘   │
│                                        │
│  [ ✨ See Your Future Garden ]        │
│  [ → Order Planting Kit ]              │
│                                        │
└────────────────────────────────────────┘
```

---

### 5.4 My Garden Screen
```
┌────────────────────────────────────────┐
│  My Garden                             │
│  4 plants growing                      │
├────────────────────────────────────────┤
│  ┌──────────────┬──────────────┐       │
│  │ 3            │ 1            │       │
│  │ Healthy 🌱   │ Needs Care ⚠│       │
│  └──────────────┴──────────────┘       │
│                                        │
│  Overall Care Rate         87% 🔥      │
│  ██████████████████░░ 87%             │
│  Great job! Your plants are thriving  │
│                                        │
│  [All Plants] [Vegetables] [Herbs]    │
│                                        │
│  ╔════════════════════════════════╗   │
│  ║                                ║   │
│  ║    [Cherry Tomato Photo]       ║   │
│  ║                                ║   │
│  ║  Cherry Tomato    ● Healthy    ║   │
│  ║  Vegetable                     ║   │
│  ╚════════════════════════════════╝   │
│  │ Growth Progress                │   │
│  │ Day 11 / 60      ████░░░░ 18%  │   │
│  │                                │   │
│  │ 💧 Today, 5:00 PM              │   │
│  │ ☀️ In 3 days                   │   │
│  │                                │   │
│  │ 📅 Planted Jan 1, 2026         │   │
│  └────────────────────────────────┘   │
│                                        │
│  [Repeat for other plants...]         │
│                                        │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │     Add More Plants            │   │
│  │         [+]                    │   │
│  │    Scan your space to find     │   │
│  │    more perfect plants         │   │
│  │    [  Scan Space  ]            │   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
└────────────────────────────────────────┘
```

---

### 5.5 Plant Detail Screen
```
┌────────────────────────────────────────┐
│  [←]                                   │
│                                        │
│  ╔════════════════════════════════╗   │
│  ║                                ║   │
│  ║   [Full Plant Photo]           ║   │
│  ║                                ║   │
│  ║   Cherry Tomato  ● Healthy     ║   │
│  ║   Vegetable • Day 11           ║   │
│  ╚════════════════════════════════╝   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │    18%      11       49          │ │
│  │  Progress  Days    Days Left     │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Growth to Harvest                    │
│  11 / 60 days  ████░░░░░░ 18%        │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Upcoming Care                     │ │
│  │ 💧 Water Plant - Today, 5:00 PM  │ │
│  │    [Done]                         │ │
│  │ ☀️ Add Fertilizer - In 3 days    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [Timeline] [Care History] [Journal]  │
│  ─────────                             │
│                                        │
│  Growth Stages                         │
│                                        │
│  ✓ Day 1: Planted       Jan 1, 2026   │
│  │                                     │
│  ✓ Day 7: Sprouting     Jan 7, 2026   │
│  │                                     │
│  ● Day 14: Vegetative   Jan 14, 2026  │
│  │         Growth (current)            │
│  │                                     │
│  ○ Day 30: Flowering    Jan 30, 2026  │
│  │                                     │
│  ○ Day 60: Harvest      Mar 1, 2026   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │   [  📷 Capture Daily Photo  ]   │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Tab Switching:**
- **Timeline:** Visual milestone tracker (Instagram-style)
- **Care History:** Log of all watering/fertilizing with AI feedback
- **Journal:** Photo gallery with AI health analysis on each

---

### 5.6 Community Screen
```
┌────────────────────────────────────────┐
│  Green Market                          │
│  Local, fresh & verified produce       │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐ │
│  │  🔍 Search plants, vegetables... │ │
│  └──────────────────────────────────┘ │
│                                        │
│  📍 Filter by District                 │
│  [All] [D1] [D2] [D3] [Binh Thanh]... │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ✓ 100% Verified Growers          │ │
│  │ All sellers have documented logs │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Fresh Produce (4)        [Filters]   │
│                                        │
│  ╔════════════════════════════════╗   │
│  ║ [Lettuce]  Nguyen Mai ✓        ║   │
│  ║            District 1           ║   │
│  ║                                ║   │
│  ║  Fresh Green Lettuce           ║   │
│  ║  Organic lettuce grown on my   ║   │
│  ║  balcony. No pesticides.       ║   │
│  ║                                ║   │
│  ║  📍 District 1 • 2h ago         ║   │
│  ║  • 45 logs                     ║   │
│  ║                                ║   │
│  ║  ₫50,000        [💬] [ Buy ]   ║   │
│  ║  10 heads                      ║   │
│  ║                                ║   │
│  ║  ✓ Growth verified • 45 days   ║   │
│  ║    documented with AI          ║   │
│  ╚════════════════════════════════╝   │
│                                        │
│  [More listings...]                   │
│                                        │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │   Got Surplus Produce?         │   │
│  │   Share your harvest with      │   │
│  │   neighbors. Your planting     │   │
│  │   logs are auto-verified.      │   │
│  │   [  List Your Produce  ]      │   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
└────────────────────────────────────────┘
```

---

## 6. TECHNICAL ARCHITECTURE

### 6.1 System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (iOS)                      │
├──────────────────────────────────────────────────────────────┤
│  UI Framework: React Native / Flutter (Decision: React Native)│
│  - Camera Integration (react-native-camera)                  │
│  - Local Storage (AsyncStorage for offline cache)            │
│  - Push Notifications (Firebase Cloud Messaging)             │
│  - Maps (react-native-maps for geo-filtering)                │
│  - On-Device AI: TensorFlow Lite (plant health classification)│
└──────────────────────────────────────────────────────────────┘
                              ↕ HTTPS / REST API
┌──────────────────────────────────────────────────────────────┐
│                     API GATEWAY (AWS/GCP)                    │
├──────────────────────────────────────────────────────────────┤
│  - Authentication (JWT tokens)                               │
│  - Rate Limiting (prevent abuse)                             │
│  - Request Routing                                           │
│  - API Versioning (v1/)                                      │
└──────────────────────────────────────────────────────────────┘
                              ↕
┌───────────────────┬─────────────────────┬───────────────────┐
│  SCAN SERVICE     │  RECOMMENDATION     │  MARKETPLACE      │
│  (CV Analysis)    │  SERVICE            │  SERVICE          │
├───────────────────┼─────────────────────┼───────────────────┤
│ - Image upload    │ - Plant DB query    │ - Listing CRUD    │
│ - Brightness      │ - Ranking algorithm │ - Geo-search      │
│   detection       │ - Match scoring     │   (PostGIS)       │
│ - Space calc      │ - Care schedule gen │ - Verification    │
│ - GenAI overlay   │                     │   logic           │
└───────────────────┴─────────────────────┴───────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                      AI/ML SERVICES                          │
├──────────────────────────────────────────────────────────────┤
│  Computer Vision:                                            │
│  - OpenCV (brightness, space detection)                      │
│  - TensorFlow (plant health classification)                  │
│                                                              │
│  Generative AI:                                              │
│  - Stable Diffusion API (Replicate.com) [MVP: Simple overlay]│
│  - ControlNet (future: realistic rendering)                  │
│                                                              │
│  Recommendation Engine:                                      │
│  - Rule-based matching (light, climate, space)               │
│  - Collaborative filtering (future: user similarity)         │
└──────────────────────────────────────────────────────────────┘
                              ↕
┌───────────────────┬─────────────────────┬───────────────────┐
│  DATABASE LAYER                                              │
├───────────────────┼─────────────────────┼───────────────────┤
│  PostgreSQL       │  MongoDB            │  Redis            │
│  (Relational)     │  (Document Store)   │  (Cache)          │
├───────────────────┼─────────────────────┼───────────────────┤
│ - Users           │ - Plant journals    │ - Session cache   │
│ - Plants (catalog)│ - Photos (metadata) │ - API responses   │
│ - Marketplace     │ - Scan results      │ - User location   │
│   listings        │                     │                   │
│ - Care logs       │                     │                   │
│                   │                     │                   │
│ PostGIS Extension │                     │                   │
│ (Geo-queries)     │                     │                   │
└───────────────────┴─────────────────────┴───────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├──────────────────────────────────────────────────────────────┤
│ - AWS S3 (image storage)                                     │
│ - Firebase (push notifications, analytics)                   │
│ - Weather API (HCMC climate data)                            │
│ - Payment (future: MoMo, ZaloPay)                            │
└──────────────────────────────────────────────────────────────┘
```

---

### 6.2 Data Models (Core Entities)

#### User
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  district VARCHAR(50), -- District 1, District 2, etc.
  location GEOGRAPHY(POINT, 4326), -- PostGIS for geo-queries
  created_at TIMESTAMP DEFAULT NOW(),
  verified_grower BOOLEAN DEFAULT FALSE
);
```

#### Plant Catalog (Static Reference Data)
```sql
CREATE TABLE plant_catalog (
  id UUID PRIMARY KEY,
  name VARCHAR(100), -- "Cherry Tomato"
  scientific_name VARCHAR(100), -- "Solanum lycopersicum"
  type VARCHAR(50), -- Vegetable, Herb, Fruit
  difficulty VARCHAR(20), -- Easy, Medium, Hard
  harvest_days INT, -- 60
  light_requirement VARCHAR(50), -- Full Sun, Partial Shade, Shade
  water_frequency VARCHAR(50), -- Daily, Every 2 days
  climate_suitability JSON, -- {"hcmc": true, "hanoi": false}
  care_instructions TEXT
);
```

#### User Plant (User's Garden)
```sql
CREATE TABLE user_plants (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plant_catalog_id UUID REFERENCES plant_catalog(id),
  planted_date DATE NOT NULL,
  status VARCHAR(20), -- Growing, Harvested, Dead
  qr_code VARCHAR(50), -- Links to physical kit
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Plant Journal (Photos & AI Analysis)
```sql
CREATE TABLE plant_journal (
  id UUID PRIMARY KEY,
  user_plant_id UUID REFERENCES user_plants(id),
  photo_url TEXT NOT NULL, -- S3 URL
  captured_at TIMESTAMP DEFAULT NOW(),
  ai_health_status VARCHAR(20), -- Healthy, Warning, Critical
  ai_analysis JSON, -- {"leaf_color": "vibrant green", "issues": "none"}
  user_notes TEXT
);
```

#### Care Log
```sql
CREATE TABLE care_logs (
  id UUID PRIMARY KEY,
  user_plant_id UUID REFERENCES user_plants(id),
  action VARCHAR(50), -- Watered, Fertilized, Pruned
  logged_at TIMESTAMP DEFAULT NOW(),
  ai_feedback TEXT -- "Soil moisture optimal"
);
```

#### Marketplace Listing
```sql
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users(id),
  user_plant_id UUID REFERENCES user_plants(id), -- Source of produce
  quantity VARCHAR(50), -- "10 heads", "2 kg"
  price_vnd INT, -- 50000 (₫50,000)
  description TEXT,
  status VARCHAR(20), -- Active, Sold, Expired
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);
```

#### Scan Result (Cache for recommendations)
```json
// MongoDB document
{
  "_id": "scan_abc123",
  "user_id": "user_uuid",
  "photo_url": "s3://...",
  "analysis": {
    "light_intensity": 55, // percentage
    "available_area": 2.5, // square meters
    "brightness_zones": [...], // bounding boxes
    "climate_context": "hcmc_hot_humid"
  },
  "recommendations": [
    {
      "plant_id": "lettuce_uuid",
      "match_score": 95,
      "reason": "Perfect for partial shade areas"
    },
    ...
  ],
  "created_at": "2026-01-12T10:30:00Z"
}
```

---

### 6.3 API Contracts (Sample)

#### POST /api/v1/scan
**Purpose:** Upload photo, get AI analysis + recommendations

**Request:**
```json
{
  "image": "base64_encoded_image_data",
  "user_id": "uuid",
  "location": {
    "lat": 10.8231,
    "lng": 106.6297
  }
}
```

**Response:**
```json
{
  "scan_id": "scan_abc123",
  "analysis": {
    "light_intensity": "Moderate (40-60%)",
    "light_percentage": 55,
    "available_area": "2.5 m²",
    "climate": "HCMC - Hot & Humid",
    "planting_capacity": 3
  },
  "recommendations": [
    {
      "plant_id": "uuid",
      "name": "Green Lettuce",
      "scientific_name": "Lactuca sativa",
      "match_score": 95,
      "reason": "Perfect for partial shade areas",
      "difficulty": "Easy",
      "harvest_days": "30-35 days",
      "image_url": "https://...",
      "care": {
        "sunlight": "Partial Shade",
        "water": "Daily",
        "climate_friendly": true
      }
    },
    ...
  ],
  "visualization_url": "https://s3.../generated_garden.jpg" // AI overlay
}
```

---

#### POST /api/v1/plants
**Purpose:** Create plant in user's garden (from kit QR code)

**Request:**
```json
{
  "user_id": "uuid",
  "plant_catalog_id": "uuid",
  "qr_code": "KIT-12345",
  "planted_date": "2026-01-12"
}
```

**Response:**
```json
{
  "plant_id": "uuid",
  "name": "Cherry Tomato",
  "planted_date": "2026-01-12",
  "harvest_date": "2026-03-12", // Auto-calculated
  "care_schedule": {
    "watering": {
      "frequency": "daily",
      "time": "08:00",
      "next_due": "2026-01-13T08:00:00Z"
    },
    "fertilizing": {
      "frequency": "weekly",
      "next_due": "2026-01-19T09:00:00Z"
    }
  }
}
```

---

#### POST /api/v1/plants/{plant_id}/journal
**Purpose:** Add photo to plant journal with AI analysis

**Request:**
```json
{
  "photo": "base64_encoded_image",
  "user_notes": "First sprout appeared!" // optional
}
```

**Response:**
```json
{
  "journal_entry_id": "uuid",
  "photo_url": "https://s3.../plant_photo.jpg",
  "ai_analysis": {
    "health_status": "Healthy",
    "confidence": 0.92,
    "leaf_color": "Vibrant green",
    "growth_stage": "Vegetative",
    "issues_detected": [],
    "recommendation": "Continue current care routine. Plant is thriving!"
  },
  "captured_at": "2026-01-12T14:30:00Z"
}
```

---

#### GET /api/v1/marketplace
**Purpose:** Browse marketplace listings with geo-filtering

**Query Params:**
- `district` (optional): District 1, District 2, etc.
- `plant_type` (optional): Vegetable, Herb
- `max_distance_km` (optional): 5 (within 5km of user)

**Response:**
```json
{
  "listings": [
    {
      "listing_id": "uuid",
      "seller": {
        "name": "Nguyen Mai",
        "avatar_url": "https://...",
        "district": "District 1",
        "verified_grower": true,
        "rating": 4.8
      },
      "plant": "Fresh Green Lettuce",
      "quantity": "10 heads",
      "price_vnd": 50000,
      "price_display": "₫50,000",
      "image_url": "https://...",
      "description": "Organic lettuce grown on my balcony...",
      "posted_time": "2 hours ago",
      "verification": {
        "planting_logs": 45,
        "ai_verified": true,
        "badge": "Growth verified • 45 days documented"
      }
    },
    ...
  ]
}
```

---

### 6.4 AI System Flow (Detailed)

#### Flow 1: Space Scan → Recommendation

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Image Preprocessing                                 │
├─────────────────────────────────────────────────────────────┤
│ Input: Photo from user (JPEG, 1920x1080)                    │
│   ↓                                                         │
│ Resize to 640x480 (reduce compute)                          │
│ Convert to RGB                                              │
│ Normalize pixel values [0-1]                                │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Computer Vision Analysis (OpenCV)                   │
├─────────────────────────────────────────────────────────────┤
│ A. BRIGHTNESS DETECTION                                     │
│    - Convert to grayscale                                   │
│    - Calculate average pixel intensity (0-255)              │
│    - Map to percentage:                                     │
│      • 0-80: Shade (< 40%)                                  │
│      • 80-150: Partial Shade (40-70%)                       │
│      • 150-255: Full Sun (> 70%)                            │
│                                                             │
│ B. SPACE MEASUREMENT                                        │
│    - Edge detection (Canny algorithm)                       │
│    - Find largest contour (balcony floor)                   │
│    - Estimate area using reference objects (optional):      │
│      • Detect windows/doors (known avg size 1.2m x 2m)     │
│      • Calculate floor area ratio                           │
│    - Fallback: User manual input slider                     │
│                                                             │
│ C. OBJECT DETECTION (Optional - Future)                     │
│    - YOLO model to detect:                                  │
│      • Windows (light source indicators)                    │
│      • Obstacles (AC units, furniture)                      │
│      • Existing plants                                      │
│                                                             │
│ Output: {light: 55%, area: 2.5m², obstacles: [...]}        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Recommendation Engine (Rule-Based + Scoring)        │
├─────────────────────────────────────────────────────────────┤
│ Query plant_catalog table WHERE:                            │
│   - climate_suitability CONTAINS "hcmc"                     │
│                                                             │
│ For each plant:                                             │
│   score = 0                                                 │
│                                                             │
│   // Light match (40% weight)                              │
│   IF plant.light_requirement == detected_light:            │
│     score += 40                                             │
│   ELSE IF partial_overlap:                                  │
│     score += 20                                             │
│                                                             │
│   // Space match (30% weight)                              │
│   IF plant.space_needed <= detected_area:                   │
│     score += 30                                             │
│                                                             │
│   // Climate match (20% weight)                            │
│   IF plant.climate_suitability["hcmc"] == true:            │
│     score += 20                                             │
│                                                             │
│   // Beginner-friendly (10% weight)                        │
│   IF plant.difficulty == "Easy":                            │
│     score += 10                                             │
│                                                             │
│ Sort plants by score DESC                                   │
│ Return top 5 with reasons                                   │
│                                                             │
│ Output: [                                                   │
│   {plant: "Lettuce", score: 95, reason: "..."},            │
│   {plant: "Mint", score: 92, reason: "..."},               │
│   ...                                                       │
│ ]                                                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Generative AI Visualization (MVP: Simple Overlay)   │
├─────────────────────────────────────────────────────────────┤
│ MVP APPROACH (Fast, no external API):                       │
│   - Use pre-rendered plant PNG assets (transparent bg)     │
│   - Detect "planting zones" (floor areas from CV)           │
│   - Position 3 plant images in detected zones               │
│   - Apply perspective transform for realism                 │
│   - Add green tint overlay (opacity 20%)                    │
│   - Composite layers: original + plants + tint              │
│   - Save to S3, return URL                                  │
│                                                             │
│ FUTURE APPROACH (Stable Diffusion):                         │
│   - Send to Replicate API:                                  │
│     {                                                       │
│       "model": "controlnet",                                │
│       "image": original_photo,                              │
│       "prompt": "lush balcony garden with lettuce,         │
│                  tomato, mint plants, natural lighting",    │
│       "negative_prompt": "dead plants, brown leaves"       │
│     }                                                       │
│   - Get generated image (10-30 sec)                         │
│   - Blend with original (60% generated, 40% original)       │
│                                                             │
│ Output: visualization_url                                   │
└─────────────────────────────────────────────────────────────┘
```

---

#### Flow 2: Plant Health Detection (TensorFlow Lite)

```
┌─────────────────────────────────────────────────────────────┐
│ TRAINING (One-time)                                         │
├─────────────────────────────────────────────────────────────┤
│ Dataset:                                                    │
│   - 5,000 plant images (public datasets + manual collect)  │
│   - Labels: Healthy, Warning (yellow leaves, wilting),     │
│             Critical (brown, dying)                         │
│   - Augmentation: rotation, brightness, zoom (10x data)    │
│                                                             │
│ Model: Transfer Learning (MobileNetV3)                      │
│   - Pre-trained on ImageNet                                │
│   - Replace final layer: 3 classes (Healthy/Warning/Crit)  │
│   - Fine-tune on plant dataset (20 epochs)                 │
│   - Accuracy target: > 85%                                  │
│                                                             │
│ Export:                                                     │
│   - Convert to TensorFlow Lite (.tflite file)              │
│   - Quantize to INT8 (smaller size, faster inference)      │
│   - Bundle in mobile app (no server call needed)           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ INFERENCE (On-Device)                                       │
├─────────────────────────────────────────────────────────────┤
│ User captures daily photo → Mobile app                      │
│   ↓                                                         │
│ Preprocess:                                                 │
│   - Resize to 224x224                                       │
│   - Normalize [0-1]                                         │
│   ↓                                                         │
│ TFLite model inference (< 200ms on iPhone 12+)             │
│   - Input: [1, 224, 224, 3] tensor                         │
│   - Output: [Healthy: 0.92, Warning: 0.06, Critical: 0.02] │
│   ↓                                                         │
│ Classification:                                             │
│   - Pick highest score: "Healthy" (92% confidence)          │
│   ↓                                                         │
│ Generate Feedback:                                          │
│   IF Healthy:                                               │
│     "Your plant looks great! Keep up the care routine."     │
│   ELSE IF Warning:                                          │
│     "Some yellow leaves detected. Check watering schedule." │
│   ELSE:                                                     │
│     "Plant needs urgent attention. Contact support."        │
│   ↓                                                         │
│ Save to journal (upload to server in background)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. RISKS & MITIGATION

### 7.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **AI accuracy too low** (users get wrong plant recommendations) | High | High | - Start with conservative recommendations (only "Easy" plants)<br>- A/B test rule-based vs ML model<br>- Add "Not sure?" disclaimer + manual override<br>- Collect feedback loop: "Did this plant grow well?" |
| **Generative AI too slow** (30 sec wait time = drop-off) | Medium | High | - MVP: Use simple image overlay (instant)<br>- Future: Pre-generate templates<br>- Show skeleton loading state with tips |
| **TFLite model doesn't work on older iPhones** | Low | Medium | - Fallback to server-side inference (API call)<br>- Graceful degradation: "Health check unavailable" |
| **Image upload failures** (poor internet in HCM) | Medium | Medium | - Compress images to < 500KB before upload<br>- Offline mode: Queue uploads for later<br>- Show upload progress bar |

### 7.2 Product Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Users don't return after first scan** | High | High | - Push notifications: "Your tomato needs water today!"<br>- Gamification: Streak badges<br>- Weekly email: "Your plant is 50% to harvest!"<br>- Onboarding: Set up first reminder in-app |
| **Marketplace has no supply** (no sellers) | Medium | High | - Seed marketplace with test users (team members)<br>- Partner with 10 existing balcony gardeners<br>- Referral incentive: "Invite friend → free kit" |
| **Trust issues** (buyers don't believe sellers) | Medium | High | - Mandatory 30-day log verification<br>- Show seller's full journal (transparency)<br>- Star rating + reviews (post-MVP)<br>- Escrow system (future) |
| **Plants die → negative reviews** | High | Medium | - Set realistic expectations: "60% success rate for beginners"<br>- AI sends early warnings: "Your plant looks stressed"<br>- Offer replacement kit (1-time) if failure in first 14 days<br>- Build knowledge base: troubleshooting guides |

### 7.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Kit supply chain breaks** (can't fulfill orders) | Medium | High | - Partner with 2 nurseries (backup supplier)<br>- Max 100 orders/week initially (manageable)<br>- Pre-order system (7-day lead time) |
| **Regulatory issues** (food safety laws) | Low | Medium | - Marketplace is peer-to-peer (not a licensed vendor)<br>- Disclaimer: "CITYFARM is a platform, not a food seller"<br>- Consult lawyer (₫10M = $400 USD) |
| **Copycat apps** (competitors launch faster) | Medium | Low | - Focus on community moat (network effects)<br>- Build trust first (verified growers)<br>- Speed: Ship MVP in 3 months (execution advantage) |

### 7.4 Privacy Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **User photos expose personal info** (faces, addresses) | Low | High | - Privacy policy: "Don't include personal items in photos"<br>- Auto-blur faces (ML model)<br>- User can delete photos anytime |
| **Location data misuse** | Low | Medium | - Only store district-level (not exact coordinates)<br>- Ask permission: "To show nearby sellers..."<br>- Allow opt-out of marketplace |

---

## 8. JUSTIFICATION OF TECHNICAL DECISIONS

### 8.1 Why React Native (Not Flutter)?
**Decision:** React Native

**Reasoning:**
- **Faster MVP:** More developers know React (easier to hire in Vietnam)
- **Ecosystem:** Better support for AI libs (TensorFlow.js, ML Kit)
- **Cost:** Can reuse web developers (lower hourly rate)
- **Trade-off:** Slightly worse performance than Flutter, but acceptable for MVP

### 8.2 Why PostgreSQL + MongoDB Hybrid?
**Decision:** Postgres (relational) + Mongo (documents)

**Reasoning:**
- **Postgres:** Perfect for structured data (users, plants, marketplace) + PostGIS for geo-queries
- **MongoDB:** Better for unstructured data (photos, AI analysis JSON, scan results)
- **Trade-off:** More complexity (2 databases), but cleaner data modeling

### 8.3 Why TensorFlow Lite (Not Cloud API)?
**Decision:** On-device ML with TFLite

**Reasoning:**
- **Speed:** < 200ms inference (vs 2-5 sec cloud API)
- **Cost:** Zero API calls = no per-request fees
- **Privacy:** Images never leave device
- **Offline:** Works without internet
- **Trade-off:** Harder to update model (need app release), but MVP model is good enough

### 8.4 Why Simple Image Overlay (Not Stable Diffusion)?
**Decision:** MVP uses PNG overlay, not generative AI

**Reasoning:**
- **Speed:** Instant vs 30 sec wait
- **Cost:** Free vs $0.02/image (Replicate API)
- **Quality:** Good enough for MVP (80% believable)
- **Trade-off:** Less realistic, but users care more about speed

**Future Migration Path:**
- V1: PNG overlay (MVP)
- V2: Hybrid (quick overlay + "Generate HD version" button)
- V3: Full Stable Diffusion when costs drop

### 8.5 Why No Payment Integration (Cash Only)?
**Decision:** Cash on pickup (no MoMo/ZaloPay)

**Reasoning:**
- **Trust:** Buyers want to see produce before paying
- **Regulation:** Avoid fintech compliance (6+ months)
- **Simplicity:** MVP focus on core value (community, not payments)
- **Trade-off:** Lower conversion, but acceptable for MVP

**Future:** Add payments when GMV > ₫100M/month

---

## 9. MVP ROADMAP (3 Months)

### Month 1: Foundation (Weeks 1-4)
**Week 1-2: Design & Setup**
- Finalize UI designs (Figma)
- Set up React Native project
- Database schema design
- API contracts

**Week 3-4: Core Features**
- Home screen + navigation
- Camera integration
- Basic CV (brightness detection)
- Plant catalog database (30 plants)

**Deliverable:** Clickable prototype with fake data

---

### Month 2: AI & Tracking (Weeks 5-8)
**Week 5-6: Scan & Recommend**
- CV analysis pipeline (OpenCV)
- Recommendation engine (rule-based)
- Results screen with match scores
- Image overlay visualization

**Week 7-8: My Garden**
- Plant creation (QR code flow)
- Growth timeline
- Care reminders (local notifications)
- TFLite model training (health detection)

**Deliverable:** Functional scan → track flow

---

### Month 3: Community & Launch (Weeks 9-12)
**Week 9-10: Marketplace**
- Listing creation
- Geo-filtering (PostGIS)
- Verification badges
- In-app chat (basic)

**Week 11: Testing & Polish**
- Beta test with 20 users
- Fix critical bugs
- Performance optimization
- Analytics integration (Firebase)

**Week 12: Launch**
- Submit to App Store
- PR campaign (local media)
- Partner activation (10 nurseries)
- Referral program live

**Goal:** 5,000 downloads, 1,000 kit sales

---

## 10. SUCCESS METRICS & KPIs

### Acquisition
- **App Downloads:** 5,000 (Month 1)
- **Install Source:** 60% organic (word of mouth), 40% ads

### Activation
- **First Scan:** 60% of users scan within first session
- **Account Creation:** 40% complete profile

### Retention
- **D1 Retention:** 50% (return next day for care reminder)
- **D7 Retention:** 40%
- **D30 Retention:** 25%

### Revenue
- **Kit Sales:** 1,000 units @ ₫299,000 = ₫299M (~$12,500 USD)
- **Average Order Value:** ₫299,000
- **Conversion Rate (Scan → Buy):** 20%

### Community
- **Marketplace Listings:** 200 active
- **Transactions:** 500 (₫25M GMV)
- **Verified Growers:** 100 users (30+ day logs)

### Engagement
- **Daily Active Users:** 1,500 (30% of user base)
- **Photos Captured:** 5,000/week
- **Care Tasks Completed:** 80% completion rate

---

## 11. NEXT STEPS (Post-MVP)

### V2 Features (Months 4-6)
- IoT sensor integration (auto-watering detection)
- Community forum (Q&A)
- Recipe suggestions (AI-generated from harvest)
- Payment integration (MoMo, ZaloPay)

### V3 Features (Months 7-12)
- Expand to Hanoi market (different climate = new plants)
- B2B offering (schools, offices)
- Subscription model (₫99k/month for premium AI insights)
- AR plant preview (not just photos, 3D models)

---

## 12. APPENDIX

### A. Plant Database Sample (HCM-Suitable)
| Plant | Light | Difficulty | Harvest Days | Notes |
|-------|-------|-----------|--------------|-------|
| Green Lettuce | Partial | Easy | 30-35 | Perfect for beginners, shade-tolerant |
| Mint | Partial | Easy | 40-50 | Loves humidity, grows fast |
| Cherry Tomato | Full Sun | Medium | 60-80 | Needs support stake |
| Thai Chili | Full Sun | Medium | 90-120 | Very hot climate tolerant |
| Vietnamese Coriander | Partial | Easy | 45-60 | Local favorite, low maintenance |
| Bok Choy | Partial | Easy | 45-60 | Fast-growing, shade-tolerant |

### B. Tech Stack Summary
- **Frontend:** React Native + TypeScript
- **Backend:** Node.js (Express) + Python (FastAPI for AI)
- **Database:** PostgreSQL + PostGIS, MongoDB
- **AI/ML:** TensorFlow Lite, OpenCV, Stable Diffusion (future)
- **Cloud:** AWS (S3, EC2) or GCP (cheaper in Vietnam)
- **Analytics:** Firebase, Mixpanel

### C. Team Requirements (MVP)
- 1x Product Designer (UI/UX)
- 2x Mobile Engineers (React Native)
- 1x Backend Engineer (Node.js)
- 1x ML Engineer (CV + TFLite)
- 1x QA Tester
- **Total:** 5 people x 3 months

### D. Budget Estimate (MVP)
- Development: ₫200M ($8,000 USD @ $10/hr HCMC rates)
- Cloud/AI APIs: ₫10M ($400 USD)
- Marketing: ₫50M ($2,000 USD)
- Legal/Ops: ₫10M ($400 USD)
- **Total: ₫270M (~$11,000 USD)**

---

**END OF PRODUCT SPEC**

*This document is a living spec. Update as we learn from users.*
