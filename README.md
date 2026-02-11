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
* **Light Conditions:** Distinguishes between direct sunlight, partial shade, and artificial light.
* **Climate Context:** Integrates real-time weather data (Temperature/Humidity) for your specific location.
* **Space Estimation:** Calculates available planting area.
* **Smart Recommendations:** Suggests the top plants (e.g., Tomato, Mint, Lettuce) that will actually survive in your specific environment.

### 🎨 **2. Generative Garden Visualization**
See it before you plant it.
* The app uses Generative AI to overlay lush, realistic plants onto your original photo, showing you exactly how your "future garden" will look.
* Adjusts for lighting and perspective automatically.

### 💬 **3. AI Gardening Assistant**
* Chat with a specialized botanical AI agent trained on specific plant needs.
* **Context-Aware:** Knows if you are asking about a Tomato or Mint plant and adjusts advice accordingly.
* **Diagnose Issues:** Upload photos to identify pests or diseases (e.g., yellow leaves, aphids).

### 🥬 **4. Community Marketplace**
* **Social Feed:** Share your harvest and view posts from other urban farmers.
* **Fresh Market:** Buy and sell home-grown produce within your local community.
* **Verified Growers:** Badges for users with documented planting logs.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React 18 (Vite) + TypeScript.
* **UI Library:** Tailwind CSS v4, Shadcn UI, Radix UI.
* **State Management:** React Hooks.
* **Icons:** Lucide React.

### **Backend**
* **Framework:** Python FastAPI.
* **AI Engine:** Google Gemini 2.5 Pro (Vision & Text).
* **Image Processing:** Pillow (PIL), NumPy.
* **Weather:** OpenWeatherMap API.

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
