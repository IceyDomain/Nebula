// Ardenne sidebar logo. This is a PLACEHOLDER crest, not the real school crest.
// To use the real crest later, replace the <svg> below with <img src="/your-crest.png" alt="" />.

export function ArdenneBrand() {
  return (
    <div className="nd-brand">
      <svg width="36" height="42" viewBox="0 0 38 44" aria-hidden="true">
        <path d="M19 2l15 5v13c0 11-7 19-15 22C11 39 4 31 4 20V7z" fill="#1D4ED8" stroke="#F5B82E" strokeWidth="2.5" />
        <path d="M13 31l6-16 6 16M15.5 26h7" fill="none" stroke="#F5B82E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        <b>Ardenne High School</b>
        <small>Student Portal</small>
      </span>
    </div>
  );
}
