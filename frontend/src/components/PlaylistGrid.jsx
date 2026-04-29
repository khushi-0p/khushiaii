/**
 * PlaylistGrid.jsx
 * Displays the generated playlist of SongCards and action buttons.
 */

import { useState, useEffect } from "react";
import SongCard from "./SongCard";
import { getLiked, getDisliked, toggleLike, toggleDislike, savePlaylist } from "../utils/localStorage";
import "./PlaylistGrid.css";

export default function PlaylistGrid({ playlist, meta, onRegenerate }) {
  const [liked, setLiked] = useState({});
  const [disliked, setDisliked] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load likes/dislikes on mount
  useEffect(() => {
    setLiked(getLiked());
    setDisliked(getDisliked());
  }, [playlist]);

  const handleLike = (id) => setLiked(toggleLike(id));
  const handleDislike = (id) => setDisliked(toggleDislike(id));

  const handleSave = () => {
    setIsSaving(true);
    // Filter out disliked songs before saving
    const tracksToSave = playlist.filter((t) => !disliked[t.id]);

    savePlaylist(meta.mood, meta.activity, tracksToSave);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600); // fake delay for UX
  };

  if (!playlist || playlist.length === 0) return null;

  return (
    <section className="playlist-grid" aria-label="Generated Playlist">
      {/* Header */}
      <div className="playlist-grid__header">
        <div className="playlist-grid__title-group">
          <h2 className="playlist-grid__title">Your Curated Playlist</h2>
          <p className="playlist-grid__subtitle">
            Based on: <strong>{meta.mood}</strong> {meta.activity && `+ ${meta.activity}`}
            <span className="playlist-grid__count">({playlist.length} tracks)</span>
          </p>
        </div>

        <div className="playlist-grid__actions">
          <button
            className="btn btn-secondary"
            onClick={onRegenerate}
            aria-label="Regenerate playlist"
          >
            🔄 Regenerate
          </button>
          <button
            className={`btn ${saveSuccess ? "btn-success" : "btn-primary"}`}
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            aria-label="Save playlist"
          >
            {isSaving ? "Saving..." : saveSuccess ? "✅ Saved!" : "💾 Save Playlist"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="playlist-grid__items">
        {playlist.map((track, index) => (
          <div
            key={track.id}
            className="playlist-grid__item-wrap animate-scaleIn"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <SongCard
              track={track}
              liked={!!liked[track.id]}
              disliked={!!disliked[track.id]}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
