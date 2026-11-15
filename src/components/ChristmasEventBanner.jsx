export default function ChristmasEventBanner() {
  return (
    <section className="nd-event-banner" aria-label="Christmas event">
      <div className="nd-event-banner-copy">
        <span className="nd-event-banner-kicker">The festive season</span>
        <h2>Christmas at Nebula</h2>
        <p>Snow is falling across your workspace. Enjoy the holiday theme.</p>
      </div>
      <div className="nd-event-banner-snowflake" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M24 5v38M7.5 14.5l33 19M40.5 14.5l-33 19M24 5l-5 5m5-5 5 5M24 43l-5-5m5 5 5-5M7.5 14.5l7 .5m-7-.5 2-6m31 6-7 .5m7-.5-2-6M7.5 33.5l7-.5m-7 .5 2 6m31-6-7-.5m7 .5-2 6" />
        </svg>
      </div>
    </section>
  );
}
