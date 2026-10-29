import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  AlertTriangle,
  CreditCard,
  ShieldAlert,
  Info,
  ExternalLink,
  Radio,
  EyeOff
} from 'lucide-react';

function getNotificationVisuals(notif) {
  const type = notif.event_type || notif.type || 'system';

  if (type.startsWith('reminder_')) {
    return {
      icon: Clock,
      bgColor: 'bg-amber-100 text-amber-700',
      badge: 'Reminder',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  if (type === 'booking_overdue') {
    return {
      icon: ShieldAlert,
      bgColor: 'bg-rose-100 text-rose-700',
      badge: 'Overdue',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }
  if (type === 'booking_approved') {
    return {
      icon: Check,
      bgColor: 'bg-emerald-100 text-emerald-700',
      badge: 'Approved',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (type === 'booking_rejected' || type === 'booking_cancelled') {
    return {
      icon: AlertTriangle,
      bgColor: 'bg-slate-100 text-slate-700',
      badge: type === 'booking_cancelled' ? 'Cancelled' : 'Declined',
      badgeColor: 'bg-slate-50 text-slate-600 border-slate-200',
    };
  }
  if (type.startsWith('payment_')) {
    return {
      icon: CreditCard,
      bgColor: 'bg-indigo-100 text-indigo-700',
      badge: 'Payment',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
  }
  if (type === 'booking_started') {
    return {
      icon: Radio,
      bgColor: 'bg-blue-100 text-blue-700',
      badge: 'In Progress',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }
  if (type.startsWith('visit_')) {
    return {
      icon: Calendar,
      bgColor: 'bg-purple-100 text-purple-700',
      badge: 'Visit',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  }

  return {
    icon: Info,
    bgColor: 'bg-brand-100 text-brand-700',
    badge: 'Update',
    badgeColor: 'bg-slate-50 text-slate-600 border-slate-200',
  };
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    connectionStatus,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'bookings' | 'reminders'
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter items based on activeTab
  const filteredList = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'bookings') {
      return (
        ['booking_created', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'booking_rescheduled'].includes(n.event_type) ||
        ['booking_request', 'booking_approved', 'booking_rejected', 'booking_cancelled'].includes(n.type)
      );
    }
    if (activeTab === 'reminders') {
      return ['reminder_30m', 'reminder_5m', 'booking_started', 'booking_expired', 'booking_overdue'].includes(n.event_type);
    }
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition ${
          isOpen ? 'bg-brand-50 text-brand-900 ring-2 ring-brand-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
        aria-label="Activity Notifications"
        title="Activity Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-rose-600 rounded-full px-1 shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-brand-100 text-brand-800 rounded-full">
                  {unreadCount} new
                </span>
              )}
              {/* Real-time SSE indicator */}
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
                title={connectionStatus === 'connected' ? 'Live SSE Connected' : 'Connecting to Live Stream'}
              />
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-700 hover:text-brand-900 font-semibold flex items-center space-x-1 transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 px-3 py-2 border-b border-slate-100 bg-white text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'bookings', label: 'Bookings' },
              { id: 'reminders', label: 'Reminders' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-brand-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List of Notifications */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No notifications here</p>
                <p className="text-[11px] text-slate-400">
                  {activeTab === 'unread' ? "You're completely caught up!" : "No activity recorded in this category."}
                </p>
              </div>
            ) : (
              filteredList.slice(0, 10).map((notif) => {
                const { icon: IconComponent, bgColor, badge, badgeColor } = getNotificationVisuals(notif);

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 flex items-start space-x-3 transition hover:bg-slate-50/80 ${
                      !notif.is_read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Event Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className={`inline-block px-1.5 py-0.5 text-[9px] font-semibold rounded border ${badgeColor}`}>
                          {badge}
                        </span>

                        <div className="flex items-center space-x-2">
                          {notif.link_url && (
                            <Link
                              to={notif.link_url}
                              onClick={() => {
                                if (!notif.is_read) markAsRead(notif.id);
                                setIsOpen(false);
                              }}
                              className="text-[11px] text-brand-700 hover:text-brand-900 font-semibold inline-flex items-center space-x-0.5"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}

                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-[10px] text-slate-400 hover:text-emerald-700 transition"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-brand-700 mt-1 flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-brand-900 hover:text-brand-700 transition inline-flex items-center space-x-1"
            >
              <span>View all notifications in Activity Center</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

