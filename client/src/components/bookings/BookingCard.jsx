import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { Calendar, Clock, MapPin, User, DollarSign, ArrowRight, CheckCircle2, LogIn, LogOut, AlertOctagon, XCircle } from 'lucide-react';

export default function BookingCard({
  booking,
  isOwnerView = false,
  onApprove,
  onReject,
  onCancel,
  onCheckIn,
  onCheckOut,
  onReportIncident
}) {
  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedStartTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedEndTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Booking #{booking.id}
            </span>
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 hover:text-brand-800 transition">
              <Link to={`/resources/${booking.resource_id}`}>{booking.resource_title}</Link>
            </h3>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span className="font-medium text-slate-800">{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>{formattedStartTime} – {formattedEndTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{booking.resource_location || 'Campus Center'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              {Number(booking.total_amount) === 0 ? 'Free Access' : `$${Number(booking.total_amount).toFixed(2)} Total`}
            </span>
          </div>
        </div>

        {/* User purpose / Booker info */}
        <div className="mt-3 text-xs text-slate-500">
          <p className="line-clamp-1">
            <strong className="text-slate-700">Purpose:</strong> {booking.purpose}
          </p>
          {isOwnerView && (
            <p className="mt-1 text-[11px] text-slate-400 flex items-center space-x-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>Requested by: <strong className="text-slate-700">{booking.user_name}</strong> ({booking.user_email})</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <Link
          to={`/my-bookings/${booking.id}`}
          className="text-xs font-semibold text-brand-800 hover:text-brand-900 flex items-center space-x-1"
        >
          <span>View Details & Timeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center space-x-2">
          {/* Owner Actions */}
          {isOwnerView && booking.status === 'pending' && (
            <>
              <button
                onClick={() => onReject(booking.id)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
              >
                Reject
              </button>
              <button
                onClick={() => onApprove(booking.id)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
              >
                Approve
              </button>
            </>
          )}

          {/* Student Actions */}
          {!isOwnerView && (
            <>
              {booking.status === 'approved' && (
                <button
                  onClick={() => onCheckIn(booking)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Check In</span>
                </button>
              )}

              {booking.status === 'checked_in' && (
                <button
                  onClick={() => onCheckOut(booking)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Check Out</span>
                </button>
              )}

              {(booking.status === 'pending' || booking.status === 'approved') && (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  Cancel
                </button>
              )}

              {(booking.status === 'checked_in' || booking.status === 'completed') && (
                <button
                  onClick={() => onReportIncident(booking)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                  title="Report Issue"
                >
                  <AlertOctagon className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
