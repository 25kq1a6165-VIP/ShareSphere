import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Package, PlusCircle, Search, Edit3, Eye, Trash2, ShieldCheck, MapPin } from 'lucide-react';

export default function MyResources() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/resources/owner');
      if (res.data.success) {
        setResources(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this resource listing?')) {
      try {
        await api.delete(`/resources/${id}`);
        fetchResources();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to deactivate resource');
      }
    }
  };

  const filtered = resources.filter(r => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return r.title.toLowerCase().includes(s) || r.location.toLowerCase().includes(s) || r.category.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Facility Listings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Published Resources
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure availability rules, update hourly rates, and manage equipment status.
          </p>
        </div>

        <Link
          to="/owner/resources/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs transition shadow-sm flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Resource</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter resources by name, category, or room..."
          className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-700 transition shadow-2xs"
        />
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchResources} />}

      {loading ? (
        <LoadingSpinner text="Loading published facility equipment..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No resources found"
          description={
            resources.length === 0
              ? 'You have not listed any instruments or spaces yet. Click below to add your first resource!'
              : 'No resources match your filter search.'
          }
          actionLabel="Add Your First Resource"
          actionLink="/owner/resources/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={r.primary_image || r.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                    alt={r.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-sm capitalize">
                      {r.type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={r.status} />
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                      {r.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1 mt-0.5">
                      {r.title}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{r.location}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>Rate:</span>
                      <span className="text-emerald-700 font-bold">
                        {Number(r.fee_per_hour) === 0 ? 'Free' : `$${Number(r.fee_per_hour).toFixed(2)}/hr`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to={`/resources/${r.id}`}
                  className="inline-flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </Link>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/owner/resources/${r.id}/edit`}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-brand-50 text-brand-800 hover:bg-brand-100 rounded-xl font-semibold transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => handleDeactivate(r.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Deactivate listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
