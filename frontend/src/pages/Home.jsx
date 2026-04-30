/**
 * Home.jsx
 * Main page containing mood/activity selectors, text input, and playlist grid.
 */

import { useState, useEffect } from "react";
import MoodSelector from "../components/MoodSelector";
import ActivitySelector from "../components/ActivitySelector";
import TextMoodInput from "../components/TextMoodInput";
import ArtistSelector from "../components/ArtistSelector";
import PlaylistGrid from "../components/PlaylistGrid";
import { usePlaylist } from "../hooks/usePlaylist";
import { getLastMood, getLastActivity, saveLastMood, saveLastActivity } from "../utils/localStorage";
import "./Home.css";

export default function Home() {
  const [mood, setMood] = useState("");
  const [activity, setActivity] = useState("");
  const [artist, setArtist] = useState("");
  const { playlist, loading, error, meta, fetchPlaylist, analyzeMood, clearPlaylist } = usePlaylist();

  // Load last selections on mount
  useEffect(() => {
    const lastMood = getLastMood();
    const lastAct = getLastActivity();
    const lastArtist = localStorage.getItem("aiplayer_last_artist");
    if (lastMood) setMood(lastMood);
    if (lastAct) setActivity(lastAct);
    if (lastArtist) setArtist(lastArtist);
  }, []);

  const handleMoodChange = (m) => {
    setMood(m);
    saveLastMood(m);
  };

  const handleActivityChange = (a) => {
    setActivity(a);
    saveLastActivity(a);
  };

  const handleArtistChange = (a) => {
    setArtist(a);
    localStorage.setItem("aiplayer_last_artist", a);
  };

  const handleGenerate = () => {
    if (!mood) return; // Mood is required (handled by UI validation but just in case)
    fetchPlaylist({ mood, activity, artist });
  };

  return (
    <main className="home container animate-fadeIn">
      {/* Hero Section */}
      <section className="home__hero">
        <div className="home__badge animate-fadeInUp">
          <span className="home__badge-icon">✨</span>
          <span className="home__badge-text">AI-Powered Music Curation</span>
        </div>
        <h1 className="home__title animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          Curate your perfect <span className="gradient-text">vibe.</span>
        </h1>
        <p className="home__subtitle animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          Stop searching for the right playlist. Let Khushi AI generate the perfect soundtrack designed specifically for your mood and activities.
        </p>
      </section>

      {/* Selectors */}
      <div className="home__selectors glass-card">
        <MoodSelector selected={mood} onChange={handleMoodChange} />
        <ActivitySelector selected={activity} onChange={handleActivityChange} />
        <ArtistSelector selectedArtist={artist} onChange={handleArtistChange} />

        <div className="home__divider"><span>OR</span></div>

        <TextMoodInput onMoodDetected={handleMoodChange} analyzeMood={analyzeMood} />

        {/* Generate Button */}
        <div className="home__generate-wrap">
          <button
            className="btn btn-primary home__generate-btn"
            onClick={handleGenerate}
            disabled={!mood || loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                Curating Playlist...
              </>
            ) : (
              <>✨ Generate Playlist</>
            )}
          </button>
          {!mood && <p className="home__helper-text">Select a mood to generate a playlist</p>}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="home__error animate-fadeInUp">
          <p>⚠️ {typeof error === "string" ? error : (error.message || JSON.stringify(error))}</p>
        </div>
      )}

      {/* Playlist Grid */}
      {playlist.length > 0 && (
        <PlaylistGrid playlist={playlist} meta={meta} onRegenerate={handleGenerate} />
      )}
    </main>
  );
}
