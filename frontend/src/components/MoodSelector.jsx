/**
 * MoodSelector.jsx
 * Emoji-based mood picker with animated selection rings.
 */

import "./MoodSelector.css";

const MOODS = [
  { id: "happy",      emoji: "😊", label: "Happy",      color: "#ffd93d" },
  { id: "sad",        emoji: "😢", label: "Sad",        color: "#74b9ff" },
  { id: "energetic",  emoji: "⚡", label: "Energetic",  color: "#fd79a8" },
  { id: "relaxed",    emoji: "😌", label: "Relaxed",    color: "#55efc4" },
  { id: "angry",      emoji: "😡", label: "Angry",      color: "#ff7675" },
  { id: "romantic",   emoji: "💕", label: "Romantic",   color: "#e84393" },
  { id: "focused",    emoji: "🎯", label: "Focused",    color: "#a29bfe" },
  { id: "melancholic",emoji: "🌧️", label: "Melancholic",color: "#636e72" },
];

export default function MoodSelector({ selected, onChange }) {
  return (
    <section className="mood-selector" aria-label="Mood selection">
      <h2 className="mood-selector__title">How are you feeling?</h2>
      <p className="mood-selector__subtitle">
        Select your current mood to start curating your playlist
      </p>

      <div className="mood-selector__grid" role="radiogroup" aria-label="Mood options">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            className={`mood-btn ${selected === mood.id ? "mood-btn--selected" : ""}`}
            onClick={() => onChange(mood.id)}
            role="radio"
            aria-checked={selected === mood.id}
            aria-label={mood.label}
            style={{ "--mood-color": mood.color }}
          >
            <span className="mood-btn__emoji">{mood.emoji}</span>
            <span className="mood-btn__label">{mood.label}</span>
            {selected === mood.id && (
              <span className="mood-btn__check" aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
