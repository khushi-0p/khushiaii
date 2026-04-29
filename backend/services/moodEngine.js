/**
 * moodEngine.js
 * ─────────────────────────────────────────────────────────────────
 * Core AI/NLP engine that:
 *  1. Maps mood labels → Spotify audio feature targets
 *  2. Applies activity-based modifiers on top
 *  3. Analyses free-text using an AFINN-style keyword list to
 *     detect mood when the user types a description
 */

// ─── Mood → Spotify Audio Feature Mapping ───────────────────────
// Values are Spotify recommendation "target_*" parameters (0.0–1.0)
const MOOD_FEATURES = {
  happy: {
    valence: 0.85,
    energy: 0.78,
    tempo: 128,
    danceability: 0.75,
    instrumentalness: 0.05,
    acousticness: 0.1,
    seed_genres: ["pop", "dance", "happy"],
  },
  sad: {
    valence: 0.18,
    energy: 0.25,
    tempo: 72,
    danceability: 0.35,
    instrumentalness: 0.25,
    acousticness: 0.55,
    seed_genres: ["sad", "acoustic", "indie"],
  },
  energetic: {
    valence: 0.72,
    energy: 0.92,
    tempo: 152,
    danceability: 0.82,
    instrumentalness: 0.03,
    acousticness: 0.05,
    seed_genres: ["edm", "electronic", "dance"],
  },
  relaxed: {
    valence: 0.55,
    energy: 0.32,
    tempo: 82,
    danceability: 0.45,
    instrumentalness: 0.35,
    acousticness: 0.6,
    seed_genres: ["chill", "ambient", "sleep"],
  },
  angry: {
    valence: 0.28,
    energy: 0.88,
    tempo: 145,
    danceability: 0.55,
    instrumentalness: 0.04,
    acousticness: 0.05,
    seed_genres: ["rock", "metal", "punk"],
  },
  romantic: {
    valence: 0.68,
    energy: 0.42,
    tempo: 92,
    danceability: 0.58,
    instrumentalness: 0.15,
    acousticness: 0.45,
    seed_genres: ["romance", "r-n-b", "soul"],
  },
  focused: {
    valence: 0.5,
    energy: 0.5,
    tempo: 100,
    danceability: 0.4,
    instrumentalness: 0.65,
    acousticness: 0.3,
    seed_genres: ["study", "classical", "piano"],
  },
  melancholic: {
    valence: 0.25,
    energy: 0.35,
    tempo: 78,
    danceability: 0.3,
    instrumentalness: 0.3,
    acousticness: 0.5,
    seed_genres: ["indie", "alternative", "singer-songwriter"],
  },
};

// ─── Activity Modifiers ──────────────────────────────────────────
// These deltas are added to the base mood features
const ACTIVITY_MODIFIERS = {
  gym: {
    energy: +0.12,
    tempo: +20,
    danceability: +0.08,
    instrumentalness: -0.08,
    valence: +0.05,
  },
  study: {
    energy: -0.2,
    tempo: -25,
    instrumentalness: +0.3,
    danceability: -0.15,
    valence: 0,
  },
  sleep: {
    energy: -0.25,
    tempo: -30,
    instrumentalness: +0.35,
    danceability: -0.25,
    valence: -0.05,
  },
  travel: {
    energy: +0.08,
    tempo: +10,
    danceability: +0.05,
    instrumentalness: -0.05,
    valence: +0.08,
  },
  party: {
    energy: +0.15,
    tempo: +18,
    danceability: +0.15,
    instrumentalness: -0.12,
    valence: +0.1,
  },
  meditation: {
    energy: -0.28,
    tempo: -35,
    instrumentalness: +0.4,
    danceability: -0.3,
    acousticness: +0.2,
  },
  walking: {
    energy: +0.05,
    tempo: +8,
    danceability: +0.05,
    instrumentalness: -0.02,
    valence: +0.05,
  },
  work: {
    energy: -0.1,
    tempo: -10,
    instrumentalness: +0.2,
    danceability: -0.1,
    valence: 0,
  },
};

// ─── AFINN-style keyword list for text analysis ──────────────────
// Score: +2 (strongly positive) to -2 (strongly negative)
const KEYWORD_SCORES = {
  // Positive
  amazing: 2, awesome: 2, fantastic: 2, great: 1, good: 1,
  happy: 2, joy: 2, excited: 2, love: 2, wonderful: 2,
  excellent: 2, brilliant: 2, cheerful: 2, elated: 2, thrilled: 2,
  motivated: 1, inspired: 1, energized: 2, pumped: 2, fired: 1,
  blessed: 1, grateful: 1, content: 1, pleased: 1, glad: 1,
  // Negative
  sad: -2, depressed: -2, unhappy: -2, miserable: -2, crying: -2,
  terrible: -2, awful: -2, horrible: -2, bad: -1, upset: -1,
  angry: -2, furious: -2, mad: -1, frustrated: -1, annoyed: -1,
  tired: -1, exhausted: -1, drained: -1, bored: -1, lonely: -2,
  anxious: -1, stressed: -1, worried: -1, nervous: -1, scared: -1,
  // Calm
  calm: 0, relaxed: 0, peaceful: 0, chill: 0, mellow: 0,
  quiet: 0, serene: 0, tranquil: 0, soothing: 0, gentle: 0,
};

/**
 * analyzeText(text) → { mood, confidence, score }
 * Tokenises the input, scores each recognised word, then maps the
 * aggregate to the closest mood bucket.
 */
function analyzeText(text) {
  if (!text || typeof text !== "string") {
    return { mood: "happy", confidence: 0, score: 0, message: "No text provided" };
  }

  // Tokenise: lowercase, strip punctuation, split on whitespace
  const tokens = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);

  let totalScore = 0;
  let matchedWords = 0;
  const matches = [];

  tokens.forEach((token) => {
    if (KEYWORD_SCORES[token] !== undefined) {
      totalScore += KEYWORD_SCORES[token];
      matchedWords++;
      matches.push({ word: token, score: KEYWORD_SCORES[token] });
    }
  });

  // Normalise: avg score per matched word (or default to 0)
  const avgScore = matchedWords > 0 ? totalScore / matchedWords : 0;
  const confidence = Math.min(matchedWords / Math.max(tokens.length, 1), 1);

  // Map avg score to mood bucket
  let mood;
  if (avgScore >= 1.5)       mood = "energetic";
  else if (avgScore >= 0.8)  mood = "happy";
  else if (avgScore >= 0.2)  mood = "romantic";
  else if (avgScore >= -0.2) mood = "relaxed";
  else if (avgScore >= -0.8) mood = "melancholic";
  else if (avgScore >= -1.5) mood = "sad";
  else                        mood = "angry";

  return {
    mood,
    confidence: parseFloat((confidence * 100).toFixed(1)),
    score: parseFloat(avgScore.toFixed(2)),
    matchedWords,
    matches,
  };
}

/**
 * buildAudioFeatures(mood, activity) → Spotify-ready feature object
 * Merges the base mood features with any activity modifiers and
 * clamps all 0–1 values to valid bounds.
 */
function buildAudioFeatures(mood = "happy", activity = null) {
  // Fallback to happy if unknown mood
  const base = MOOD_FEATURES[mood.toLowerCase()] || MOOD_FEATURES.happy;

  // Clone to avoid mutating the source object
  const features = { ...base, seed_genres: [...base.seed_genres] };

  // Apply activity modifier if provided
  if (activity && ACTIVITY_MODIFIERS[activity.toLowerCase()]) {
    const mod = ACTIVITY_MODIFIERS[activity.toLowerCase()];

    Object.keys(mod).forEach((key) => {
      if (features[key] !== undefined) {
        features[key] = features[key] + mod[key];
      }
    });

    // Override seed genres for specific activity combos
    if (activity === "study" || activity === "work") {
      features.seed_genres = ["study", "classical", "ambient"];
    } else if (activity === "sleep" || activity === "meditation") {
      features.seed_genres = ["ambient", "sleep", "chill"];
    } else if (activity === "gym") {
      features.seed_genres = ["work-out", "electronic", "hip-hop"];
    } else if (activity === "party") {
      features.seed_genres = ["dance", "edm", "pop"];
    }
  }

  // Clamp 0–1 values
  const CLAMP_KEYS = ["valence", "energy", "danceability", "instrumentalness", "acousticness"];
  CLAMP_KEYS.forEach((key) => {
    if (features[key] !== undefined) {
      features[key] = Math.max(0, Math.min(1, parseFloat(features[key].toFixed(3))));
    }
  });

  // Clamp tempo to 60–200 BPM
  if (features.tempo) {
    features.tempo = Math.max(60, Math.min(200, Math.round(features.tempo)));
  }

  return features;
}

/**
 * getMoodList() → string[]
 * Returns all supported mood labels.
 */
function getMoodList() {
  return Object.keys(MOOD_FEATURES);
}

/**
 * getActivityList() → string[]
 * Returns all supported activity labels.
 */
function getActivityList() {
  return Object.keys(ACTIVITY_MODIFIERS);
}

module.exports = { analyzeText, buildAudioFeatures, getMoodList, getActivityList };
