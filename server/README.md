# Server

Instructions for running the server locally:

1. Install dependencies

```powershell
cd server
npm install
```

2. (Optional) enable Gemini (Generative Language API) enhancement

- Copy `.env.example` to `.env` and set `GEMINI_API_KEY` or `GOOGLE_API_KEY`:

```powershell
copy .env.example .env
# then edit `.env` and add your key (e.g. GEMINI_API_KEY=...)
```

3. Start the server

```powershell
npm start
```

4. Test the analyze endpoint

```powershell
curl -F "file=@test\sample.txt" http://localhost:3000/analyze
```

If no Gemini/Google API key is provided the AI enhancement will be skipped and analysis will be rule-based only.
