import React, { useState, useRef, useEffect } from 'react';
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

export const Navbar = () => {
  const { user, collegeName, isAdmin, logout, isAuthenticated } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-200">
      {/* Background Glass Plate - Keeps sticky navbar blurred without trapping descendant dropdowns in a Backdrop Root */}
      <div 
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none -z-10 border-b shadow-[0_4px_20px_-5px_rgba(0,0,0,0.3)] transition-colors duration-200 ${
          isLight
            ? 'bg-white/75 backdrop-blur-xl border-slate-200/80'
            : 'bg-[#07090e]/75 backdrop-blur-xl border-white/[0.08]'
        }`}
      />
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 lg:gap-3 xl:gap-4">
          
          {/* Left Navigation Area: Logo + Multi-College Badge + Core Links */}
          <div className="flex items-center gap-3 lg:gap-4 xl:gap-6 shrink-0">
            {/* Logo & Multi-College Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
                  <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-400 fill-indigo-500/20 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
                <span className="font-extrabold text-xl tracking-tight text-white shrink-0 whitespace-nowrap">
                  Hack<span className="text-gradient">Match</span>
                </span>
              </Link>

              {/* Multi-College Badge: Rendered on 2xl+ ultra-wide screens */}
              <span className="hidden 2xl:inline-flex shrink-0 whitespace-nowrap items-center justify-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 select-none min-w-[96px]">
                MULTI-COLLEGE
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
              <Link
                to="/hackathons"
                className={`group shrink-0 whitespace-nowrap px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 ${
                  isActive('/hackathons')
                    ? isLight
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent'
                }`}
              >
                <SpatialAnimatedIcon icon={Trophy} animation="lift" trigger="parent-hover" className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Hackathons</span>
              </Link>

              <Link
                to="/users"
                className={`group shrink-0 whitespace-nowrap px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 ${
                  isActive('/users')
                    ? isLight
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent'
                }`}
              >
                <SpatialAnimatedIcon icon={Users} animation="group" trigger="parent-hover" className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Find Teammates</span>
              </Link>
            </div>
          </div>

          {/* Center Section: Dedicated Structural Slot for Inline Expanding Universal Search */}
          <div className="hidden md:flex items-center justify-center flex-1 min-w-[160px] xl:min-w-[200px] max-w-[340px] mx-1.5 lg:mx-3">
            <UniversalSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />
          </div>

          {/* Right Section: Campus Badge, CTA, Notifications, Profile OR Auth Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Active College Badge (Shown on 2XL+ screens to keep desktop spacious) */}
                {collegeName && (
                  <div
                    className={`hidden 2xl:flex items-center gap-2 px-3 h-10 rounded-xl border text-xs shrink-0 max-w-[190px] ${
                      isLight
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs'
                        : 'bg-slate-900/90 border-indigo-500/30 text-gray-300'
                    }`}
                    title={`Campus: ${collegeName}`}
                  >
                    <Building2 className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
                    <span className={`font-medium shrink-0 ${isLight ? 'text-indigo-600' : 'text-gray-400'}`}>Campus:</span>
                    <span className={`font-semibold truncate ${isLight ? 'text-indigo-950' : 'text-indigo-300'}`}>{collegeName}</span>
                  </div>
                )}

                {/* Admin Quick Link if admin */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="shrink-0 whitespace-nowrap px-3 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Post Team Request Primary CTA */}
                <SpatialButton
                  to="/post-request"
                  variant="primary"
                  size="md"
                  icon={PlusCircle}
                  className="hidden sm:inline-flex shrink-0 whitespace-nowrap"
                >
                  <span className="hidden xl:inline">Post Team Request</span>
                  <span className="xl:hidden">Post</span>
                </SpatialButton>

                {/* Notifications Bell */}
                <NotificationBell />

                {/* Theme Toggle */}
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
                      className="absolute right-0 mt-2 w-64 rounded-2xl z-50 overflow-hidden motion-open liquid-glass-floating text-slate-900 dark:text-slate-100"
                    >
                      {/* Top Specular Accent Highlight Line matching SpatialCard */}
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-white/30 via-indigo-400/40 to-cyan-400/30 dark:from-white/20 dark:via-indigo-300/30 dark:to-cyan-300/20 opacity-80 pointer-events-none" />

                      <div className="px-4 py-3 border-b border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-white/[0.02]">
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
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors group animate-in fade-in duration-240 fill-mode-both"
                        >
                          <SpatialAnimatedIcon icon={LayoutDashboard} animation="micro-lift" trigger="parent-hover" className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                          Student Dashboard
                        </Link>

                        <Link
                          to="/notifications"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          style={{ animationDelay: '60ms' }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors group animate-in fade-in duration-240 fill-mode-both"
                        >
                          <SpatialAnimatedIcon icon={Bell} animation="signal" trigger="parent-hover" className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          Notifications
                        </Link>

                        <Link
                          to="/my-requests"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          style={{ animationDelay: '120ms' }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors group animate-in fade-in duration-240 fill-mode-both"
                        >
                          <SpatialAnimatedIcon icon={Inbox} animation="bubble" trigger="parent-hover" className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          My Requests & Responses
                        </Link>

                        <Link
                          to="/profile"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          style={{ animationDelay: '180ms' }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/10 transition-colors group animate-in fade-in duration-240 fill-mode-both"
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

                      <div className="border-t border-slate-200/50 dark:border-white/10 my-1"></div>

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
                          className="justify-start text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 px-3 py-2 w-full font-medium"
                        >
                          Sign Out
                        </SpatialButton>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <SpatialButton
                  to="/admin/login"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-slate-600 dark:text-gray-400"
                >
                  Admin Login
                </SpatialButton>
                <SpatialButton
                  to="/login"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                >
                  Log In
                </SpatialButton>
                <SpatialButton
                  to="/signup"
                  variant="primary"
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                >
                  Get Started
                </SpatialButton>
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
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
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className={`lg:hidden px-4 pt-2 pb-6 space-y-3 border-b shadow-xl ${
          isLight
            ? 'bg-white/98 border-slate-200 text-slate-900'
            : 'bg-gray-950/98 backdrop-blur-xl border-gray-800 text-gray-200'
        }`}>
          {isAuthenticated && collegeName && (
            <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 mb-2 ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-slate-900 border-indigo-500/30 text-gray-300'
            }`}>
              <Building2 className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
              <span className="font-semibold truncate">{collegeName}</span>
            </div>
          )}

          <Link
            to="/notifications"
            onClick={() => setMobileMenuOpen(false)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                : 'text-gray-200 hover:bg-gray-800'
            }`}
          >
            <SpatialAnimatedIcon icon={Bell} animation="signal" trigger="parent-hover" className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            Notifications
          </Link>

          <Link
            to="/hackathons"
            onClick={() => setMobileMenuOpen(false)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                : 'text-gray-200 hover:bg-gray-800'
            }`}
          >
            <SpatialAnimatedIcon icon={Trophy} animation="lift" trigger="parent-hover" className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            Hackathons
          </Link>
          <Link
            to="/users"
            onClick={() => setMobileMenuOpen(false)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              isLight
                ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                : 'text-gray-200 hover:bg-gray-800'
            }`}
          >
            <SpatialAnimatedIcon icon={Users} animation="group" trigger="parent-hover" className={`w-4 h-4 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
            Find Teammates
          </Link>

          {isAuthenticated ? (
            <div className={`pt-3 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
              <div className={`flex items-center gap-3 px-3 py-2 border-b mb-2 ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name}
                  size="sm"
                  verified={user?.experienceVerificationStatus === 'Verified' || user?.isVerified}
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {user?.name}
                  </p>
                  {collegeName && (
                    <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      {collegeName}
                    </p>
                  )}
                </div>
              </div>
              <SpatialButton
                to="/post-request"
                variant="primary"
                size="md"
                fullWidth
                icon={PlusCircle}
                onClick={() => setMobileMenuOpen(false)}
              >
                Post Team Request
              </SpatialButton>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 font-medium rounded-lg transition-colors ${
                  isLight
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                Student Dashboard
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 font-medium rounded-lg transition-colors ${
                  isLight
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                My Requests & Responses
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 font-medium rounded-lg transition-colors ${
                  isLight
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                Profile Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 font-medium rounded-lg transition-colors ${
                    isLight
                      ? 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
                      : 'text-amber-300 hover:bg-amber-500/10'
                  }`}
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
            <div className={`pt-3 border-t flex flex-col gap-2 ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
              <SpatialButton
                to="/login"
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </SpatialButton>
              <SpatialButton
                to="/signup"
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </SpatialButton>
            </div>
          )}
        </div>
      )}

      {/* Mobile Search In-Place Header Bar (for screens < md) */}
      {isSearchOpen && (
        <div className="md:hidden absolute inset-x-0 top-0 h-16 bg-[#07090e]/95 dark:bg-[#07090e]/98 backdrop-blur-2xl border-b border-white/10 z-50 px-3 flex items-center gap-2">
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
    </nav>
  );
};
