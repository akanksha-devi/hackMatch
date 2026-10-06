import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Trash2,
  ExternalLink,
  Filter,
} from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { SpatialCard, SpatialPanel, SpatialButton, SpatialIconButton, SpatialTabs } from '../components/spatial';
import { StatusBadge } from '../components/StatusBadge';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'VERIFICATION_APPROVED':
      return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
    case 'VERIFICATION_REJECTED':
      return <XCircle className="w-5 h-5 text-rose-500" />;
    case 'VERIFICATION_REQUESTED':
      return <Clock className="w-5 h-5 text-amber-500" />;
    case 'VERIFICATION_RESET':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'APPLICATION_RECEIVED':
      return <Users className="w-5 h-5 text-indigo-500" />;
    case 'APPLICATION_ACCEPTED':
      return <UserCheck className="w-5 h-5 text-emerald-500" />;
    case 'APPLICATION_REJECTED':
      return <XCircle className="w-5 h-5 text-rose-500" />;
    case 'ADMIN_CREATED':
    case 'ADMIN_REMOVED':
    case 'ADMIN_DEACTIVATED':
      return <ShieldAlert className="w-5 h-5 text-violet-500" />;
    default:
      return <Bell className="w-5 h-5 text-cyan-500" />;
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
  return past.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const Notifications = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await apiService.getNotifications({
        unreadOnly: filter === 'unread',
        limit: 50,
      });
      if (data && data.notifications) {
        setNotifications(data.notifications);
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('notification-refresh', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('notification-refresh', handleFocus);
    };
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      // Re-fetch count if unread
      const removed = notifications.find((n) => n._id === id);
      if (removed && !removed.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="relative space-y-6 pb-16">
      {/* Ambient Atmospheric Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[520px] max-w-full h-[320px] bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-transparent blur-3xl rounded-full" 
        />
      </div>

      <div className="relative max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
          isLight ? 'border-slate-200/80' : 'border-gray-800/80'
        }`}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>SIGNAL DISPATCH & AUDIT</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl border ${
                isLight
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
              }`}>
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  Notification Center
                </h1>
                <p className={`text-sm mt-0.5 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Real-time alerts on team rosters, applicant decisions, and college credential verifications.
                </p>
              </div>
            </div>
          </div>

          {/* Action Header Button */}
          {unreadCount > 0 && (
            <div className="self-start sm:self-center">
              <SpatialButton
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                icon={Check}
              >
                Mark All as Read
              </SpatialButton>
            </div>
          )}
        </div>

        {/* Filter Tabs & Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <SpatialTabs
            tabs={[
              { id: 'all', label: 'All Notifications', badge: notifications.length > 0 ? notifications.length : null },
              { id: 'unread', label: 'Unread', badge: unreadCount > 0 ? unreadCount : null },
            ]}
            activeTab={filter}
            onChange={setFilter}
          />

          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} px-1`}>
            {unreadCount > 0 ? `${unreadCount} unread incoming signal${unreadCount > 1 ? 's' : ''}` : 'All signals cleared'}
          </span>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Retrieving signal feed...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <SpatialPanel elevation="flat" className="p-12 text-center">
            <Bell className={`w-12 h-12 stroke-[1.2] mx-auto mb-3 ${
              isLight ? 'text-slate-400' : 'text-slate-600'
            }`} />
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className={`text-sm mt-1 max-w-sm mx-auto ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {filter === 'unread'
                ? "You're completely caught up! Check back later for team invitations and verification updates."
                : "You don't have any notifications right now. Activity related to your teams and verifications will appear here."}
            </p>
          </SpatialPanel>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <SpatialCard
                key={notif._id}
                hover
                elevation="raised"
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 transition-all duration-200 ${
                  !notif.isRead
                    ? isLight
                      ? 'border-indigo-400/80 bg-indigo-50/30'
                      : 'border-indigo-500/40 bg-indigo-950/20'
                    : ''
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                    isLight
                      ? 'bg-white border-slate-200/80 shadow-xs'
                      : 'bg-slate-800/80 border-white/10'
                  }`}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4
                        className={`text-sm truncate ${
                          !notif.isRead
                            ? isLight
                              ? 'text-indigo-950 font-bold'
                              : 'text-white font-bold'
                            : isLight
                            ? 'text-slate-900 font-semibold'
                            : 'text-slate-200 font-semibold'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <StatusBadge
                          status="new"
                          label="New"
                          size="sm"
                          showIcon={false}
                        />
                      )}
                      <span className={`text-xs ml-auto sm:ml-0 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        • {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      isLight ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  {notif.link && (
                    <Link
                      to={notif.link}
                      onClick={() => {
                        if (!notif.isRead) handleMarkAsRead(notif._id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border-white/10'
                      }`}
                    >
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <SpatialButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMarkAsRead(notif._id)}
                      icon={Check}
                    >
                      Mark Read
                    </SpatialButton>
                  )}

                  <SpatialIconButton
                    icon={Trash2}
                    label="Delete Notification"
                    tooltip="Delete Notification"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(notif._id)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  />
                </div>
              </SpatialCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
