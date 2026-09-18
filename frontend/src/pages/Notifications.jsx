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

const getNotificationIcon = (type) => {
  switch (type) {
    case 'VERIFICATION_APPROVED':
      return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    case 'VERIFICATION_REJECTED':
      return <XCircle className="w-5 h-5 text-rose-400" />;
    case 'VERIFICATION_REQUESTED':
      return <Clock className="w-5 h-5 text-amber-400" />;
    case 'VERIFICATION_RESET':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'APPLICATION_RECEIVED':
      return <Users className="w-5 h-5 text-indigo-400" />;
    case 'APPLICATION_ACCEPTED':
      return <UserCheck className="w-5 h-5 text-emerald-400" />;
    case 'APPLICATION_REJECTED':
      return <XCircle className="w-5 h-5 text-rose-400" />;
    case 'ADMIN_CREATED':
    case 'ADMIN_REMOVED':
    case 'ADMIN_DEACTIVATED':
      return <ShieldAlert className="w-5 h-5 text-violet-400" />;
    default:
      return <Bell className="w-5 h-5 text-cyan-400" />;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Notification Center
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Stay updated on team formation, applications, and experience verifications.
                </p>
              </div>
            </div>
          </div>

          {/* Action Header Button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mt-6 mb-6">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-indigo-400 text-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Showing {notifications.length} updates
          </span>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400">Loading your notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <Bell className="w-12 h-12 text-slate-600 stroke-[1.2] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-200">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {filter === 'unread'
                ? "You're completely caught up! Check back later for team invitations and verification updates."
                : "You don't have any notifications right now. Activity related to your teams and verifications will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
                  !notif.isRead
                    ? 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/50'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          !notif.isRead ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          New
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto sm:ml-0">
                        • {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      title="Mark as Read"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notif._id)}
                    title="Delete Notification"
                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
