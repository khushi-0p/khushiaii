/**
 * ActivitySelector.jsx
 * Icon-based activity grid with selection state.
 */

import "./ActivitySelector.css";

const ACTIVITIES = [
  { id: "gym",        emoji: "🏋️",  label: "Gym" },
  { id: "study",      emoji: "📚",  label: "Study" },
  { id: "sleep",      emoji: "😴",  label: "Sleep" },
  { id: "travel",     emoji: "✈️",  label: "Travel" },
  { id: "party",      emoji: "🎉",  label: "Party" },
  { id: "meditation", emoji: "🧘",  label: "Meditate" },
  { id: "walking",    emoji: "🚶",  label: "Walking" },
  { id: "work",       emoji: "💼",  label: "Work" },
];

export default function ActivitySelector({ selected, onChange }) {
  return (
    <section className="activity-selector" aria-label="Activity selection">
      <h2 className="activity-selector__title">What are you doing?</h2>
      <p className="activity-selector__subtitle">Optional — refines your playlist further</p>

      <div
        className="activity-selector__grid"
        role="radiogroup"
        aria-label="Activity options"
      >
        {ACTIVITIES.map((act) => (
          <button
            key={act.id}
            className={`activity-btn ${selected === act.id ? "activity-btn--selected" : ""}`}
            onClick={() => onChange(selected === act.id ? "" : act.id)}
            role="radio"
            aria-checked={selected === act.id}
            aria-label={act.label}
          >
            <span className="activity-btn__emoji">{act.emoji}</span>
            <span className="activity-btn__label">{act.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
