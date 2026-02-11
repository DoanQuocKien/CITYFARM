# 🌿 CITYFARM - AI Urban Gardening App

![Project Status](https://img.shields.io/badge/Status-MVP_Ready-success)
![Tech Stack](https://img.shields.io/badge/Stack-React_%7C_FastAPI_%7C_Gemini_AI-blue)
![License](https://img.shields.io/badge/License-MIT-green)

**CITYFARM** is an AI-powered platform designed to help urban residents grow clean food at home. By leveraging **Computer Vision** and **Generative AI**, we solve the common pain points of "not knowing what to grow" or "how to care for plants" in small urban spaces like balconies and rooftops.

🔗 **Live Demo:** [https://cityfarm.vercel.app/](https://cityfarm.vercel.app/)  
🎨 **Figma Design:** [View Design File](https://www.figma.com/design/rCO58uggocc2sKz9XYFXQf/AI-Urban-Gardening-App)

---

## ✨ Key Features

### 📸 **1. AI Space Analysis**
Stop guessing. Upload a photo of your balcony, and our AI analyzes:
* [cite_start]**Light Conditions:** Distinguishes between direct sunlight, partial shade, and artificial light[cite: 21].
* [cite_start]**Climate Context:** Integrates real-time weather data (Temperature/Humidity) for your specific location[cite: 99].
* [cite_start]**Space Estimation:** Calculates available planting area[cite: 24].
* [cite_start]**Smart Recommendations:** Suggests the top plants (e.g., Tomato, Mint, Lettuce) that will actually survive in your specific environment [cite: 26-32].

### 🎨 **2. Generative Garden Visualization**
See it before you plant it.
* [cite_start]The app uses Generative AI to overlay lush, realistic plants onto your original photo, showing you exactly how your "future garden" will look[cite: 43].
* [cite_start]Adjusts for lighting and perspective automatically[cite: 58].

### 💬 **3. AI Gardening Assistant**
* [cite_start]Chat with a specialized botanical AI agent trained on specific plant needs[cite: 62].
* [cite_start]**Context-Aware:** Knows if you are asking about a Tomato or Mint plant and adjusts advice accordingly[cite: 95].
* [cite_start]**Diagnose Issues:** Upload photos to identify pests or diseases (e.g., yellow leaves, aphids)[cite: 70].

### 🥬 **4. Community Marketplace**
* [cite_start]**Social Feed:** Share your harvest and view posts from other urban farmers[cite: 400].
* [cite_start]**Fresh Market:** Buy and sell home-grown produce within your local community[cite: 408].
* [cite_start]**Verified Growers:** Badges for users with documented planting logs[cite: 432].

---

## 🛠️ Tech Stack

### **Frontend**
* [cite_start]**Framework:** React 18 (Vite) + TypeScript[cite: 2348, 2352].
* [cite_start]**UI Library:** Tailwind CSS v4, Shadcn UI, Radix UI[cite: 1304, 1724].
* **State Management:** React Hooks.
* [cite_start]**Icons:** Lucide React[cite: 2385].

### **Backend**
* [cite_start]**Framework:** Python FastAPI[cite: 9].
* [cite_start]**AI Engine:** Google Gemini 2.5 Pro (Vision & Text)[cite: 33].
* [cite_start]**Image Processing:** Pillow (PIL), NumPy[cite: 9].
* [cite_start]**Weather:** OpenWeatherMap API[cite: 9].

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* A Google Gemini API Key
* An OpenWeatherMap API Key

### 1. Backend Setup (Python)

Navigate to the backend folder and install dependencies:

```bash
cd back-end
# Create a virtual environment (optional but recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install requirements
pip install -r requirements.txt
