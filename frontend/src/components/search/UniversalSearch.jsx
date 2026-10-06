import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Trophy,
  Users,
  FolderKanban,
  Bell,
  LayoutDashboard,
  Shield,
  ShieldCheck,
  GraduationCap,
  Building2,
  FileText,
  PlusCircle,
  Edit3,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/apiService';
import { Avatar } from '../Avatar';
import { StatusBadge } from '../StatusBadge';
import { RADIUS, FOCUS, MOTION } from '../../design-system/tokens';
import { SpatialAnimatedIcon, SpatialIconButton } from '../spatial';

const RECENT_SEARCHES_KEY = 'hackmatch_recent_searches';
const MAX_RECENT_SEARCHES = 4;

// Category metadata
const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'hackathons', label: 'Hackathons', icon: Trophy },
  { key: 'teammates', label: 'Teammates', icon: Users },
  { key: 'teamRequests', label: 'Requests', icon: FolderKanban },
  { key: 'pages', label: 'Pages', icon: LayoutDashboard },
];

// Helper to highlight matching text substrings
const HighlightedText = ({ text = '', highlight = '' }) => {
  if (!highlight.trim() || !text) return <span>{text}</span>;

  const escaped = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 rounded-xs px-0.5"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// Render category icon
const CategoryIcon = ({ iconName, category, className = 'w-4 h-4' }) => {
  if (category === 'teammates') return <Users className={className} />;
  if (category === 'hackathons') return <Trophy className={className} />;
  if (category === 'teamRequests') return <FolderKanban className={className} />;
  if (category === 'notifications') return <Bell className={className} />;

  switch (iconName) {
    case 'LayoutDashboard':
      return <LayoutDashboard className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'PlusCircle':
      return <PlusCircle className={className} />;
    case 'Inbox':
      return <FolderKanban className={className} />;
    case 'Bell':
      return <Bell className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Edit3':
    case 'Settings':
      return <Settings className={className} />;
    case 'User':
      return <UserIcon className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

/**
 * UniversalSearch - Inline Expanding Search Capsule with Attached Floating Dropdown
 * 
 * Features:
 * - In-place navbar capsule: compact at rest (w-48 to w-60), expands smoothly (w-72 to w-96) on hover/focus
 * - Floating Liquid Glass dropdown attached directly underneath the capsule (NO full-screen dimming backdrop)
 * - Profile-aware suggestions personalized to the user (skills, experience level, campus hackathons) when query is empty
 * - Real-time debounced search results as the user types, respecting college isolation
 * - Full keyboard navigation (ArrowUp, ArrowDown, Enter, Escape, Ctrl+K / Cmd+K)
 * - Seamless mobile support with responsive inline expansion
 */
export const UniversalSearch = ({ isOpen: externalOpen = false, onClose }) => {
  const { user, collegeName } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    pages: [],
    hackathons: [],
    teammates: [],
    teamRequests: [],
    notifications: [],
    actions: [],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Dropdown open state: open if externally requested, or if input is focused
  const isDropdownOpen = Boolean(externalOpen || isFocused);
  const isCapsuleExpanded = Boolean(isDropdownOpen || isHovered);

  // Focus input when external open triggers (e.g. Ctrl+K)
  useEffect(() => {
    if (externalOpen) {
      inputRef.current?.focus();
      mobileInputRef.current?.focus();
      setIsFocused(true);
    }
  }, [externalOpen]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read recent searches:', e);
    }
  }, []);

  const saveRecentSearch = useCallback((term) => {
    if (!term || !term.trim()) return;
    const trimmed = term.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save recent search:', e);
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = (term, e) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((t) => t !== term);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not update recent searches:', e);
      }
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.warn('Could not clear recent searches:', e);
    }
  };

  // Close dropdown on outside click or Escape (without full-screen backdrop)
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
        onClose?.();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
        mobileInputRef.current?.blur();
        onClose?.();
      }
    };

    const handleClosePopovers = () => {
      setIsFocused(false);
      onClose?.();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('close-all-popovers', handleClosePopovers);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('close-all-popovers', handleClosePopovers);
    };
  }, [isDropdownOpen, onClose]);

  // Debounced API Search with AbortController
  useEffect(() => {
    if (!query.trim()) {
      setResults({
        pages: [],
        hackathons: [],
        teammates: [],
        teamRequests: [],
        notifications: [],
        actions: [],
      });
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await apiService.search(query.trim(), controller.signal);
        if (data && data.results) {
          setResults(data.results);
          setSelectedIndex(0);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('[UniversalSearch] Search error:', err);
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Generate Profile-Aware Suggestions for empty query state
  const profileSuggestions = useMemo(() => {
    const list = [];

    // 1. Campus Hackathons (strictly college scoped)
    list.push({
      id: 'sug-campus-hackathons',
      group: 'suggestions',
      icon: 'Trophy',
      title: collegeName ? `Explore ${collegeName} Hackathons` : 'Browse Campus Hackathons',
      subtitle: 'Upcoming campus & global hackathons in your college scope',
      badge: 'Campus',
      path: '/hackathons',
    });

    // 2. Primary Skill Match
    if (user?.skills && user.skills.length > 0) {
      const topSkill = user.skills[0];
      list.push({
        id: 'sug-skill-teammates-1',
        group: 'suggestions',
        icon: 'Users',
        title: `Find teammates with ${topSkill}`,
        subtitle: `Connect with peers sharing your core ${topSkill} skillset`,
        badge: 'Skill Match',
        path: `/users?skill=${encodeURIComponent(topSkill)}`,
      });
    } else {
      list.push({
        id: 'sug-find-teammates',
        group: 'suggestions',
        icon: 'Users',
        title: 'Find Teammates',
        subtitle: collegeName ? `Connect with verified students from ${collegeName}` : 'Discover peers and filter by stack',
        badge: 'Network',
        path: '/users',
      });
    }

    // 3. Secondary Skill OR Experience Level
    if (user?.skills && user.skills.length > 1) {
      const secondSkill = user.skills[1];
      list.push({
        id: 'sug-skill-teammates-2',
        group: 'suggestions',
        icon: 'Sparkles',
        title: `Explore ${secondSkill} Builders`,
        subtitle: `Find open team requests and peers specializing in ${secondSkill}`,
        badge: 'Skill Match',
        path: `/users?skill=${encodeURIComponent(secondSkill)}`,
      });
    } else if (user?.experienceLevel) {
      list.push({
        id: 'sug-exp-level',
        group: 'suggestions',
        icon: 'Sparkles',
        title: `${user.experienceLevel} Developer Projects`,
        subtitle: `Hackathons and requests suited for ${user.experienceLevel.toLowerCase()} builders`,
        badge: user.experienceLevel,
        path: '/users',
      });
    }

    // 4. Post Team Request CTA
    list.push({
      id: 'sug-post-request',
      group: 'suggestions',
      icon: 'PlusCircle',
      title: 'Post Team Request',
      subtitle: 'Recruit verified teammates for an upcoming hackathon',
      badge: 'Recruit',
      path: '/post-request',
    });

    return list;
  }, [user, collegeName]);

  // Flatten filtered search results for keyboard navigation
  const flatItems = useMemo(() => {
    if (!query.trim()) {
      return profileSuggestions;
    }

    const items = [];
    const pushGroup = (catKey, groupList) => {
      if (activeCategory === 'all' || activeCategory === catKey) {
        groupList.forEach((item) => items.push({ ...item, group: catKey }));
      }
    };

    pushGroup('actions', results.actions || []);
    pushGroup('pages', results.pages || []);
    pushGroup('hackathons', results.hackathons || []);
    pushGroup('teammates', results.teammates || []);
    pushGroup('teamRequests', results.teamRequests || []);
    pushGroup('notifications', results.notifications || []);

    return items;
  }, [results, activeCategory, query, profileSuggestions]);

  // Handle item selection
  const handleSelect = useCallback(
    (item) => {
      if (!item) return;
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }
      setIsFocused(false);
      onClose?.();
      if (item.path) {
        navigate(item.path);
      }
    },
    [navigate, onClose, query, saveRecentSearch]
  );

  // Keyboard navigation within list
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (flatItems.length ? (prev + 1) % flatItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        flatItems.length ? (prev - 1 + flatItems.length) % flatItems.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems.length > 0 && flatItems[selectedIndex]) {
        handleSelect(flatItems[selectedIndex]);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (dropdownRef.current) {
      const activeEl = dropdownRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const isSearching = Boolean(query.trim());
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <div
      ref={containerRef}
      className="relative z-30 flex items-center justify-center shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* =========================================================================
          INLINE SEARCH CAPSULE (Desktop)
          Compact at rest (h-10, w-48 to w-60) -> Expands smoothly in-place (w-72 to w-96)
          ========================================================================= */}
      <div
        className={`group relative flex items-center h-10 ${RADIUS.control} border transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] select-none box-border ${
          isCapsuleExpanded
            ? 'w-56 sm:w-60 lg:w-68 xl:w-72 bg-white/75 dark:bg-slate-900/50 border-indigo-500/60 dark:border-indigo-400/50 shadow-[0_0_20px_-3px_rgba(99,102,241,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] ring-2 ring-indigo-500/20'
            : 'w-36 sm:w-40 lg:w-44 xl:w-52 bg-white/50 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/55 border-slate-200/80 dark:border-white/12 hover:border-indigo-400/60 dark:hover:border-indigo-400/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]'
        } backdrop-blur-xl px-3 gap-2.5`}
      >
        <SpatialAnimatedIcon
          icon={Search}
          animation="magnify"
          trigger="parent-hover"
          className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0"
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onFocus={() => {
            window.dispatchEvent(new CustomEvent('close-all-popovers'));
            setIsFocused(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isCapsuleExpanded ? 'Search hackathons, peers, requests...' : 'Search anything...'}
          className="w-full bg-transparent text-xs sm:text-sm font-medium placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none text-slate-900 dark:text-white truncate"
          aria-label="Universal Search"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
        />

        {loading && (
          <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin shrink-0" />
        )}

        {query ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors shrink-0"
            aria-label="Clear query"
          >
            <SpatialAnimatedIcon icon={X} animation="cross" trigger="parent-hover" className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200/70 dark:bg-white/10 border border-slate-300/50 dark:border-white/10 text-slate-500 dark:text-gray-400 shrink-0 select-none">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        )}
      </div>

      {/* =========================================================================
          ATTACHED FLOATING LIQUID GLASS DROPDOWN
          Reveals directly underneath the search capsule without full-screen dimming
          ========================================================================= */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Search suggestions and results"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[360px] sm:w-[420px] max-w-[90vw] rounded-2xl z-50 overflow-hidden liquid-glass-floating border border-slate-200/80 dark:border-white/14 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 ease-out text-slate-900 dark:text-slate-100"
        >
          {/* Top Decorative Ambient Glass Rim Highlight matching SpatialCard */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-white/30 via-indigo-400/40 to-cyan-400/30 dark:from-white/20 dark:via-indigo-300/30 dark:to-cyan-300/20 opacity-80 pointer-events-none" />

          {/* Category Filter Pills (when query has text) */}
          {isSearching && (
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200/50 dark:border-white/10 overflow-x-auto bg-slate-50/50 dark:bg-white/[0.02]">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isCatActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.key);
                      setSelectedIndex(0);
                    }}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isCatActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isLight
                        ? 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-3 h-3" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Scrollable Results & Suggestions Area */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-200/30 dark:divide-white/[0.05]">
            {/* =================================================================
                EMPTY QUERY: PROFILE-AWARE SUGGESTIONS + RECENT SEARCHES
                ================================================================= */}
            {!isSearching && (
              <div className="p-3.5 space-y-3.5">
                {/* Profile-Aware Quick Suggestions */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Suggestions For You
                    </span>
                    {collegeName && (
                      <span className="text-[10px] text-slate-400 dark:text-gray-400 font-normal truncate max-w-[150px]">
                        {collegeName}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {profileSuggestions.map((sug, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <div
                          key={sug.id}
                          data-selected={isSelected}
                          onClick={() => handleSelect(sug)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`group flex items-center justify-between gap-2.5 p-2 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? isLight
                                ? 'bg-indigo-50/90 text-indigo-950 border border-indigo-200/80'
                                : 'bg-indigo-500/15 text-white border border-indigo-500/30'
                              : isLight
                              ? 'hover:bg-slate-100/70 border border-transparent'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                              <CategoryIcon iconName={sug.icon} category={sug.group} className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate">{sug.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">{sug.subtitle}</p>
                            </div>
                          </div>
                          {sug.badge && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shrink-0">
                              {sug.badge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Searches (if available) */}
                {recentSearches.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/40 dark:border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearAllRecent}
                        className="text-[10px] text-indigo-500 hover:underline normal-case"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term) => (
                        <span
                          key={term}
                          onClick={() => {
                            setQuery(term);
                            inputRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer border transition-colors bg-white/40 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-indigo-400 text-slate-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <span>{term}</span>
                          <X
                            className="w-3 h-3 text-slate-400 hover:text-rose-500 shrink-0"
                            onClick={(e) => removeRecentSearch(term, e)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================
                LIVE SEARCH RESULTS
                ================================================================= */}
            {isSearching && flatItems.length > 0 && (
              <div className="py-1">
                {flatItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={`${item.group}-${item.id || idx}`}
                      data-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 cursor-pointer transition-all ${
                        isSelected
                          ? isLight
                            ? 'bg-indigo-50/90 text-indigo-950 border-l-2 border-indigo-600'
                            : 'bg-indigo-500/15 text-white border-l-2 border-indigo-400'
                          : isLight
                          ? 'hover:bg-slate-100/60 text-slate-800'
                          : 'hover:bg-white/[0.04] text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.group === 'teammates' ? (
                          <Avatar
                            src={item.avatarUrl}
                            name={item.title}
                            size="sm"
                            verified={item.verified}
                          />
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-indigo-500 text-white'
                                : isLight
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            <CategoryIcon
                              iconName={item.icon}
                              category={item.group}
                              className="w-3.5 h-3.5"
                            />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-semibold truncate">
                              <HighlightedText text={item.title} highlight={query} />
                            </p>
                            {item.badge && (
                              <StatusBadge status={item.badge} type="mode" size="sm" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                            <HighlightedText text={item.subtitle} highlight={query} />
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.skills && item.skills.length > 0 && (
                          <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/10 text-slate-600 dark:text-gray-300 truncate max-w-[100px]">
                            {item.skills[0]}
                          </span>
                        )}
                        <SpatialAnimatedIcon
                          icon={ChevronRight}
                          animation="glide-right"
                          trigger="state"
                          isActive={isSelected}
                          className={`w-3.5 h-3.5 ${
                            isSelected
                              ? 'text-indigo-500'
                              : 'text-slate-400 dark:text-gray-600 opacity-50'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty Search Result */}
            {isSearching && flatItems.length === 0 && !loading && (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto mb-2.5">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                  No matching results found
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 max-w-xs mx-auto mb-3">
                  {user
                    ? `No matches for "${query}" in your college scope.`
                    : `No results found for "${query}".`}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuery('hackathons')}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Hackathons
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuery('React')}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    React Skills
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuery('Dashboard')}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Shortcut Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 border-t border-slate-200/50 dark:border-white/10 bg-white/30 dark:bg-slate-950/40 text-[10px] text-slate-500 dark:text-gray-400">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 font-mono text-[9px]">
                  ↑↓
                </kbd>
                <span>Navigate</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 font-mono text-[9px]">
                  ↵
                </kbd>
                <span>Select</span>
              </span>

              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 font-mono text-[9px]">
                  esc
                </kbd>
                <span>Close</span>
              </span>
            </div>

            <span className="font-medium text-slate-400 dark:text-gray-500">
              {isSearching ? `${flatItems.length} results` : 'HackMatch Command Search'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
