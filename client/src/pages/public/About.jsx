import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Target, Shield, Award, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-bold uppercase tracking-wider">
          About ShareSphere
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Democratizing Access to Specialized Scientific & Campus Resources
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          ShareSphere was born out of a common university challenge: multi-million dollar laboratory instruments and high-tech spaces sitting idle during off-peak hours, while student researchers struggle with resource bottlenecks.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Eliminate departmental silos and establish an intuitive, transparent scheduling platform for physical campus hardware and research spaces.
          </p>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Safety & Compliance</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Protect high-precision instrumentation through mandatory training verification, digital check-in inspections, and full audit logging.
          </p>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Research Acceleration</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Empower undergraduate and graduate students to validate theses and prototypes faster using enterprise-grade equipment.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Platform Pillars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900">Zero Double-Booking</strong>
              <span className="text-xs text-slate-500">Atomic database concurrency prevents scheduling overlaps.</span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900">Owner Autonomy</strong>
              <span className="text-xs text-slate-500">Resource owners set their own rules, time blocks, and safety protocols.</span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900">Condition Tracking</strong>
              <span className="text-xs text-slate-500">Check-in and check-out notes record equipment status before and after each session.</span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900">Enterprise Security</strong>
              <span className="text-xs text-slate-500">Bcrypt hashing, JWT sessions, and role-based access control across all tiers.</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/resources"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-900 text-white font-bold text-sm hover:bg-brand-800 transition shadow-md"
        >
          <span>Explore Platform Resources</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
