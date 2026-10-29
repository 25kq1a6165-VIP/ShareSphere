import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BookingCard from '../../components/bookings/BookingCard';
import CheckInModal from '../../components/bookings/CheckInModal';
import IncidentModal from '../../components/bookings/IncidentModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, booking: null, isCheckOut: false });
  const [incidentModal, setIncidentModal] = useState({ isOpen: false, booking: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, resourcesRes] = await Promise.allSettled([
        api.get('/bookings/my'),
        api.get('/resources?limit=4&sort=newest'),
      ]);

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data.success) {
        setBookings(bookingsRes.value.data.data);
      }
      if (resourcesRes.status === 'fulfilled' && resourcesRes.value.data.success) {
        setRecommendations(resourcesRes.value.data.data);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingCount = bookings.filter(b => ['pending', 'advance_pending'].includes(b.status)).length;
  const activeCount = bookings.filter(b => ['approved', 'booking_confirmed', 'resource_ready', 'in_use', 'checked_in'].includes(b.status)).length;
  const completedCount = bookings.filter(b => ['completed', 'usage_completed'].includes(b.status)).length;

  const upcomingBookings = bookings.filter(b => !['cancelled', 'rejected', 'cancelled_after_visit'].includes(b.status)).slice(0, 3);

  // Check in handler
  const handleCheckInSubmit = async (data) => {
    setActionLoading(true);
    try {
      const endpoint = checkInModal.isCheckOut
        ? `/bookings/${checkInModal.booking.id}/check-out`
        : `/bookings/${checkInModal.booking.id}/check-in`;
      await api.patch(endpoint, data);
      setCheckInModal({ isOpen: false, booking: null, isCheckOut: false });
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Incident report handler
  const handleIncidentSubmit = async (data) => {
    setActionLoading(true);
    try {
      await api.post('/incidents', data);
      setIncidentModal({ isOpen: false, booking: null });
      alert('Incident report logged. Laboratory staff will investigate.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit incident report');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading your research hub..." />;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
            Student Research Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track your equipment bookings, manage active laboratory sessions, and reserve shared instruments.
          </p>
        </div>
        <Link
          to="/resources"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-brand-950 font-bold text-xs hover:bg-slate-100 transition shadow-md flex-shrink-0"
        >
          <Compass className="w-4 h-4 text-brand-700" />
          <span>Explore Equipment</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active & Confirmed</p>
            <p className="text-2xl font-bold text-brand-900 mt-1">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Completed Sessions</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-brand-700" />
            <span>Upcoming & Active Reservations</span>
          </h2>
          <Link
            to="/my-bookings"
            className="text-xs font-bold text-brand-800 hover:text-brand-950 flex items-center space-x-1"
          >
            <span>View All ({bookings.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <EmptyState
            title="No upcoming reservations"
            description="You don't have any pending or confirmed bookings right now."
            actionLabel="Browse Available Resources"
            actionLink="/resources"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCheckIn={(booking) => setCheckInModal({ isOpen: true, booking, isCheckOut: false })}
                onCheckOut={(booking) => setCheckInModal({ isOpen: true, booking, isCheckOut: true })}
                onCancel={async (id) => {
                  if (window.confirm('Are you sure you want to cancel this booking?')) {
                    await api.patch(`/bookings/${id}/cancel`, { reason: 'User cancelled from dashboard' });
                    fetchDashboardData();
                  }
                }}
                onReportIncident={(booking) => setIncidentModal({ isOpen: true, booking })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommended for Your Department */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-700" />
            <span>Recommended for Your Research</span>
          </h2>
          <Link
            to="/resources"
            className="text-xs font-bold text-brand-800 hover:text-brand-950 flex items-center space-x-1"
          >
            <span>See Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recommendations.slice(0, 4).map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <img
                  src={res.primary_image || res.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80'}
                  alt={res.title}
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
                <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                  {res.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                  {res.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {res.location}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {Number(res.fee_per_hour) === 0 ? 'Free' : `$${Number(res.fee_per_hour).toFixed(0)}/hr`}
                </span>
                <Link
                  to={`/resources/${res.id}`}
                  className="text-xs font-bold text-brand-800 hover:text-brand-950"
                >
                  Book →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Check In / Check Out Modal */}
      <CheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() => setCheckInModal({ isOpen: false, booking: null, isCheckOut: false })}
        booking={checkInModal.booking}
        isCheckOut={checkInModal.isCheckOut}
        onSubmit={handleCheckInSubmit}
        loading={actionLoading}
      />

      {/* Incident Modal */}
      {incidentModal.booking && (
        <IncidentModal
          isOpen={incidentModal.isOpen}
          onClose={() => setIncidentModal({ isOpen: false, booking: null })}
          booking={incidentModal.booking}
          onSubmit={handleIncidentSubmit}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
