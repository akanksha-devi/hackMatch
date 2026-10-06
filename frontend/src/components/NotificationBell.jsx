import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { SpatialButton, SpatialIconButton, SpatialAnimatedIcon } from './spatial';
import { StatusBadge } from './StatusBadge';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'VERIFICATION_APPROVED':
      return <SpatialAnimatedIcon icon={ShieldCheck} animation="pop" trigger="parent-hover" className="w-5 h-5 text-emerald-400" />;
    case 'VERIFICATION_REJECTED':
      return <SpatialAnimatedIcon icon={XCircle} animation="cross" trigger="parent-hover" className="w-5 h-5 text-rose-400" />;
    case 'VERIFICATION_REQUESTED':
      return <SpatialAnimatedIcon icon={Clock} animation="tick" trigger="parent-hover" className="w-5 h-5 text-amber-400" />;
    case 'VERIFICATION_RESET':
      return <SpatialAnimatedIcon icon={AlertTriangle} animation="bounce" trigger="parent-hover" className="w-5 h-5 text-yellow-400" />;
    case 'APPLICATION_RECEIVED':
      return <SpatialAnimatedIcon icon={Users} animation="group" trigger="parent-hover" className="w-5 h-5 text-indigo-400" />;
    case 'APPLICATION_ACCEPTED':
      return <SpatialAnimatedIcon icon={UserCheck} animation="pop" trigger="parent-hover" className="w-5 h-5 text-emerald-400" />;
    case 'APPLICATION_REJECTED':
      return <SpatialAnimatedIcon icon={XCircle} animation="cross" trigger="parent-hover" className="w-5 h-5 text-rose-400" />;
    case 'ADMIN_CREATED':
    case 'ADMIN_REMOVED':
    case 'ADMIN_DEACTIVATED':
      return <SpatialAnimatedIcon icon={ShieldAlert} animation="tilt" trigger="parent-hover" className="w-5 h-5 text-violet-400" />;
    default:
      return <SpatialAnimatedIcon icon={Bell} animation="signal" trigger="parent-hover" className="w-5 h-5 text-cyan-400" />;
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSec = Math.floor((now - past) / 1000);

  if (diffInSec < 60) return 'Just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const NotificationBell = ({ isLight = false }) => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLightMode = isLight || resolvedTheme === 'light';
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const data = await apiService.getUnreadNotificationCount();
      if (data && typeof data.count === 'number') {
        setUnreadCount(data.count);
      }
    } catch (err) {
      // Graceful fail on background poll
    }
  };

  const fetchRecentNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiService.getNotifications({ limit: 8 });
      if (data && data.notifications) {
        setNotifications(data.notifications);
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();

    // Responsive poll every 15 seconds
    const interval = setInterval(fetchUnreadCount, 15000);

    // Refresh immediately when window/tab gains focus
    const handleFocus = () => fetchUnreadCount();
    window.addEventListener('focus', handleFocus);

    // Listen for custom app-wide notification refresh events
    const handleCustomRefresh = () => fetchUnreadCount();
    window.addEventListener('notification-refresh', handleCustomRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('notification-refresh', handleCustomRefresh);
    };
  }, [user]);

  // Close dropdown on click outside, Escape, or when popovers are dismissed globally
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handleClosePopovers = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('close-all-popovers', handleClosePopovers);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('close-all-popovers', handleClosePopovers);
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('close-all-popovers'));
      fetchRecentNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await apiService.markNotificationRead(notif._id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }

    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await apiService.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Bell Button */}
      <SpatialIconButton
        icon={Bell}
        label="Notifications"
        tooltip="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        variant={isOpen ? 'secondary' : 'ghost'}
        size="md"
        onClick={handleToggle}
        className={isOpen ? 'text-indigo-600 dark:text-indigo-400' : ''}
      >
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-indigo-600 rounded-full shadow-md shadow-indigo-500/40 border-2 transition-transform duration-180 hover:scale-105 select-none ${isLightMode ? 'border-white' : 'border-slate-950'}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </SpatialIconButton>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications popover"
          className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl z-50 overflow-hidden motion-open liquid-glass-floating ${
            isLightMode
              ? 'text-slate-900'
              : 'text-slate-100'
          }`}
        >
          {/* Top Specular Accent Highlight Line matching SpatialCard */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-white/30 via-indigo-400/40 to-cyan-400/30 dark:from-white/20 dark:via-indigo-300/30 dark:to-cyan-300/20 opacity-80 pointer-events-none" />

          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/50 dark:border-white/10 bg-white/20 dark:bg-white/[0.02]"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <StatusBadge
                  status="new"
                  label={`${unreadCount} new`}
                  size="sm"
                  showIcon={false}
                />
              )}
            </div>
            {unreadCount > 0 && (
              <SpatialButton
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                icon={Check}
                className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 h-auto min-h-0 font-medium"
              >
                Mark all read
              </SpatialButton>
            )}
          </div>

          {/* List of Notifications */}
          <div
            className="max-h-[380px] overflow-y-auto divide-y divide-slate-200/40 dark:divide-white/[0.06]"
          >
            {loading ? (
              <div
                className={`py-8 text-center text-xs ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading updates...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell
                  className={`w-8 h-8 mx-auto mb-2 stroke-[1.5] ${
                    isLightMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    isLightMode ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  No notifications yet
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  We'll alert you on important team & verification events.
                </p>
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={notif._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNotificationClick(notif)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notif);
                    }
                  }}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className={`group flex items-start gap-3 p-3.5 cursor-pointer transition-all duration-240 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 animate-in fade-in duration-260 fill-mode-both ${
                    !notif.isRead
                      ? 'bg-indigo-500/[0.08] dark:bg-indigo-500/15 hover:bg-slate-200/50 dark:hover:bg-white/10'
                      : 'bg-transparent hover:bg-slate-200/40 dark:hover:bg-white/5'
                  }`}
                >
                  <div
                    className="p-2 rounded-xl shrink-0 mt-0.5 border bg-white/40 dark:bg-white/5 border-slate-200/60 dark:border-white/10 group-hover:scale-105 group-hover:border-indigo-400/40 transition-all duration-180"
                  >
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs font-semibold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-180 ${
                          !notif.isRead
                            ? isLightMode
                              ? 'text-slate-900 font-bold'
                              : 'text-white'
                            : isLightMode
                            ? 'text-slate-700'
                            : 'text-slate-300'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span
                        className={`text-[11px] shrink-0 ${
                          isLightMode ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs line-clamp-2 leading-relaxed ${
                        isLightMode ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0 mt-2 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className="p-2.5 border-t border-slate-200/50 dark:border-white/10 bg-transparent text-center"
          >
            <SpatialButton
              to="/notifications"
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setIsOpen(false)}
              icon={ArrowRight}
              iconPosition="right"
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            >
              View full notification center
            </SpatialButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
