import React, { useState } from 'react';
import api from '../../services/api';
import { X, Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function RescheduleModal({ isOpen, onClose, visit, onRescheduled }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [newDate, setNewDate] = useState(visit?.preferred_date || defaultDateStr);
  const [newTime, setNewTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !visit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newDate || !newTime) {
      setError('Please specify both the proposed date and time.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.patch(`/visits/${visit.id}/reschedule`, {
        rescheduled_date: newDate,
        rescheduled_time: newTime,
        rescheduled_notes: notes.trim() || 'Facility owner proposed alternate time slot',
      });

      if (res.data.success) {
        if (onRescheduled) onRescheduled(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reschedule visit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
          <RefreshCw className="w-4 h-4" />
          <span>Propose Alternate Slot</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Reschedule Physical Visit
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Visitor requested: <strong>{visit.preferred_date}</strong> at <strong>{visit.preferred_time}</strong>. Propose a better time when the lab is free.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="new-date" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Proposed Alternate Date
            </label>
            <input
              id="new-date"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="new-time" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Proposed Alternate Time
            </label>
            <select
              id="new-time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
            >
              <option value="09:00">09:00 AM – Morning Inspection Slot</option>
              <option value="10:00">10:00 AM – Morning Walkthrough Slot</option>
              <option value="11:30">11:30 AM – Pre-Noon Inspection Slot</option>
              <option value="14:00">02:00 PM – Afternoon Verification Slot</option>
              <option value="15:30">03:30 PM – Afternoon Technical Review</option>
              <option value="17:00">05:00 PM – Evening Lab Handover Slot</option>
            </select>
          </div>

          <div>
            <label htmlFor="reschedule-notes" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Message to Visitor
            </label>
            <textarea
              id="reschedule-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleanroom air handler scheduled for servicing in the morning; afternoon slot is clear."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-purple-700 hover:bg-purple-800 transition shadow-md disabled:opacity-50"
            >
              {submitting ? 'Proposing...' : 'Send Alternate Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

