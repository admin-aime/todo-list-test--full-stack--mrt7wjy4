import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './hooks/useAuth';
import { useContext } from 'react';
import { FeedbackProvider } from '@aime-platform/aime-feedback-module';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import ModelOverview from './pages/ModelOverview';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const captureMode =
    import.meta.env.DEV && (window as any).__CAPTURE_MODE__ === true;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user && !captureMode) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  useEffect(() => {
    (window as any).__APP_ROUTES__ = [
      '/login',
      '/register',
      '/dashboard',
      '/tasks',
      '/model-overview',
    ];
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/model-overview" element={<ModelOverview />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <FeedbackProvider
      projectId="6a5e1866d0111e8be007faf9"
      projectsMsBaseUrl={import.meta.env.VITE_FEEDBACK_PROJECTS_MS_URL}
      projectsMsToken={import.meta.env.VITE_FEEDBACK_PROJECTS_MS_TOKEN}
      filesMsApiBaseUrl={import.meta.env.VITE_FEEDBACK_FILES_MS_URL}
      filesMsToken={import.meta.env.VITE_FEEDBACK_FILES_MS_TOKEN}
      teamsUrl={import.meta.env.VITE_PROJECT_TOOLS_URL}
      notifyUsers={import.meta.env.VITE_FEEDBACK_NOTIFY_USERS}
    >
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </FeedbackProvider>
  );
}
