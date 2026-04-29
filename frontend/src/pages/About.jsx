import "./About.css";

export default function About() {
  return (
    <main className="about-page container animate-fadeIn">
      <section className="about-hero">
        <h1 className="about-title">About <span className="gradient-text">Khushi AI</span></h1>
        <p className="about-subtitle">
          Music isn't just sound; it's emotion. We built Khushi AI to bridge the gap between how you feel and what you listen to.
        </p>
      </section>

      <div className="about-grid">
        <div className="about-card glass-card">
          <span className="about-icon">🧠</span>
          <h2>Emotion-First AI</h2>
          <p>
            Unlike traditional playlists based on genres, our Natural Language Processing engine understands the nuance in your words to perfectly match your current emotional state.
          </p>
        </div>

        <div className="about-card glass-card">
          <span className="about-icon">🎵</span>
          <h2>Spotify Powered</h2>
          <p>
            We leverage the Spotify Web API to fetch high-quality track recommendations, album art, and audio previews from a catalog of millions of songs.
          </p>
        </div>

        <div className="about-card glass-card">
          <span className="about-icon">🏃</span>
          <h2>Context Aware</h2>
          <p>
            Whether you're hitting personal records at the gym or studying for finals, Khushi AI dynamically adjusts tempo and energy levels to fit your environment.
          </p>
        </div>
      </div>

      <section className="about-mission glass-card">
        <h2>Our Mission</h2>
        <p>
          We believe that finding the right music shouldn't feel like a chore. Khushi AI was created to provide seamless, intuitive music discovery that feels deeply personal and instantly accessible.
        </p>
      </section>
    </main>
  );
}
