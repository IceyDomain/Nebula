export default function LandingPage({ onOpenModal }) {
  return (
    <main className="landing-container">
      <div className="landing-content">
        <div className="nebula-mark" aria-hidden="true">🌌</div>
        <h1 className="nebula-title">NEBULA</h1>
        <p className="landing-subtitle">Secure Portal Access</p>
        <button type="button" className="portal-entry-btn" onClick={onOpenModal}>
          Enter Portal <span aria-hidden="true">→</span>
        </button>
      </div>
    </main>
  );
}
