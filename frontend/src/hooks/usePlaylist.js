/**
 * usePlaylist.js
 * Custom React hook that encapsulates all API calls and playlist state.
 */

import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE = "/api"; // proxied by Vite to http://localhost:5000

export function usePlaylist() {
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null); // { mood, activity, features, trackCount }

  /**
   * fetchPlaylist({ mood, activity, text, limit })
   * Calls GET /api/getPlaylist and updates state.
   */
  const fetchPlaylist = useCallback(async ({ mood, activity, artist, text, limit = 20 } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = { limit };
      if (mood)     params.mood = mood;
      if (activity) params.activity = activity;
      if (artist)   params.artist = artist;
      if (text)     params.text = text;

      const { data } = await axios.get(`${API_BASE}/getPlaylist`, { params });

      setPlaylist(data.playlist || []);
      setMeta({
        mood: data.mood,
        activity: data.activity,
        features: data.features,
        trackCount: data.trackCount,
      });
    } catch (err) {
      // Robust error message extraction
      const msg = 
        (typeof err.response?.data?.error === 'string' ? err.response.data.error : null) ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Failed to load playlist. Please try again.";
      
      setError(msg);
      setPlaylist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * analyzeMood(text)
   * Calls POST /api/analyzeMood and returns { mood, confidence, score }
   */
  const analyzeMood = useCallback(async (text) => {
    try {
      const { data } = await axios.post(`${API_BASE}/analyzeMood`, { text });
      return data;
    } catch (err) {
      const msg = 
        (typeof err.response?.data?.error === 'string' ? err.response.data.error : null) ||
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Mood analysis failed. Please try again.";
      
      throw new Error(msg);
    }
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setMeta(null);
    setError(null);
  }, []);

  return { playlist, loading, error, meta, fetchPlaylist, analyzeMood, clearPlaylist };
}
