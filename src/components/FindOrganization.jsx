// Nebula organization sign-in: 1) country or region, 2) organization, 3) sign in.
// Single file, no extra CSS or image files needed.
// Usage:
//   <FindOrganization
//     onBack={() => ...}               // back to the Organization / Personal choice
//     onSignIn={async ({ username, password, org }) => ...}  // throw an Error to show its message
//     onSignUp={async ({ username, email, password, org }) => ...}  // throw an Error to show its message
//     onGoogleSignIn={(org) => ...}    // used for both signing in and signing up with Google
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
  {
    id: "ardenne-high-school",
    name: "Ardenne High School",
    regionId: "jamaica",
    roles: ["student", "teacher"],
    gradeForm: { grades: [7, 8, 9, 10, 11, 12, 13], forms: [1, 2, 3, 4, 5, 6, 7, 8] },
    teacherCode: "", // set a school access code here so only teachers can create teacher accounts (empty means no code)
  },
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
  onSignUp = async () => {},
  onGoogleSignIn = () => {},
  onForgotPassword = () => {},
  onRequestAccess = () => {},
  christmasPreview = false,
}) {
  const [step, setStep] = useState(1); // 1 = region, 2 = organization
  const [query, setQuery] = useState("");
  const [regionId, setRegionId] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [mode, setMode] = useState("signin"); // "signin" or "signup"
  const [role, setRole] = useState("student");
  const [grade, setGrade] = useState("");
  const [formNo, setFormNo] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const region = REGIONS.find((r) => r.id === regionId);
  const org = ORGANIZATIONS.find((o) => o.id === orgId);

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
  const results = items.filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedId = step === 1 ? regionId : orgId;

  const copy =
    step === 3
      ? {
          title: mode === "signup" ? "Create your account" : "Sign in to " + (org ? org.name : ""),
          sub:
            mode === "signup"
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

  function switchMode(m) {
    setMode(m);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const orgInfo = { ...org, region: region.name };
    if (mode === "signup") {
      if (!username.trim() || !email.trim() || !password) {
        setError("Fill in all the fields.");
        return;
      }
      if (!email.includes("@")) {
        setError("Enter a valid email address.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
    } else if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    if (mode === "signup" && org.gradeForm) {
      if (!grade || !formNo) { setError(role === "teacher" ? "Choose the grade and form you are in charge of." : "Choose your grade level and form."); return; }
      if (role === "teacher" && org.teacherCode && code.trim() !== org.teacherCode) { setError("That school access code is not correct."); return; }
    }
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") {
        await onSignUp({ username: username.trim(), email: email.trim(), password, org: orgInfo, role, grade: grade ? Number(grade) : null, form: formNo ? Number(formNo) : null });
      } else {
        await onSignIn({ username: username.trim(), password, org: orgInfo, role });
      }
    } catch (err) {
      setError(err && err.message ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
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
                {christmasPreview ? (
                  <img className="fo-christmas-word" src="/christmas-logo.png" alt="Nebula" />
                ) : (
                  <img className="fo-star" src="/nebula-star.png" alt="Nebula" />
                )}
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
                {org.roles && org.roles.length > 1 && (
                  <div className="fo-tabs" role="tablist" aria-label="I am a">
                    {org.roles.map((r) => (
                      <button type="button" role="tab" key={r} aria-selected={role === r} className={role === r ? "on" : ""} onClick={() => { setRole(r); setError(""); }}>{r === "teacher" ? "Teacher" : "Student"}</button>
                    ))}
                  </div>
                )}
                <div className="fo-tabs" role="tablist">
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
                  onClick={() => onGoogleSignIn({ ...org, region: region.name })}
                >
                  <span className="fo-g">G</span>
                  {mode === "signup"
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
                  {mode === "signup" && org.gradeForm && (
                    <>
                      <div className="fo-field">
                        <label htmlFor="fo-grade">{role === "teacher" ? "Grade level you are in charge of" : "Grade level"}</label>
                        <select id="fo-grade" className="fo-input plain" value={grade} onChange={(e) => setGrade(e.target.value)}>
                          <option value="">Choose a grade</option>
                          {org.gradeForm.grades.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                        </select>
                      </div>
                      <div className="fo-field">
                        <label htmlFor="fo-formno">{role === "teacher" ? "Form class you are in charge of" : "Form"}</label>
                        <select id="fo-formno" className="fo-input plain" value={formNo} onChange={(e) => setFormNo(e.target.value)}>
                          <option value="">Choose a form</option>
                          {org.gradeForm.forms.map((f) => <option key={f} value={f}>Form {f}</option>)}
                        </select>
                        {grade && formNo && <small style={{ color: "var(--tc-muted, #a8a3bd)" }}>Your form is {grade}-{formNo}.</small>}
                      </div>
                      {role === "teacher" && org.teacherCode && (
                        <div className="fo-field">
                          <label htmlFor="fo-code">School access code</label>
                          <input id="fo-code" className="fo-input plain" value={code} onChange={(e) => setCode(e.target.value)} />
                        </div>
                      )}
                    </>
                  )}
                  {error && (
                    <p className="fo-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button type="submit" className="fo-continue" disabled={busy}>
                    {busy
                      ? mode === "signup"
                        ? "Creating account..."
                        : "Signing in..."
                      : mode === "signup"
                      ? "Create account"
                      : "Sign in"}
                  </button>
                </form>
                <p className="fo-request">
                  {mode === "signin" && (
                    <>
                      <button
                        type="button"
                        className="fo-link"
                        onClick={() => onForgotPassword({ ...org, region: region.name })}
                      >
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



const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap");

.fo {
  min-height: 100vh; box-sizing: border-box; padding: 40px;
  display: flex; align-items: center; justify-content: center;
  background: #08070f; color: #f2f0fa; font-family: "DM Sans", sans-serif;
}
.fo *, .fo *::before, .fo *::after { box-sizing: border-box; }
.fo a { text-decoration: none; }

.fo-modal {
  position: relative; width: 100%; max-width: 1180px; height: 780px;
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
.fo-christmas-word { width: 104px; height: 82px; object-fit: contain; }
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

@media (max-width: 860px) {
  .fo { padding: 16px; }
  .fo-modal { height: auto; }
  .fo-glow, .fo-earth, .fo-lights, .fo-intro, .fo-points { display: none; }
  .fo-right { position: relative; width: 100%; clip-path: none; padding: 28px 22px; min-height: 680px; }
}
.fo-google { margin-top: 16px; height: 52px; width: 100%; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.22); background: #17142a; color: #f2f0fa; font-family: inherit; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
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
.fo-tabs { margin-top: 20px; display: flex; padding: 4px; border-radius: 10px; background: #17142a; border: 1px solid rgba(255, 255, 255, 0.12); }
.fo-tabs button { flex: 1; height: 38px; border: 0; border-radius: 7px; background: transparent; color: #a8a3bd; font-family: inherit; font-weight: 600; font-size: 14px; cursor: pointer; }
.fo-tabs button.on { background: #6d28d9; color: #fff; }
.fo-badge.flag { width: 46px; height: 31px; border-radius: 4px; overflow: hidden; background: transparent; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25); }
.fo-badge.code { font-size: 14px; letter-spacing: 0.02em; }
.fo-region { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 8px; background: rgba(255, 255, 255, 0.04); font-size: 14px; color: #a8a3bd; }
.fo-region strong { color: #f2f0fa; font-weight: 600; }
`;
