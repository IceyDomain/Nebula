// Nebula sign-in choice page: single file, no extra CSS or image files needed.
// Usage:
//   <SignInChoice
//     onSelect={(type) => ...}   // type is "organization" or "personal"
//     onBack={() => ...}         // optional: "Back to home"
//   />

const OPTIONS = [
  {
    type: "organization",
    title: "Organization",
    text: "Find your school or group and sign in with your school account.",
    icon: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V9l7-5 7 5v12" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
  },
  {
    type: "personal",
    title: "Personal",
    text: "Sign in or create your own Nebula account.",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </>
    ),
  },
];

export default function SignInChoice({ onSelect = () => {}, onBack = () => {}, christmasPreview = false }) {
  return (
    <div className="sc">
      <style>{STYLES}</style>

      <header className="sc-header">
        <div className="sc-brand">
          {christmasPreview ? (
            <img className="sc-christmas-word" src="/christmas-logo.png" alt="Nebula" />
          ) : (
            <img className="sc-star" src="/nebula-star.png" alt="Nebula" />
          )}
        </div>
        <button type="button" className="sc-back" onClick={onBack}>
          ← Back to home
        </button>
      </header>

      <main className="sc-main">
        <span className="sc-pill">Sign in</span>
        <h1>How are you signing in?</h1>
        <p className="sc-sub">Choose one to continue.</p>

        <div className="sc-cards">
          {OPTIONS.map((o) => (
            <button type="button" className="sc-card" key={o.type} onClick={() => onSelect(o.type)}>
              <span className="sc-icon">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {o.icon}
                </svg>
              </span>
              <span className="sc-title">{o.title}</span>
              <span className="sc-text">{o.text}</span>
              <span className="sc-go">
                Continue
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </main>

      <footer className="sc-footer">
        <span>© {new Date().getFullYear()} Nebula</span>
        <span className="sc-footer-links">
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

.sc {
  --muted: #a8a3bd;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  color: #f2f0fa;
  font-family: "DM Sans", sans-serif;
  background-color: #08070f;
  background-image:
    radial-gradient(1px 1px at 40px 60px, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1px 1px at 190px 140px, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(1.5px 1.5px at 120px 250px, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(700px 420px at 12% 0%, rgba(110, 40, 150, 0.35), transparent),
    radial-gradient(700px 420px at 95% 10%, rgba(20, 100, 120, 0.25), transparent);
  background-size: 300px 300px, 300px 300px, 300px 300px, auto, auto;
  background-repeat: repeat, repeat, repeat, no-repeat, no-repeat;
}
.sc *, .sc *::before, .sc *::after { box-sizing: border-box; }
.sc a { text-decoration: none; }

.sc-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 16px 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.sc-brand { display: flex; align-items: center; gap: 12px; }
.sc-star { height: 30px; width: auto; }
.sc-christmas-word { width: 104px; height: 82px; object-fit: contain; }
.sc-back {
  background: none; border: 0; padding: 12px 0; cursor: pointer;
  color: var(--muted); font: inherit; font-size: 15px;
}
.sc-back:hover { color: #f2f0fa; }

.sc-main {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 72px 24px 56px;
}
.sc-pill {
  display: inline-block; padding: 6px 14px; border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px; font-size: 13px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--muted);
}
.sc-main h1 {
  margin: 20px 0 0; font-family: "Space Grotesk", sans-serif; font-weight: 700;
  font-size: 42px; letter-spacing: -0.03em; text-align: center;
}
.sc-sub { margin: 14px 0 0; font-size: 18px; color: var(--muted); text-align: center; }

.sc-cards {
  margin-top: 44px; width: 100%; max-width: 780px;
  display: flex; flex-wrap: wrap; gap: 20px;
}
.sc-card {
  flex: 1 1 300px; min-height: 280px; padding: 32px; text-align: left;
  display: flex; flex-direction: column; gap: 12px; cursor: pointer;
  color: #f2f0fa; font-family: inherit;
  border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}
.sc-card:hover { border-color: rgba(255, 255, 255, 0.4); background: rgba(255, 255, 255, 0.07); }
.sc-card:focus-visible { outline: 2px solid #8b3ff0; outline-offset: 2px; }
.sc-icon {
  width: 52px; height: 52px; border-radius: 14px; margin-bottom: 8px;
  background: rgba(139, 63, 240, 0.22);
  display: flex; align-items: center; justify-content: center;
}
.sc-title { font-family: "Space Grotesk", sans-serif; font-size: 26px; font-weight: 600; }
.sc-text { color: var(--muted); font-size: 16px; line-height: 1.55; }
.sc-go {
  display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 16px;
  font-weight: 600; font-size: 16px;
}

.sc-footer {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; padding: 20px 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 14px; color: var(--muted);
}
.sc-footer-links { display: flex; gap: 24px; }
.sc-footer-links a { color: var(--muted); padding: 10px 0; }
.sc-footer-links a:hover { color: #f2f0fa; }

@media (max-width: 600px) {
  .sc-header, .sc-footer { padding-left: 20px; padding-right: 20px; }
  .sc-main h1 { font-size: 32px; }
}
`;
