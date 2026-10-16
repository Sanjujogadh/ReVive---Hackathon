# ReVive — Give Waste a Second Life
## AI-Powered Smart Recycling Assistant & Virtual Facility Twin

**Team:** Team ReVive  
**Hackathon Deadline:** October 16, 2026, 4:30 PM IST  
**Active Municipality:** Bengaluru (BBMP Solid Waste Management Bye-Laws 2020)  

---

### Quick Start (Zero Dependencies)

No `npm install` or external package installation required. ReVive runs out of the box using Python 3:

```bash
# 1. Start the local server
python3 server.py

# 2. Open in your browser
open http://localhost:8000
```

---

### Core Connected User Journey

1. **Smart Packaging Scanner:**
   * **Quick Samples:** Click any test chip (*Chips Sachet*, *Tetra Pak*, *Pizza Box*, *PET Bottle*, *AA Battery*).
   * **Search Database:** Type any packaging name with instant autocomplete.
   * **Upload / Camera:** Drop an image or snap a photo.
2. **In-Place Recycling Assistant:**
   * Displays estimated packaging composition (e.g. *BOPP film + Aluminum barrier + LDPE*).
   * Highlights visual contamination risk (e.g. *grease, oils, unrinsed liquids*).
   * Provides **Verified BBMP Guidelines** with official legal citations (*Schedule-I, Category A/B/C*).
   * Provides circular packaging alternatives.
   * Includes a **User Override Dropdown** to correct uncertain identifications.
3. **2D Digital Twin Facility (`[SIMULATED]`):**
   * Click **"Simulate Disposal in Digital Twin"** to dispatch the item.
   * Watch the item travel on the animated conveyor belt through the optical NIR scanning chamber.
   * Observe contamination alerts and automatic sorting into one of the 4 municipal bins:
     - **Blue:** Dry Recyclables
     - **Green:** Wet / Organics
     - **Red:** Domestic Hazardous & Sanitary
     - **Slate:** Landfill / RDF Co-Processing
   * Includes direct **"+ Test Infeed"** spawner buttons to test the facility without scanning.
4. **Real-Time Analytics Dashboard (`[SIMULATED]`):**
   * Live telemetry updates as items are sorted.
   * Tracks simulated diverted kilograms, intercepted contamination incidents, and bin fill levels.
   * Explains the material science of why multi-layer plastics fail mechanical recycling.

---

### AI Vision Setup & Key Management

ReVive keeps all API keys strictly on the backend (`server.py`). 

* **To enable live Gemini Vision recognition:**
  1. Create a `.env` file in the project folder (or copy `.env.example` to `.env`):
     ```bash
     GEMINI_API_KEY="your-gemini-api-key"
     ```
  2. Restart the server:
     ```bash
     python3 server.py
     ```
  3. The status indicator in the top navbar will update to `Gemini Vision Active • BBMP Rules`.

* **If no API key is provided:**
  * ReVive operates safely in verified database mode.
  * Uploading an image without an active API key displays an explicit **"AI Vision Unavailable"** card explaining that the key is missing, and provides 1-click manual search without ever misrepresenting previous items as AI predictions.

