import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Mail, MapPin, Phone, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-sans">
                Share<span className="text-blue-500">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              “Share Resources. Unlock Possibilities.” Empowering university campuses and research institutes to seamlessly share scientific equipment, laboratories, maker spaces, and meeting rooms.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="inline-flex items-center">
                <Shield className="w-4 h-4 text-emerald-400 mr-1.5" />
                Verified Campus Access
              </span>
              <span>•</span>
              <span>Audit Logged</span>
              <span>•</span>
              <span>Real-Time Scheduling</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/resources" className="hover:text-white transition">All Resources</Link></li>
              <li><Link to="/resources?category=Laboratory+Equipment" className="hover:text-white transition">Lab Instruments</Link></li>
              <li><Link to="/resources?type=space" className="hover:text-white transition">Meeting Rooms</Link></li>
              <li><Link to="/resources?category=Engineering+%26+Prototyping" className="hover:text-white transition">3D Makerspace</Link></li>
              <li><Link to="/resources?category=Computing+%26+AI" className="hover:text-white transition">GPU Clusters</Link></li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/dashboard" className="hover:text-white transition">Student Hub</Link></li>
              <li><Link to="/owner" className="hover:text-white transition">Owner Management</Link></li>
              <li><Link to="/admin" className="hover:text-white transition">Administrative Console</Link></li>
              <li><Link to="/help" className="hover:text-white transition">Booking Policies & FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Help Desk</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Campus Desk</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <span>Central Innovation & Research Complex, Campus Tower A</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>support@sharesphere.edu</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span>+1 (555) 019-9200</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShareSphere Platform. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <Link to="/about" className="hover:text-slate-300">About</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
            <Link to="/help" className="hover:text-slate-300">Policies & Terms</Link>
            <Link to="/help" className="hover:text-slate-300">Privacy & Auditing</Link>
          </div>
        </div>

        {/* Demo Data Disclaimer */}
        <div className="pt-4 text-[11px] text-slate-500 text-center">
          <p>
            * Demonstration Environment: ShareSphere is an academic prototype. Listings, hourly fees, contact numbers, and campus directories shown are simulated demonstration data.
          </p>
        </div>
      </div>
    </footer>
  );
}
