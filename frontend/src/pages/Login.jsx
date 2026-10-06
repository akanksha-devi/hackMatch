import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Zap, Mail, Lock, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { SpatialCard, SpatialButton, SpatialInput } from '../components/spatial';

export const Login = () => {
  const { login } = useAuth();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Instant fill for demo accounts
  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h2 className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Welcome Back</h2>
          <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Log in to manage your hackathon teams & responses</p>
        </div>

        {/* Demo Account Fill Bar */}
        <SpatialCard elevation="flat" padding="compact" className="space-y-2">
          <p className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-400'} flex items-center gap-1.5`}>
            <UserCheck className="w-4 h-4 text-cyan-400" />
            Quick Demo Accounts (Click to Fill):
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <SpatialButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillDemoAccount('alex@example.com', 'password123')}
              className="text-left truncate font-semibold"
            >
              Alex (Full-Stack)
            </SpatialButton>
            <SpatialButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillDemoAccount('priya@example.com', 'password123')}
              className="text-left truncate font-semibold"
            >
              Priya (AI Eng)
            </SpatialButton>
            <SpatialButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fillDemoAccount('sophia@example.com', 'password123')}
              className="text-left truncate font-semibold"
            >
              Sophia (UI/UX)
            </SpatialButton>
          </div>
        </SpatialCard>

        {/* Login Form */}
        <SpatialCard as="form" onSubmit={handleSubmit} elevation="floating" padding="large" className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="login-email" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Email Address</label>
            <SpatialInput
              id="login-email"
              type="email"
              required
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Password</label>
            <SpatialInput
              id="login-password"
              type="password"
              required
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <SpatialButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Sign In
          </SpatialButton>
        </SpatialCard>

        <p className={`text-center text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          Don't have a HackMatch account?{' '}
          <Link to="/signup" className={`font-semibold hover:underline ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
            Create Profile
          </Link>
        </p>

      </div>
    </div>
  );
};
