import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';

// Student Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { BrowseUsers } from './pages/BrowseUsers';
import { Hackathons } from './pages/Hackathons';
import { HackathonDetail } from './pages/HackathonDetail';
import { PostTeamRequest } from './pages/PostTeamRequest';
import { MyRequests } from './pages/MyRequests';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { Notifications } from './pages/Notifications';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminColleges } from './pages/admin/AdminColleges';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminTeamRequests } from './pages/admin/AdminTeamRequests';
import { AdminHackathons } from './pages/admin/AdminHackathons';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminVerification } from './pages/admin/AdminVerification';

// Animation Architecture
import { AnimationBackground, PageTransition, AnimationProvider } from './animations';

// Student Layout Wrapper (Header + Main + Footer)
const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-[#07090e]/75 text-gray-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans relative z-10">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AnimationProvider>
        <AnimationBackground isRoot />
        <Routes>
          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
          <Route index element={<AdminDashboard />} />
          <Route
            path="colleges"
            element={
              <ProtectedAdminRoute requireSuperAdmin>
                <AdminColleges />
              </ProtectedAdminRoute>
            }
          />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="team-requests" element={<AdminTeamRequests />} />
          <Route path="hackathons" element={<AdminHackathons />} />
          <Route
            path="audit-logs"
            element={
              <ProtectedAdminRoute requireSuperAdmin>
                <AdminAuditLogs />
              </ProtectedAdminRoute>
            }
          />
        </Route>

        {/* ================= STUDENT & PUBLIC ROUTES ================= */}
        <Route element={<StudentLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/hackathons/:id" element={<HackathonDetail />} />

          {/* Protected Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <BrowseUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-request"
            element={
              <ProtectedRoute>
                <PostTeamRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-requests/create"
            element={<Navigate to="/post-request" replace />}
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="py-24 text-center space-y-4">
                <h2 className="text-4xl font-extrabold text-white">404 - Page Not Found</h2>
                <p className="text-sm text-gray-400">
                  The page you're looking for doesn't exist or has been moved.
                </p>
                <a
                  href="/dashboard"
                  className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Return to Dashboard
                </a>
              </div>
            }
          />
        </Route>
      </Routes>
    </AnimationProvider>
  </AuthProvider>
  );
}
