import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/HomePage';
import LostItemsPage from './pages/LostItemsPage';
import FoundItemsPage from './pages/FoundItemsPage';
import SearchPage from './pages/SearchPage';
import ReportLostPage from './pages/ReportLostPage';
import ReportFoundPage from './pages/ReportFoundPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminClaimsPage from './pages/admin/AdminClaimsPage';

function AppLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <Navbar onMenuToggle={() => setMenuOpen(o => !o)} menuOpen={menuOpen} />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="page-container">
        {children}
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected student routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><HomePage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/lost-items" element={
              <ProtectedRoute>
                <AppLayout><LostItemsPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/found-items" element={
              <ProtectedRoute>
                <AppLayout><FoundItemsPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <AppLayout><SearchPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/report/lost" element={
              <ProtectedRoute>
                <AppLayout><ReportLostPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/report/found" element={
              <ProtectedRoute>
                <AppLayout><ReportFoundPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout><ProfilePage /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AppLayout><AdminDashboardPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <AppLayout><AdminUsersPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/posts" element={
              <ProtectedRoute adminOnly>
                <AppLayout><AdminPostsPage /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/claims" element={
              <ProtectedRoute adminOnly>
                <AppLayout><AdminClaimsPage /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
