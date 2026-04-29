/**
 * Saved.jsx
 * Displays all saved playlists from localStorage with search and clear functionality.
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getSavedPlaylists, deletePlaylist, clearSavedPlaylists } from "../utils/localStorage";
import SongCard from "../components/SongCard";
import "./Saved.css";

export default function Saved() {
  const [playlists, setPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setPlaylists(getSavedPlaylists());
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      setPlaylists(deletePlaylist(id));
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete ALL saved playlists? This cannot be undone.")) {
      setPlaylists(clearSavedPlaylists());
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  // Filter playlists based on search query
  const filteredPlaylists = useMemo(() => {
    if (!searchQuery) return playlists;
    const lowerQuery = searchQuery.toLowerCase();
    return playlists.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      formatDate(p.savedAt).toLowerCase().includes(lowerQuery)
    );
  }, [playlists, searchQuery]);

  // Calculate stats
  const totalPlaylists = playlists.length;
  const totalTracks = playlists.reduce((acc, curr) => acc + curr.tracks.length, 0);

  if (playlists.length === 0) {
    return (
      <main className="saved container animate-fadeIn">
        <div className="saved__empty glass-card">
          <div className="saved__empty-visual">
            <div className="saved__empty-blob"></div>
            <span className="saved__empty-icon">🎧</span>
          </div>
          <h2>Your Collection is Empty</h2>
          <p>You haven't saved any curated playlists yet. Head over to the discover page to find the perfect vibe.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>
            Start Discovering
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="saved container animate-fadeIn">
      {/* Dashboard Header */}
      <header className="saved__dashboard glass-card">
        <div className="saved__dashboard-stats">
          <div className="stat-box">
            <span className="stat-value gradient-text">{totalPlaylists}</span>
            <span className="stat-label">Playlists</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-box">
            <span className="stat-value gradient-text">{totalTracks}</span>
            <span className="stat-label">Tracks</span>
          </div>
        </div>

        <div className="saved__dashboard-controls">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search playlists..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost clear-btn" onClick={handleClearAll}>
            🗑️ Clear All
          </button>
        </div>
      </header>

      {/* Filter Results State */}
      {searchQuery && filteredPlaylists.length === 0 && (
        <div className="saved__no-results">
          <p>No playlists found matching "{searchQuery}"</p>
        </div>
      )}

      {/* Playlist Grid */}
      <div className="saved__list">
        {filteredPlaylists.map((playlist) => (
          <article key={playlist.id} className="saved__playlist glass-card">
            <div className="saved__playlist-header">
              <div>
                <h2 className="saved__playlist-name">{playlist.name}</h2>
                <p className="saved__playlist-meta">
                  <span className="meta-badge">{playlist.tracks.length} tracks</span>
                  <span className="meta-date">Saved on {formatDate(playlist.savedAt)}</span>
                </p>
              </div>
              <button
                className="btn btn-ghost delete-btn"
                onClick={() => handleDelete(playlist.id)}
                aria-label="Delete playlist"
                title="Delete Playlist"
              >
                ✕
              </button>
            </div>

            {/* Horizontal scrolling track list */}
            <div className="saved__tracks custom-scrollbar">
              {playlist.tracks.map((track) => (
                <div key={track.id} className="saved__track-wrap">
                  <SongCard
                    track={track}
                    liked={false}     // View-only mode for saved tracks
                    disliked={false}  
                    onLike={() => {}}
                    onDislike={() => {}}
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
