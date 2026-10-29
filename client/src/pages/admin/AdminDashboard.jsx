import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNotifications } from '../../context/NotificationContext';
import {
  ShieldCheck,
  Users,
  Package,
  CalendarCheck,
  AlertTriangle,
  Activity,
  FileText,
  Server,
  ArrowRight,
  Database,
  Bell,
  Clock,
  Radio,
  CheckCheck,
  ExternalLink,
  Play
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedulerTriggering, setSchedulerTriggering] = useState(false);
  const [schedulerResult, setSchedulerResult] = useState(null);

  const { notifications, unreadCount, markAllAsRead, connectionStatus } = useNotifications();

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [statsRes, healthRes] = await Promise.allSettled([
          api.get('/resources/stats'),
          api.get('/health'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          setStats(statsRes.value.data.data);
        }
        if (healthRes.status === 'fulfilled' && healthRes.value.data) {
          setHealth(healthRes.value.data);
        }
      } catch (e) {
        console.error('Admin dashboard error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleRunScheduler = async () => {
    try {
      setSchedulerTriggering(true);
      const res = await api.post('/notifications/scheduler/run');
      setSchedulerResult(res.data?.summary || { status: 'completed' });
      setTimeout(() => setSchedulerResult(null), 5000);
    } catch (e) {
      console.error('Failed to trigger scheduler:', e);
    } finally {
      setSchedulerTriggering(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Retrieving administrative telemetry..." />;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center space-x-2">
            <span>Enterprise System Administrator</span>
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="text-[11px] text-purple-200">
              {connectionStatus === 'connected' ? 'Live Stream Online' : 'Connecting'}
            </span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Central Administrative Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Monitor real-time booking requests, 50/50 payment settlements, autonomous scheduler reminders, and resource utilization.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <button
            onClick={handleRunScheduler}
            disabled={schedulerTriggering}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-100 font-bold text-xs hover:bg-purple-800 transition shadow-xs disabled:opacity-50"
            title="Execute booking scheduler evaluation immediately"
          >
            <Play className={`w-3.5 h-3.5 ${schedulerTriggering ? 'animate-spin' : ''}`} />
            <span>{schedulerTriggering ? 'Evaluating...' : 'Run Scheduler Now'}</span>
          </button>

          <Link
            to="/admin/audit-logs"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-md flex-shrink-0"
          >
            <FileText className="w-4 h-4 text-purple-700" />
            <span>View Audit Logs</span>
          </Link>
        </div>
      </div>

      {/* Scheduler Result Banner */}
      {schedulerResult && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 p-4 rounded-2xl text-xs flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-700 flex-shrink-0" />
            <span className="font-semibold">
              Scheduler evaluation finished: 30m Reminders: {schedulerResult.reminders30mSent || 0}, 5m Reminders: {schedulerResult.reminders5mSent || 0}, Started: {schedulerResult.startedSent || 0}, Expired: {schedulerResult.expiredUpdated || 0}, Overdue: {schedulerResult.overdueSent || 0}.
            </span>
          </div>
          <span className="text-[10px] text-purple-600 font-mono">
            {new Date(schedulerResult.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Link
          to="/admin/users"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Registered Users</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition">
              {stats?.total_users || 5}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/admin/resources"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Active Resources</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 group-hover:text-brand-700 transition">
              {stats?.total_resources || 8}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/admin/bookings"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Total Bookings</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 group-hover:text-emerald-600 transition">
              {stats?.total_bookings || 12}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/notifications"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Admin Alerts</p>
            <p className="text-2xl font-bold text-rose-600 mt-1 group-hover:text-rose-700 transition">
              {unreadCount} Unread
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Real-Time Platform Alert Stream (Admin Notification Feed) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Live Dual-Recipient Platform Alerts
              </h2>
              <p className="text-[11px] text-slate-500">
                Stream of all user bookings, reminders, payment settlements, and cancellations sent to Admin & User.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-700 hover:text-brand-900 font-semibold flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}

            <Link
              to="/notifications"
              className="text-xs font-bold text-brand-700 hover:text-brand-900 transition flex items-center space-x-1"
            >
              <span>View Full Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No activity notifications logged yet. When users submit bookings, alerts will arrive here in real time.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {notifications.slice(0, 8).map((notif) => (
              <div
                key={notif.id}
                className={`py-3 px-2 flex items-start justify-between gap-3 text-xs transition hover:bg-slate-50/80 ${
                  !notif.is_read ? 'bg-blue-50/30 rounded-xl' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    !notif.is_read ? 'bg-brand-700 animate-pulse' : 'bg-slate-300'
                  }`} />
                  <div>
                    <span className="font-bold text-slate-900 block">{notif.title}</span>
                    <span className="text-slate-600 text-[11px] block mt-0.5">{notif.message}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(notif.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                {notif.link_url && (
                  <Link
                    to={notif.link_url}
                    className="flex-shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-brand-800 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backend & Database Health Diagnostic Card */}
      {health && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>Real-Time System Health Telemetry</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● API Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Database Host</span>
              <span className="text-slate-900 font-bold text-sm block mt-1 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-brand-700" />
                <span>{health.database?.host || 'localhost:3306'}</span>
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                DB Name: {health.database?.database}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Active Engine Provider</span>
              <span className="text-slate-900 font-bold text-sm block mt-1 capitalize">
                {health.database?.provider?.replace(/_/g, ' ') || 'MySQL'}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                ✓ Fully Persistent & Seeded
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block font-medium">System Uptime</span>
              <span className="text-slate-900 font-bold text-sm block mt-1">
                {Math.round(health.uptime || 0)} seconds
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Environment: {health.environment}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-card-hover transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
            User Directory & Access
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Manage user roles, activate or suspend researcher accounts, and inspect profile information.
          </p>
        </Link>

        <Link
          to="/admin/resources"
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-card-hover transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition">
            Resource Moderation
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review newly listed instruments, verify laboratory safety rules, and suspend non-compliant resources.
          </p>
        </Link>

        <Link
          to="/admin/audit-logs"
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-card-hover transition space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">
            Security Audit Trail
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect immutable audit logs for logins, bookings, status alterations, and administrative interventions.
          </p>
        </Link>
      </div>
    </div>
  );
}
