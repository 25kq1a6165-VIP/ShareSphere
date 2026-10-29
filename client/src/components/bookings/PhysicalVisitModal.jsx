import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Calendar, Clock, MapPin, ShieldCheck, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export default function PhysicalVisitModal({ isOpen, onClose, resource, onVisitRequested }) {
  const { user } = useAuth();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [preferredDate, setPreferredDate] = useState(defaultDateStr);
  const [preferredTime, setPreferredTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!preferredDate) {
      setError('Please select a preferred visit date.');
      return;
    }

    if (!preferredTime) {
      setError('Please select a preferred time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/visits', {
        resource_id: resource.id,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes: notes.trim(),
      });

      if (res.data.success) {
        setSuccess(true);
        if (onVisitRequested) onVisitRequested(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule physical visit. Please try another time.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <Building2 className="w-4 h-4" />
          <span>Pre-Booking Inspection</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Request Physical Visit
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Inspect physical facilities, verify tooling compatibility, and consult lab staff before committing.
        </p>

        {/* Resource summary chip */}
        <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
          <img
            src={resource.primary_image || resource.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80'}
            alt={resource.title}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">{resource.title}</h4>
            <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{resource.location}</span>
            </div>
          </div>
        </div>

        {/* Free Inspection Guarantee Banner */}
        <div className="mb-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex items-start space-x-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>100% Free Pre-Reservation Visit:</strong> No advance payment or card required. If you decide not to proceed after inspecting, simply cancel with one click.
          </div>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Visit Request Sent!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Dr. Sarah Jenkins and the laboratory team have been notified. You will receive an approval confirmation with arrival instructions.
            </p>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-brand-900 hover:bg-brand-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label htmlFor="visit-date" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred Visit Date
              </label>
              <div className="relative">
                <input
                  id="visit-date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label htmlFor="visit-time" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred Time Slot
              </label>
              <select
                id="visit-time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
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

            {/* Purpose / What to Inspect */}
            <div>
              <label htmlFor="visit-notes" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Inspection Focus & Specific Questions
              </label>
              <textarea
                id="visit-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Inspect specimen holder dimensions, verify vacuum pump operation, check microscope software licenses..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
              />
            </div>

            {/* Visitor Info Notice */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              Visiting as: <strong className="text-slate-800">{user?.full_name || 'Enrolled Student'}</strong> ({user?.email || 'student@sharesphere.edu'})
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-brand-900 hover:bg-brand-800 transition shadow-md disabled:opacity-50"
              >
                {submitting ? 'Submitting Request...' : 'Confirm Free Visit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

