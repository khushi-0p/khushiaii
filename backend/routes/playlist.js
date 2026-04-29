/**
 * routes/playlist.js
 * ─────────────────────────────────────────────────────────────────
 * GET /api/getPlaylist
 * Combines mood + activity inputs to fetch personalised Spotify
 * track recommendations.
 */

const express = require("express");
const router = express.Router();
const { buildAudioFeatures, analyzeText } = require("../services/moodEngine");
const { getRecommendations } = require("../services/spotifyService");

/**
 * GET /api/getPlaylist
 * Query params:
 *   mood     (string)  – e.g. "happy", "sad", "energetic"
 *   activity (string)  – e.g. "gym", "study", "sleep"
 *   text     (string)  – optional free-text for NLP mood detection
 *   limit    (number)  – number of tracks, default 20, max 50
 *
 * Returns: { playlist: Track[], mood, activity, features }
 */
router.get("/", async (req, res) => {
  try {
    let { mood, activity, text, limit = 20, artist } = req.query;

    // Sanitise limit
    limit = Math.min(Math.max(parseInt(limit, 10) || 20, 5), 50);

    // If free-text is provided and no mood explicitly selected, run NLP
    if (text && !mood) {
      const analysis = analyzeText(text);
      mood = analysis.mood;
      console.log(`🧠 NLP detected mood: "${mood}" (score: ${analysis.score})`);
    }

    // Default to "happy" if still no mood
    if (!mood) mood = "happy";

    console.log(`🎵 Building playlist | Mood: ${mood} | Activity: ${activity || "none"} | Artist: ${artist || "none"} | Limit: ${limit}`);

    // Build Spotify audio feature targets
    const features = buildAudioFeatures(mood, activity || null);

    // Fetch recommendations from Spotify
    const playlist = await getRecommendations(features, limit, artist);

    if (!playlist || playlist.length === 0) {
      return res.status(404).json({
        error: "No tracks found for this mood/activity combination. Try a different selection.",
      });
    }

    return res.json({
      success: true,
      mood,
      activity: activity || null,
      trackCount: playlist.length,
      features: {
        valence: features.valence,
        energy: features.energy,
        tempo: features.tempo,
        danceability: features.danceability,
      },
      playlist,
    });
  } catch (err) {
    console.error("❌ getPlaylist error:", err.message);

    // Return a user-friendly error
    if (err.message.includes("credentials") || err.message.includes("authentication")) {
      return res.status(503).json({
        error: "Spotify service unavailable. Please check server configuration.",
      });
    }

    return res.status(500).json({
      error: "Failed to generate playlist. Please try again.",
      detail: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
