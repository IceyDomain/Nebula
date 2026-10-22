// Nebula organization sign-in: 1) country or region, 2) organization, 3) sign in.
// Single file, no extra CSS or image files needed.
// Usage:
//   <FindOrganization
//     onBack={() => ...}               // back to the Organization / Personal choice
//     onSignIn={async ({ username, password, org }) => ...}  // throw an Error to show its message
//     onSignUp={async ({ username, email, password, org }) => ...}  // throw an Error to show its message
//     onGoogleSignIn={(org) => ...}    // "Sign in with your school Google account"
//     onForgotPassword={(org) => ...}  // optional
//     // org = { id, name, regionId, region }
//     onRequestAccess={() => ...}      // optional: "Request access" link
//   />
//
// To add a region, add a line to REGIONS. To add a school, add a line to ORGANIZATIONS
// with the regionId of the region it belongs to.

import { useState } from "react";

const REGIONS = [
  { id: "jamaica", name: "Jamaica", code: "JM" },
  // { id: "trinidad-and-tobago", name: "Trinidad and Tobago", code: "TT" },
];

// Flags are drawn as small SVGs so they look the same on every device.
// To add a flag for a new region, add an entry here using the same id as in REGIONS.
const FLAGS = {
  jamaica: (
    <svg
      viewBox="0 0 60 40"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <rect width="60" height="40" fill="#009B3A" />
      <polygon points="0,0 0,40 30,20" fill="#000000" />
      <polygon points="60,0 60,40 30,20" fill="#000000" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#FED100" strokeWidth="7" />
    </svg>
  ),
};

const ORGANIZATIONS = [
  { id: "ardenne-high-school", name: "Ardenne High School", regionId: "jamaica" },
  // { id: "another-school", name: "Another School", regionId: "jamaica" },
];

const POINTS = [
  {
    text: "Password-protected sign-in",
    icon: (
      <>
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    text: "Quick links to Google Classroom",
    icon: (
      <>
        <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
        <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
      </>
    ),
  },
  {
    text: "Notes and tools in one place",
    icon: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M9 12h7M9 16h5" />
      </>
    ),
  },
];

export default function FindOrganization({
  onBack = () => {},
  onSignIn = async () => {},
  onSignUp = async () => {
    throw new Error("Account creation is unavailable.");
  },
  onGoogleSignIn = () => {},
  onForgotPassword = () => {},
  onRequestAccess = () => {},
}) {
  const [step, setStep] = useState(1); // 1 = region, 2 = organization
  const [query, setQuery] = useState("");
  const [regionId, setRegionId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [mode, setMode] = useState("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const region = REGIONS.find((r) => r.id === regionId);
  const org = ORGANIZATIONS.find((o) => o.id === orgId);
  const organizationInfo = region && org ? { ...org, region: region.name } : null;

  const items =
    step === 1
      ? REGIONS.map((r) => ({
          id: r.id,
          name: r.name,
          badge: FLAGS[r.id] || r.code,
          isFlag: !!FLAGS[r.id],
          isCode: !FLAGS[r.id],
        }))
      : ORGANIZATIONS.filter((o) => o.regionId === regionId).map((o) => ({
          id: o.id,
          name: o.name,
          badge: o.name.charAt(0),
          isCode: false,
        }));
  const normalizedQuery = query.trim().toLowerCase();
  const results = items.filter((i) => i.name.toLowerCase().includes(normalizedQuery));
  const selectedId = step === 1 ? regionId : orgId;

  const copy =
    step === 3
      ? {
          title: mode === "signup" ? "Create your account" : "Sign in to " + (org ? org.name : ""),
          sub: mode === "signup"
            ? "Join " + (org ? org.name : "") + " on Nebula."
            : "Use your school account to continue.",
        }
      : step === 1
      ? {
          title: "Choose your country or region",
          sub: "We'll show the organizations available there.",
          label: "Country or region",
          placeholder: "Search countries or regions",
          head: "Available regions",
          empty: "No countries or regions match",
          request: "Can't find your region?",
        }
      : {
          title: "Select your organization",
          sub: "Search for your school or group, then continue to sign in.",
          label: "Organization",
          placeholder: "Search by name",
          head: "Organizations in " + (region ? region.name : ""),
          empty: "No organizations match",
          request: "Can't find your organization?",
        };

  function select(id) {
    if (step === 1) {
      if (id !== regionId) setOrgId(null);
      setRegionId(id);
    } else {
      setOrgId(id);
    }
  }

  function handleBack() {
    if (step === 3) {
      setStep(2);
      setError("");
      setMode("signin");
    } else if (step === 2) {
      setStep(1);
      setQuery("");
    } else {
      onBack();
    }
  }

  function handleContinue() {
    if (step === 1 && region) {
      setStep(2);
      setQuery("");
    } else if (step === 2 && org) {
      setStep(3);
      setError("");
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!organizationInfo) {
      setError("Select an organization before continuing.");
      return;
    }
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();
    if (mode === "signup" && (!normalizedUsername || !normalizedEmail || !password)) {
      setError("Fill in all the fields.");
      return;
    }
    if (mode === "signup" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signin" && (!normalizedUsername || !password)) {
      setError("Enter your username and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") {
        await onSignUp({
          username: normalizedUsername,
          email: normalizedEmail,
          password,
          org: organizationInfo,
        });
      } else {
        await onSignIn({ username: normalizedUsername, password, org: organizationInfo });
      }
    } catch (err) {
      setError(err && err.message ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!organizationInfo) {
      setError("Select an organization before continuing.");
      return;
    }
    setGoogleBusy(true);
    setError("");
    try {
      await onGoogleSignIn(organizationInfo);
    } catch (err) {
      setError(err && err.message ? err.message : "Google sign-in failed. Please try again.");
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="fo">
      <style>{STYLES}</style>
      <div className="fo-modal">
        <div className="fo-glow" />
        <div className="fo-earth" />
        <div className="fo-lights" />

        <div className="fo-intro">
          <div className="fo-kicker">Secure portal access</div>
          <h2>Sign in through your organization</h2>
          <p>Your school's space, links and tools, all in one secure place.</p>
        </div>
        <div className="fo-points">
          {POINTS.map((p) => (
            <div className="fo-point" key={p.text}>
              <span className="fo-point-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#67E8F9"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {p.icon}
                </svg>
              </span>
              {p.text}
            </div>
          ))}
        </div>

        <div className="fo-right">
          <div className="fo-col">
            <div className="fo-head">
              <div className="fo-brand">
                <img className="fo-star" src={STAR} alt="" />
                <img className="fo-word" src={WORDMARK} alt="Nebula" />
              </div>
              <span className="fo-lang">EN</span>
            </div>

            <button type="button" className="fo-back" onClick={handleBack}>
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
                <path d="M15 6l-6 6 6 6" />
              </svg>
              Back
            </button>

            <div className="fo-step">
              <span>Step {step} of 3</span>
              <span className="fo-bars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={n <= step ? "on" : ""} />
                ))}
              </span>
            </div>
            <h1>{copy.title}</h1>
            <p className="fo-sub">{copy.sub}</p>

            {step < 3 ? (
              <>
            <div className="fo-field">
              <label htmlFor="fo-search">{copy.label}</label>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A8A3BD"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <input
                id="fo-search"
                className="fo-input"
                type="text"
                placeholder={copy.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="fo-listhead">
              <strong>{copy.head}</strong>
              <span>
                {results.length} {results.length === 1 ? "result" : "results"}
              </span>
            </div>
            <ul className="fo-list">
              {results.map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    className={"fo-row" + (i.id === selectedId ? " sel" : "")}
                    aria-pressed={i.id === selectedId}
                    onClick={() => select(i.id)}
                  >
                    <span className={"fo-badge" + (i.isFlag ? " flag" : i.isCode ? " code" : "")}>{i.badge}</span>
                    <span className="fo-name">{i.name}</span>
                    {i.id === selectedId && (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#67E8F9"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M5 12l5 5 9-10" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
              {results.length === 0 && (
                <li className="fo-empty">
                  {copy.empty} "{query}".
                </li>
              )}
            </ul>

            <button
              type="button"
              className="fo-continue"
              disabled={step === 1 ? !region : !org}
              onClick={handleContinue}
            >
              Continue
            </button>

            <p className="fo-request">
              {copy.request}{" "}
              <button type="button" className="fo-link" onClick={onRequestAccess}>
                Request access
              </button>
            </p>
              </>
            ) : (
              <>
                <div className="fo-tabs" role="tablist" aria-label="Account options">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "signin"}
                    className={mode === "signin" ? "on" : ""}
                    onClick={() => switchMode("signin")}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "signup"}
                    className={mode === "signup" ? "on" : ""}
                    onClick={() => switchMode("signup")}
                  >
                    Create account
                  </button>
                </div>
                <button
                  type="button"
                  className="fo-google"
                  disabled={googleBusy}
                  onClick={handleGoogleSignIn}
                >
                  <span className="fo-g">G</span>
                  {googleBusy
                    ? "Connecting to Google..."
                    : mode === "signup"
                    ? "Sign up with your school Google account"
                    : "Sign in with your school Google account"}
                </button>
                <div className="fo-or">
                  <span />
                  or
                  <span />
                </div>
                <form className="fo-form" onSubmit={handleSubmit} noValidate>
                  <div className="fo-field">
                    <label htmlFor="fo-user">{mode === "signup" ? "Username" : "Username or email"}</label>
                    <input
                      id="fo-user"
                      className="fo-input plain"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  {mode === "signup" && (
                    <div className="fo-field">
                      <label htmlFor="fo-email">Email address</label>
                      <input
                        id="fo-email"
                        className="fo-input plain"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="fo-field">
                    <label htmlFor="fo-pass">Password</label>
                    <div className="fo-pw">
                      <input
                        id="fo-pass"
                        className="fo-input plain"
                        type={showPw ? "text" : "password"}
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" className="fo-show" onClick={() => setShowPw(!showPw)}>
                        {showPw ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <p className="fo-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button type="submit" className="fo-continue" disabled={busy}>
                    {busy
                      ? mode === "signup" ? "Creating account..." : "Signing in..."
                      : mode === "signup" ? "Create account" : "Sign in"}
                  </button>
                </form>
                <p className="fo-request">
                  {mode === "signin" && (
                    <>
                      <button type="button" className="fo-link" onClick={() => onForgotPassword(organizationInfo)}>
                        Forgot password?
                      </button>
                      {"  ·  "}
                    </>
                  )}
                  <button type="button" className="fo-link" onClick={handleBack}>
                    Change organization
                  </button>
                </p>
              </>
            )}

            <div className="fo-foot">
              <span>Terms</span>
              <span>Privacy</span>
              <span>Portal Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STAR =
  "data:image/png;base64,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";

const WORDMARK =
  "data:image/png;base64,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";

const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap");

.fo {
  min-height: 100vh; box-sizing: border-box; padding: 40px;
  display: flex; align-items: center; justify-content: center;
  background-color: #08070f;
  background-image: linear-gradient(rgba(8, 7, 15, 0.28), rgba(8, 7, 15, 0.72)), url("/nebula-galaxy.png");
  background-position: center, center;
  background-size: cover, cover;
  background-repeat: no-repeat, no-repeat;
  background-attachment: fixed, fixed;
  color: #f2f0fa; font-family: "DM Sans", sans-serif;
}
.fo *, .fo *::before, .fo *::after { box-sizing: border-box; }
.fo a { text-decoration: none; }

.fo-modal {
  position: relative; width: 100%; max-width: 1180px; height: 740px;
  border-radius: 16px; overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1); background-color: #05070f;
  background-image:
    radial-gradient(1px 1px at 40px 60px, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(1px 1px at 190px 140px, rgba(255, 255, 255, 0.5), transparent),
    radial-gradient(1.5px 1.5px at 120px 250px, rgba(255, 255, 255, 0.6), transparent);
  background-size: 260px 260px;
}

/* left side */
.fo-glow {
  position: absolute; left: -120px; top: -160px; width: 640px; height: 460px;
  background: radial-gradient(closest-side, rgba(124, 58, 237, 0.38), rgba(5, 7, 15, 0));
  pointer-events: none;
}
.fo-earth {
  position: absolute; left: -380px; top: 440px; width: 1500px; height: 1500px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 0%, #26306a 0%, #0e1538 10%, #070b20 35%);
  box-shadow: 0 -3px 40px rgba(130, 150, 255, 0.3);
}
.fo-lights {
  position: absolute; left: 60px; top: 462px; width: 560px; height: 120px; opacity: 0.6;
  background-image:
    radial-gradient(2px 2px at 30px 30px, #9cc9ff, transparent),
    radial-gradient(2px 2px at 120px 70px, #c9b8ff, transparent),
    radial-gradient(3px 3px at 210px 40px, #cfe3ff, transparent),
    radial-gradient(2px 2px at 300px 85px, #9cc9ff, transparent),
    radial-gradient(2px 2px at 380px 45px, #c9b8ff, transparent),
    radial-gradient(3px 3px at 460px 90px, #cfe3ff, transparent);
}
.fo-intro { position: absolute; left: 48px; top: 64px; width: 400px; color: #fff; }
.fo-kicker {
  font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;
  color: #67e8f9; font-weight: 600;
}
.fo-intro h2 {
  margin: 12px 0 0; font-family: "Manrope", sans-serif; font-weight: 800;
  font-size: 30px; line-height: 1.2; letter-spacing: -0.02em;
}
.fo-intro p { margin: 12px 0 0; font-size: 16px; line-height: 1.55; color: #b9b5cc; }
.fo-points {
  position: absolute; left: 48px; bottom: 44px; width: 420px;
  display: flex; flex-direction: column; gap: 14px; color: #fff; font-size: 15px;
}
.fo-point { display: flex; align-items: center; gap: 12px; }
.fo-point-icon {
  width: 36px; height: 36px; flex: none; border-radius: 8px;
  background: rgba(5, 7, 15, 0.75); border: 1px solid rgba(255, 255, 255, 0.14);
  display: flex; align-items: center; justify-content: center;
}

/* right side */
.fo-right {
  position: absolute; top: 0; right: 0; bottom: 0; width: 54%;
  background: #0f0d1b; clip-path: polygon(78px 0, 100% 0, 100% 100%, 0 100%);
  padding: 32px 56px 28px 112px; display: flex; flex-direction: column; align-items: center;
}
.fo-col { width: 100%; max-width: 460px; flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; }
.fo-head {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.fo-brand { display: flex; align-items: center; gap: 10px; }
.fo-star { height: 28px; width: auto; }
.fo-word { height: 17px; width: auto; }
.fo-lang {
  padding: 6px 12px; border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 6px;
  font-size: 13px; font-weight: 600; color: #cfcbe0;
}
.fo-back {
  align-self: flex-start; margin-top: 20px; padding: 6px 0; background: none; border: 0;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
  font: inherit; font-size: 15px; font-weight: 600; color: #cfcbe0;
}
.fo-back:hover { text-decoration: underline; }
.fo-step { margin-top: 10px; display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; color: #a8a3bd; }
.fo-bars { display: flex; gap: 6px; flex: 1; }
.fo-bars span { flex: 1; height: 4px; border-radius: 2px; background: rgba(255, 255, 255, 0.14); }
.fo-bars span.on { background: #a78bfa; }
.fo-right h1 {
  margin: 18px 0 0; font-family: "Manrope", sans-serif; font-weight: 800;
  font-size: 30px; letter-spacing: -0.02em;
}
.fo-sub { margin: 8px 0 0; font-size: 16px; line-height: 1.5; color: #a8a3bd; }

.fo-field { position: relative; margin-top: 24px; }
.fo-field label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #cfcbe0; }
.fo-field svg { position: absolute; left: 16px; top: 46px; }
.fo-input {
  width: 100%; height: 52px; padding: 0 16px 0 46px;
  border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 8px;
  background: #17142a; color: #f2f0fa; font-family: inherit; font-size: 16px;
}
.fo-input::placeholder { color: #8f8aa6; }
.fo-input:focus { outline: 2px solid #a78bfa; outline-offset: 1px; }

.fo-listhead {
  margin-top: 20px; display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; color: #a8a3bd;
}
.fo-listhead strong { font-weight: 600; color: #cfcbe0; }
.fo-list { margin: 8px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; max-height: 190px; overflow-y: auto; }
.fo-row {
  width: 100%; min-height: 64px; padding: 8px 16px; display: flex; align-items: center; gap: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 8px; background: rgba(255, 255, 255, 0.04);
  color: #f2f0fa; font-family: inherit; text-align: left; cursor: pointer;
}
.fo-row:hover { border-color: #c4b5fd; }
.fo-row.sel { border-color: #a78bfa; background: rgba(139, 92, 246, 0.14); }
.fo-badge {
  width: 40px; height: 40px; flex: none; border-radius: 8px; background: #6d28d9; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: "Manrope", sans-serif; font-weight: 800; font-size: 18px;
}
.fo-name { flex: 1; font-weight: 700; font-size: 17px; }
.fo-empty { padding: 16px; border: 1px dashed rgba(255, 255, 255, 0.25); border-radius: 8px; font-size: 15px; color: #a8a3bd; }

.fo-continue {
  margin-top: 22px; height: 52px; border: 0; border-radius: 8px; background: #6d28d9; color: #fff;
  font-family: inherit; font-weight: 600; font-size: 16px; cursor: pointer;
}
.fo-continue:hover:not(:disabled) { filter: brightness(1.12); }
.fo-continue:disabled { opacity: 0.45; cursor: not-allowed; }
.fo-request { margin: 16px 0 0; text-align: center; font-size: 15px; color: #a8a3bd; }
.fo-link { background: none; border: 0; padding: 0; cursor: pointer; font: inherit; font-weight: 600; color: #67e8f9; }
.fo-link:hover { text-decoration: underline; }
.fo-foot {
  margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex; justify-content: center; gap: 16px; font-size: 13px; color: #a8a3bd;
}
.fo-tabs { margin-top: 20px; display: flex; padding: 4px; border-radius: 10px; background: #17142a; border: 1px solid rgba(255, 255, 255, 0.12); }
.fo-tabs button { flex: 1; height: 38px; border: 0; border-radius: 7px; background: transparent; color: #a8a3bd; font-family: inherit; font-weight: 600; font-size: 14px; cursor: pointer; }
.fo-tabs button.on { background: #6d28d9; color: #fff; }

@media (max-width: 860px) {
  .fo { padding: 16px; }
  .fo-modal { height: auto; }
  .fo-glow, .fo-earth, .fo-lights, .fo-intro, .fo-points { display: none; }
  .fo-right { position: relative; width: 100%; clip-path: none; padding: 28px 22px; min-height: 680px; }
}
.fo-google { margin-top: 24px; height: 52px; width: 100%; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.22); background: #17142a; color: #f2f0fa; font-family: inherit; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
.fo-google:hover { border-color: #c4b5fd; }
.fo-g { width: 22px; height: 22px; border-radius: 50%; background: #f2f0fa; color: #08070f; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.fo-or { margin-top: 16px; display: flex; align-items: center; gap: 12px; font-size: 13px; color: #a8a3bd; }
.fo-or span { flex: 1; height: 1px; background: rgba(255, 255, 255, 0.12); }
.fo-form { display: flex; flex-direction: column; }
.fo-form .fo-field { margin-top: 14px; }
.fo-input.plain { padding-left: 16px; }
.fo-pw { position: relative; }
.fo-pw .fo-input { padding-right: 72px; }
.fo-show { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: 0; padding: 8px; cursor: pointer; color: #67e8f9; font: inherit; font-size: 13px; font-weight: 600; }
.fo-error { margin: 12px 0 0; padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(244, 114, 182, 0.5); background: rgba(244, 114, 182, 0.12); color: #fbcfe8; font-size: 14px; }
.fo-badge.flag { width: 46px; height: 31px; border-radius: 4px; overflow: hidden; background: transparent; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25); }
.fo-badge.code { font-size: 14px; letter-spacing: 0.02em; }
.fo-region { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 8px; background: rgba(255, 255, 255, 0.04); font-size: 14px; color: #a8a3bd; }
.fo-region strong { color: #f2f0fa; font-weight: 600; }
`;
