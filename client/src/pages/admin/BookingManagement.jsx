import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { CalendarCheck, Search, Filter } from 'lucide-react';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/bookings?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <CalendarCheck className="w-4 h-4" />
          <span>Platform Reservation Oversight</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          All System Bookings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Master log of all reservations, check-ins, approvals, and completions across all facilities.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'pending', 'approved', 'checked_in', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by resource, student, purpose..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
          />
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchBookings} />}

      {loading ? (
        <LoadingSpinner text="Retrieving complete booking history..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Ref #</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Student User</th>
                  <th className="p-4">Reservation Window</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">#{b.id}</td>
                    <td className="p-4 font-semibold text-slate-900 truncate max-w-xs">{b.resource_title}</td>
                    <td className="p-4">
                      <span className="block font-bold text-slate-800">{b.user_name}</span>
                      <span className="text-[11px] text-slate-400">{b.user_email}</span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(b.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {Number(b.total_amount) === 0 ? 'Free' : `$${Number(b.total_amount).toFixed(2)}`}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/my-bookings/${b.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-brand-800 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
