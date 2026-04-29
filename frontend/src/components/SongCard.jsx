/**
 * SongCard.jsx
 * Individual track card featuring the official Spotify Embed Widget and custom Like/Dislike actions.
 */

import "./SongCard.css";

export default function SongCard({ track, liked, disliked, onLike, onDislike }) {
  // Strip any mock indexing (e.g., "_0") from the ID so the Spotify widget doesn't break
  const realId = track.id.split('_')[0];
  
  // We use the 'compact' Spotify embed theme with a dark background to match our app
  const embedUrl = `https://open.spotify.com/embed/track/${realId}?utm_source=generator&theme=0`;

  return (
    <article className="song-card">
      {/* Official Spotify Player Widget */}
      <div className="song-card__spotify-embed">
        <iframe 
          src={embedUrl} 
          width="100%" 
          height="152" 
          frameBorder="0" 
          allowFullScreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          title={`${track.name} by ${track.artists}`}
        ></iframe>
      </div>

      {/* Custom App Actions */}
      <div className="song-card__actions">
        <div className="song-card__meta-tags">
          {track.explicit && <span className="song-card__explicit">E</span>}
          <span className="song-card__popularity" title="Popularity">
            {'★'.repeat(Math.max(1, Math.round(track.popularity / 25)))}
          </span>
        </div>

        <div className="song-card__action-buttons">
          {/* Like */}
          <button
            className={`song-card__action-btn ${liked ? "song-card__action-btn--liked" : ""}`}
            onClick={() => onLike(track.id)}
            aria-label={liked ? "Unlike song" : "Like song"}
            title={liked ? "Unlike" : "Like"}
          >
            {liked ? "❤️" : "🤍"}
          </button>

          {/* Dislike */}
          <button
            className={`song-card__action-btn ${disliked ? "song-card__action-btn--disliked" : ""}`}
            onClick={() => onDislike(track.id)}
            aria-label={disliked ? "Remove dislike" : "Dislike song"}
            title={disliked ? "Remove dislike" : "Dislike"}
          >
            {disliked ? "👎" : "👎🏻"}
          </button>
        </div>
      </div>
    </article>
  );
}
