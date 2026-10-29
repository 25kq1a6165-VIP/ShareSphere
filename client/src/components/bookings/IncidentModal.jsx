import React, { useState } from 'react';
import Modal from '../common/Modal';
import { AlertTriangle } from 'lucide-react';

export default function IncidentModal({
  isOpen,
  onClose,
  booking,
  onSubmit,
  loading = false,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      resource_id: booking.resource_id,
      booking_id: booking.id,
      title: title.trim(),
      description: description.trim(),
      severity,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report an Incident / Equipment Issue" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
          <span>
            Reporting an issue notifies the resource manager and laboratory director to ensure student safety.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Issue Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Optical sensor miscalibrated, broken cable"
            className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-700 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Severity Level
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-700 transition"
          >
            <option value="low">Low (Minor cosmetic issue or suggestion)</option>
            <option value="medium">Medium (Partially functional or needs attention)</option>
            <option value="high">High (Cannot complete work, malfunction)</option>
            <option value="critical">Critical (Safety hazard, fire risk, leak)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Detailed Description
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened, any error codes shown on screen, or physical damage observed..."
            className="w-full text-sm bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-brand-700 transition"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : 'Submit Incident Report'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
