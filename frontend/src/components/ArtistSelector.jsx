/**
 * ArtistSelector.jsx
 * Component to allow users to input a specific singer/artist name.
 * Features a text input and quick-select chips.
 */

import { useState } from "react";
import "./ArtistSelector.css";

const POPULAR_ARTISTS = [
  "Taylor Swift",
  "Arijit Singh",
  "The Weeknd",
  "Drake",
  "Billie Eilish",
  "Ed Sheeran"
];

export default function ArtistSelector({ selectedArtist, onChange }) {
  const [inputValue, setInputValue] = useState(selectedArtist || "");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value); // Update parent state in real-time
  };

  const handleChipClick = (artist) => {
    setInputValue(artist);
    onChange(artist);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="artist-selector">
      <h3 className="artist-selector__title">🎤 Preferred Singer (Optional)</h3>
      
      <div className="artist-selector__input-wrap">
        <input
          type="text"
          className="artist-selector__input"
          placeholder="e.g. Taylor Swift, Arijit Singh..."
          value={inputValue}
          onChange={handleInputChange}
        />
        {inputValue && (
          <button 
            className="artist-selector__clear-btn" 
            onClick={handleClear}
            aria-label="Clear artist"
          >
            ✕
          </button>
        )}
      </div>

      <div className="artist-selector__chips custom-scrollbar">
        {POPULAR_ARTISTS.map(artist => (
          <button
            key={artist}
            className={`artist-chip ${inputValue === artist ? "artist-chip--active" : ""}`}
            onClick={() => handleChipClick(artist)}
          >
            {artist}
          </button>
        ))}
      </div>
    </div>
  );
}
