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
const Pricing = lazy(() => import('./pages/Pricing'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Faq = lazy(() => import('./pages/Faq'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Contact = lazy(() => import('./pages/Contact'));

// Lazy stubs for remaining pages
const NotFound = lazy(() => import('./pages/NotFound'));

// LogoIcon import for loading screen
import { LogoIcon } from './components/ui/Logo';

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0F14' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '14px',
        background: '#12151C', border: '1.5px solid #C8F135',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', animation: 'pulse 1.5s ease-in-out infinite',
        boxShadow: '0 0 15px rgba(200, 241, 53, 0.2)'
      }}>
        <LogoIcon size={30} />
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

        {/* Public Footer pages */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/contact" element={<Contact />} />

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
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AppContent />
    <ToastContainer />
  </BrowserRouter>
);

export default App;
