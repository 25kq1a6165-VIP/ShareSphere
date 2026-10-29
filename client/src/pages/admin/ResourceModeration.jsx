import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ShieldCheck, Search, Eye, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

export default function ResourceModeration() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resources?status=all&limit=50');
      if (res.data.success) {
        setResources(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/resources/${id}`, { status: newStatus });
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const filtered = resources.filter(r => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return r.title.toLowerCase().includes(s) || r.location.toLowerCase().includes(s) || r.category.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Listing Quality & Compliance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Resource Moderation Console
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review campus equipment listings, approve new submissions, and enforce compliance guidelines.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter catalog by name, category, or room..."
          className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-700 transition shadow-2xs"
        />
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchResources} />}

      {loading ? (
        <LoadingSpinner text="Retrieving platform listings..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Facility / Location</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Fee / Hour</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900 flex items-center space-x-3">
                      <img
                        src={r.primary_image || r.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=100&q=80'}
                        alt={r.title}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <span className="block truncate max-w-xs">{r.title}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{r.category}</span>
                      </div>
                    </td>
                    <td className="p-4">{r.location}</td>
                    <td className="p-4">{r.owner_name || 'Academic Lab'}</td>
                    <td className="p-4 font-bold text-slate-900">
                      {Number(r.fee_per_hour) === 0 ? 'Free' : `$${Number(r.fee_per_hour).toFixed(2)}`}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/resources/${r.id}`}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        Preview
                      </Link>
                      {r.status !== 'active' ? (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'active')}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                        >
                          Approve Listing
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'suspended')}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                        >
                          Suspend
                        </button>
                      )}
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
