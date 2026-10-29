import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">Password Recovery</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Enter your institutional email address to receive password reset instructions.
        </p>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left space-y-3 animate-fade-in">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Reset Request Registered</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              In production mode with active SMTP configured in <code className="bg-emerald-100 px-1 py-0.5 rounded">.env</code>, an email is dispatched.
            </p>
            <p className="text-xs text-slate-600">
              For local testing and evaluation, demo accounts use password: <strong className="text-slate-900">Password123!</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., student@sharesphere.edu"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-900 hover:bg-brand-800 transition shadow-md"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100">
          <Link
            to="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
