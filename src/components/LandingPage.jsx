// Nebula landing page: single file, no extra CSS or image files needed.
// Usage: <LandingPage onOpenModal={() => ...} />


const FEATURES = [
  {
    title: "Secure access",
    text: "Password sign-in, plus Google sign-in for school accounts.",
    icon: (
      <>
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Classroom links",
    text: "Jump straight into Google Classroom.",
    icon: (
      <>
        <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
        <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
      </>
    ),
  },
  {
    title: "Notes and tools",
    text: "Interactive notes and web tools, ready when you are.",
    icon: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M9 12h7M9 16h5" />
      </>
    ),
  },
  {
    title: "Levels and rewards",
    text: "Earn levels, unlock tiers and use the Nebula store.",
    icon: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  },
];

// The entry buttons use onEnter, with onOpenModal retained for the app's auth flow.
export default function LandingPage({ onOpenModal, onEnter = onOpenModal, christmasPreview = false }) {
  return (
    <div className="lp">
      <style>{STYLES}</style>
      <header className="lp-header">
        <div className="lp-brand">
          {christmasPreview ? (
            <img className="lp-header-christmas-logo" src="/christmas-logo.png" alt="Nebula" />
          ) : (
            <img className="lp-star" src="/nebula-star.png" alt="Nebula" />
          )}
        </div>
        <nav className="lp-nav">
          <a href="#features">Features</a>
          <a href="/for-schools.html">For schools</a>
          <a href="#support">Support</a>
          <button type="button" className="lp-btn lp-btn-outline lp-btn-sm" onClick={onEnter}>
            Sign in
          </button>
        </nav>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-text">
          <span className="lp-pill">Secure portal access</span>
          <h1>The secure portal for your school.</h1>
          <p>
            Sign in with your organization or personal account to reach Classroom links, notes and
            tools in one place.
          </p>
          <div className="lp-actions">
            <button type="button" className="lp-btn lp-btn-primary" onClick={onEnter}>
              Enter Portal
            </button>
            <a className="lp-btn lp-btn-outline" href="/for-schools.html">
              For schools
            </a>
          </div>
          <p className="lp-open">
            Now open to <strong>Ardene</strong>
          </p>
        </div>
        <div className="lp-logo-panel">
          {christmasPreview ? (
            <img className="lp-christmas-wordmark" src="/christmas-logo.png" alt="Nebula Christmas logo" />
          ) : (
            <img className="lp-logo-star" src="/nebula-star.png" alt="Nebula" />
          )}
        </div>
      </section>

      <section id="features" className="lp-section">
        <div className="lp-features">
          {FEATURES.map((f) => (
            <div className="lp-card" key={f.title}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22D3EE"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {f.icon}
              </svg>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="support" className="lp-footer">
        <span>© {new Date().getFullYear()} Nebula</span>
        <span className="lp-footer-links">
          <a href="/terms.html">Terms of Service</a>
          <a href="/privacy.html">Privacy Policy</a>
          <a href="mailto:theicedomain123@gmail.com">Support</a>
        </span>
      </footer>
    </div>
  );
}


const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap");

.lp {
  --accent: #8b3ff0;
  --muted: #a8a3bd;
  --line: rgba(255, 255, 255, 0.1);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  color: #f2f0fa;
  font-family: "DM Sans", sans-serif;
  background-color: #08070f;
  background-image:
    linear-gradient(rgba(8, 7, 15, 0.28), rgba(8, 7, 15, 0.72)),
    url("/nebula-galaxy.png");
  background-position: center, center;
  background-size: cover, cover;
  background-repeat: no-repeat, no-repeat;
  background-attachment: fixed, fixed;
}
.lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
.lp a { text-decoration: none; }

/* header */
.lp-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 16px 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.lp-brand { display: flex; align-items: center; gap: 12px; }
.lp-star { height: 30px; width: auto; }
.lp-header-christmas-logo { display:block; width:92px; height:72px; object-fit:contain; }
.lp-nav { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.lp-nav a { color: var(--muted); font-size: 15px; padding: 12px 0; }
.lp-nav a:hover { color: #f2f0fa; }

/* buttons */
.lp-btn {
  height: 48px; padding: 0 28px; border-radius: 10px; border: 0;
  display: inline-flex; align-items: center; justify-content: center;
  font-family: inherit; font-weight: 600; font-size: 16px; cursor: pointer;
}
.lp-btn:hover { filter: brightness(1.1); }
.lp-btn-sm { height: 42px; padding: 0 18px; font-size: 15px; border-radius: 8px; }
.lp-btn-primary { background: var(--accent); color: #fff; }
.lp-btn-outline { background: transparent; color: #f2f0fa; border: 1px solid rgba(255, 255, 255, 0.22); }
.lp-btn-light { background: #f2f0fa; color: #08070f; }

/* hero */
.lp-hero {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 56px; padding: 64px 48px;
}
.lp-hero-text { flex: 1 1 440px; max-width: 560px; }
.lp-pill {
  display: inline-block; padding: 6px 14px; border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px; font-size: 13px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--muted);
}
.lp-hero h1 {
  margin: 20px 0 0; font-family: "Space Grotesk", sans-serif; font-weight: 700;
  font-size: 44px; line-height: 1.1; letter-spacing: -0.03em;
}
.lp-hero-text > p { margin: 16px 0 0; font-size: 18px; line-height: 1.55; color: var(--muted); }
.lp-actions { margin-top: 28px; display: flex; gap: 12px; flex-wrap: wrap; }
.lp-hero-text > .lp-open { margin-top: 24px; font-size: 14px; }
.lp-open strong { color: #f2f0fa; }
.lp-logo-panel {
  flex: 0 1 400px; padding: 40px 32px; border: 1px solid var(--line);
  border-radius: 16px; background: rgba(255, 255, 255, 0.03);
  display: flex; flex-direction: column; align-items: center; gap: 28px;
}
.lp-logo-star { width: 170px; height: auto; }
.lp-christmas-wordmark { display: block; width: min(330px, 100%); height: auto; filter: drop-shadow(0 10px 24px rgba(0,0,0,.24)); }

/* sections */
.lp-section { padding: 8px 48px 48px; display: flex; justify-content: center; }
.lp-features { width: 100%; max-width: 1120px; display: flex; flex-wrap: wrap; gap: 16px; }
.lp-card {
  flex: 1 1 220px; padding: 22px; border: 1px solid var(--line);
  border-radius: 12px; background: rgba(255, 255, 255, 0.04);
}
.lp-card h3 { margin: 14px 0 6px; font-family: "Space Grotesk", sans-serif; font-size: 18px; font-weight: 600; }
.lp-card p { margin: 0; color: var(--muted); font-size: 15px; line-height: 1.5; }

.lp-band {
  width: 100%; max-width: 1120px; padding: 28px 32px;
  border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px;
  background: rgba(139, 63, 240, 0.14);
  display: flex; flex-wrap: wrap; gap: 20px; align-items: center; justify-content: space-between;
}
.lp-band h2 { margin: 0; font-family: "Space Grotesk", sans-serif; font-weight: 600; font-size: 22px; }
.lp-band p { margin: 6px 0 0; font-size: 16px; color: #c9c5da; }

/* footer */
.lp-footer {
  margin-top: auto; display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 20px 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 14px; color: var(--muted);
}
.lp-footer-links { display: flex; gap: 24px; }
.lp-footer-links a { color: var(--muted); padding: 10px 0; }
.lp-footer-links a:hover { color: #f2f0fa; }

@media (max-width: 600px) {
  .lp-header, .lp-hero, .lp-section, .lp-footer { padding-left: 20px; padding-right: 20px; }
  .lp-hero h1 { font-size: 34px; }
}
`;
