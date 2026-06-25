import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import VariableProximity from '../../components/effects/VariableProximity';
import GlareHover from '../../components/effects/GlareHover';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [tab, setTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password, tab === 'admin');
    if (result.success) {
      navigate(result.user?.role === 'admin' ? '/admin' : '/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'var(--gradient-hero)' }}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div className="w-full max-w-md px-4 relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 glow-primary" style={{ background: 'var(--gradient-primary)' }}>
            <span className="text-white font-bold text-xl">L&F</span>
          </div>
          <div ref={containerRef} style={{ position: 'relative' }}>
            <h1 className="font-display font-black text-3xl text-white mb-1" style={{ letterSpacing: '-0.03em' }}>
              <VariableProximity
                label="Welcome Back"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={120}
                falloff="linear"
              />
            </h1>
          </div>
          <p className="text-slate-400 text-sm">Sign in to Campus Lost & Found Portal</p>
        </div>

        <GlareHover
          background="rgba(17,17,39,0.8)"
          borderRadius="24px"
          borderColor="rgba(99,102,241,0.25)"
          glareColor="#ffffff"
          glareOpacity={0.12}
          glareAngle={-30}
          glareSize={300}
          transitionDuration={900}
          style={{ width: '100%', height: 'auto', padding: '32px' }}
        >
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              id="student-tab"
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'student' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              onClick={() => { setTab('student'); setError(''); }}
            >
              Student Login
            </button>
            <button
              id="admin-tab"
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${tab === 'admin' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              onClick={() => { setTab('admin'); setError(''); }}
            >
              <Shield size={14} /> Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div>
              <label className="form-label">{tab === 'admin' ? 'Admin Email' : 'Email'}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder={tab === 'admin' ? 'admin@campus.edu' : 'you@campus.edu'}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  id="password-input"
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {tab === 'admin' && (
              <p className="text-xs text-slate-500 bg-white/5 rounded-xl p-3">
                🔐 Demo credentials: <span className="text-slate-300">admin@campus.edu</span> / <span className="text-slate-300">admin123</span>
              </p>
            )}
            {tab === 'student' && (
              <p className="text-xs text-slate-500 bg-white/5 rounded-xl p-3">
                🎓 Demo: <span className="text-slate-300">alex@campus.edu</span> / <span className="text-slate-300">password123</span>
              </p>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                `Sign in as ${tab === 'admin' ? 'Admin' : 'Student'}`
              )}
            </button>
          </form>

          {tab === 'student' && (
            <p className="text-center text-sm text-slate-400 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                Register here
              </Link>
            </p>
          )}
        </GlareHover>
      </div>
    </div>
  );
}
