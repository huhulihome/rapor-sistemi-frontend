import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/common/ToastContainer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';
import { PWAUpdatePrompt } from './components/common/PWAUpdatePrompt';
import { NotificationPermissionPrompt } from './components/common/NotificationPermissionPrompt';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ProfilePage = lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Tasks = lazy(() => import('./pages/Tasks').then(m => ({ default: m.Tasks })));
const TaskNew = lazy(() => import('./pages/TaskNew').then(m => ({ default: m.TaskNew })));
const TaskDetailPage = lazy(() => import('./components/tasks/TaskDetail').then(m => ({ default: m.TaskDetail })));
const Issues = lazy(() => import('./pages/Issues').then(m => ({ default: m.Issues })));
const AdminIssues = lazy(() => import('./pages/AdminIssues').then(m => ({ default: m.AdminIssues })));
const Users = lazy(() => import('./pages/Users').then(m => ({ default: m.Users })));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <PWAInstallPrompt />
              <PWAUpdatePrompt />
              <NotificationPermissionPrompt />
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-900">
                  <LoadingSpinner size="lg" message="Yükleniyor..." />
                </div>
              }>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <ProtectedRoute>
                        <Tasks />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tasks/new"
                    element={
                      <ProtectedRoute>
                        <TaskNew />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tasks/:id"
                    element={
                      <ProtectedRoute>
                        <TaskDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/issues"
                    element={
                      <ProtectedRoute>
                        <Issues />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/issues"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminIssues />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute requireAdmin>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

