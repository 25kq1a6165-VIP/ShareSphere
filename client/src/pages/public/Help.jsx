import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Shield, Calendar, Clock, BookOpen } from 'lucide-react';

export default function Help() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does ShareSphere prevent double-booking?',
      a: 'ShareSphere runs an atomic server-side database concurrency check. When an owner approves a booking or a slot is reserved, the backend verifies that no active or confirmed reservation overlaps with the start and end timestamp.',
    },
    {
      q: 'What is required to book specialized equipment like the Electron Microscope?',
      a: 'Instruments marked with "Training Required" require verified safety clearance. You can request or upload your certification via the eligibility workflow or contact the lab director.',
    },
    {
      q: 'How do check-in and check-out work?',
      a: 'When arriving for your reservation, click "Check In" from your dashboard or booking details to record the physical condition of the equipment. After finishing, click "Check Out" to record the return state and complete your session.',
    },
    {
      q: 'Can I cancel my booking if my research plans change?',
      a: 'Yes, pending and approved reservations can be cancelled directly through the "My Bookings" page prior to your scheduled time slot, which immediately releases the slot for other researchers.',
    },
    {
      q: 'How do resource owners get notified of requests?',
      a: 'When a student submits a reservation request, an in-app notification is immediately delivered to the owner’s dashboard. Owners can review the purpose, team size, and approve or reject the slot with a single click.',
    },
    {
      q: 'What should I do if an instrument malfunctions during my session?',
      a: 'Stop use immediately and use the "Report Incident" button on your booking card. This marks the equipment status and alerts both the lab director and campus administration for swift maintenance.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Support & Knowledge Base</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-500">
          Everything you need to know about reserving, sharing, and managing university research facilities.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full text-left px-6 py-4 flex items-center justify-between space-x-4 hover:bg-slate-50 transition"
              >
                <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-brand-700 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Campus Rules Notice */}
      <div className="bg-gradient-to-br from-brand-50 to-blue-50/60 p-6 rounded-3xl border border-brand-100 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-brand-700" />
          <span>General Campus Usage Guidelines</span>
        </h4>
        <p>
          All students and staff must adhere to institutional chemical hygiene and biosafety standards. Unauthorized transfers of reservations or sharing keys/passcodes is strictly prohibited and subject to disciplinary review.
        </p>
      </div>
    </div>
  );
}
