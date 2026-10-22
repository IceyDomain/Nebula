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

export default function SignInChoice({ onSelect = () => {}, onBack = () => {} }) {
  return (
    <div className="sc">
      <style>{STYLES}</style>

      <header className="sc-header">
        <div className="sc-brand">
          <img className="sc-star" src={STAR} alt="" />
          <img className="sc-word" src={WORDMARK} alt="Nebula" />
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
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Support</a>
        </span>
      </footer>
    </div>
  );
}

const STAR = "/nebula-star.png";

const WORDMARK =
  "data:image/png;base64,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";

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
.sc-word { height: 18px; width: auto; }
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
