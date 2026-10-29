import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts & Protection
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import ExploreResources from './pages/public/ExploreResources';
import ResourceDetails from './pages/public/ResourceDetails';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Help from './pages/public/Help';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyBookings from './pages/student/MyBookings';
import BookingDetails from './pages/student/BookingDetails';
import Notifications from './pages/student/Notifications';
import Profile from './pages/student/Profile';
import Settings from './pages/student/Settings';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyResources from './pages/owner/MyResources';
import AddResource from './pages/owner/AddResource';
import EditResource from './pages/owner/EditResource';
import BookingRequests from './pages/owner/BookingRequests';
import AvailabilityManagement from './pages/owner/AvailabilityManagement';
import OwnerReports from './pages/owner/OwnerReports';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ResourceModeration from './pages/admin/ResourceModeration';
import BookingManagement from './pages/admin/BookingManagement';
import IncidentManagement from './pages/admin/IncidentManagement';
import AuditLogs from './pages/admin/AuditLogs';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/resources" element={<ExploreResources />} />
              <Route path="/resources/:id" element={<ResourceDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<Help />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Student & Shared Dashboard Layout */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['student', 'owner', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/my-bookings/:id" element={<BookingDetails />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Owner Management Dashboard Layout */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/owner/resources" element={<MyResources />} />
              <Route path="/owner/resources/new" element={<AddResource />} />
              <Route path="/owner/resources/:id/edit" element={<EditResource />} />
              <Route path="/owner/requests" element={<BookingRequests />} />
              <Route path="/owner/availability" element={<AvailabilityManagement />} />
              <Route path="/owner/reports" element={<OwnerReports />} />
            </Route>

            {/* Administrator Management Dashboard Layout */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/resources" element={<ResourceModeration />} />
              <Route path="/admin/bookings" element={<BookingManagement />} />
              <Route path="/admin/incidents" element={<IncidentManagement />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
