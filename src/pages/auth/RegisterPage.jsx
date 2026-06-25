import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, BookOpen, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import VariableProximity from '../../components/effects/VariableProximity';
import GlareHover from '../../components/effects/GlareHover';


const DEPARTMENTS_LIST = [
  'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical',
  'Information Technology', 'Chemical', 'Biotechnology', 'Architecture', 'MBA', 'MCA',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    ktuId: '', phone: '', department: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const [confirmMsg, setConfirmMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setConfirmMsg('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    const result = await register({ ...form });
    setLoading(false);
    if (result.success) {
      if (result.requiresConfirmation) {
        setConfirmMsg(result.message);
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative py-8" style={{ background: 'var(--gradient-hero)' }}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div className="w-full max-w-md px-4 relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 glow-primary" style={{ background: 'var(--gradient-primary)' }}>
            <span className="text-white font-bold text-lg">L&F</span>
          </div>
          <div ref={containerRef} style={{ position: 'relative' }}>
            <h1 className="font-display font-black text-2xl text-white mb-1" style={{ letterSpacing: '-0.03em' }}>
              <VariableProximity
                label="Create Account"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={120}
              />
            </h1>
          </div>
          <p className="text-slate-400 text-sm">Join the Campus Lost & Found community</p>
        </div>

        <GlareHover
          background="rgba(17,17,39,0.85)"
          borderRadius="24px"
          borderColor="rgba(99,102,241,0.25)"
          glareOpacity={0.1}
          transitionDuration={900}
          style={{ width: '100%', height: 'auto', padding: '28px' }}
        >
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <AlertCircle size={15} />{error}
            </div>
          )}

          {confirmMsg && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-sm mb-4 text-center">
              <div className="text-2xl mb-2">📧</div>
              <p className="font-semibold mb-1">Check your email!</p>
              <p className="text-xs text-green-300/80">{confirmMsg}</p>
              <Link to="/login" className="inline-block mt-3 text-xs font-semibold text-primary-400 hover:text-primary-300">
                Go to Login →
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input name="name" required value={form.name} onChange={handleChange}
                  className="input-field pl-10" placeholder="Your full name" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Campus Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  className="input-field pl-10" placeholder="you@campus.edu" />
              </div>
            </div>

            {/* KTU ID */}
            <div>
              <label className="form-label">KTU ID</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input name="ktuId" required value={form.ktuId} onChange={handleChange}
                  className="input-field pl-10" placeholder="KTU2021CS001" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
                  className="input-field pl-10" placeholder="10-digit mobile number" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="form-label">Department</label>
              <select name="department" required value={form.department} onChange={handleChange} className="input-field select">
                <option value="">Select Department</option>
                {DEPARTMENTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input name="password" type={showPwd ? 'text' : 'password'} required
                  value={form.password} onChange={handleChange}
                  className="input-field pl-10 pr-10" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input name="confirmPassword" type="password" required
                  value={form.confirmPassword} onChange={handleChange}
                  className="input-field pl-10" placeholder="Repeat your password" />
              </div>
            </div>

            <button id="register-submit" type="submit" disabled={loading}
              className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : (
                <><span>Create Account</span><ChevronRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">
              Sign in
            </Link>
          </p>
        </GlareHover>
      </div>
    </div>
  );
}
