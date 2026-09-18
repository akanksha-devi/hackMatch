import React, { useState } from 'react';
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
  Bell
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

export const Navbar = () => {
  const { user, collegeName, isAdmin, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#07090e]/90 backdrop-blur-md border-b border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">
          
          {/* Left + Center Navigation Area */}
          <div className="flex items-center gap-4 lg:gap-6 xl:gap-8 shrink-0">
            {/* Left Section: Logo & Multi-College Badge */}
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

              {/* Multi-College Badge: Never wraps, fixed min-width, clean subtle border */}
              <span className="shrink-0 whitespace-nowrap inline-flex items-center justify-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 select-none min-w-[96px]">
                MULTI-COLLEGE
              </span>
            </div>

            {/* Center Section: Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <Link
                to="/hackathons"
                className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 ${
                  isActive('/hackathons')
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent'
                }`}
              >
                <Trophy className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Hackathons</span>
              </Link>

              <Link
                to="/users"
                className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 ${
                  isActive('/users')
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent'
                }`}
              >
                <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Find Teammates</span>
              </Link>
            </div>
          </div>

          {/* Right Section: Campus Badge, CTA, Notifications, Profile OR Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Active College Badge (Prominent / Cleanly Scoped) */}
                {collegeName && (
                  <div
                    className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs shrink-0 max-w-[170px] xl:max-w-[230px]"
                    title={`Campus: ${collegeName}`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-gray-400 font-medium shrink-0">Campus:</span>
                    <span className="text-indigo-300 font-semibold truncate">{collegeName}</span>
                  </div>
                )}

                {/* Admin Quick Link if admin */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Post Team Request Primary CTA - clean subtle 1px border, no wrapping */}
                <Link
                  to="/post-request"
                  className="shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm border border-indigo-400/30 hover:border-indigo-400/50 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>Post Team Request</span>
                </Link>

                {/* Notifications Bell */}
                <NotificationBell />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Profile Dropdown */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="shrink-0 flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-gray-800 hover:border-gray-700 bg-gray-900/60 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    aria-expanded={dropdownOpen}
                  >
                    <img
                      src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={user?.name}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/40 shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-200 max-w-[110px] truncate whitespace-nowrap">
                      {user?.name}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel border border-gray-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-800">
                        <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        {collegeName && (
                          <p className="text-[11px] text-cyan-400 truncate mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3 shrink-0" /> {collegeName}
                          </p>
                        )}
                        <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-1">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-indigo-500/10 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-400 shrink-0" />
                        Student Dashboard
                      </Link>

                      <Link
                        to="/notifications"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-indigo-500/10 transition-colors"
                      >
                        <Bell className="w-4 h-4 text-cyan-400 shrink-0" />
                        Notifications
                      </Link>

                      <Link
                        to="/my-requests"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-indigo-500/10 transition-colors"
                      >
                        <Inbox className="w-4 h-4 text-cyan-400 shrink-0" />
                        My Requests & Responses
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-indigo-500/10 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-purple-400 shrink-0" />
                        My Profile
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-300 hover:bg-amber-500/10 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-gray-800 my-1"></div>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <Link
                  to="/admin/login"
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all"
                >
                  Admin Login
                </Link>
                <Link
                  to="/login"
                  className="shrink-0 whitespace-nowrap px-3.5 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-xl transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="shrink-0 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm border border-indigo-400/30 hover:border-indigo-400/50 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-200"
                >
                  Get Started
                </Link>
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <ThemeToggle size="sm" />
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 focus:outline-none shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-gray-800 px-4 pt-2 pb-6 space-y-3">
          {isAuthenticated && collegeName && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-semibold truncate">{collegeName}</span>
            </div>
          )}

          <Link
            to="/notifications"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 font-medium hover:bg-gray-800"
          >
            <Bell className="w-4 h-4 text-indigo-400" />
            Notifications
          </Link>

          <Link
            to="/hackathons"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 font-medium hover:bg-gray-800"
          >
            <Trophy className="w-4 h-4 text-indigo-400" />
            Hackathons
          </Link>
          <Link
            to="/users"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 font-medium hover:bg-gray-800"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            Find Teammates
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-gray-800 space-y-2">
              <Link
                to="/post-request"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Post Team Request
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-300 font-medium hover:bg-gray-800 rounded-lg"
              >
                Student Dashboard
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-300 font-medium hover:bg-gray-800 rounded-lg"
              >
                My Requests & Responses
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-gray-300 font-medium hover:bg-gray-800 rounded-lg"
              >
                Profile Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-amber-300 font-medium hover:bg-amber-500/10 rounded-lg"
                >
                  Admin Console
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 text-red-400 font-medium hover:bg-red-500/10 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-gray-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-gray-300 hover:text-white border border-gray-700 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-indigo-600 text-white rounded-xl font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
