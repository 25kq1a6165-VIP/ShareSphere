import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents');
      if (res.data.success) {
        setIncidents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolve = async (id) => {
    const notes = window.prompt('Enter administrative resolution / action taken:');
    if (!notes) return;
    try {
      await api.patch(`/incidents/${id}/resolve`, {
        status: 'resolved',
        resolution_notes: notes,
      });
      fetchIncidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Resolution failed');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Safety & Infrastructure Operations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Incident & Equipment Damage Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track safety reports, equipment faults, and resolve reported malfunctions.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving platform incidents..." />
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Zero incidents reported"
          description="All laboratory instruments and facilities are reported in normal operating condition."
        />
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400">Incident #{inc.id}</span>
                  <StatusBadge status={inc.status} />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700">
                    Severity: {inc.severity}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{inc.title}</h3>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {inc.description}
                </p>
                <div className="text-[11px] text-slate-400">
                  Resource: <strong className="text-slate-700">{inc.resource_title || 'Equipment Item'}</strong> • Reported by: <strong className="text-slate-700">{inc.reporter_name || 'User'}</strong>
                </div>
                {inc.resolution_notes && (
                  <div className="text-xs bg-emerald-50 text-emerald-900 p-3 rounded-xl">
                    <strong>Resolution:</strong> {inc.resolution_notes}
                  </div>
                )}
              </div>

              {inc.status === 'open' && (
                <button
                  onClick={() => handleResolve(inc.id)}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 rounded-xl transition shadow-sm flex-shrink-0"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
