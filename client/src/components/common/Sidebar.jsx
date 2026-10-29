import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  Bell,
  User,
  Settings,
  Package,
  PlusCircle,
  Clock,
  FileCheck2,
  AlertTriangle,
  Users,
  ShieldCheck,
  FileText,
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const { user, isStudent, isOwner, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resources', label: 'Explore Resources', icon: Compass },
    { to: '/my-bookings', label: 'My Bookings', icon: CalendarCheck },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const ownerLinks = [
    { to: '/owner', label: 'Overview', icon: LayoutDashboard },
    { to: '/owner/resources', label: 'My Resources', icon: Package },
    { to: '/owner/resources/new', label: 'Add Resource', icon: PlusCircle },
    { to: '/owner/requests', label: 'Booking Requests', icon: Clock },
    { to: '/owner/availability', label: 'Availability', icon: CalendarCheck },
    { to: '/owner/reports', label: 'Condition & Incidents', icon: FileCheck2 },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/profile', label: 'Owner Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/resources', label: 'Resource Moderation', icon: ShieldCheck },
    { to: '/admin/bookings', label: 'Booking Oversight', icon: CalendarCheck },
    { to: '/admin/incidents', label: 'Incidents & Safety', icon: AlertTriangle },
    { to: '/admin/audit-logs', label: 'Audit Trail', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ];

  let links = studentLinks;
  let roleTitle = 'Student Portal';
  let roleBadgeColor = 'bg-blue-100 text-blue-800';

  if (isAdmin) {
    links = adminLinks;
    roleTitle = 'Admin Console';
    roleBadgeColor = 'bg-purple-100 text-purple-800';
  } else if (isOwner) {
    links = ownerLinks;
    roleTitle = 'Resource Owner';
    roleBadgeColor = 'bg-emerald-100 text-emerald-800';
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex flex-shrink-0">
      <div>
        {/* User Card */}
        <div className="flex items-center space-x-3 p-3 mb-6 bg-slate-50/80 rounded-2xl border border-slate-100">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name}`}
            alt={user?.full_name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-900 truncate leading-tight">{user?.full_name}</h4>
            <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${roleBadgeColor}`}>
              {roleTitle}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard' || link.to === '/owner' || link.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition group ${
                    isActive
                      ? 'bg-brand-900 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive ? 'bg-white text-brand-900' : 'bg-rose-500 text-white'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Campus Safety Badge */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-gradient-to-br from-brand-50 to-blue-50/50 rounded-xl border border-brand-100">
          <div className="flex items-center space-x-2 text-brand-900 font-medium text-xs mb-1">
            <Activity className="w-3.5 h-3.5 text-brand-600" />
            <span>ShareSphere Live</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Need urgent laboratory access? Contact the department help desk.
          </p>
        </div>
      </div>
    </aside>
  );
}
