import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const categories = [
  'All Categories',
  'Laboratory Equipment',
  'Biotechnology',
  'Engineering & Prototyping',
  'Meeting & Workspaces',
  'Multimedia & Tech',
  'Electronics & Hardware',
  'Computing & AI',
  'Classrooms & Auditoriums'
];

export default function FilterPanel({ filters, setFilters, onReset }) {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
          <Filter className="w-4 h-4 text-brand-700" />
          <span>Refine Resources</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-brand-700 flex items-center space-x-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Category
        </label>
        <select
          value={filters.category || 'All Categories'}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Resource Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Resource Type
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'equipment', label: 'Equipment' },
            { id: 'space', label: 'Rooms' }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleChange('type', type.id)}
              className={`py-1.5 rounded-lg font-medium transition ${
                (filters.type || 'all') === type.id
                  ? 'bg-white text-brand-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Filter */}
      <div>
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          <span>Max Fee / Hour</span>
          <span className="text-brand-800 font-bold">
            {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.maxPrice || 100}
          onChange={(e) => handleChange('maxPrice', e.target.value === '100' ? '' : e.target.value)}
          className="w-full accent-brand-800 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>$0 (Free)</span>
          <span>$50</span>
          <span>$100+</span>
        </div>
      </div>

      {/* Sort Option */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Sort Order
        </label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 transition"
        >
          <option value="newest">Newest Additions</option>
          <option value="price-low">Hourly Fee: Low to High</option>
          <option value="price-high">Hourly Fee: High to Low</option>
          <option value="capacity">Capacity (Largest first)</option>
        </select>
      </div>
    </div>
  );
}
