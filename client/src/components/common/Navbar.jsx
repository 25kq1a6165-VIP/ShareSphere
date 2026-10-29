import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Compass,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Share2,
  ChevronDown,
  Layers,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isStudent, isOwner, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isOwner) return '/owner';
    return '/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-brand-800 to-blue-600 flex items-center justify-center text-white shadow-md shadow-brand-900/10 group-hover:scale-105 transition transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-brand-950 font-sans">
                Share<span className="text-blue-600">Sphere</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                Campus Resource Sharing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/') ? 'text-brand-900 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/resources"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive('/resources') ? 'text-brand-900 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-brand-600" />
              <span>Explore Resources</span>
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/about') ? 'text-brand-900 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/contact') ? 'text-brand-900 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Contact
            </Link>
            <Link
              to="/help"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/help') ? 'text-brand-900 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Help & FAQs
            </Link>
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Real-time Interactive Notification Dropdown */}
                <NotificationDropdown />

                {/* Dashboard Quick Link */}
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium text-brand-900 bg-brand-50 hover:bg-brand-100 transition border border-brand-200"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-700" />
                  <span>Dashboard</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                  >
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-100"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">{user.full_name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in"
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-500">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-800 rounded-md uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </Link>

                      {isStudent && (
                        <Link
                          to="/my-bookings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>My Bookings</span>
                        </Link>
                      )}

                      {isOwner && (
                        <Link
                          to="/owner/resources/new"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                        >
                          <PlusCircle className="w-4 h-4 text-slate-400" />
                          <span>Add New Resource</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin/users"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                        >
                          <ShieldCheck className="w-4 h-4 text-slate-400" />
                          <span>User Management</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile & Account</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-800 hover:bg-brand-900 rounded-xl transition shadow-sm hover:shadow"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <Link to="/notifications" className="relative p-2 text-slate-500 hover:text-slate-800" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full" />
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-brand-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          {/* Quick Access Action Bar for Mobile */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 mb-2">
            <Link
              to="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-brand-900 text-white font-bold text-sm rounded-xl shadow-sm hover:bg-brand-800 transition"
            >
              <Compass className="w-4 h-4 text-brand-300" />
              <span>Browse All Resources</span>
            </Link>
          </div>

          <nav className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/') ? 'bg-brand-50 text-brand-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/resources') ? 'bg-brand-50 text-brand-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Explore Catalog & Filters
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/about') ? 'bg-brand-50 text-brand-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              About ShareSphere
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/contact') ? 'bg-brand-50 text-brand-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Support & Contact
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive('/help') ? 'bg-brand-50 text-brand-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Help & Lab Policies
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3.5 py-2.5 text-sm font-bold text-brand-900 bg-brand-50 rounded-xl"
                >
                  <LayoutDashboard className="w-5 h-5 text-brand-700" />
                  <span className="capitalize">Dashboard ({user.role})</span>
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold text-white bg-rose-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 rounded-xl transition shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
