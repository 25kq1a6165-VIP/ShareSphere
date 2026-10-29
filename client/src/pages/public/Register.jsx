import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Share2, AlertCircle, User, Building, ShieldCheck, Info } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // 'student' or 'owner'
    department: '',
    phone: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
      });

      if (user.role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-brand-900 mb-3" aria-label="ShareSphere Home">
            <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Share<span className="text-blue-600">Sphere</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create a Campus Account</h1>
          <p className="text-xs text-slate-600 mt-1">Join researchers, faculty, and students on the ShareSphere resource platform</p>
        </div>

        {/* Eligibility & Email Requirements Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-slate-900">
            <Info className="w-4 h-4 text-brand-700 flex-shrink-0" />
            <span>Eligibility & Registration Policy</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
            <li><strong>Who can register:</strong> University students, research fellows, faculty members, and lab managers.</li>
            <li><strong>Email requirement:</strong> An institutional email ending in <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">.edu</code> is recommended for instant department access. Affiliated research partners may also register with departmental authorization.</li>
          </ul>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-start space-x-2 animate-fade-in" role="alert">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Role Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account Type">
              <button
                type="button"
                role="radio"
                aria-checked={formData.role === 'student'}
                onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-brand-700 ${
                  formData.role === 'student'
                    ? 'border-brand-800 bg-brand-50/70 text-brand-950 ring-2 ring-brand-800/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl ${formData.role === 'student' ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Student / Researcher</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Explore & book equipment</p>
                </div>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={formData.role === 'owner'}
                onClick={() => setFormData(prev => ({ ...prev, role: 'owner' }))}
                className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-brand-700 ${
                  formData.role === 'owner'
                    ? 'border-brand-800 bg-brand-50/70 text-brand-950 ring-2 ring-brand-800/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-xl ${formData.role === 'owner' ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Resource Owner</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Publish lab instruments</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Legal Name
            </label>
            <input
              id="reg-name"
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g., Alex Rivera"
              autoComplete="name"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              University Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., alex.rivera@university.edu"
              autoComplete="email"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-dept" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department / Faculty
              </label>
              <input
                id="reg-dept"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Materials Science"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., +1-555-0104"
                autoComplete="tel"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Create Password
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Privacy & Visibility Transparency Box */}
          <div className="bg-blue-50/60 border border-blue-200/70 rounded-2xl p-3.5 text-[11px] text-blue-950 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0" />
              <span>Data Collection & Booking Visibility</span>
            </div>
            <p className="leading-relaxed text-blue-900/90">
              We collect your name, institutional email, department affiliation, and contact number solely to verify safety credentials and facilitate facility reservations. Your research project details and booking requests are visible only to the respective facility manager and compliance administrators.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-900 hover:bg-brand-800 transition shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 mt-2 focus:outline-none focus:ring-2 focus:ring-brand-700"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-800 hover:text-brand-950 underline">
            Log in to your account
          </Link>
        </div>
      </div>
    </div>
  );
}
