import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { FileText, Search, Shield, Filter, Terminal } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/audit-logs${actionFilter !== 'all' ? `?action=${actionFilter}` : ''}`);
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filtered = logs.filter(l => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (l.action && l.action.toLowerCase().includes(s)) ||
      (l.entity_type && l.entity_type.toLowerCase().includes(s)) ||
      (l.user_name && l.user_name.toLowerCase().includes(s)) ||
      (l.details && l.details.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4 text-purple-700" />
          <span>Security & Compliance Trail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          System Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable forensic log of authentications, booking creations, status alterations, and administrative operations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'USER_LOGIN', 'BOOKING_REQUESTED', 'BOOKING_APPROVED', 'RESOURCE_CREATED'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                actionFilter === act
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {act === 'all' ? 'All Events' : act.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, or payload..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchLogs} />}

      {loading ? (
        <LoadingSpinner text="Retrieving immutable audit records..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 text-slate-500 whitespace-nowrap font-sans text-xs">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-brand-900 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-bold font-sans">
                      {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                    </td>
                    <td className="p-4 font-sans font-semibold text-slate-800">
                      {log.user_name || 'System Actor'}
                    </td>
                    <td className="p-4 text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                    <td className="p-4 max-w-xs truncate text-slate-600">
                      {log.details || '—'}
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
