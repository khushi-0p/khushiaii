/**
 * server.js
 * ─────────────────────────────────────────────────────────────────
 * Entry point for the AI Music Playlist Curator backend.
 * Sets up Express with CORS, rate limiting, and route registration.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const playlistRouter = require("./routes/playlist");
const moodRouter = require("./routes/mood");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────

// CORS: allow the Vite dev server and any deployed frontend
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:3000",
      /\.vercel\.app$/,    // allow any Vercel preview URL
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter — max 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many requests. Please wait a moment and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// ─── Routes ──────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => {
  res.json({
    service: "AI Music Playlist Curator API",
    version: "1.0.0",
    status: "healthy",
    endpoints: [
      "GET  /api/getPlaylist?mood=happy&activity=gym&limit=20",
      "POST /api/analyzeMood  { text: '...' }",
      "GET  /api/analyzeMood/moods",
    ],
  });
});

app.use("/api/getPlaylist", playlistRouter);
app.use("/api/analyzeMood", moodRouter);

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start Server ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║   🎵  AI Music Playlist Curator — Backend        ║
║   ✅  Server running on http://localhost:${PORT}   ║
║   📡  Spotify API: ${process.env.SPOTIFY_CLIENT_ID ? "Configured ✅" : "NOT configured ⚠️ "}            ║
╚══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
