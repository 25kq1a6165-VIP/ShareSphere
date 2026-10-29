import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ResourceCard from '../../components/resources/ResourceCard';
import FilterPanel from '../../components/resources/FilterPanel';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

export default function ExploreResources() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All Categories',
    type: searchParams.get('type') || 'all',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category && filters.category !== 'All Categories') params.set('category', filters.category);
      if (filters.type && filters.type !== 'all') params.set('type', filters.type);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.sort) params.set('sort', filters.sort);
      params.set('page', filters.page);
      params.set('limit', 9);

      setSearchParams(params);

      const res = await api.get(`/resources?${params.toString()}`);
      if (res.data.success) {
        setResources(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filters.category, filters.type, filters.maxPrice, filters.sort, filters.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchResources();
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All Categories',
      type: 'all',
      maxPrice: '',
      sort: 'newest',
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4" />
          <span>Resource Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Campus Resources
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Find and reserve equipment, specialized instruments, maker laboratories, and group study spaces.
        </p>
      </div>

      {/* Search & Mobile Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search by title, location, keywords..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-24 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-700 focus:outline-none transition shadow-2xs"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-900 text-white text-xs font-semibold rounded-lg hover:bg-brand-800 transition"
          >
            Search
          </button>
        </form>

        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-2xs w-full sm:w-auto justify-center"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Resource Listings */}
        <div className="lg:col-span-3 space-y-6">
          {error && <ErrorMessage message={error} onRetry={fetchResources} />}

          {loading ? (
            <LoadingSpinner text="Querying database for available resources..." />
          ) : resources.length === 0 ? (
            <EmptyState
              title="No resources matched your criteria"
              description="Try clearing your search query, increasing the price range, or selecting another category."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              {/* Results count & status */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/60">
                <span>
                  Showing <strong className="text-slate-800">{resources.length}</strong> of{' '}
                  <strong className="text-slate-800">{pagination.total}</strong> resources
                </span>
                {filters.category !== 'All Categories' && (
                  <span className="font-semibold text-brand-700">Category: {filters.category}</span>
                )}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-8">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={filters.page <= 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-1 text-sm font-semibold text-slate-700">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setFilters(prev => ({ ...prev, page: num }))}
                        className={`w-9 h-9 rounded-xl transition ${
                          filters.page === num
                            ? 'bg-brand-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                    disabled={filters.page >= pagination.totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
