import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Share2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'owner') navigate('/owner');
        else navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Demo Fill
  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-brand-900 mb-3" aria-label="ShareSphere Home">
            <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Share<span className="text-blue-600">Sphere</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Sign In to ShareSphere</h1>
          <p className="text-xs text-slate-600 mt-1">Access university laboratory equipment, maker spaces, and meeting rooms</p>
        </div>

        {/* 1-Click Demo Accounts Card */}
        <div className="bg-gradient-to-br from-brand-50 to-blue-50/50 p-4 rounded-2xl border border-brand-100">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-950 mb-2.5">
            <Sparkles className="w-4 h-4 text-brand-700" />
            <span>1-Click Demonstration Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('student@sharesphere.edu')}
              className="px-2.5 py-2 bg-white rounded-xl border border-brand-200 text-brand-900 font-semibold hover:bg-brand-900 hover:text-white transition shadow-2xs text-center focus:ring-2 focus:ring-brand-700 focus:outline-none"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo('owner@sharesphere.edu')}
              className="px-2.5 py-2 bg-white rounded-xl border border-brand-200 text-brand-900 font-semibold hover:bg-brand-900 hover:text-white transition shadow-2xs text-center focus:ring-2 focus:ring-brand-700 focus:outline-none"
            >
              🔬 Lab Owner
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@sharesphere.edu')}
              className="px-2.5 py-2 bg-white rounded-xl border border-brand-200 text-brand-900 font-semibold hover:bg-brand-900 hover:text-white transition shadow-2xs text-center focus:ring-2 focus:ring-brand-700 focus:outline-none"
            >
              🛡️ Admin
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            Password is automatically populated: <strong className="text-slate-800">Password123!</strong>
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-start space-x-2 animate-fade-in" role="alert">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., student@sharesphere.edu"
              autoComplete="email"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-brand-700 hover:text-brand-900 underline focus:ring-2 focus:ring-brand-700 focus:outline-none rounded">
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-900 hover:bg-brand-800 transition shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 focus:ring-2 focus:ring-brand-700 focus:outline-none"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* How to Get Help Signing In */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <HelpCircle className="w-4 h-4 text-brand-700" />
            <span>Need Help Signing In?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">
            • Use one of the <strong>1-Click Demo Accounts</strong> above to explore immediately.
            <br />
            • Reset your credentials via <Link to="/forgot-password" className="text-brand-800 font-semibold underline">Password Recovery</Link>.
            <br />
            • For institutional SSO or department lockouts, consult <Link to="/help" className="text-brand-800 font-semibold underline">Help & FAQs</Link> or contact <Link to="/contact" className="text-brand-800 font-semibold underline">Support</Link>.
          </p>
        </div>

        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-800 hover:text-brand-950 underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
