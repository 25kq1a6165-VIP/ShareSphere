import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

const ALL_STEPS = [
  { id: 1, label: 'Physical Visit', desc: 'Pre-booking inspection' },
  { id: 2, label: 'Interest Confirmed', desc: 'Proceeding to book' },
  { id: 3, label: '50% Advance Due', desc: 'Awaiting deposit' },
  { id: 4, label: 'Advance Verified', desc: 'Payment validated' },
  { id: 5, label: 'Booking Confirmed', desc: 'Slot secured' },
  { id: 6, label: 'Resource Ready', desc: 'Handover prepared' },
  { id: 7, label: 'Resource In Use', desc: 'Session active' },
  { id: 8, label: 'Usage Completed', desc: 'Return inspected' },
  { id: 9, label: 'Final 50% Due', desc: 'Balance settlement' },
  { id: 10, label: 'Fully Completed', desc: 'Settled & archived' }
];

export default function BookingProgressSteps({ booking }) {
  if (!booking) return null;

  // Determine current active milestone (1 to 10)
  const determineStep = () => {
    if (booking.status === 'completed' || booking.final_paid === 1) return 10;
    if (booking.status === 'usage_completed' && booking.final_paid === 0) return 9;
    if (booking.status === 'in_use' || booking.status === 'checked_in') return 7;
    if (booking.status === 'resource_ready' || booking.handover_confirmed === 1) return 6;
    if (booking.status === 'booking_confirmed' || (booking.advance_paid === 1 && booking.status !== 'advance_pending')) return 5;
    if (booking.advance_paid === 1) return 4;
    if (booking.status === 'advance_pending') return 3;
    if (booking.visit_id) return 2;
    return 3;
  };

  const currentStep = determineStep();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
            10-Stage Milestone Tracker
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Reservation Lifecycle Progress
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-900 bg-brand-50 text-brand-900 px-3 py-1 rounded-full border border-brand-200">
            Stage {currentStep} of 10
          </span>
        </div>
      </div>

      {/* Horizontal Desktop Steps */}
      <div className="hidden lg:grid grid-cols-10 gap-2 relative">
        {ALL_STEPS.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-brand-900 text-white ring-4 ring-brand-100 scale-110'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`text-[11px] font-bold mt-2 leading-tight ${
                  isCurrent
                    ? 'text-brand-950 font-extrabold'
                    : isDone
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Vertical Steps */}
      <div className="lg:hidden space-y-3">
        {ALL_STEPS.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-2.5 rounded-2xl border transition ${
                isCurrent
                  ? 'bg-brand-50/60 border-brand-300 ring-1 ring-brand-200'
                  : isDone
                  ? 'bg-slate-50 border-slate-200/80'
                  : 'bg-white border-slate-100 opacity-60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-brand-900 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isCurrent ? 'text-brand-950' : isDone ? 'text-slate-800' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-900 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 truncate">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

