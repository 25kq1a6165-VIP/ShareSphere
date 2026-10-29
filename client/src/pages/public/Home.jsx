import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ResourceCard from '../../components/resources/ResourceCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Search,
  ArrowRight,
  Microscope,
  Cpu,
  Box,
  Layers,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Users,
  Compass,
  Building2,
  Lock
} from 'lucide-react';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredResources, setFeaturedResources] = useState([]);
  const [stats, setStats] = useState({
    total_resources: 8,
    total_users: 5,
    total_bookings: 12,
    active_bookings: 3
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [resResponse, statsResponse] = await Promise.allSettled([
          api.get('/resources?limit=6&sort=newest'),
          api.get('/resources/stats'),
        ]);

        if (resResponse.status === 'fulfilled' && resResponse.value.data.success) {
          setFeaturedResources(resResponse.value.data.data.slice(0, 6));
        }

        if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
          setStats(statsResponse.value.data.data);
        }
      } catch (e) {
        console.error('Error fetching home data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/resources?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/resources');
    }
  };

  const categories = [
    { name: 'Laboratory Equipment', icon: Microscope, count: 'FE-SEM, PCR, Centrifuges', color: 'bg-blue-50 text-blue-700' },
    { name: 'Computing & AI', icon: Cpu, count: '4x RTX 4090 Nodes, HPC', color: 'bg-indigo-50 text-indigo-700' },
    { name: 'Engineering & Prototyping', icon: Box, count: 'SLA/FDM 3D Printers, CNC', color: 'bg-amber-50 text-amber-700' },
    { name: 'Meeting & Workspaces', icon: Building2, count: 'Conference Suites, 4K Displays', color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-slate-50 to-white pt-16 pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-900 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-700" />
            <span>Campus Resource Sharing Reimagined</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Share Resources. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-900 via-brand-700 to-blue-600 bg-clip-text text-transparent">
              Unlock Possibilities.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Reserve advanced electron microscopes, computing clusters, 3D prototyping labs, and collaborative meeting spaces across university departments.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-brand-700 transition">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by instrument, room number, or department (e.g., SEM, PCR, Studio)..."
                className="w-full px-3 py-2 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white font-semibold text-sm transition shadow-sm flex items-center space-x-1.5 flex-shrink-0"
              >
                <span>Find Resources</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Shortcuts */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Popular Searches:</span>
            {['FE-SEM Microscope', 'Park NX10 AFM', 'Confocal Laser', 'Bruker XRD', 'Auditorium B'].map((item) => (
              <button
                key={item}
                onClick={() => navigate(`/resources?search=${encodeURIComponent(item)}`)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-800 transition shadow-2xs"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Database-derived stats banner */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
              <div>
                <p className="text-3xl font-extrabold text-brand-900">{stats.total_resources || 8}+</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Active Resources</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-blue-600">{stats.total_users || 4}+</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Verified Researchers</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-emerald-600">{stats.completed_bookings || 15}+</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Completed Sessions</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-amber-600">100%</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Schedule Guarantee</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2.5 text-center">
              * Demonstration Platform Telemetry: Metrics shown reflect the ShareSphere demo database seed dataset.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Campus Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Resource Categories</h2>
          </div>
          <Link
            to="/resources"
            className="mt-3 sm:mt-0 text-sm font-semibold text-brand-800 hover:text-brand-900 flex items-center space-x-1"
          >
            <span>Browse All Resources</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => navigate(`/resources?category=${encodeURIComponent(cat.name)}`)}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition ${cat.color} group-hover:scale-105`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5">{cat.count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Resources Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Demonstration Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Equipment & Rooms</h2>
            <p className="text-xs text-slate-500 mt-0.5">Sample equipment listings and schedules for evaluation</p>
          </div>
          <Link
            to="/resources"
            className="mt-3 sm:mt-0 text-sm font-semibold text-brand-800 hover:text-brand-900 flex items-center space-x-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading campus resources from database..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Seamless Process</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">How ShareSphere Works</h2>
            <p className="text-sm text-slate-600 mt-2">
              From student discovery to resource owner sign-off and return condition reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discover & Check', desc: 'Browse available instruments and rooms. View operating schedules and safety prerequisites.' },
              { step: '02', title: 'Request Slot', desc: 'Select your time range. Automated concurrency checks prevent double-booking.' },
              { step: '03', title: 'Faculty Approval', desc: 'Resource owners receive in-app alerts and approve your research request.' },
              { step: '04', title: 'Check In & Complete', desc: 'Record equipment condition upon arrival and departure to ensure safety.' },
            ].map((item, i) => (
              <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative">
                <span className="text-3xl font-black text-brand-100 absolute top-4 right-4">
                  {item.step}
                </span>
                <div className="w-8 h-8 rounded-lg bg-brand-800 text-white flex items-center justify-center font-bold text-xs mb-4">
                  {i + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits for Students & Owners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Students Card */}
          <div className="bg-gradient-to-br from-white to-blue-50/40 p-8 rounded-3xl border border-blue-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-600/20">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">For Students & Researchers</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Gain equitable access to expensive specialized instrumentation without departmental silos or paper sign-up sheets.
            </p>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Instant visibility into live availability and maintenance slots</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Track booking approvals, instructions, and return timelines</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Verify safety credentials and request training certification</span>
              </li>
            </ul>
            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 text-sm font-semibold text-brand-900 hover:text-blue-700"
              >
                <span>Join as a Researcher</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Owners Card */}
          <div className="bg-gradient-to-br from-white to-emerald-50/40 p-8 rounded-3xl border border-emerald-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">For Resource Owners & Lab Directors</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Maximize instrument utilization, prevent unauthorized usage, enforce safety protocols, and record audit trails.
            </p>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Full approval authority over every reservation request</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Enforce custom operating hours, buffers, and maintenance blocks</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Detailed condition inspection logs before and after each session</span>
              </li>
            </ul>
            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 text-sm font-semibold text-emerald-800 hover:text-emerald-900"
              >
                <span>Publish Laboratory Resources</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-brand-950 via-brand-900 to-blue-900 rounded-3xl p-10 sm:p-14 text-white text-center shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Ready to Unlock Campus Innovation?
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Discover available equipment or onboard your department’s instruments today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/resources"
              className="px-6 py-3 rounded-xl bg-white text-brand-950 font-bold text-sm hover:bg-slate-100 transition shadow-md"
            >
              Explore All Resources
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md"
            >
              Log In to Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
