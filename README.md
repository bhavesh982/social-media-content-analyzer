# Social Media Content Analyzer

Smart PDF / image ingestion, instant KPIs, and Gemini-powered creative guidance for social media managers.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000?logo=vercel)](https://social-media-content-analyzer-verce.vercel.app/) 
[![Backend](https://img.shields.io/badge/Backend-Render-0468d7?logo=render)](https://social-media-content-analyzer-er7c.onrender.com/)

> **Try it now:** visit the Vercel-hosted UI → upload a PDF or screenshot → the app calls the Render API and streams back KPIs, trend guidance, and the raw Gemini payload for auditing.

---

## ✨ Features
- **Document ingestion:** drag/drop PDFs, JPGs, PNGs, or TXT files with automatic OCR via Tesseract (eng.traineddata).
- **Rule-driven KPIs:** custom heuristics surface word counts, hashtag density, and link usage even if AI is offline.
- **Gemini insights:** structured JSON prompt yields summaries, sentiment, optimized hashtags, and engagement predictions.
- **Raw visibility:** dashboard shows both parsed data and the original AI response for debugging.
- **Deployment ready:** Vercel (client) ↔ Render (server) with configurable API URL.

## 🧱 Architecture
```
client/ (Vite + React)
	├─ components (Dashboard, FileUpload, skeletons)
	├─ api/analyze.js (axios helper → Render backend)
	└─ styles / assets

server/ (Express)
	├─ routes/analyze.js (multer memory upload)
	├─ controllers/analyzeController.js (PDF/OCR + ruleAnalyzer + aiEnhancer)
	├─ services/
	│   ├─ pdfService.js (pdf-parse)
	│   ├─ ocrService.js (tesseract.js)
	│   ├─ ruleAnalyzer.js (heuristics)
	│   └─ aiEnhancer.js (Gemini API)
	└─ middleware/errorHandler.js
```

## 🧭 High-Level Design (HLD)

![High-level diagram](https://github.com/bhavesh982/social-media-content-analyzer/blob/main/docs/uml-hld.png)

**Flow:** the Vercel-hosted client captures files, posts them to the Render backend, which streams the payload through PDF/OCR services, heuristics, and Gemini enhancement before responding with KPIs, structured AI insights, and the raw model output.


## 🛠 Low-Level Design (LLD)

![Low-level diagram](https://github.com/bhavesh982/social-media-content-analyzer/blob/main/docs/uml-lld.png)

**Details:** the low-level map shows how the React entry (main → App → components) composes the upload workflow, while the Express stack wires `index.js` → `routes/analyze.js` → `analyzeController` and its service helpers.



## 🚀 Live URLs
- **Frontend (Vercel):** https://social-media-content-analyzer-verce.vercel.app/
- **Backend (Render):** https://social-media-content-analyzer-er7c.onrender.com/
	- API endpoint: `POST /analyze` with `multipart/form-data` (`file` field)

## 🛠️ Tech Stack
- React 18 + Vite + Tailwind (utility styles) + Axios
- Node.js + Express + Multer + pdf-parse + tesseract.js
- Google Gemini (via Generative Language API) for AI enrichment

## 🧪 Usage (Hosted)
1. Open the Vercel link above.
2. Drop a PDF/image or click **Upload Content**.
3. The UI shows quick KPIs while the backend extracts text.
4. Gemini analysis populates the dashboard and raw payload view once ready.

## 🧑‍💻 Local Development

### Prerequisites
- Node.js 18+
- npm (comes with Node)

### Clone & Install
```bash
git clone https://github.com/bhavesh982/social-media-content-analyzer.git
cd social-media-content-analyzer
npm install --prefix server
npm install --prefix client
```

### Environment Variables

**Server (`server/.env`):**
```
GEMINI_API_KEY=your_google_generative_language_api_key
```

**Client (`client/.env`):**
```
VITE_API_URL=http://localhost:3000/analyze
```
> Copy `client/.env.example` to `client/.env`. For production builds leave the default Render URL (`https://social-media-content-analyzer-er7c.onrender.com/analyze`).

### Run Locally
```bash
cd server
npm run start   # starts Express on http://localhost:3000

cd ../client
npm run dev     # opens Vite dev server (default http://localhost:5173)
```

## 📦 Deployment Notes
- **Frontend:** deploy `client/` to Vercel; set `VITE_API_URL` env to the Render endpoint.
- **Backend:** deploy `server/` to Render (Node service); ensure `GEMINI_API_KEY` is set and uploads dir is writeable.
- CORS is fully open via `app.use(cors())`, so the hosted frontend can call the API without extra tweaks. Tighten origins via environment variables if required later.

## 🤝 Contributing
1. Fork + clone.
2. Create a feature branch.
3. Ensure `npm run lint` (client) and tests (if any) pass.
4. Open a PR describing the change and screenshots of UI tweaks.

---

Need to verify the hosted build or request new enhancements? Open an issue or ping via discussions!
