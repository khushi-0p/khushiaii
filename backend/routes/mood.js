/**
 * routes/mood.js
 * ─────────────────────────────────────────────────────────────────
 * POST /api/analyzeMood
 * Accepts free-text mood description and returns a detected mood
 * label with a confidence score using keyword-based NLP.
 */

const express = require("express");
const router = express.Router();
const { analyzeText, getMoodList } = require("../services/moodEngine");

/**
 * POST /api/analyzeMood
 * Body: { text: "I'm feeling really pumped and ready to go!" }
 * Returns: { mood, confidence, score, matchedWords, matches }
 */
router.post("/", (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        error: "Please provide a non-empty 'text' field in the request body.",
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        error: "Text must be 500 characters or fewer.",
      });
    }

    const result = analyzeText(text.trim());

    return res.json({
      success: true,
      ...result,
      supportedMoods: getMoodList(),
    });
  } catch (err) {
    console.error("❌ analyzeMood error:", err.message);
    return res.status(500).json({ error: "Mood analysis failed. Please try again." });
  }
});

/**
 * GET /api/analyzeMood/moods
 * Returns the list of all supported mood labels.
 */
router.get("/moods", (req, res) => {
  res.json({ moods: getMoodList() });
});

module.exports = router;
