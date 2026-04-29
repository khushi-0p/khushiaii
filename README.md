# 🎵 AI Music Playlist Curator

A full-stack web application that curates personalized music playlists based on your mood and activity, powered by the Spotify Web API and a custom keyword-based NLP engine.

## ✨ Features

- **Mood & Activity Selection**: Combine moods (Happy, Sad, Energetic, etc.) with activities (Gym, Study, Sleep, etc.) for fine-tuned curation.
- **NLP Text Analysis**: Type how you're feeling and the AI will automatically detect your mood using AFINN-based sentiment analysis.
- **Spotify Integration**: Fetches real track recommendations, album art, and 30-second audio previews directly from Spotify.
- **Dark & Light Mode**: A sleek, glassmorphism UI with smooth CSS animations and customizable themes.
- **Save & Like**: Like individual songs or save entire generated playlists to your browser's local storage.
- **No Login Required**: Uses the Spotify Client Credentials flow to fetch music without requiring users to log in to their personal Spotify accounts.

---

## 🚀 Setup Instructions

### 1. Spotify API Credentials

You will need a free Spotify Developer account to get your API keys:
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Click **Create App**.
3. Give it a name (e.g., "AI Playlist Curator") and description.
4. Set the Redirect URI to `http://localhost:5173` (even though we don't strictly need it for the Client Credentials flow, it's required to create the app).
5. Once created, go to **Settings** and copy your **Client ID** and **Client Secret**.

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
4. Open the new `.env` file and paste your Spotify credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will run on http://localhost:5000*

### 3. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The app will run on http://localhost:5173*

---

## 🏗️ Architecture

- **Frontend**: React 18, Vite, React Router, Axios, Vanilla CSS Custom Properties.
- **Backend**: Node.js, Express, Axios, express-rate-limit.
- **State Management**: React Hooks + LocalStorage API.
- **AI Logic**: Custom mapping of moods/activities to Spotify Audio Features (`target_valence`, `target_energy`, `target_tempo`, etc.).

## 📦 Deployment (Optional)
- **Frontend** is configured perfectly for **Vercel** or **Netlify**. Just link the repository and set the root directory to `frontend/`.
- **Backend** can be deployed to **Render**, **Railway**, or **Heroku**. Set the build command to `npm install` and start command to `npm start`. Make sure to add your `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to the environment variables on your hosting provider.
