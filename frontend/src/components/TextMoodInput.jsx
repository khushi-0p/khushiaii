/**
 * TextMoodInput.jsx
 * Free-text mood description input with NLP analysis.
 * Calls /api/analyzeMood and displays the detected mood.
 */

import { useState } from "react";
import "./TextMoodInput.css";

export default function TextMoodInput({ onMoodDetected, analyzeMood }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MOOD_EMOJIS = {
    happy: "😊", sad: "😢", energetic: "⚡", relaxed: "😌",
    angry: "😡", romantic: "💕", focused: "🎯", melancholic: "🌧️",
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeMood(text);
      setResult(data);
      if (onMoodDetected) onMoodDetected(data.mood);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAnalyze();
  };

  return (
    <section className="text-mood" aria-label="Text mood input">
      <h2 className="text-mood__title">Describe your mood</h2>
      <p className="text-mood__subtitle">
        Tell us how you feel and AI will detect your mood • Ctrl+Enter to analyze
      </p>

      <div className="text-mood__input-wrap">
        <textarea
          id="mood-text"
          className="text-mood__textarea"
          placeholder="e.g. I'm feeling really pumped and ready to conquer the world! 💪"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          rows={3}
          aria-label="Describe your mood"
        />
        <div className="text-mood__meta">
          <span className="text-mood__count">{text.length}/500</span>
          <button
            className="btn btn-primary text-mood__btn"
            onClick={handleAnalyze}
            disabled={!text.trim() || loading}
            id="analyze-mood-btn"
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Analyzing…
              </>
            ) : (
              <>🧠 Analyze Mood</>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-mood__error">⚠️ {error}</p>}

      {/* Result badge */}
      {result && (
        <div className="text-mood__result animate-fadeInUp">
          <span className="text-mood__result-emoji">
            {MOOD_EMOJIS[result.mood] || "🎵"}
          </span>
          <div className="text-mood__result-info">
            <p className="text-mood__result-mood">
              Detected: <strong>{result.mood.charAt(0).toUpperCase() + result.mood.slice(1)}</strong>
            </p>
            <div className="text-mood__confidence">
              <div
                className="text-mood__confidence-bar"
                style={{ width: `${result.confidence}%` }}
              />
              <span>{result.confidence}% confidence</span>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon text-mood__apply-btn"
            onClick={() => onMoodDetected && onMoodDetected(result.mood)}
            title="Apply this mood to selector"
            aria-label="Apply detected mood"
          >
            ↗
          </button>
        </div>
      )}
    </section>
  );
}
