import React, { useState } from 'react';
import Modal from '../common/Modal';
import { ClipboardCheck } from 'lucide-react';

export default function CheckInModal({
  isOpen,
  onClose,
  booking,
  isCheckOut = false,
  onSubmit,
  loading = false,
}) {
  const [conditionStatus, setConditionStatus] = useState('good');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      conditionStatus,
      conditionNotes: notes.trim() || `${isCheckOut ? 'Check-out' : 'Check-in'} inspected. Status: ${conditionStatus}.`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCheckOut ? 'Record Return Condition & Check Out' : 'Initial Condition & Check In'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">{booking?.resource_title}</p>
          <p className="text-slate-500">Booking Reference #{booking?.id}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Resource Physical Condition
          </label>
          <select
            value={conditionStatus}
            onChange={(e) => setConditionStatus(e.target.value)}
            className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-700 transition"
          >
            <option value="excellent">Excellent (Like New)</option>
            <option value="good">Good (Normal Working Condition)</option>
            <option value="fair">Fair (Minor Wear & Tear)</option>
            <option value="damaged">Damaged (Components Non-Functional)</option>
            <option value="missing_parts">Missing Parts / Accessories</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Inspection Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isCheckOut
                ? 'e.g., Cleaned workspace, powered off safely, all lenses capped...'
                : 'e.g., Equipment checked, power cables verified, no visible scratches...'
            }
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
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-800 hover:bg-brand-900 rounded-xl transition shadow-sm"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : isCheckOut ? 'Confirm Check Out' : 'Confirm Check In'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
