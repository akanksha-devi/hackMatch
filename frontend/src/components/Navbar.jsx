import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Zap, 
  Users, 
  Trophy, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Inbox, 
  Menu, 
  X, 
  ShieldAlert, 
  Building2, 
  Bell,
  Search
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import UniversalSearch from './search/UniversalSearch';
import { useTheme } from '../context/ThemeContext';
import { SpatialButton, SpatialIconButton, SpatialProfileMenuTrigger, SpatialAnimatedIcon } from './spatial';
import { StatusBadge } from './StatusBadge';
import { FOCUS, MOTION } from '../design-system/tokens';
import { Avatar } from './Avatar';

// Navigation links for Desktop Magnetic Sliding Tab Highlight
const NAV_LINKS = [
  { path: '/hackathons', label: 'Hackathons', icon: Trophy, accentColor: 'text-amber-400' },
  { path: '/users', label: 'Find Teammates', icon: Users, accentColor: 'text-cyan-400' },
];

/**
 * MagneticNav — Vercel / Raycast style physics-based sliding tab highlight
 */
const MagneticNav = () => {
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState(null);
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const activePath = NAV_LINKS.some((link) => link.path === location.pathname) ? location.pathname : null;
  const currentTarget = hoveredPath || activePath;

  const updateIndicator = useCallback((path) => {
    if (!path || !tabRefs.current[path] || !containerRef.current) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const tabEl = tabRefs.current[path];
    const containerEl = containerRef.current;
    const tabRect = tabEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    setIndicatorStyle({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
      opacity: 1,
    });
  }, []);

  useEffect(() => {
    updateIndicator(currentTarget);
  }, [currentTarget, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator(currentTarget);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentTarget, updateIndicator]);

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => setHoveredPath(null)}
      className="relative hidden lg:flex items-center p-1 rounded-full border transition-colors select-none bg-slate-100/80 dark:bg-white/[0.04] border-slate-200/80 dark:border-white/[0.08]"
    >
      {/* The Magnetic Sliding Pill Indicator */}
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-full pointer-events-none transition-all duration-260 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white text-slate-900 shadow-sm border border-slate-200/90 dark:bg-white/12 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] dark:border-white/[0.14]"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />

      {NAV_LINKS.map(({ path, label, icon: Icon, accentColor }) => {
        const isActive = location.pathname === path;
        const isHovered = hoveredPath === path;
        return (
          <Link
            key={path}
            to={path}
            ref={(el) => (tabRefs.current[path] = el)}
            onMouseEnter={() => setHoveredPath(path)}
            className={`relative z-10 shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 inline-flex items-center gap-2 select-none ${
              isActive || isHovered
                ? 'text-slate-950 dark:text-white font-bold'
                : 'text-slate-600 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <SpatialAnimatedIcon
              icon={Icon}
              animation={path === '/hackathons' ? 'lift' : 'group'}
              trigger="parent-hover"
              className={`w-3.5 h-3.5 shrink-0 ${accentColor}`}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export const Navbar = () => {
  const { user, collegeName, isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for subtle compaction & depth
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  // Close floating menus when modals open
  useEffect(() => {
    const handleClosePopovers = () => {
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    };
    window.addEventListener('close-all-popovers', handleClosePopovers);
    return () => window.removeEventListener('close-all-popovers', handleClosePopovers);
  }, []);

  // Close profile dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 sm:top-2.5 lg:top-3 z-50 px-2.5 sm:px-4 lg:px-6 pointer-events-none transition-all duration-300">
      {/* Floating Glass Island / Capsule Container */}
      <nav
        aria-label="Main Navigation"
        className={`pointer-events-auto w-full max-w-7xl 2xl:max-w-[1536px] mx-auto rounded-2xl sm:rounded-full transition-all duration-300 relative bg-white/90 dark:bg-[#080c1e]/82 border border-slate-200/90 dark:border-white/[0.12] ${
          isScrolled
            ? 'shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_22px_54px_-12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.24)]'
            : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_14px_38px_-12px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.18)]'
        } backdrop-blur-2xl backdrop-saturate-180 px-3 sm:px-4 lg:px-5 xl:px-6 pr-4 sm:pr-5 lg:pr-6`}
      >
        {/* Top Hairline Specular Highlight */}
        <div 
          aria-hidden="true"
          className="absolute top-0 inset-x-8 sm:inset-x-16 h-[1px] bg-gradient-to-r from-transparent via-white/45 dark:via-white/20 to-transparent pointer-events-none"
        />

        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 lg:gap-3 xl:gap-4">
          
          {/* Left Navigation Area: Logo + Multi-College Badge + Magnetic Sliding Links */}
          <div className="flex items-center gap-3 lg:gap-4 xl:gap-5 shrink-0">
            {/* Logo & Multi-College Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 group-hover:shadow-amber-500/25 transition-all duration-300 shrink-0">
                  <div className="w-full h-full bg-[#080c1e] rounded-[9.5px] flex items-center justify-center">
                    <Zap className="w-4.5 h-4.5 text-amber-300 fill-amber-400/20 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white shrink-0 whitespace-nowrap">
                  Hack<span className="text-gradient">Match</span>
                </span>
              </Link>

              {/* Multi-College Badge: Rendered on 2xl+ ultra-wide screens */}
              <span className="hidden 2xl:inline-flex shrink-0 whitespace-nowrap items-center justify-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30 select-none min-w-[96px]">
                MULTI-COLLEGE
              </span>
            </div>

            {/* Desktop Magnetic Sliding Links */}
            <MagneticNav />
          </div>

          {/* Center Section: Dedicated Structural Slot for Inline Expanding Universal Search */}
          <div className="hidden md:flex items-center justify-center flex-1 min-w-[160px] xl:min-w-[200px] max-w-[340px] mx-1.5 lg:mx-3">
            <UniversalSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />
          </div>

          {/* Right Section: Campus Badge, CTA, Notifications, Profile OR Auth Buttons */}
          <div className="hidden lg:flex items-center gap-1 sm:gap-1.5 xl:gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Active College Badge (Shown on 2XL+ screens to keep desktop spacious) */}
                {collegeName && (
                  <div
                    className="hidden 2xl:flex items-center gap-1.5 px-2.5 h-9 rounded-full border text-xs shrink-0 max-w-[170px] bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs dark:bg-slate-900/90 dark:border-indigo-500/30 dark:text-gray-300"
                    title={`Campus: ${collegeName}`}
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-cyan-400" />
                    <span className="font-medium shrink-0 text-indigo-600 dark:text-gray-400">Campus:</span>
                    <span className="font-semibold truncate text-indigo-950 dark:text-indigo-300">{collegeName}</span>
                  </div>
                )}

                {/* Admin Quick Link if admin */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="shrink-0 whitespace-nowrap px-3 h-9 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Post Team Request Primary CTA — Polished Warm Gold Pill */}
                <Link
                  to="/post-request"
                  className="hidden sm:inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap px-3.5 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs sm:text-sm font-bold bg-[#ffd23f] hover:bg-[#ffe066] text-slate-950 shadow-[0_4px_16px_-2px_rgba(255,210,63,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950 shrink-0" />
                  <span className="hidden xl:inline">Post Team Request</span>
                  <span className="xl:hidden">Post</span>
                </Link>

                {/* Notifications Bell */}
                <NotificationBell />

                {/* Circular Theme Toggle Control */}
                <ThemeToggle size="md" />

                {/* Profile Dropdown */}
                <div className="relative shrink-0" ref={dropdownRef}>
                  <SpatialProfileMenuTrigger
                    user={user}
                    isOpen={dropdownOpen}
                    onClick={() => {
                      if (!dropdownOpen) {
                        window.dispatchEvent(new CustomEvent('close-all-popovers'));
                      }
                      setDropdownOpen(!dropdownOpen);
                    }}
                    size="md"
                  />

                  {dropdownOpen && (
                    <div 
                      role="menu"
                      aria-label="User navigation menu"
                      className="absolute right-0 mt-2 w-64 rounded-2xl z-50 overflow-hidden motion-open shadow-2xl backdrop-blur-2xl bg-white/96 dark:bg-[#090d20]/96 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-white/14 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]"
                    >
                      {/* Top Specular Accent Highlight Line */}
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-white/30 via-amber-400/30 to-cyan-400/30 dark:from-white/20 dark:via-amber-300/25 dark:to-cyan-300/20 opacity-80 pointer-events-none" />

                      <div className="px-4 py-3 border-b border-slate-200/70 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.03]">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Logged in as</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                        {collegeName && (
                          <p className="text-[11px] text-cyan-600 dark:text-cyan-400 truncate mt-0.5 flex items-center gap-1 font-medium">
                            <Building2 className="w-3 h-3 shrink-0" /> {collegeName}
                          </p>
                        )}
                        {user?.role && (
                          <div className="mt-1">
                            <StatusBadge status={user.role} type="role" size="sm" />
                          </div>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          style={{ animationDelay: '0ms' }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group animate-in fade-in duration-240 fill-mode-both"
                        >
                          <SpatialAnimatedIcon icon={LayoutDashboard} animation="micro-lift" trigger="parent-hover" className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                          Student Dashboard
                        </Link>

                        <Link
                          to="/notifications"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          style={{ animationDelay: '60ms' }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group animate-in fade-in duration-240 fill-mode-both"
                        >
                          <SpatialAnimatedIcon icon={Bell} animation="signal" trigger="parent-hover" className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          Notifications
                        </Link>

                        <Link
                          to="/my-requests"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          style={{ animationDelay: '120ms' }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group animate-in fade-in duration-240 fill-mode-both"
                        >
                          <SpatialAnimatedIcon icon={Inbox} animation="bubble" trigger="parent-hover" className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          My Requests & Responses
                        </Link>

                        <Link
                          to="/profile"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          style={{ animationDelay: '180ms' }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group animate-in fade-in duration-240 fill-mode-both"
                        >
                          <SpatialAnimatedIcon icon={UserIcon} animation="group" trigger="parent-hover" className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          My Profile
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            role="menuitem"
                            onClick={() => setDropdownOpen(false)}
                            style={{ animationDelay: '240ms' }}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 transition-colors group animate-in fade-in duration-240 fill-mode-both"
                          >
                            <SpatialAnimatedIcon icon={ShieldAlert} animation="tilt" trigger="parent-hover" className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-200/70 dark:border-white/10 my-1"></div>

                      <div className="px-2 py-1">
                        <SpatialButton
                          variant="ghost"
                          size="sm"
                          fullWidth
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          icon={LogOut}
                          className="justify-start text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 px-3 py-2 w-full font-medium"
                        >
                          Sign Out
                        </SpatialButton>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                <Link
                  to="/admin/login"
                  className="hidden xl:inline-flex text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Admin Login
                </Link>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full transition-colors text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5"
                >
                  Log In
                </Link>
                {/* Hero-Harmonized Warm Gold "Get Started" Pill */}
                <Link
                  to="/signup"
                  className="shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#ffd23f] hover:bg-[#ffe066] text-slate-950 shadow-[0_4px_16px_-2px_rgba(255,210,63,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200"
                >
                  Get Started
                </Link>
                {/* Circular Theme Toggle Control */}
                <ThemeToggle size="md" />
              </div>
            )}
          </div>

          {/* Mobile Navigation Controls (< lg) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <SpatialIconButton
              icon={Search}
              label="Universal Search (Ctrl+K)"
              size="sm"
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsSearchOpen((prev) => !prev)}
            />
            <ThemeToggle size="sm" />
            {isAuthenticated && <NotificationBell />}
            <SpatialIconButton
              icon={mobileMenuOpen ? X : Menu}
              label="Toggle navigation menu"
              size="md"
              variant="secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </div>
      </nav>

      {/* Floating Glass Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden mt-2 rounded-2xl p-4 space-y-3 border transition-all duration-200 bg-white/95 border-slate-200/90 text-slate-900 shadow-2xl dark:bg-[#080c1e]/95 dark:backdrop-blur-2xl dark:border-white/12 dark:text-gray-200 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {isAuthenticated && collegeName && (
            <div className="p-2.5 rounded-xl border text-xs flex items-center gap-2 mb-2 bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-indigo-500/30 dark:text-gray-300">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              <span className="font-semibold truncate">{collegeName}</span>
            </div>
          )}

          <Link
            to="/notifications"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <SpatialAnimatedIcon icon={Bell} animation="signal" trigger="parent-hover" className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Notifications
          </Link>

          <Link
            to="/hackathons"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <SpatialAnimatedIcon icon={Trophy} animation="lift" trigger="parent-hover" className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Hackathons
          </Link>
          <Link
            to="/users"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <SpatialAnimatedIcon icon={Users} animation="group" trigger="parent-hover" className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Find Teammates
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t space-y-2 border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-3 px-3 py-2 border-b mb-2 border-slate-200 dark:border-gray-800">
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name}
                  size="sm"
                  verified={user?.experienceVerificationStatus === 'Verified' || user?.isVerified}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                    {user?.name}
                  </p>
                  {collegeName && (
                    <p className="text-xs truncate text-slate-500 dark:text-gray-400">
                      {collegeName}
                    </p>
                  )}
                </div>
              </div>
              <Link
                to="/post-request"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full text-sm font-bold bg-[#ffd23f] hover:bg-[#ffe066] text-slate-950 shadow-md transition-all"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Post Team Request</span>
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 font-medium rounded-lg transition-colors text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Student Dashboard
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 font-medium rounded-lg transition-colors text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                My Requests & Responses
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 font-medium rounded-lg transition-colors text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Profile Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 font-medium rounded-lg transition-colors text-amber-700 hover:text-amber-900 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/10"
                >
                  Admin Console
                </Link>
              )}
              <SpatialButton
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                icon={LogOut}
                className="justify-start text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-3 py-2"
              >
                Sign Out
              </SpatialButton>
            </div>
          ) : (
            <div className="pt-3 border-t flex flex-col gap-2 border-slate-200 dark:border-gray-800">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-white/5 dark:border dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/20 transition-all"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-bold bg-[#ffd23f] hover:bg-[#ffe066] text-slate-950 shadow-md transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Floating Mobile Search In-Place Header Bar */}
      {isSearchOpen && (
        <div className="pointer-events-auto md:hidden absolute inset-x-2.5 top-2.5 h-14 bg-white/98 dark:bg-[#080c1e]/98 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/14 z-50 px-3 flex items-center gap-2 shadow-2xl">
          <div className="flex-1">
            <UniversalSearch
              isOpen={true}
              onClose={() => setIsSearchOpen(false)}
            />
          </div>
          <SpatialIconButton
            icon={X}
            label="Close search"
            size="sm"
            variant="ghost"
            onClick={() => setIsSearchOpen(false)}
          />
        </div>
      )}
    </header>
  );
};

export default Navbar;
