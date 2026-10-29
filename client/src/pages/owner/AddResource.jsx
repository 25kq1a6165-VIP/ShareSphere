import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, ArrowLeft, Image, ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const categories = [
  'Laboratory Equipment',
  'Biotechnology',
  'Engineering & Prototyping',
  'Meeting & Workspaces',
  'Multimedia & Tech',
  'Electronics & Hardware',
  'Computing & AI',
  'Classrooms & Auditoriums'
];

export default function AddResource() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Laboratory Equipment',
    type: 'equipment',
    description: '',
    location: '',
    capacity: 1,
    fee_per_hour: 0,
    min_duration_hours: 1,
    max_duration_hours: 4,
    requires_approval: true,
    requires_training: false,
    safety_instructions: '',
    booking_rules: '',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/resources', {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        fee_per_hour: parseFloat(formData.fee_per_hour || 0),
        min_duration_hours: parseInt(formData.min_duration_hours, 10),
        max_duration_hours: parseInt(formData.max_duration_hours, 10),
      });

      if (res.data.success) {
        navigate('/owner/resources');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <Link
          to="/owner/resources"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resources</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          List a New Campus Resource
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish equipment or room spaces for verified university students and researchers.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Specifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Basic Identification
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Resource Title / Name
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Zeiss Ultra-55 Field Emission Scanning Electron Microscope"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Resource Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              >
                <option value="equipment">Equipment / Instrument</option>
                <option value="space">Space / Meeting Room</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Physical Location / Room Number
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Materials Science Building, Room 104"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Capacity (People)
              </label>
              <input
                type="number"
                name="capacity"
                min="1"
                required
                value={formData.capacity}
                onChange={handleChange}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Comprehensive Description
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail specifications, capabilities, and suitable experimental procedures..."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
            />
          </div>
        </div>

        {/* Pricing & Scheduling Rules */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Booking & Duration Limits
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hourly Fee ($)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="fee_per_hour"
                value={formData.fee_per_hour}
                onChange={handleChange}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Set 0 for free campus access</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Min Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                name="min_duration_hours"
                value={formData.min_duration_hours}
                onChange={handleChange}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                name="max_duration_hours"
                value={formData.max_duration_hours}
                onChange={handleChange}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
              />
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="requires_approval"
                checked={formData.requires_approval}
                onChange={handleChange}
                className="w-4 h-4 accent-brand-800 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Require Owner Approval</span>
                <span className="text-[11px] text-slate-500">Every request requires your manual approval</span>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="requires_training"
                checked={formData.requires_training}
                onChange={handleChange}
                className="w-4 h-4 accent-brand-800 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Require Safety Training</span>
                <span className="text-[11px] text-slate-500">Users must hold certification badge</span>
              </div>
            </label>
          </div>
        </div>

        {/* Safety & Booking Instructions */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Safety Protocols & Rules
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Safety & Handling Instructions
            </label>
            <textarea
              name="safety_instructions"
              rows={2}
              value={formData.safety_instructions}
              onChange={handleChange}
              placeholder="e.g., Nitrile gloves and eye protection mandatory. Clean optical surfaces with ethanol..."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Laboratory Booking Rules
            </label>
            <textarea
              name="booking_rules"
              rows={2}
              value={formData.booking_rules}
              onChange={handleChange}
              placeholder="e.g., Book at least 24 hours in advance. Log check-in condition upon arrival..."
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/owner/resources')}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 rounded-xl transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Resource Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
