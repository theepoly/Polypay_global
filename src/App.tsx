import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/AppLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import KycPage from '@/pages/auth/KycPage';
import TwoFactorPage from '@/pages/auth/TwoFactorPage';
import DashboardPage from '@/pages/DashboardPage';
import SwapPage from '@/pages/SwapPage';
import WalletsPage from '@/pages/WalletsPage';
import TransactionsPage from '@/pages/TransactionsPage';
import RatesPage from '@/pages/RatesPage';
import SettingsPage from '@/pages/SettingsPage';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50 dark:bg-navy-950">
        <Loader2 size={40} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50 dark:bg-navy-950">
        <Loader2 size={40} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/kyc" element={<ProtectedRoute><KycPage /></ProtectedRoute>} />
      <Route path="/2fa" element={<ProtectedRoute><TwoFactorPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/swap" element={<ProtectedRoute><SwapPage /></ProtectedRoute>} />
      <Route path="/wallets" element={<ProtectedRoute><WalletsPage /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
      <Route path="/rates" element={<ProtectedRoute><RatesPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
