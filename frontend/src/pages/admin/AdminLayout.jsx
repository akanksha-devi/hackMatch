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
import { PageTransition } from '../../animations';

export const AdminLayout = () => {
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
    <div className="min-h-screen bg-[#07090e]/75 text-gray-100 flex flex-col md:flex-row font-sans relative z-10">
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-950/80 border-b border-gray-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            HM
          </div>
          <span className="font-bold text-white text-base">HackMatch Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-gray-950/90 border-r border-gray-800/80 p-5 shrink-0 fixed md:sticky top-0 h-auto md:h-screen z-30 overflow-y-auto`}
      >
        {/* Logo & Portal Title */}
        <div className="hidden md:flex items-center gap-3 pb-6 border-b border-gray-800/80">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
            HM
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
              HackMatch
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Admin
              </span>
            </h1>
            <p className="text-[11px] text-gray-500">Multi-College Platform</p>
          </div>
        </div>

        {/* Current Admin Identity Pill */}
        <div className="my-5 p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isSuperAdmin
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}
            >
              {isSuperAdmin ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
              {isSuperAdmin ? 'Super Admin' : 'College Admin'}
            </span>
          </div>

          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>

          {collegeName && (
            <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1.5 pt-1 border-t border-gray-800">
              <School className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{collegeName}</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3 py-1">
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
        <div className="pt-4 border-t border-gray-800/80 space-y-2 mt-auto">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-indigo-300 hover:bg-gray-900/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Student Portal
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Top Header Bar */}
          <div className="hidden md:flex items-center justify-between pb-5 border-b border-gray-800/80">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                Logged in as <span className="font-semibold text-white">{user?.name}</span>{' '}
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 ml-1">
                  {user?.role === 'superAdmin' ? 'Super Admin' : 'College Admin'}
                </span>
              </span>
              {collegeName && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-indigo-500/30 text-xs text-indigo-300">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium truncate max-w-[260px]">{collegeName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
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
