import React, { useState, useMemo } from 'react';
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
  Inbox,
  Search,
  Radio,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

function getNotificationVisuals(notif) {
  const type = notif.event_type || notif.type || 'system';

  if (type.startsWith('reminder_')) {
    return {
      icon: Clock,
      bgColor: 'bg-amber-100 text-amber-700',
      badge: type === 'reminder_5m' ? '5m Reminder' : '30m Reminder',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  if (type === 'booking_overdue') {
    return {
      icon: ShieldAlert,
      bgColor: 'bg-rose-100 text-rose-700',
      badge: 'Action Required',
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
      badge: type === 'payment_failed' ? 'Declined' : 'Verified Payment',
      badgeColor: type === 'payment_failed' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
      badge: 'Physical Visit',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  }

  return {
    icon: Info,
    bgColor: 'bg-brand-100 text-brand-700',
    badge: 'System Notice',
    badgeColor: 'bg-slate-50 text-slate-600 border-slate-200',
  };
}

const ITEMS_PER_PAGE = 10;

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    connectionStatus,
  } = useNotifications();

  const [category, setCategory] = useState('all'); // 'all' | 'unread' | 'bookings' | 'reminders' | 'payments' | 'system'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Category counts
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter(n => !n.is_read).length,
      bookings: notifications.filter(n =>
        ['booking_created', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'booking_rescheduled'].includes(n.event_type) ||
        ['booking_request', 'booking_approved', 'booking_rejected', 'booking_cancelled'].includes(n.type)
      ).length,
      reminders: notifications.filter(n =>
        ['reminder_30m', 'reminder_5m', 'booking_started', 'booking_expired', 'booking_overdue'].includes(n.event_type)
      ).length,
      payments: notifications.filter(n =>
        ['payment_success', 'payment_failed', 'payment_received'].includes(n.event_type) ||
        ['payment_success', 'payment_failed', 'payment_received'].includes(n.type)
      ).length,
      system: notifications.filter(n =>
        ['system', 'feedback_request', 'incident_reported', 'visit_request', 'visit_approved', 'visit_rejected'].includes(n.event_type)
      ).length,
    };
  }, [notifications]);

  // Filter and search
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Category filter
      if (category === 'unread' && n.is_read) return false;
      if (category === 'bookings') {
        const matchesBooking =
          ['booking_created', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'booking_rescheduled'].includes(n.event_type) ||
          ['booking_request', 'booking_approved', 'booking_rejected', 'booking_cancelled'].includes(n.type);
        if (!matchesBooking) return false;
      }
      if (category === 'reminders') {
        const matchesReminder = ['reminder_30m', 'reminder_5m', 'booking_started', 'booking_expired', 'booking_overdue'].includes(n.event_type);
        if (!matchesReminder) return false;
      }
      if (category === 'payments') {
        const matchesPayment =
          ['payment_success', 'payment_failed', 'payment_received'].includes(n.event_type) ||
          ['payment_success', 'payment_failed', 'payment_received'].includes(n.type);
        if (!matchesPayment) return false;
      }
      if (category === 'system') {
        const matchesSystem = ['system', 'feedback_request', 'incident_reported', 'visit_request', 'visit_approved', 'visit_rejected'].includes(n.event_type);
        if (!matchesSystem) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = n.title && n.title.toLowerCase().includes(q);
        const inMessage = n.message && n.message.toLowerCase().includes(q);
        if (!inTitle && !inMessage) return false;
      }

      return true;
    });
  }, [notifications, category, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotifications, currentPage]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-900 text-white flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <span>In-App Notification Center</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full inline-block ${
                    connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                  title={connectionStatus === 'connected' ? 'Real-Time SSE Stream Active' : 'Connecting'}
                />
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time booking reminders, advance payment receipts, and inspection alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          <button
            onClick={handleManualRefresh}
            className={`p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition ${
              isRefreshing ? 'animate-spin text-brand-700' : ''
            }`}
            title="Refresh notifications"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-900 bg-brand-50 hover:bg-brand-100 transition border border-brand-200"
            >
              <CheckCheck className="w-4 h-4 text-brand-700" />
              <span>Mark all read</span>
            </button>
          )}

          <Link
            to="/settings"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
          >
            Preferences
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All', count: counts.all },
              { id: 'unread', label: 'Unread', count: counts.unread },
              { id: 'bookings', label: 'Bookings', count: counts.bookings },
              { id: 'reminders', label: 'Reminders', count: counts.reminders },
              { id: 'payments', label: 'Payments', count: counts.payments },
              { id: 'system', label: 'System', count: counts.system },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                  category === cat.id
                    ? 'bg-brand-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      category === cat.id
                        ? 'bg-brand-800 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-700 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {paginatedList.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={searchQuery ? "No matches found" : "No notifications"}
          description={
            searchQuery
              ? `No notifications matched your search query "${searchQuery}".`
              : category === 'unread'
              ? "You are completely caught up! No unread notifications."
              : "No activity recorded in this category yet."
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {paginatedList.map((n) => {
            const { icon: IconComponent, bgColor, badge, badgeColor } = getNotificationVisuals(n);

            return (
              <div
                key={n.id}
                className={`p-5 flex items-start justify-between gap-4 transition hover:bg-slate-50/70 ${
                  !n.is_read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Event Icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${bgColor} shadow-xs`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${badgeColor}`}>
                        {badge}
                      </span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-700 inline-block animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                      {n.message}
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(n.created_at).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </span>
                      {n.delivery_status && (
                        <span className="capitalize text-[10px] text-slate-400">
                          • {n.delivery_status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0 pt-1">
                  {n.link_url && (
                    <Link
                      to={n.link_url}
                      onClick={() => { if (!n.is_read) markAsRead(n.id); }}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-brand-900 bg-brand-50 hover:bg-brand-100 rounded-xl transition border border-brand-200"
                      title="View details"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-3.5 h-3.5 text-brand-700" />
                    </Link>
                  )}

                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
          <span className="text-slate-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifications.length)} of {filteredNotifications.length} notifications
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
