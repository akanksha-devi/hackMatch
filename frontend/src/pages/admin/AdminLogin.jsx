import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Shield, ShieldAlert, Mail, Lock, ArrowRight, CheckCircle, School } from 'lucide-react';
import { PageTransition } from '../../animations';
import { SpatialCard, SpatialButton, SpatialInput } from '../../components/spatial';

export const AdminLogin = () => {
  const { login, logout, isAdmin } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role !== 'superAdmin' && loggedUser.role !== 'collegeAdmin') {
        logout();
        setError('Access Denied: Administrative credentials required. Student accounts must use the student login.');
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${isLight ? 'bg-slate-50/85 text-slate-900' : 'bg-[#07090e]/75 text-gray-100'} font-sans relative z-10 transition-colors duration-300`}>
      <PageTransition className="flex items-center justify-center w-full">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/10">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Administrator Portal
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            Sign in to manage college isolation, student verification, and moderation
          </p>
        </div>

        {/* Demo Fast-Fill Card */}
        <SpatialCard elevation="flat" padding="compact" className="space-y-2.5">
          <p className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-400'} flex items-center gap-1.5`}>
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            Quick Demo Sign-in:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <SpatialButton
              type="button"
              variant="outline"
              size="md"
              onClick={() => fillDemoAccount('superadmin@hackmatch.com', 'Admin@123')}
              className="flex-col !items-start text-left h-auto py-2.5 px-3 space-y-0.5"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-purple-600 dark:text-purple-400">
                <Shield className="w-3.5 h-3.5 text-purple-500" />
                <span>Super Admin</span>
              </div>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'} font-normal`}>Platform-Wide Access</p>
            </SpatialButton>

            <SpatialButton
              type="button"
              variant="outline"
              size="md"
              onClick={() => fillDemoAccount('admin@kiet.edu', 'Admin@123')}
              className="flex-col !items-start text-left h-auto py-2.5 px-3 space-y-0.5"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-600 dark:text-indigo-400">
                <School className="w-3.5 h-3.5 text-indigo-500" />
                <span>KIET Admin</span>
              </div>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'} font-normal`}>Campus-Scoped</p>
            </SpatialButton>
          </div>
        </SpatialCard>

        {/* Form */}
        <SpatialCard as="form" onSubmit={handleSubmit} elevation="floating" padding="large" className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <SpatialInput
            id="admin-email"
            label="Admin Email"
            type="email"
            required
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@kiet.edu"
          />

          <SpatialInput
            id="admin-password"
            label="Password"
            type="password"
            required
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <SpatialButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Verify & Enter Console
          </SpatialButton>
        </SpatialCard>

        <div className="text-center">
          <Link to="/login" className={`text-xs ${isLight ? 'text-slate-600 hover:text-indigo-600' : 'text-gray-400 hover:text-indigo-300'} transition-colors`}>
            ← Switch to Student Login
          </Link>
        </div>
      </div>
      </PageTransition>
    </div>
  );
};

export default AdminLogin;
