import { useState } from 'react';

const SLIDES = [
  { image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop', tag: 'Explore Space' },
  { image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop', tag: 'Deep Cosmos' },
  { image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop', tag: 'Orbital View' },
];

export default function VisualPanel({ isSignUp, setIsSignUp, onClearError = () => {} }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const changeSlide = (offset) => {
    setCurrentSlide((slide) => (slide + offset + SLIDES.length) % SLIDES.length);
  };

  return (
    <div className="left-visual-side" style={{ backgroundImage: `url(${SLIDES[currentSlide].image})` }}>
      <div className="left-visual-overlay" aria-hidden="true" />
      <div className="visual-content">
        <div className="top-bar-left">
          <span className="brand-title-left">Featured Projects</span>
          <div className="nav-pills" role="tablist" aria-label="Authentication options">
            <button type="button" role="tab" aria-selected={!isSignUp} className={`pill-btn ${!isSignUp ? 'active' : ''}`} onClick={() => { setIsSignUp(false); onClearError(); }}>
              Sign In
            </button>
            <button type="button" role="tab" aria-selected={isSignUp} className={`pill-btn ${isSignUp ? 'active' : ''}`} onClick={() => { setIsSignUp(true); onClearError(); }}>
              Join Us
            </button>
          </div>
        </div>
        <div className="bottom-bar-left">
          <div className="profile-badge">
            <div className="avatar-img" aria-hidden="true">A</div>
            <div className="profile-info">
              <strong>Nebula Student</strong>
              <span>{SLIDES[currentSlide].tag}</span>
            </div>
          </div>
          <div className="carousel-controls" aria-label="Carousel controls">
            <button type="button" className="arrow-btn" onClick={() => changeSlide(-1)} aria-label="Previous slide">←</button>
            <button type="button" className="arrow-btn" onClick={() => changeSlide(1)} aria-label="Next slide">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
