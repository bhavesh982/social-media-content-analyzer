# social-media-content-analyzer
Social Media Content Analyzer is an application that analyzes social media posts and suggests engagement improvements.

## Frontend configuration

The Vite client reads its API target from `VITE_API_URL`.

1. Copy `client/.env.example` to `client/.env`.
2. Leave the default hosted value (`https://social-media-content-analyzer-er7c.onrender.com/analyze`) for production builds.
3. For local testing point it at your dev server, e.g. `VITE_API_URL=http://localhost:3000/analyze`.
