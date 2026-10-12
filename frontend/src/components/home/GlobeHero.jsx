import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme as useAppTheme } from "../../context/ThemeContext";
import { useAnimation } from "../../animations/AnimationContext";
import "./globe-hero.css";

const CURATED_CURRENT_HACKATHONS = [
  {
    id: "innohacks-2026",
    title: "KIET InnoHacks 2026",
    organizer: "KIET Group of Institutions • Delhi-NCR",
    mode: "In-Person • Campus",
    dates: "Oct 24 – 26, 2026",
    deadlineLabel: "Registration Closing Soon",
    teamsSeeking: "42 Teams Assembling",
    prizePool: "₹1,50,000",
    tags: ["AI / ML", "Web3", "Open Innovation"],
    status: "Active",
    badge: "Featured Campus",
  },
  {
    id: "sih-2026",
    title: "Smart India Hackathon 2026",
    organizer: "Ministry of Education & AICTE",
    mode: "Hybrid • National",
    dates: "Nov 15 – 17, 2026",
    deadlineLabel: "Team Registration Open",
    teamsSeeking: "128 Teams Assembling",
    prizePool: "₹1,00,000 / Problem",
    tags: ["GovTech", "Smart Automation", "IoT"],
    status: "Active",
    badge: "National Flagship",
  },
  {
    id: "google-ai-2026",
    title: "Google AI Agents Buildathon",
    organizer: "Google Cloud & DeepMind",
    mode: "Online • Global",
    dates: "Oct 20 – Nov 05, 2026",
    deadlineLabel: "Submissions Live",
    teamsSeeking: "86 Teams Assembling",
    prizePool: "$50,000 in GCP Credits",
    tags: ["Gemini 2.5", "Agentic AI", "Python"],
    status: "Active",
    badge: "Global AI Track",
  },
  {
    id: "mathhacks-2026",
    title: "MathHacks 2.0",
    organizer: "Toronto Tech Community",
    mode: "Offline • Global Track",
    dates: "Oct 17 – 18, 2026",
    deadlineLabel: "Active Event",
    teamsSeeking: "24 Teams Assembling",
    prizePool: "$10,000",
    tags: ["Algorithms", "Data Science", "Web"],
    status: "Active",
    badge: "Curated Event",
  },
];

export function GlobeHero({
  headline = [
    "Four people.",
    "One idea.",
    "Three seats",
    "still empty.",
  ],
  sub = "Find the teammates whose skills your hackathon idea is missing.",
  proof,
  onFindTeam,
  onExplore,
}) {
  const navigate = useNavigate();
  const themeContext = useAppTheme();
  const animCtx = useAnimation();

  const resolvedThemeStr = themeContext?.resolvedTheme || (
    typeof document !== 'undefined' && document.documentElement.classList.contains('light') ? 'light' : 'dark'
  );
  const theme = resolvedThemeStr === 'light' ? 'light' : 'dark';

  const cardRef = useRef(null);
  const [selectedId, setSelectedId] = useState("innohacks-2026");
  const [hackathons, setHackathons] = useState(CURATED_CURRENT_HACKATHONS);
  const [totalCount, setTotalCount] = useState(16);

  // Horizontal-only hover reaction (zero vertical rocking)
  const [tiltY, setTiltY] = useState(0);

  // Live ticking hackathon submission lock countdown
  const [secondsRemaining, setSecondsRemaining] = useState(85692);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = useMemo(() => {
    const hours = Math.floor(secondsRemaining / 3600);
    const mins = Math.floor((secondsRemaining % 3600) / 60);
    const secs = secondsRemaining % 60;
    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  }, [secondsRemaining]);

  // Try fetching live hackathons from API to augment total count or list
  useEffect(() => {
    let isMounted = true;
    fetch("/api/hackathons")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.total) {
          setTotalCount(data.total);
        } else if (Array.isArray(data.hackathons)) {
          setTotalCount(data.hackathons.length || 16);
        }
      })
      .catch(() => {
        // Fall back gracefully to curated state
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Ensure cosmic universe background particles flow with clean opacity
  useEffect(() => {
    if (animCtx?.setOpacity) {
      animCtx.setOpacity(theme === 'light' ? 0.45 : 0.85);
    }
  }, [animCtx, theme]);

  // Subtle horizontal-only turn reaction on card hover (rx is locked to 0)
  const handleCardPointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / rect.width - 0.5;
    const clampedX = Math.max(-0.5, Math.min(0.5, rawX));
    // Gentle horizontal turn angle (max ±4.5 degrees)
    setTiltY(clampedX * 7.5);
  };

  const handleCardPointerLeave = () => {
    setTiltY(0);
  };

  let wordIndex = 0;

  const handleFindTeam = onFindTeam || (() => navigate('/post-request'));
  const handleExplore = onExplore || (() => navigate('/hackathons'));

  const activeHackathon = useMemo(() => {
    return (
      hackathons.find((h) => h.id === selectedId) ||
      hackathons[0] ||
      CURATED_CURRENT_HACKATHONS[0]
    );
  }, [hackathons, selectedId]);

  const queueHackathons = useMemo(() => {
    return hackathons.filter((h) => h.id !== activeHackathon.id).slice(0, 3);
  }, [hackathons, activeHackathon]);

  return (
    <section
      className="gh"
      data-gh-theme={theme}
      aria-labelledby="hackmatch-hero-title"
    >
      <div className="gh-atmosphere" aria-hidden="true">
        <span className="gh-light gh-light--cobalt" />
        <span className="gh-light gh-light--mint" />
        <span className="gh-light gh-light--yellow" />
        <span className="gh-grid" />
      </div>

      <div className="gh-inner">
        {/* Left Editorial Copy */}
        <div className="gh-copy">
          <p
            className="gh-eyebrow gh-reveal"
            style={{ "--delay": "40ms" }}
          >
            <span className="gh-eyebrow__dot" />
            HackMatch — Campus Teammate Finder
          </p>

          <h1
            id="hackmatch-hero-title"
            className="gh-heading"
            aria-label={headline.join(" ")}
          >
            {headline.map((line, lineIndex) => (
              <span
                className="gh-heading__line"
                key={`${line}-${lineIndex}`}
              >
                {line.split(" ").map((token) => {
                  const index = wordIndex++;

                  return (
                    <span
                      className={`gh-word${
                        (headline.length > 3 ? lineIndex >= 2 : lineIndex === headline.length - 1)
                          ? " gh-word--accent"
                          : ""
                      }`}
                      key={`${token}-${index}`}
                    >
                      <span style={{ "--i": index }}>
                        {token}
                      </span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>

          <p
            className="gh-sub gh-reveal"
            style={{ "--delay": "520ms" }}
          >
            {sub}
          </p>

          <div
            className="gh-actions gh-reveal"
            style={{ "--delay": "640ms" }}
          >
            <button
              className="gh-btn gh-btn--primary"
              type="button"
              onClick={handleFindTeam}
            >
              <span className="gh-btn__label">
                I need teammates
              </span>

              <span
                className="gh-btn__label gh-btn__label--hover"
                aria-hidden="true"
              >
                I need teammates
              </span>

              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

            <button
              className="gh-btn gh-btn--secondary"
              type="button"
              onClick={handleExplore}
            >
              I want to join a team
            </button>
          </div>

          {proof ? (
            <div
              className="gh-proof gh-reveal"
              style={{ "--delay": "760ms" }}
            >
              <span className="gh-proof__avatars">
                {proof.avatars?.slice(0, 4).map((src, index) => (
                  <img
                    src={src}
                    alt=""
                    key={`${src}-${index}`}
                  />
                ))}
              </span>

              <span>{proof.text}</span>
            </div>
          ) : null}
        </div>

        {/* ========================================================= */}
        {/* CURRENT HACKATHONS SHOWCASE — MATCHING SITE TYPOGRAPHY    */}
        {/* Reacts strictly horizontally on mouse hover (rx locked)  */}
        {/* ========================================================= */}
        <div
          className="gh-events-stage"
          onPointerMove={handleCardPointerMove}
          onPointerLeave={handleCardPointerLeave}
        >
          <div
            className="gh-events-card"
            ref={cardRef}
            style={{
              transform: `perspective(1200px) rotateY(${tiltY}deg)`,
            }}
          >
            {/* Ambient liquid backdrop */}
            <div className="gh-events-backdrop" aria-hidden="true" />

            {/* Top Bar: Live Status & Directory Count */}
            <div className="gh-events-topbar">
              <div className="gh-live-beacon-pill">
                <span className="gh-live-beacon" />
                <span className="gh-live-beacon-text">Current Hackathons</span>
              </div>
              <div className="gh-events-counter-pill">
                <span className="gh-counter-dot" />
                <span className="gh-counter-text">{totalCount} Active Events</span>
              </div>
            </div>

            {/* Featured Hackathon Hero Block */}
            <div className="gh-featured-block">
              <div className="gh-featured-status-row">
                <span className="gh-tag-mode">
                  <span className="gh-tag-mode-dot" />
                  {activeHackathon.mode}
                </span>
                <span className="gh-tag-countdown">
                  <span className="gh-countdown-icon">⚡</span>
                  <span className="gh-countdown-label">Lock in</span>
                  <span className="gh-countdown-time">{formatCountdown}</span>
                </span>
              </div>

              <div className="gh-featured-title-wrap">
                <h2 className="gh-featured-title">
                  {activeHackathon.title}
                </h2>
                <span className="gh-featured-badge">
                  {activeHackathon.badge}
                </span>
              </div>

              <p className="gh-featured-organizer">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>{activeHackathon.organizer}</span>
              </p>

              {/* Essential Intel Metric Grid */}
              <div className="gh-intel-grid">
                <div className="gh-intel-cell">
                  <span className="gh-intel-label">Timeline</span>
                  <span className="gh-intel-val">{activeHackathon.dates}</span>
                </div>
                <div className="gh-intel-cell">
                  <span className="gh-intel-label">Prize Pool</span>
                  <span className="gh-intel-val gh-intel-val--prize">{activeHackathon.prizePool}</span>
                </div>
                <div className="gh-intel-cell">
                  <span className="gh-intel-label">Teams Assembling</span>
                  <span className="gh-intel-val gh-intel-val--teams">{activeHackathon.teamsSeeking}</span>
                </div>
              </div>

              {/* Tags & Direct Action */}
              <div className="gh-featured-foot-row">
                <div className="gh-featured-tags">
                  {activeHackathon.tags.map((tag) => (
                    <span className="gh-tag-pill" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="gh-btn-assemble-event"
                  onClick={handleFindTeam}
                >
                  <span>Assemble Team</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Current Hackathons Interactive Queue */}
            <div className="gh-queue-block">
              <div className="gh-queue-head">
                <span>Upcoming Active Events</span>
                <span className="gh-queue-hint">Click to preview</span>
              </div>

              <div className="gh-queue-list">
                {queueHackathons.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="gh-queue-item"
                    onClick={() => setSelectedId(item.id)}
                    aria-label={`Preview ${item.title}`}
                  >
                    <div className="gh-queue-item-left">
                      <span className="gh-queue-dot" />
                      <div className="gh-queue-item-info">
                        <span className="gh-queue-item-title">{item.title}</span>
                        <span className="gh-queue-item-sub">{item.organizer.split('•')[0]}</span>
                      </div>
                    </div>

                    <div className="gh-queue-item-right">
                      <span className="gh-queue-item-mode">{item.mode.split('•')[0].trim()}</span>
                      <span className="gh-queue-item-teams">{item.teamsSeeking.split(' ')[0]} Teams</span>
                      <span className="gh-queue-item-arrow">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Trust & Directory Link */}
            <div className="gh-card-footer">
              <div className="gh-trust-note">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Verified Events • Official Campus & Global Sync</span>
              </div>
              <button
                type="button"
                className="gh-dir-link"
                onClick={handleExplore}
              >
                <span>Explore Directory →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const HomeHero = GlobeHero;
export default GlobeHero;
