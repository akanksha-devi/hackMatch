import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Building2,
  Users,
  GitPullRequest,
  Trophy,
  History,
  LogOut,
  ChevronRight,
  ExternalLink,
  Shield,
  ShieldCheck,
  School,
  Menu,
  X,
  Sparkles,
  BadgeCheck,
} from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
import ThemeToggle from '../../components/ThemeToggle';
import { PageTransition } from '../../animations';
import { useTheme } from '../../context/ThemeContext';
import { SpatialButton, SpatialIconButton } from '../../components/spatial';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminLayout = () => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const { user, isSuperAdmin, isCollegeAdmin, collegeName, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    {
      label: 'Overview',
      to: '/admin',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Colleges & Campuses',
      to: '/admin/colleges',
      icon: Building2,
      superAdminOnly: true,
    },
    {
      label: 'Experience Verification',
      to: '/admin/verification',
      icon: BadgeCheck,
    },
    {
      label: 'Student Directory',
      to: '/admin/students',
      icon: Users,
    },
    {
      label: 'Team Requests',
      to: '/admin/team-requests',
      icon: GitPullRequest,
    },
    {
      label: 'Hackathons',
      to: '/admin/hackathons',
      icon: Trophy,
    },
    {
      label: 'Audit Trail',
      to: '/admin/audit-logs',
      icon: History,
      superAdminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans relative z-10 transition-colors duration-300 ${
      isLight ? 'bg-slate-50/80 text-slate-800' : 'bg-[#07090e]/75 text-gray-100'
    }`}>
      {/* Mobile Top Nav */}
      <div className={`md:hidden flex items-center justify-between p-4 border-b sticky top-0 z-40 backdrop-blur-md ${
        isLight ? 'bg-white/90 border-slate-200' : 'bg-gray-950/80 border-gray-800'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            HM
          </div>
          <span className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>HackMatch Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <NotificationBell />
          <SpatialIconButton
            icon={mobileMenuOpen ? X : Menu}
            label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 border-r p-5 shrink-0 fixed md:sticky top-0 h-auto md:h-screen z-30 overflow-y-auto ${
          isLight ? 'bg-white/95 border-slate-200 shadow-sm' : 'bg-gray-950/90 border-gray-800/80'
        }`}
      >
        {/* Logo & Portal Title */}
        <div className={`hidden md:flex items-center gap-3 pb-6 border-b ${isLight ? 'border-slate-200' : 'border-gray-800/80'}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
            HM
          </div>
          <div>
            <h1 className={`font-extrabold text-base tracking-tight flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              HackMatch
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Admin
              </span>
            </h1>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Multi-College Platform</p>
          </div>
        </div>

        {/* Current Admin Identity Pill */}
        <div className={`my-5 p-3.5 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-900/90 border-gray-800/90'}`}>
          <div className="flex items-center justify-between">
            <StatusBadge
              status={user?.role}
              type="role"
              size="sm"
            />
          </div>

          <div className="truncate">
            <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{user?.name || 'Administrator'}</p>
            <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{user?.email}</p>
          </div>

          {collegeName && (
            <div className={`text-[11px] font-medium flex items-center gap-1.5 pt-1 border-t ${
              isLight ? 'border-slate-200 text-indigo-700' : 'border-gray-800 text-cyan-300'
            }`}>
              <School className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
              <span className="truncate">{collegeName}</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 flex-1">
          <p className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
            Management
          </p>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`pt-4 border-t space-y-2 mt-auto ${isLight ? 'border-slate-200' : 'border-gray-800/80'}`}>
          <Link
            to="/dashboard"
            className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              isLight
                ? 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                : 'text-gray-400 hover:text-indigo-300 hover:bg-gray-900/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Student Portal
            </span>
            <ChevronRight className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-gray-600'}`} />
          </Link>

          <SpatialButton
            variant="ghost"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
            className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            Sign Out
          </SpatialButton>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Header Bar */}
          <div className={`hidden md:flex items-center justify-between pb-5 border-b ${isLight ? 'border-slate-200' : 'border-gray-800/80'}`}>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Logged in as <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{user?.name}</span>{' '}
                <StatusBadge
                  status={user?.role}
                  type="role"
                  size="sm"
                  className="ml-1"
                />
              </span>
              {collegeName && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${
                  isLight ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' : 'bg-slate-900 border border-indigo-500/30 text-indigo-300'
                }`}>
                  <School className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`} />
                  <span className="font-medium truncate max-w-[260px]">{collegeName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>

          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
