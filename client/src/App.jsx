import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import useAuthStore from './store/authStore';
import useSocket from './hooks/useSocket';
import ToastContainer from './components/ui/Toast';
import './styles/index.css';

// Lazy imports
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Exercises = lazy(() => import('./pages/exercises/Exercises'));
const WorkoutPlans = lazy(() => import('./pages/workouts/WorkoutPlans'));
const WorkoutHistory = lazy(() => import('./pages/workouts/WorkoutHistory'));
const Nutrition = lazy(() => import('./pages/nutrition/Nutrition'));
const Goals = lazy(() => import('./pages/goals/Goals'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const Profile = lazy(() => import('./pages/profile/Profile'));

// Lazy stubs for remaining pages
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0F14' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #C8F135, #A8D020)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem', margin: '0 auto 16px', animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        ⚡
      </div>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  </div>
);

// Route guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppContent = () => {
  // Initialize socket connection
  useSocket();

  // Rehydrate auth token
  const { accessToken } = useAuthStore();
  useEffect(() => {
    if (accessToken) {
      import('./services/api').then(({ default: api }) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      });
    }
  }, [accessToken]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/exercises" element={<PrivateRoute><Exercises /></PrivateRoute>} />
        <Route path="/workouts" element={<PrivateRoute><WorkoutPlans /></PrivateRoute>} />
        <Route path="/workout-history" element={<PrivateRoute><WorkoutHistory /></PrivateRoute>} />
        <Route path="/nutrition" element={<PrivateRoute><Nutrition /></PrivateRoute>} />
        <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile/settings" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
    <ToastContainer />
  </BrowserRouter>
);

export default App;
