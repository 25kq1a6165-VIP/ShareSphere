import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Clock,
  CreditCard,
  AlertTriangle,
  Globe,
  CheckCircle2,
  Save,
  Radio
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { preferences, updatePreferences, requestBrowserPermission, connectionStatus } = useNotifications();

  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [cancellationUpdates, setCancellationUpdates] = useState(true);
  const [paymentUpdates, setPaymentUpdates] = useState(true);
  const [browserPush, setBrowserPush] = useState(false);
  const [reminderTime1, setReminderTime1] = useState(30);
  const [reminderTime2, setReminderTime2] = useState(5);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setBookingUpdates(Boolean(preferences.booking_updates));
      setBookingReminders(Boolean(preferences.booking_reminders));
      setCancellationUpdates(Boolean(preferences.cancellation_updates));
      setPaymentUpdates(Boolean(preferences.payment_updates));
      setBrowserPush(Boolean(preferences.browser_push));
      if (preferences.reminder_time_1) setReminderTime1(Number(preferences.reminder_time_1));
      if (preferences.reminder_time_2) setReminderTime2(Number(preferences.reminder_time_2));
    }
  }, [preferences]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await updatePreferences({
      booking_updates: bookingUpdates,
      booking_reminders: bookingReminders,
      cancellation_updates: cancellationUpdates,
      payment_updates: paymentUpdates,
      browser_push: browserPush,
      reminder_time_1: Number(reminderTime1),
      reminder_time_2: Number(reminderTime2),
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleBrowserPushToggle = async (checked) => {
    if (checked) {
      const granted = await requestBrowserPermission();
      setBrowserPush(granted);
    } else {
      setBrowserPush(false);
      await updatePreferences({ browser_push: false });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-brand-700" />
          <span>Notification & System Preferences</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Customize your real-time booking reminders, advance payment notifications, and delivery channels.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">Notification preferences saved successfully! Real-time alerts updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Real-Time Notification Center Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
              <Bell className="w-4 h-4 text-brand-700" />
              <span>Real-Time In-App Alert Channels</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-medium capitalize">SSE Stream: {connectionStatus}</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Booking updates */}
            <label className="flex items-start justify-between cursor-pointer p-3.5 rounded-2xl hover:bg-slate-50 transition border border-slate-100">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>Booking Approvals & Decision Updates</span>
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Receive instant alerts when an administrator or host approves, reschedules, or updates your reservation.
                </span>
              </div>
              <input
                type="checkbox"
                checked={bookingUpdates}
                onChange={(e) => setBookingUpdates(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-brand-900 rounded cursor-pointer flex-shrink-0"
              />
            </label>

            {/* Reminders Toggle & Lead Times */}
            <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
              <label className="flex items-start justify-between cursor-pointer">
                <div className="pr-4">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Booking Session Reminders</span>
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Autonomous background scheduler sends alerts prior to your reserved slot start time.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={bookingReminders}
                  onChange={(e) => setBookingReminders(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-brand-900 rounded cursor-pointer flex-shrink-0"
                />
              </label>

              {bookingReminders && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      First Reminder Lead Time (Minutes)
                    </label>
                    <select
                      value={reminderTime1}
                      onChange={(e) => setReminderTime1(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 font-medium focus:ring-2 focus:ring-brand-700 focus:outline-none"
                    >
                      <option value="60">60 Minutes Before Start</option>
                      <option value="45">45 Minutes Before Start</option>
                      <option value="30">30 Minutes Before Start (Recommended)</option>
                      <option value="15">15 Minutes Before Start</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Urgent Final Reminder (Minutes)
                    </label>
                    <select
                      value={reminderTime2}
                      onChange={(e) => setReminderTime2(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 font-medium focus:ring-2 focus:ring-brand-700 focus:outline-none"
                    >
                      <option value="10">10 Minutes Before Start</option>
                      <option value="5">5 Minutes Before Start (Recommended)</option>
                      <option value="2">2 Minutes Before Start</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Cancellations */}
            <label className="flex items-start justify-between cursor-pointer p-3.5 rounded-2xl hover:bg-slate-50 transition border border-slate-100">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cancellation & Refund Notices</span>
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Notify me when a booking is cancelled, refunded, or overdue equipment return is required.
                </span>
              </div>
              <input
                type="checkbox"
                checked={cancellationUpdates}
                onChange={(e) => setCancellationUpdates(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-brand-900 rounded cursor-pointer flex-shrink-0"
              />
            </label>

            {/* Payments */}
            <label className="flex items-start justify-between cursor-pointer p-3.5 rounded-2xl hover:bg-slate-50 transition border border-slate-100">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Payment Receipts & 50/50 Settlement Alerts</span>
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Alerts on verified 50% advance deposits, final balance settlements, and generated invoice receipts.
                </span>
              </div>
              <input
                type="checkbox"
                checked={paymentUpdates}
                onChange={(e) => setPaymentUpdates(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-brand-900 rounded cursor-pointer flex-shrink-0"
              />
            </label>

            {/* Browser Push */}
            <label className="flex items-start justify-between cursor-pointer p-3.5 rounded-2xl hover:bg-slate-50 transition border border-slate-100">
              <div className="pr-4">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-700" />
                  <span>Desktop Browser Push Notifications</span>
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Receive native OS system notifications even when ShareSphere is running in a background tab.
                </span>
              </div>
              <input
                type="checkbox"
                checked={browserPush}
                onChange={(e) => handleBrowserPushToggle(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-brand-900 rounded cursor-pointer flex-shrink-0"
              />
            </label>
          </div>
        </div>

        {/* Security & Token Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Account Security & Active Session</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All notifications are cryptographically scoped to your user ID and verified via HMAC SHA-256 tokens.
          </p>
          <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono">
            Signed in as: <strong>{user?.email}</strong> (ID: {user?.id}, Role: {user?.role})
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-900 hover:bg-brand-800 transition shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Notification Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
