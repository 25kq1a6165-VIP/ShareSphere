import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import CheckInModal from '../../components/bookings/CheckInModal';
import IncidentModal from '../../components/bookings/IncidentModal';
import PaymentModal from '../../components/bookings/PaymentModal';
import ReceiptModal from '../../components/bookings/ReceiptModal';
import BookingProgressSteps from '../../components/bookings/BookingProgressSteps';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  User,
  Shield,
  FileCheck2,
  LogIn,
  LogOut,
  AlertOctagon,
  CreditCard,
  Receipt,
  Building,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, isCheckOut: false });
  const [incidentModal, setIncidentModal] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, isRemaining: false });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, receipt: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/bookings/${id}`);
      if (res.data.success) {
        setBooking(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleStartUsage = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/payments/bookings/${id}/start-use`);
      fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start usage.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteUsage = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/payments/bookings/${id}/complete-use`);
      fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete usage.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckInSubmit = async (data) => {
    setActionLoading(true);
    try {
      const endpoint = checkInModal.isCheckOut
        ? `/bookings/${id}/check-out`
        : `/bookings/${id}/check-in`;
      await api.patch(endpoint, data);
      setCheckInModal({ isOpen: false, isCheckOut: false });
      fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      // Use refund endpoint to calculate and record accurate refund
      await api.patch(`/payments/bookings/${id}/refund`, {
        reason: 'Student requested cancellation',
      });
      setCancelDialog(false);
      fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!booking.visit_id) return;
    setActionLoading(true);
    try {
      await api.patch(`/visits/${booking.visit_id}/decision`, {
        decision,
        notes: decision === 'interested' ? 'Confirmed interest in proceeding to booking' : 'Declined after physical inspection',
      });
      if (decision === 'not_interested') {
        await api.patch(`/bookings/${id}/cancel`, { reason: 'Cancelled after physical inspection' });
      }
      fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not record decision.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    if (paymentData?.receipt) {
      setReceiptModal({ isOpen: true, receipt: paymentData.receipt });
    }
    fetchBooking();
  };

  const handleIncidentSubmit = async (data) => {
    setActionLoading(true);
    try {
      await api.post('/incidents', data);
      setIncidentModal(false);
      alert('Incident report logged.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to report incident');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Retrieving booking itinerary..." />;
  if (error || !booking) return <div className="max-w-4xl mx-auto p-8"><ErrorMessage message={error || 'Booking not found'} /></div>;

  const startDate = new Date(booking.start_time);
  const endDate = new Date(booking.end_time);
  const totalAmount = Number(booking.total_amount || 0);
  const advanceAmount = Number(booking.advance_amount || Math.round(totalAmount * 50) / 100);
  const remainingAmount = Number(booking.remaining_amount || Math.round((totalAmount - advanceAmount) * 100) / 100);

  const canPayAdvance = totalAmount > 0 && !booking.advance_paid && ['advance_pending', 'pending', 'approved', 'booking_confirmed'].includes(booking.status);
  const canPayRemaining = totalAmount > 0 && booking.advance_paid && !booking.final_paid && ['usage_completed', 'checked_in', 'in_use', 'completed'].includes(booking.status);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top back button */}
      <div>
        <Link
          to="/my-bookings"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Bookings</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Reservation #{booking.id}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {booking.resource_title}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{booking.resource_location || 'Campus Center'}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={booking.status} className="text-sm px-3.5 py-1" />
        </div>
      </div>

      {/* 10-Milestone Progress Tracker */}
      <BookingProgressSteps booking={booking} />

      {/* Post-Visit Decision Card (Option A & Option B) */}
      {booking.visit_id && !booking.advance_paid && booking.status === 'advance_pending' && (
        <div className="bg-gradient-to-r from-brand-50 to-purple-50 p-6 rounded-3xl border border-brand-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-brand-900 font-bold text-sm">
            <Building className="w-5 h-5 text-brand-700" />
            <span>Post-Physical Visit Decision</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            You completed a physical inspection for this resource. Please indicate your final outcome:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Option A: Not Interested */}
            <button
              onClick={() => handleDecision('not_interested')}
              disabled={actionLoading}
              className="py-3 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 transition text-left flex items-start space-x-3 group"
            >
              <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Option A: Not Interested</span>
                <span className="text-[11px] text-slate-500">Cancel request with zero charges. No advance payment required.</span>
              </div>
            </button>

            {/* Option B: Interested */}
            <button
              onClick={() => setPaymentModal({ isOpen: true, isRemaining: false })}
              disabled={actionLoading}
              className="py-3 px-4 rounded-2xl border border-brand-300 bg-brand-900 text-white hover:bg-brand-800 transition text-left flex items-start space-x-3 shadow-md group"
            >
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition" />
              <div>
                <span className="text-xs font-bold text-white block">Option B: Proceed to Booking</span>
                <span className="text-[11px] text-brand-100">Confirm terms and pay 50% advance (₹{advanceAmount.toLocaleString('en-IN')}).</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Itinerary Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Session Schedule</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Scheduled Start</span>
                <span className="text-slate-900 font-bold text-sm block mt-1">
                  {startDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block font-medium">Scheduled End</span>
                <span className="text-slate-900 font-bold text-sm block mt-1">
                  {endDate.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block font-medium mb-1">Research Purpose</span>
              <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                {booking.purpose}
              </p>
            </div>
          </div>

          {/* Condition Inspection Reports Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <FileCheck2 className="w-4 h-4 text-brand-700" />
              <span>Inspection Condition Records</span>
            </div>

            {(!booking.condition_reports || booking.condition_reports.length === 0) ? (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-2xl">
                No inspection condition reports submitted yet. Check in upon arrival to log initial equipment condition.
              </p>
            ) : (
              <div className="space-y-3">
                {booking.condition_reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                        {report.report_type === 'check_in' ? '🟢 Check-In Arrival State' : '🔵 Check-Out Return State'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-white border border-slate-200 capitalize">
                        Status: {report.condition_status}
                      </span>
                    </div>
                    <p className="text-slate-700 pt-1">{report.notes}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Recorded: {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Financials */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">50/50 Fee Summary</h3>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs py-2 border-y border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Agreed Total Price:</span>
                <span className="font-bold text-slate-900">
                  {totalAmount === 0 ? 'Free (₹0.00)' : `₹${totalAmount.toLocaleString('en-IN')}`}
                </span>
              </div>
              {totalAmount > 0 && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>50% Advance:</span>
                    <span className={`font-semibold ${booking.advance_paid ? 'text-emerald-700' : 'text-amber-800'}`}>
                      ₹{advanceAmount.toLocaleString('en-IN')} {booking.advance_paid ? '(Verified)' : '(Pending)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>50% Remaining:</span>
                    <span className={`font-semibold ${booking.final_paid ? 'text-emerald-700' : 'text-slate-700'}`}>
                      ₹{remainingAmount.toLocaleString('en-IN')} {booking.final_paid ? '(Settled)' : '(Due at handover)'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Context Actions */}
            <div className="space-y-2 pt-2">
              {/* Pay 50% Advance Button */}
              {canPayAdvance && (
                <button
                  onClick={() => setPaymentModal({ isOpen: true, isRemaining: false })}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay 50% Advance (₹{advanceAmount.toLocaleString('en-IN')})</span>
                </button>
              )}

              {/* View Advance Receipt */}
              {booking.advance_paid === 1 && (
                <button
                  onClick={() => setReceiptModal({ isOpen: true, receipt: null })}
                  className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-brand-900 bg-brand-50 hover:bg-brand-100 transition border border-brand-200 flex items-center justify-center space-x-1.5"
                >
                  <Receipt className="w-4 h-4 text-brand-700" />
                  <span>View Advance Receipt</span>
                </button>
              )}

              {/* Resource Ready / Handover Confirm by student */}
              {booking.status === 'resource_ready' && (
                <button
                  onClick={handleStartUsage}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Start Usage (Begin Session)</span>
                </button>
              )}

              {/* In Use actions */}
              {(booking.status === 'in_use' || booking.status === 'checked_in') && (
                <>
                  <button
                    onClick={handleCompleteUsage}
                    disabled={actionLoading}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Complete Usage & Return Resource</span>
                  </button>
                  <button
                    onClick={() => setCheckInModal({ isOpen: true, isCheckOut: true })}
                    className="w-full py-2 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Record Return Condition Report
                  </button>
                </>
              )}

              {/* Pay Remaining 50% Button */}
              {canPayRemaining && (
                <button
                  onClick={() => setPaymentModal({ isOpen: true, isRemaining: true })}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-brand-900 hover:bg-brand-800 transition shadow-md flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Remaining 50% (₹{remainingAmount.toLocaleString('en-IN')})</span>
                </button>
              )}

              {/* View Final Settlement Receipt */}
              {booking.final_paid === 1 && (
                <button
                  onClick={() => setReceiptModal({ isOpen: true, receipt: null })}
                  className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-teal-900 bg-teal-50 hover:bg-teal-100 transition border border-teal-200 flex items-center justify-center space-x-1.5"
                >
                  <Receipt className="w-4 h-4 text-teal-700" />
                  <span>View Final Settlement Receipt</span>
                </button>
              )}

              {/* Cancel Reservation */}
              {['pending', 'advance_pending', 'booking_confirmed', 'approved'].includes(booking.status) && (
                <button
                  onClick={() => setCancelDialog(true)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                >
                  Cancel Booking
                </button>
              )}

              {/* Malfunction Incident Report */}
              {['in_use', 'checked_in', 'usage_completed', 'completed'].includes(booking.status) && (
                <button
                  onClick={() => setIncidentModal(true)}
                  className="w-full py-2 px-4 rounded-xl font-medium text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 transition flex items-center justify-center space-x-1.5"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Report Equipment Malfunction / Incident</span>
                </button>
              )}
            </div>

            {/* Refund terms explanation */}
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Cancellation & Refund Policy:</span>
              <p>• &gt;24 hours notice: 100% advance refunded.</p>
              <p>• 2–24 hours notice: 50% advance refunded.</p>
              <p>• &lt;2 hours notice: Non-refundable.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, isRemaining: false })}
        booking={booking}
        isRemaining={paymentModal.isRemaining}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, receipt: null })}
        receipt={receiptModal.receipt}
        booking={booking}
      />

      <CheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() => setCheckInModal({ isOpen: false, isCheckOut: false })}
        booking={booking}
        isCheckOut={checkInModal.isCheckOut}
        onSubmit={handleCheckInSubmit}
        loading={actionLoading}
      />

      <IncidentModal
        isOpen={incidentModal}
        onClose={() => setIncidentModal(false)}
        booking={booking}
        onSubmit={handleIncidentSubmit}
        loading={actionLoading}
      />

      <ConfirmationDialog
        isOpen={cancelDialog}
        onClose={() => setCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this booking? If an advance was paid, your refund will be calculated automatically according to the cancellation policy."
        confirmText="Confirm Cancellation"
        danger={true}
        loading={actionLoading}
      />
    </div>
  );
}
