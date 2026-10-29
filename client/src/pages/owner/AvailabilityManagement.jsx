import React, { useState } from 'react';
import { Calendar, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

export default function AvailabilityManagement() {
  const [schedule, setSchedule] = useState([
    { day: 'Monday', open: '08:30', close: '18:00', active: true },
    { day: 'Tuesday', open: '08:30', close: '18:00', active: true },
    { day: 'Wednesday', open: '08:30', close: '18:00', active: true },
    { day: 'Thursday', open: '08:30', close: '18:00', active: true },
    { day: 'Friday', open: '08:30', close: '17:00', active: true },
    { day: 'Saturday', open: '10:00', close: '15:00', active: false },
    { day: 'Sunday', open: '10:00', close: '14:00', active: false },
  ]);

  const [blackouts, setBlackouts] = useState([
    { id: 1, reason: 'Annual Laser Calibration', date: 'Next Friday', time: '13:00 - 17:00' },
    { id: 2, reason: 'Campus Holiday Maintenance', date: 'Nov 24', time: 'All Day' }
  ]);

  const [saved, setSaved] = useState(false);

  const handleToggle = (index) => {
    setSchedule(prev => prev.map((item, i) => i === index ? { ...item, active: !item.active } : item));
  };

  const handleTimeChange = (index, field, val) => {
    setSchedule(prev => prev.map((item, i) => i === index ? { ...item, [field]: val } : item));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          <span>Facility Scheduling</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Availability & Maintenance Windows
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Set weekly lab operating hours and schedule maintenance blackout blocks to prevent bookings during calibrations.
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Weekly schedule changes updated and active across booking engine!</span>
        </div>
      )}

      {/* Weekly Operating Hours */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-700" />
          <span>Standard Weekly Operating Schedule</span>
        </h3>

        <div className="space-y-3">
          {schedule.map((item, idx) => (
            <div
              key={item.day}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition ${
                item.active ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200/50 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={() => handleToggle(idx)}
                  className="w-4 h-4 accent-brand-800 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 w-28">{item.day}</span>
              </div>

              {item.active ? (
                <div className="flex items-center space-x-2 text-xs">
                  <span>Open:</span>
                  <input
                    type="time"
                    value={item.open}
                    onChange={(e) => handleTimeChange(idx, 'open', e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:ring-1 focus:ring-brand-700"
                  />
                  <span>Close:</span>
                  <input
                    type="time"
                    value={item.close}
                    onChange={(e) => handleTimeChange(idx, 'close', e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:ring-1 focus:ring-brand-700"
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Facility Closed</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-900 hover:bg-brand-800 transition shadow-md"
          >
            Save Operating Schedule
          </button>
        </div>
      </form>

      {/* Blocked Times & Maintenance */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Scheduled Maintenance & Blackout Windows</span>
          </h3>
          <button
            onClick={() => alert('New maintenance window scheduled.')}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-800 hover:text-brand-950"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Maintenance Block</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {blackouts.map((b) => (
            <div key={b.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 block">{b.reason}</strong>
                <span className="text-slate-500">{b.date} • {b.time}</span>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-semibold text-[10px]">
                Maintenance Block Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
