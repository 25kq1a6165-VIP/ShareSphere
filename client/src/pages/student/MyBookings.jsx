import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import BookingCard from '../../components/bookings/BookingCard';
import CheckInModal from '../../components/bookings/CheckInModal';
import IncidentModal from '../../components/bookings/IncidentModal';
import ReceiptModal from '../../components/bookings/ReceiptModal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';
import {
  CalendarCheck,
  Filter,
  Search,
  Building2,
  Receipt,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function MyBookings() {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState('bookings'); // 'bookings', 'visits', 'receipts'
  const [bookings, setBookings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, booking: null, isCheckOut: false });
  const [incidentModal, setIncidentModal] = useState({ isOpen: false, booking: null });
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, bookingId: null });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeMainTab === 'bookings') {
        const res = await api.get(`/bookings/my${bookingFilterStatus !== 'all' ? `?status=${bookingFilterStatus}` : ''}`);
        if (res.data.success) {
          setBookings(res.data.data);
        }
      } else if (activeMainTab === 'visits') {
        const res = await api.get('/visits/my');
        if (res.data.success) {
          setVisits(res.data.data);
        }
      } else if (activeMainTab === 'receipts') {
        const res = await api.get('/payments/my');
        if (res.data.success) {
          setPayments(res.data.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeMainTab, bookingFilterStatus]);

  const handleCancelBooking = async () => {
    if (!cancelDialog.bookingId) return;
    setActionLoading(true);
    try {
      await api.patch(`/payments/bookings/${cancelDialog.bookingId}/refund`, {
        reason: 'Student cancelled reservation',
      });
      setCancelDialog({ isOpen: false, bookingId: null });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVisitDecision = async (visitId, decision, resourceId) => {
    setActionLoading(true);
    try {
      await api.patch(`/visits/${visitId}/decision`, { decision });
      if (decision === 'interested') {
        navigate(`/resources/${resourceId}`);
      } else {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record decision.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckInSubmit = async (data) => {
    setActionLoading(true);
    try {
      const endpoint = checkInModal.isCheckOut
        ? `/bookings/${checkInModal.booking.id}/check-out`
        : `/bookings/${checkInModal.booking.id}/check-in`;
      await api.patch(endpoint, data);
      setCheckInModal({ isOpen: false, booking: null, isCheckOut: false });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIncidentSubmit = async (data) => {
    setActionLoading(true);
    try {
      await api.post('/incidents', data);
      setIncidentModal({ isOpen: false, booking: null });
      alert('Incident report submitted successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit incident report');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (b.resource_title && b.resource_title.toLowerCase().includes(s)) ||
      (b.purpose && b.purpose.toLowerCase().includes(s))
    );
  });

  const filteredVisits = visits.filter(v => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (v.resource_title && v.resource_title.toLowerCase().includes(s)) ||
      (v.notes && v.notes.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <CalendarCheck className="w-4 h-4" />
          <span>Student Reservation Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Bookings & Physical Visits
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track pre-booking inspections, manage confirmed reservations, settle 50/50 balances, and access payment receipts.
        </p>
      </div>

      {/* Main Top Nav Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveMainTab('bookings')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeMainTab === 'bookings'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>My Reservations</span>
        </button>
        <button
          onClick={() => setActiveMainTab('visits')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeMainTab === 'visits'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Physical Visit Requests</span>
        </button>
        <button
          onClick={() => setActiveMainTab('receipts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeMainTab === 'receipts'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Verified Receipts</span>
        </button>
      </div>

      {/* 1. RESERVATIONS TAB */}
      {activeMainTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            {/* Filter Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto p-1">
              {[
                { id: 'all', label: 'All Bookings' },
                { id: 'advance_pending', label: 'Advance Pending' },
                { id: 'booking_confirmed', label: 'Confirmed (50% Paid)' },
                { id: 'in_use', label: 'In Use' },
                { id: 'usage_completed', label: 'Usage Completed' },
                { id: 'completed', label: 'Fully Paid & Completed' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBookingFilterStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    bookingFilterStatus === tab.id
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reservations..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              />
            </div>
          </div>

          {error && <ErrorMessage message={error} onRetry={fetchData} />}

          {loading ? (
            <LoadingSpinner text="Fetching your reservations..." />
          ) : filteredBookings.length === 0 ? (
            <EmptyState
              title="No reservations found"
              description="You do not have any bookings matching this filter."
              actionLabel="Explore Campus Resources"
              actionLink="/resources"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCheckIn={(b) => setCheckInModal({ isOpen: true, booking: b, isCheckOut: false })}
                  onCheckOut={(b) => setCheckInModal({ isOpen: true, booking: b, isCheckOut: true })}
                  onCancel={(id) => setCancelDialog({ isOpen: true, bookingId: id })}
                  onReportIncident={(b) => setIncidentModal({ isOpen: true, booking: b })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. PHYSICAL VISITS TAB */}
      {activeMainTab === 'visits' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Free Pre-Reservation Physical Inspections:</strong> Inspect equipment, verify specimens, and talk to lab technicians before committing. After your visit, choose <em>Proceed to Booking</em> or <em>Cancel Request</em> at zero cost.
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading physical visits..." />
          ) : filteredVisits.length === 0 ? (
            <EmptyState
              title="No physical visits scheduled"
              description="You have not requested any on-site equipment inspections yet."
              actionLabel="Browse Resources to Inspect"
              actionLink="/resources"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVisits.map((visit) => {
                const isCompleted = visit.status === 'visit_completed';
                const isApproved = visit.status === 'visit_approved';
                const isRescheduled = visit.status === 'visit_rescheduled';

                return (
                  <div
                    key={visit.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Inspection Visit #{visit.id}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                            {visit.resource_title}
                          </h3>
                        </div>
                        <StatusBadge status={visit.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 my-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-brand-700 flex-shrink-0" />
                          <span className="font-semibold text-slate-800">{visit.preferred_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-brand-700 flex-shrink-0" />
                          <span className="text-slate-700">{visit.preferred_time}</span>
                        </div>
                        <div className="col-span-2 flex items-center space-x-2 pt-1 border-t border-slate-200/50">
                          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate text-slate-600">{visit.resource_location}</span>
                        </div>
                      </div>

                      {visit.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                          <strong className="text-slate-700">Inspection Note:</strong> {visit.notes}
                        </p>
                      )}

                      {visit.rescheduled_notes && (
                        <div className="mt-2 text-xs bg-purple-50 text-purple-900 p-2.5 rounded-xl border border-purple-200">
                          <strong>Owner Proposed Time:</strong> {visit.rescheduled_date} at {visit.rescheduled_time} ({visit.rescheduled_notes})
                        </div>
                      )}

                      {visit.rejection_reason && (
                        <div className="mt-2 text-xs bg-rose-50 text-rose-900 p-2.5 rounded-xl border border-rose-200">
                          <strong>Declined Reason:</strong> {visit.rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* After-Visit Decision Options A & B */}
                    {isCompleted && visit.outcome !== 'not_interested' && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold text-brand-900 block">
                          Inspection Complete: Choose Next Step
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleVisitDecision(visit.id, 'not_interested', visit.resource_id)}
                            disabled={actionLoading}
                            className="py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition text-center"
                          >
                            Option A: Cancel Request
                          </button>
                          <button
                            onClick={() => handleVisitDecision(visit.id, 'interested', visit.resource_id)}
                            disabled={actionLoading}
                            className="py-2 px-3 rounded-xl bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 transition text-center shadow-sm flex items-center justify-center space-x-1"
                          >
                            <span>Option B: Proceed</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {visit.outcome === 'not_interested' && (
                      <div className="pt-2 text-xs text-slate-500 italic">
                        Cancelled after physical visit. No advance fee charged.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. RECEIPTS & INVOICES TAB */}
      {activeMainTab === 'receipts' && (
        <div className="space-y-6">
          {loading ? (
            <LoadingSpinner text="Retrieving verified transaction receipts..." />
          ) : payments.length === 0 ? (
            <EmptyState
              title="No payment receipts yet"
              description="When you pay a 50% advance or remaining balance, your verified receipts will appear here."
              actionLabel="View Reservations"
              actionLink="/my-bookings"
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Receipt Number</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Payment Type</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Method / Gateway</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          {p.receipt_number}
                        </td>
                        <td className="p-4 text-slate-600">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-medium text-slate-800 capitalize">
                          {p.payment_type === 'advance_50' ? '50% Advance' : p.payment_type === 'final_50' ? 'Final 50% Settlement' : 'Refund'}
                        </td>
                        <td className="p-4 font-extrabold text-emerald-700">
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-slate-500">
                          {p.payment_method}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            VERIFIED
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-900 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />

      <CheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() => setCheckInModal({ isOpen: false, booking: null, isCheckOut: false })}
        booking={checkInModal.booking}
        isCheckOut={checkInModal.isCheckOut}
        onSubmit={handleCheckInSubmit}
        loading={actionLoading}
      />

      {incidentModal.booking && (
        <IncidentModal
          isOpen={incidentModal.isOpen}
          onClose={() => setIncidentModal({ isOpen: false, booking: null })}
          booking={incidentModal.booking}
          onSubmit={handleIncidentSubmit}
          loading={actionLoading}
        />
      )}

      <ConfirmationDialog
        isOpen={cancelDialog.isOpen}
        onClose={() => setCancelDialog({ isOpen: false, bookingId: null })}
        onConfirm={handleCancelBooking}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this booking? Refund will be calculated based on cancellation rules (100% >24h, 50% 2-24h, 0% <2h)."
        confirmText="Yes, Cancel Booking"
        danger={true}
        loading={actionLoading}
      />
    </div>
  );
}
