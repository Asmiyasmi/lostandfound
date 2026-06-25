import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Menu, X, Plus, LogOut, User, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import NotificationsPanel from '../NotificationsPanel';

export default function Navbar({ onMenuToggle, menuOpen }) {
  const { currentUser, logout } = useAuth();
  const { notifications } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unread = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="content-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <span className="text-white font-bold text-sm">L&F</span>
            </div>
            <span className="font-display font-bold text-white hidden sm:block" style={{ fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              Campus<span className="text-gradient">LostFound</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                className="input-field pl-10 py-2 text-sm"
                placeholder="Search lost & found items..."
                style={{ borderRadius: '10px' }}
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {currentUser && currentUser.role !== 'admin' && (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/report/lost">
                  <button className="btn-accent flex items-center gap-1.5 py-2 px-3 text-xs">
                    <Plus size={14} /> Lost
                  </button>
                </Link>
                <Link to="/report/found">
                  <button className="btn-primary flex items-center gap-1.5 py-2 px-3 text-xs">
                    <Plus size={14} /> Found
                  </button>
                </Link>
              </div>
            )}

            {/* Notifications */}
            {currentUser && (
              <div className="relative" ref={notifRef}>
                <button
                  id="notif-btn"
                  onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
                  className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Bell size={20} />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
              </div>
            )}

            {/* Profile */}
            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  id="profile-btn"
                  onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  {currentUser.profileImage ? (
                    <img src={currentUser.profileImage} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
                      {initials}
                    </div>
                  )}
                </button>
                {showProfile && (
                  <div className="absolute right-0 top-12 w-52 glass rounded-2xl p-2 shadow-2xl border border-white/10 animate-fade-in">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    {currentUser.role === 'admin' ? (
                      <Link to="/admin" onClick={() => setShowProfile(false)}>
                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                          <Shield size={15} /> Admin Dashboard
                        </button>
                      </Link>
                    ) : (
                      <Link to="/profile" onClick={() => setShowProfile(false)}>
                        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all">
                          <User size={15} /> My Profile
                        </button>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all mt-1"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><button className="btn-secondary py-2 px-4 text-sm">Login</button></Link>
                <Link to="/register"><button className="btn-primary py-2 px-4 text-sm hidden sm:block">Register</button></Link>
              </div>
            )}

            {/* Mobile menu */}
            <button
              id="mobile-menu-btn"
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              onClick={onMenuToggle}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
