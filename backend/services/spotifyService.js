/**
 * spotifyService.js
 * ─────────────────────────────────────────────────────────────────
 * Handles all Spotify Web API communication:
 *  - Client Credentials OAuth token management (auto-refresh)
 *  - Track recommendations based on audio features
 *  - Token caching to avoid unnecessary API calls
 */

const axios = require("axios");

// ─── Token Cache ─────────────────────────────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * getAccessToken()
 * Uses Client Credentials flow — no user login required.
 * Returns a cached token if still valid, otherwise fetches a new one.
 */
async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Spotify credentials not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file."
    );
  }

  try {
    // Encode credentials as Base64 for Basic auth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    cachedToken = response.data.access_token;
    // expires_in is in seconds; store absolute expiry timestamp
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

    console.log("✅ Spotify access token refreshed");
    return cachedToken;
  } catch (err) {
    console.error("❌ Failed to get Spotify token:", err.response?.data || err.message);
    throw new Error("Spotify authentication failed. Check your credentials.");
  }
}

/**
 * getRecommendations(features, limit)
 * Calls the Spotify /recommendations endpoint with the given
 * audio feature targets.
 *
 * @param {Object} features  - Output from moodEngine.buildAudioFeatures()
 * @param {number} limit     - Number of tracks to return (default 20)
 * @returns {Array}          - Array of normalised track objects
 */
async function getRecommendations(features, limit = 20, artistName = null) {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.log("⚠️ No Spotify keys configured. Returning mock recommendations.");
    return getMockTracks(limit, artistName);
  }

  const token = await getAccessToken();

  let artistId = null;
  if (artistName) {
    artistId = await getArtistId(artistName, token);
  }

  // Spotify allows max 5 seed genres
  const seedGenres = (features.seed_genres || ["pop"]).slice(0, 5).join(",");

  const params = {
    limit,
    // Audio feature targets (Spotify tunes recommendations around these)
    target_valence: features.valence,
    target_energy: features.energy,
    target_tempo: features.tempo,
    target_danceability: features.danceability,
    target_instrumentalness: features.instrumentalness,
    target_acousticness: features.acousticness,
    min_popularity: 20,
  };

  // Spotify allows max 5 seeds total. 
  if (artistId) {
    params.seed_artists = artistId;
    // We can mix artist and genre, but let's keep it mostly focused on the artist
    params.seed_genres = seedGenres.split(',').slice(0, 3).join(',');
  } else {
    params.seed_genres = seedGenres;
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/recommendations", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    // Normalise each track to a consistent shape for the frontend
    return response.data.tracks.map(normaliseTrack);
  } catch (err) {
    console.error("❌ Spotify recommendations error:", err.response?.data || err.message);

    // If the request failed due to invalid seed genre, retry with safer genres
    if (err.response?.status === 400) {
      console.log("⚠️  Retrying with fallback genres...");
      return retryWithFallback(features, limit, token);
    }

    throw new Error("Failed to fetch recommendations from Spotify.");
  }
}

/**
 * retryWithFallback()
 * Retries the recommendation call with safe, always-valid genres.
 */
async function retryWithFallback(features, limit, token) {
  const fallbackGenres = ["pop", "rock", "electronic"].join(",");

  const params = {
    seed_genres: fallbackGenres,
    limit,
    target_valence: features.valence,
    target_energy: features.energy,
    target_tempo: features.tempo,
    target_danceability: features.danceability,
    min_popularity: 20,
  };

  try {
    const response = await axios.get("https://api.spotify.com/v1/recommendations", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data.tracks.map(normaliseTrack);
  } catch (err) {
    throw new Error("Fallback Spotify request also failed: " + err.message);
  }
}

/**
 * normaliseTrack(track)
 * Transforms the raw Spotify track object into a clean, frontend-friendly shape.
 */
function normaliseTrack(track) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    albumImage:
      track.album.images?.[0]?.url ||
      "https://via.placeholder.com/300x300?text=No+Image",
    previewUrl: track.preview_url,           // 30-sec MP3, may be null
    spotifyUrl: track.external_urls?.spotify,
    duration: track.duration_ms,
    popularity: track.popularity,
    explicit: track.explicit,
  };
}

/**
 * searchTracks(query, limit)
 * Fallback search when recommendations don't yield results.
 */
async function searchTracks(query, limit = 20) {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.log("⚠️ No Spotify keys configured. Returning mock search results.");
    return getMockTracks(limit);
  }

  const token = await getAccessToken();

  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: "track", limit },
    });

    return response.data.tracks.items.map(normaliseTrack);
  } catch (err) {
    console.error("❌ Spotify search error:", err.response?.data || err.message);
    throw new Error("Spotify search failed.");
  }
}

/**
 * getArtistId(artistName, token)
 * Searches Spotify for the given artist name and returns their internal ID.
 */
async function getArtistId(artistName, token) {
  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: artistName, type: "artist", limit: 1 },
    });
    const items = response.data.artists.items;
    return items.length > 0 ? items[0].id : null;
  } catch (err) {
    console.error(`❌ Failed to find artist ${artistName}:`, err.message);
    return null;
  }
}

/**
 * getMockTracks(limit, artistName)
 * Returns mock data if the user hasn't configured Spotify Developer Keys yet.
 */
function getMockTracks(limit, artistName = null) {
  const mocks = [
    {
      id: "4cOdK2wGLETKBW3PvgPWqT", // Rick Astley - Never Gonna Give You Up
      name: "Never Gonna Give You Up (Mock Data)",
      artists: "Rick Astley",
      album: "Whenever You Need Somebody",
      albumImage: "https://i.scdn.co/image/ab67616d0000b2734121fa0c20aa1ce6e5c9f53e",
      previewUrl: null,
      spotifyUrl: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
      duration: 213573,
      popularity: 80,
      explicit: false
    },
    {
      id: "3AJwUDP919kvQ9QcozQPxg", // Yellow - Coldplay
      name: "Yellow (Mock Data)",
      artists: "Coldplay",
      album: "Parachutes",
      albumImage: "https://i.scdn.co/image/ab67616d0000b27303e83b4266107b309dbda2f3",
      previewUrl: null,
      spotifyUrl: "https://open.spotify.com/track/3AJwUDP919kvQ9QcozQPxg",
      duration: 266773,
      popularity: 88,
      explicit: false
    },
    {
      id: "1Qrg8KqiBpW07V7PNxwwwL", // Hotel California
      name: "Hotel California (Mock Data)",
      artists: "Eagles",
      album: "Hotel California",
      albumImage: "https://i.scdn.co/image/ab67616d0000b27376d4cd12bb31f7a01cdb826b",
      previewUrl: null,
      spotifyUrl: "https://open.spotify.com/track/1Qrg8KqiBpW07V7PNxwwwL",
      duration: 391376,
      popularity: 84,
      explicit: false
    },
    {
      id: "7qiZfU4dY1lWllzX7mPBI3", // Shape of You
      name: "Shape of You (Mock Data)",
      artists: "Ed Sheeran",
      album: "÷ (Divide)",
      albumImage: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
      previewUrl: null,
      spotifyUrl: "https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3",
      duration: 233712,
      popularity: 86,
      explicit: false
    },
    {
      id: "0VjIjW4GlUZAMYd2vXMi3b", // Blinding Lights
      name: "Blinding Lights (Mock Data)",
      artists: "The Weeknd",
      album: "After Hours",
      albumImage: "https://i.scdn.co/image/ab67616d0000b273881d8d8378cd01099babcd44",
      previewUrl: null,
      spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
      duration: 200040,
      popularity: 93,
      explicit: false
    }
  ];

  // Return requested amount, looping the mocks if limit > 5
  const result = [];
  for (let i = 0; i < limit; i++) {
    const mockTrack = mocks[i % mocks.length];
    result.push({
      ...mockTrack,
      id: mockTrack.id + "_" + i, // Ensure unique IDs for React keys
      artists: artistName ? `${artistName} (Vibe Match)` : mockTrack.artists
    });
  }
  return result;
}

module.exports = { getRecommendations, searchTracks };
