import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BookingCard from '../../components/bookings/BookingCard';
import RescheduleModal from '../../components/bookings/RescheduleModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  RefreshCw,
  Check,
  Box
} from 'lucide-react';

export default function BookingRequests() {
  const [mainTab, setMainTab] = useState('bookings'); // 'bookings' or 'visits'
  const [requests, setRequests] = useState([]);
  const [visits, setVisits] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVisitForReschedule, setSelectedVisitForReschedule] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mainTab === 'bookings') {
        const res = await api.get(`/bookings/requests${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`);
        if (res.data.success) {
          setRequests(res.data.data);
        }
      } else {
        const res = await api.get('/visits/owner');
        if (res.data.success) {
          setVisits(res.data.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mainTab, filterStatus]);

  // Booking handlers
  const handleApproveBooking = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${id}/approve`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBooking = async (id) => {
    const reason = window.prompt('Please provide a reason for declining this reservation:');
    if (reason === null) return;
    setActionLoading(true);
    try {
      await api.patch(`/bookings/${id}/reject`, { reason });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmHandover = async (id) => {
    setActionLoading(true);
    try {
      await api.patch(`/payments/bookings/${id}/handover`);
      alert('Resource preparation and handover confirmed! Status updated to Resource Ready.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Handover confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Visit handlers
  const handleApproveVisit = async (visitId) => {
    setActionLoading(true);
    try {
      await api.patch(`/visits/${visitId}/approve`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Visit approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVisit = async (visitId) => {
    const reason = window.prompt('Please provide a reason for declining this visit request:');
    if (reason === null) return;
    setActionLoading(true);
    try {
      await api.patch(`/visits/${visitId}/reject`, { reason });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Visit decline failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteVisit = async (visitId) => {
    setActionLoading(true);
    try {
      await api.patch(`/visits/${visitId}/complete`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Visit complete failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <Clock className="w-4 h-4" />
          <span>Facility Director Control</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Access Requests & Physical Visits
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review physical inspection appointments, approve paid reservations, confirm handover preparation, and monitor 50/50 settlements.
        </p>
      </div>

      {/* Main Mode Toggle: Facility Bookings vs Physical Visits */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setMainTab('bookings')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            mainTab === 'bookings'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Facility Reservations</span>
        </button>
        <button
          onClick={() => setMainTab('visits')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            mainTab === 'visits'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Physical Visit Inquiries</span>
        </button>
      </div>

      {/* 1. RESERVATIONS MANAGEMENT */}
      {mainTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200/80 w-fit overflow-x-auto">
            {[
              { id: 'all', label: 'All Reservations' },
              { id: 'advance_pending', label: 'Advance Pending' },
              { id: 'booking_confirmed', label: 'Advance Paid (Needs Handover)' },
              { id: 'in_use', label: 'Currently in Use' },
              { id: 'usage_completed', label: 'Usage Completed (Final Due)' },
              { id: 'completed', label: 'Settled & Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterStatus === tab.id
                    ? 'bg-brand-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && <ErrorMessage message={error} onRetry={fetchData} />}

          {loading ? (
            <LoadingSpinner text="Retrieving reservation requests..." />
          ) : requests.length === 0 ? (
            <EmptyState
              title={`No reservations found`}
              description="There are currently no bookings matching this status."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((booking) => {
                const totalAmount = Number(booking.total_amount || 0);
                const advanceAmount = Number(booking.advance_amount || 0);
                const remainingAmount = Number(booking.remaining_amount || 0);
                const needsHandover = booking.advance_paid === 1 && !booking.handover_confirmed && ['booking_confirmed', 'approved'].includes(booking.status);

                return (
                  <div key={booking.id} className="flex flex-col justify-between">
                    <BookingCard
                      booking={booking}
                      isOwnerView={true}
                      onApprove={handleApproveBooking}
                      onReject={handleRejectBooking}
                    />

                    {/* Owner Handover Action Bar */}
                    {needsHandover && (
                      <div className="mt-2 p-3 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-between">
                        <div className="text-[11px] text-brand-900">
                          <span className="font-bold block">Advance ₹{advanceAmount.toLocaleString('en-IN')} Verified</span>
                          <span>Facility ready for user access?</span>
                        </div>
                        <button
                          onClick={() => handleConfirmHandover(booking.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 transition shadow-sm flex items-center space-x-1"
                        >
                          <Box className="w-3.5 h-3.5" />
                          <span>Confirm Handover</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. PHYSICAL VISITS MANAGEMENT */}
      {mainTab === 'visits' && (
        <div className="space-y-6">
          <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-purple-950">
            <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Pre-Reservation Physical Inspections:</strong> Visitors inspect equipment, test compatibility, and meet lab technicians before committing to paid bookings. Approve, decline, or propose alternate slots if your lab schedule has conflicts.
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Retrieving visit inquiries..." />
          ) : visits.length === 0 ? (
            <EmptyState
              title="No physical visit requests"
              description="There are currently no prospective visitors waiting for inspection appointment approval."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visits.map((v) => {
                const isRequested = v.status === 'visit_requested';
                const isApproved = v.status === 'visit_approved';
                const isRescheduled = v.status === 'visit_rescheduled';

                return (
                  <div
                    key={v.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Physical Visit Inquiry #{v.id}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                            {v.resource_title}
                          </h3>
                        </div>
                        <StatusBadge status={v.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 my-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-brand-700 flex-shrink-0" />
                          <span className="font-semibold text-slate-800">{v.preferred_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-brand-700 flex-shrink-0" />
                          <span className="text-slate-700">{v.preferred_time}</span>
                        </div>
                        <div className="col-span-2 flex items-center space-x-2 pt-1 border-t border-slate-200/50">
                          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate text-slate-600">
                            Requested by: <strong className="text-slate-800">{v.user_name}</strong> ({v.user_email})
                          </span>
                        </div>
                      </div>

                      {v.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                          <strong className="text-slate-700">Visitor Request Notes:</strong> {v.notes}
                        </p>
                      )}

                      {v.rescheduled_notes && (
                        <div className="mt-2 text-xs bg-purple-50 text-purple-900 p-2.5 rounded-xl border border-purple-200">
                          <strong>Proposed Alternate:</strong> {v.rescheduled_date} at {v.rescheduled_time} ({v.rescheduled_notes})
                        </div>
                      )}
                    </div>

                    {/* Action buttons for owner */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      {isRequested && (
                        <>
                          <button
                            onClick={() => handleRejectVisit(v.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                          >
                            Decline
                          </button>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedVisitForReschedule(v)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition flex items-center space-x-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Propose Other Time</span>
                            </button>
                            <button
                              onClick={() => handleApproveVisit(v.id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm flex items-center space-x-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Visit</span>
                            </button>
                          </div>
                        </>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => handleCompleteVisit(v.id)}
                          disabled={actionLoading}
                          className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm text-center"
                        >
                          Mark Physical Inspection Completed
                        </button>
                      )}

                      {v.status === 'visit_completed' && (
                        <span className="text-xs text-slate-500 italic">
                          Inspection completed. Waiting for visitor's decision.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!selectedVisitForReschedule}
        onClose={() => setSelectedVisitForReschedule(null)}
        visit={selectedVisitForReschedule}
        onRescheduled={fetchData}
      />
    </div>
  );
}
