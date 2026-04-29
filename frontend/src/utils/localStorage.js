/**
 * localStorage.js
 * Utility functions for persisting user preferences, liked songs,
 * and saved playlists in the browser's localStorage.
 */

const KEYS = {
  THEME: "aiplayer_theme",
  LIKED: "aiplayer_liked",
  DISLIKED: "aiplayer_disliked",
  SAVED_PLAYLISTS: "aiplayer_saved_playlists",
  LAST_MOOD: "aiplayer_last_mood",
  LAST_ACTIVITY: "aiplayer_last_activity",
};

// ─── Theme ───────────────────────────────────────────────────────
export const getTheme = () => localStorage.getItem(KEYS.THEME) || "dark";
export const saveTheme = (theme) => localStorage.setItem(KEYS.THEME, theme);

// ─── Liked / Disliked Songs ───────────────────────────────────────
export const getLiked = () => {
  try { return JSON.parse(localStorage.getItem(KEYS.LIKED)) || {}; }
  catch { return {}; }
};
export const toggleLike = (trackId) => {
  const liked = getLiked();
  const disliked = getDisliked();
  if (liked[trackId]) {
    delete liked[trackId];
  } else {
    liked[trackId] = true;
    delete disliked[trackId]; // can't like and dislike simultaneously
    saveDisliked(disliked);
  }
  localStorage.setItem(KEYS.LIKED, JSON.stringify(liked));
  return liked;
};

export const getDisliked = () => {
  try { return JSON.parse(localStorage.getItem(KEYS.DISLIKED)) || {}; }
  catch { return {}; }
};
export const toggleDislike = (trackId) => {
  const disliked = getDisliked();
  const liked = getLiked();
  if (disliked[trackId]) {
    delete disliked[trackId];
  } else {
    disliked[trackId] = true;
    delete liked[trackId];
    localStorage.setItem(KEYS.LIKED, JSON.stringify(liked));
  }
  saveDisliked(disliked);
  return disliked;
};
const saveDisliked = (d) => localStorage.setItem(KEYS.DISLIKED, JSON.stringify(d));

// ─── Saved Playlists ──────────────────────────────────────────────
export const getSavedPlaylists = () => {
  try { return JSON.parse(localStorage.getItem(KEYS.SAVED_PLAYLISTS)) || []; }
  catch { return []; }
};

export const savePlaylist = (mood, activity, tracks) => {
  const playlists = getSavedPlaylists();
  const newEntry = {
    id: Date.now(),
    mood,
    activity,
    tracks,
    savedAt: new Date().toISOString(),
    name: `${capitalise(mood)}${activity ? ` + ${capitalise(activity)}` : ""} Mix`,
  };
  playlists.unshift(newEntry); // newest first
  // Keep max 20 saved playlists
  const trimmed = playlists.slice(0, 20);
  localStorage.setItem(KEYS.SAVED_PLAYLISTS, JSON.stringify(trimmed));
  return newEntry;
};

export const deletePlaylist = (id) => {
  const playlists = getSavedPlaylists().filter((p) => p.id !== id);
  localStorage.setItem(KEYS.SAVED_PLAYLISTS, JSON.stringify(playlists));
  return playlists;
};

export const clearSavedPlaylists = () => {
  localStorage.setItem(KEYS.SAVED_PLAYLISTS, JSON.stringify([]));
  return [];
};

// ─── Last Selections ──────────────────────────────────────────────
export const getLastMood = () => localStorage.getItem(KEYS.LAST_MOOD) || "";
export const saveLastMood = (mood) => localStorage.setItem(KEYS.LAST_MOOD, mood);
export const getLastActivity = () => localStorage.getItem(KEYS.LAST_ACTIVITY) || "";
export const saveLastActivity = (a) => localStorage.setItem(KEYS.LAST_ACTIVITY, a);

// ─── Helpers ──────────────────────────────────────────────────────
const capitalise = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
