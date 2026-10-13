import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme as useAppTheme } from "../../context/ThemeContext";
import { useAnimation } from "../../animations/AnimationContext";
import apiService from "../../services/apiService";
import "./globe-hero.css";

// Helper to format ISO dates to clean range
function formatDatesRange(startDate, endDate) {
  if (!startDate) return "Dates TBA";
  const sDate = new Date(startDate);
  const eDate = endDate ? new Date(endDate) : null;
  if (isNaN(sDate.getTime())) return "Dates TBA";

  const sMonth = sDate.toLocaleDateString("en-US", { month: "short" });
  const sDay = sDate.getDate();
  const year = sDate.getFullYear();

  if (eDate && !isNaN(eDate.getTime())) {
    const eMonth = eDate.toLocaleDateString("en-US", { month: "short" });
    const eDay = eDate.getDate();
    if (sMonth === eMonth) {
      return `${sMonth} ${sDay} – ${eDay}, ${year}`;
    }
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${year}`;
  }
  return `${sMonth} ${sDay}, ${year}`;
}

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

  const [isDomLight, setIsDomLight] = useState(() => {
    return typeof document !== 'undefined' ? document.documentElement.classList.contains('light') : false;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const checkDom = () => setIsDomLight(document.documentElement.classList.contains('light'));
    checkDom();
    const observer = new MutationObserver(checkDom);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  const theme = (isDomLight || themeContext?.resolvedTheme === 'light') ? 'light' : 'dark';

  const cardRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [hackathons, setHackathons] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [teamCountMap, setTeamCountMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Horizontal-only hover reaction (zero vertical rocking)
  const [tiltY, setTiltY] = useState(0);

  // Real-time ticking clock for deadline countdown
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real hackathons from database via apiService
  useEffect(() => {
    let isMounted = true;
    apiService.getHackathons({ status: "Active" })
      .then((data) => {
        if (!isMounted || !data) return;
        const rawList = Array.isArray(data.hackathons) ? data.hackathons : [];
        const count = typeof data.count === "number" ? data.count : rawList.length;
        setTotalCount(count);

        if (rawList.length > 0) {
          const mapped = rawList.map((h) => {
            const rawDeadline = h.registrationDeadline || h.startDate;
            return {
              id: h._id || h.id,
              title: h.title,
              organizer: h.organizer || (h.collegeId?.name ? `${h.collegeId.name} • Campus` : "HackMatch Verified"),
              mode: `${h.mode || "Online"}${h.location ? ` • ${h.location.split(",")[0].trim()}` : (h.visibility === "College" ? " • Campus" : " • Global")}`,
              dates: formatDatesRange(h.startDate, h.endDate),
              rawStartDate: h.startDate,
              rawEndDate: h.endDate,
              rawDeadline,
              prizePool: h.prizePool || "See Event Details",
              tags: Array.isArray(h.tags) && h.tags.length > 0 ? h.tags.slice(0, 3) : ["Hackathon", "Open Track"],
              status: h.status || "Active",
              badge: h.visibility === "College" ? "Campus Flagship" : (h.isExternal ? "Verified Global Sync" : "Featured Event"),
            };
          });

          setHackathons(mapped);
          setSelectedId((prev) => prev || mapped[0]?.id);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn("Notice: GlobeHero live hackathon load fallback", err?.message);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real team requests count for the selected hackathon
  useEffect(() => {
    if (!selectedId) return;
    let isMounted = true;
    apiService.getHackathonById(selectedId)
      .then((res) => {
        if (!isMounted || !res) return;
        const count = Array.isArray(res.teamRequests) ? res.teamRequests.length : 0;
        setTeamCountMap((prev) => ({
          ...prev,
          [selectedId]: count > 0 ? `${count} Team${count > 1 ? "s" : ""} Assembling` : "Open for Teams",
        }));
      })
      .catch(() => {
        // Fall back gracefully
      });
    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  // Active hackathon resolution
  const activeHackathon = useMemo(() => {
    if (hackathons.length === 0) return null;
    return hackathons.find((h) => h.id === selectedId) || hackathons[0];
  }, [hackathons, selectedId]);

  // Format real-time dynamic countdown based on actual registrationDeadline
  const countdownDisplay = useMemo(() => {
    if (!activeHackathon?.rawDeadline) return { label: "Deadline", time: "Open" };
    const deadlineMs = new Date(activeHackathon.rawDeadline).getTime();
    if (isNaN(deadlineMs)) return { label: "Deadline", time: "Open" };

    const diffSec = Math.floor((deadlineMs - nowTime) / 1000);

    if (diffSec <= 0) {
      if (activeHackathon.rawEndDate && new Date(activeHackathon.rawEndDate).getTime() > nowTime) {
        return { label: "Event", time: "Live Now" };
      }
      return { label: "Status", time: "Registration Closed" };
    }

    if (diffSec > 86400) {
      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor((diffSec % 86400) / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      return { label: "Lock in", time: `${days}d ${hours}h ${mins}m` };
    }

    const hours = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;
    return {
      label: "Lock in",
      time: `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`,
    };
  }, [activeHackathon, nowTime]);

  const queueHackathons = useMemo(() => {
    if (!activeHackathon) return [];
    return hackathons.filter((h) => h.id !== activeHackathon.id).slice(0, 3);
  }, [hackathons, activeHackathon]);

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
            {isLoading ? (
              <div className="gh-featured-block" style={{ padding: "40px 22px", textAlign: "center" }}>
                <div style={{ opacity: 0.7, fontSize: "13px", color: "var(--gh-muted)" }}>
                  Syncing verified live hackathons...
                </div>
              </div>
            ) : activeHackathon ? (
              <div className="gh-featured-block">
                <div className="gh-featured-status-row">
                  <span className="gh-tag-mode">
                    <span className="gh-tag-mode-dot" />
                    {activeHackathon.mode}
                  </span>
                  <span className="gh-tag-countdown">
                    <span className="gh-countdown-icon">⚡</span>
                    <span className="gh-countdown-label">{countdownDisplay.label}</span>
                    <span className="gh-countdown-time">{countdownDisplay.time}</span>
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
                    <span className="gh-intel-val gh-intel-val--teams">
                      {teamCountMap[activeHackathon.id] || activeHackathon.teamsSeeking}
                    </span>
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
                    onClick={() => {
                      if (activeHackathon?.id) {
                        navigate(`/post-request?hackathon=${activeHackathon.id}`);
                      } else {
                        handleFindTeam();
                      }
                    }}
                  >
                    <span>Assemble Team</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="gh-featured-block" style={{ padding: "30px 22px", textAlign: "center" }}>
                <p style={{ color: "var(--gh-muted)", fontSize: "13px" }}>No active hackathons scheduled right now.</p>
                <button type="button" className="gh-dir-link" onClick={handleExplore} style={{ marginTop: "8px" }}>
                  Browse all past & upcoming events →
                </button>
              </div>
            )}

            {/* Current Hackathons Interactive Queue */}
            {queueHackathons.length > 0 && (
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
                          <span className="gh-queue-item-sub">{item.organizer ? item.organizer.split('•')[0].trim() : ''}</span>
                        </div>
                      </div>

                      <div className="gh-queue-item-right">
                        <span className="gh-queue-item-mode">{item.mode ? item.mode.split('•')[0].trim() : 'Live'}</span>
                        <span className="gh-queue-item-teams">
                          {teamCountMap[item.id] ? teamCountMap[item.id].split(' ')[0] + ' Teams' : 'Open'}
                        </span>
                        <span className="gh-queue-item-arrow">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
