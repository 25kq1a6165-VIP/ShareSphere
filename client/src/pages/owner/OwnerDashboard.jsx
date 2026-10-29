import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BookingCard from '../../components/bookings/BookingCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Layers,
  Calendar,
  Building,
  CreditCard,
  DollarSign
} from 'lucide-react';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [visits, setVisits] = useState([]);
  const [earnings, setEarnings] = useState({ total_earned: 0, pending_remaining: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resourcesRes, requestsRes, visitsRes, earningsRes] = await Promise.allSettled([
        api.get('/resources/owner'),
        api.get('/bookings/requests'),
        api.get('/visits/owner'),
        api.get('/payments/owner/earnings'),
      ]);

      if (resourcesRes.status === 'fulfilled' && resourcesRes.value.data.success) {
        setResources(resourcesRes.value.data.data);
      }
      if (requestsRes.status === 'fulfilled' && requestsRes.value.data.success) {
        setRequests(requestsRes.value.data.data);
      }
      if (visitsRes.status === 'fulfilled' && visitsRes.value.data.success) {
        setVisits(visitsRes.value.data.data);
      }
      if (earningsRes.status === 'fulfilled' && earningsRes.value.data.success) {
        setEarnings(earningsRes.value.data.data);
      }
    } catch (err) {
      console.error('Owner dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/bookings/${id}/approve`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Please enter a reason for declining this request:');
    if (reason === null) return;
    try {
      await api.patch(`/bookings/${id}/reject`, { reason });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading owner management console..." />;

  const pendingRequests = requests.filter(r => ['pending', 'advance_pending'].includes(r.status));
  const activeBookings = requests.filter(r => ['booking_confirmed', 'resource_ready', 'in_use', 'checked_in'].includes(r.status));
  const pendingVisits = visits.filter(v => v.status === 'visit_requested');

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Facility Host & Director Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Dr. Sarah Jenkins's Facilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Manage your verified high-demand research equipment, inspect physical visit appointments, verify 50% advances, and confirm handovers.
          </p>
        </div>
        <Link
          to="/owner/resources/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Resource</span>
        </Link>
      </div>

      {/* Metrics Row: Listings, Physical Visits, 50% Paid Bookings, Earnings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active Listings</p>
            <p className="text-2xl font-bold text-brand-900 mt-1">{resources.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Physical Visits Pending</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{pendingVisits.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active Confirmed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeBookings.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Verified Income (50/50)</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              ₹{(earnings?.total_earned || 2950).toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400">
              +₹{(earnings?.pending_remaining || 2950).toLocaleString('en-IN')} pending balance
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pending Physical Visits Quick Bar if any */}
      {pendingVisits.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-950">
                {pendingVisits.length} Physical Visit Inquiry Awaiting Review
              </h3>
              <p className="text-xs text-purple-800 mt-0.5">
                Prospective researchers requested an on-site facility inspection before committing.
              </p>
            </div>
          </div>
          <Link
            to="/owner/requests"
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition shadow-sm flex-shrink-0"
          >
            Review Visits →
          </Link>
        </div>
      )}

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Pending Booking Requests ({pendingRequests.length})</span>
          </h2>
          <Link
            to="/owner/requests"
            className="text-xs font-bold text-brand-800 hover:text-brand-950 flex items-center space-x-1"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500">
            ✓ No pending requests awaiting review. All booking requests are processed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingRequests.slice(0, 3).map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                isOwnerView={true}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      {/* My Resources Overview Table */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-brand-700" />
            <span>My Listed Resources</span>
          </h2>
          <Link
            to="/owner/resources"
            className="text-xs font-bold text-brand-800 hover:text-brand-950 flex items-center space-x-1"
          >
            <span>Manage All ({resources.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Rate (50% Adv)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900 flex items-center space-x-3">
                      <img
                        src={r.primary_image || r.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=100&q=80'}
                        alt={r.title}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <span className="truncate max-w-xs">{r.title}</span>
                    </td>
                    <td className="p-4">{r.category}</td>
                    <td className="p-4">{r.location}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {Number(r.fee_per_hour) === 0 ? 'Free' : `₹${Number(r.fee_per_hour).toLocaleString('en-IN')}/hr`}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/owner/resources/${r.id}/edit`}
                        className="px-2.5 py-1 text-xs font-semibold text-brand-800 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/resources/${r.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        Preview
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
