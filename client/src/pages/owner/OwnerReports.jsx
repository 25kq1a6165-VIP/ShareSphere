import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FileCheck2, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';

export default function OwnerReports() {
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
      console.error('Failed to load incident reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolve = async (id) => {
    const notes = window.prompt('Enter resolution notes / repair action taken:');
    if (!notes) return;
    try {
      await api.patch(`/incidents/${id}/resolve`, {
        status: 'resolved',
        resolution_notes: notes,
      });
      fetchIncidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Resolution update failed');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <FileCheck2 className="w-4 h-4" />
          <span>Quality Assurance & Lab Health</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Condition Reports & Safety Incidents
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review physical inspection records from check-in/check-out sessions and manage equipment incident reports.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading facility incident reports..." />
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All systems operational"
          description="There are no open incidents or damage reports logged on your resources."
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Reported Incidents ({incidents.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Incident #{inc.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{inc.title}</h3>
                    </div>
                    <StatusBadge status={inc.status} />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {inc.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-3">
                    <div>
                      <span className="font-semibold text-slate-700">Resource:</span>{' '}
                      {inc.resource_title || 'Equipment Item'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Severity:</span>{' '}
                      <span className="capitalize font-bold text-rose-700">{inc.severity}</span>
                    </div>
                  </div>

                  {inc.resolution_notes && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900">
                      <strong>Resolution Note:</strong> {inc.resolution_notes}
                    </div>
                  )}
                </div>

                {inc.status === 'open' && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleResolve(inc.id)}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 rounded-xl transition shadow-sm"
                    >
                      Resolve & Clear Equipment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
