import React, { useState } from 'react';
import api from '../../services/api';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Get in Touch</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Contact Platform Support</h1>
        <p className="text-sm text-slate-500 mt-2">
          Have questions about equipment onboarding, safety credentials, or departmental partnerships? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Card */}
        <div className="bg-gradient-to-br from-brand-950 via-brand-900 to-blue-900 rounded-3xl p-8 text-white space-y-8 shadow-xl">
          <div>
            <h3 className="text-xl font-bold">Campus Support Office</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Our central lab coordination team is available Monday through Friday, 8:00 AM to 6:00 PM.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Central Innovation & Research Complex, Building 4, Suite 102</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span>support@sharesphere.edu</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span>+1 (555) 019-9200</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/60 text-[11px] text-slate-300 space-y-2">
            <p>
              For urgent equipment emergencies or lab safety incidents during active sessions, call campus security dispatch at ext. 9110.
            </p>
            <div className="bg-white/10 rounded-xl p-2.5 border border-white/15">
              <span className="font-semibold text-amber-300 block mb-0.5">Demonstration Notice:</span>
              <span>All phone numbers, facility addresses, and support emails shown are simulated demonstration data for the ShareSphere academic prototype.</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl mb-6 flex items-center space-x-3 animate-fade-in" role="status">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-xs font-semibold">
                Thank you! Your inquiry has been logged in our system and an administrator will respond shortly.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl mb-6 flex items-center space-x-2 text-xs" role="alert">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Dr. Jane Foster"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institutional Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., j.foster@university.edu"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Department Lab Onboarding Request"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we assist you with ShareSphere?..."
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-brand-900 hover:bg-brand-800 transition shadow-md disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending Message...' : 'Submit Inquiry'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
