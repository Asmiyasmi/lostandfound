import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, AlertTriangle, CheckCircle, User, BookmarkCheck, Bell, Settings, LogOut, X, Plus, Shield, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); onClose(); };

  const studentLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search Items' },
    { to: '/lost-items', icon: AlertTriangle, label: 'Lost Items' },
    { to: '/found-items', icon: CheckCircle, label: 'Found Items' },
    { to: '/report/lost', icon: Plus, label: 'Report Lost', accent: true },
    { to: '/report/found', icon: Plus, label: 'Report Found', primary: true },
    { to: '/profile', icon: User, label: 'My Profile' },
    { to: '/profile?tab=saved', icon: BookmarkCheck, label: 'Saved Posts' },
    { to: '/profile?tab=notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile?tab=settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin', icon: BarChart2, label: 'Dashboard' },
    { to: '/admin/users', icon: User, label: 'Users' },
    { to: '/admin/posts', icon: AlertTriangle, label: 'All Posts' },
    { to: '/admin/claims', icon: CheckCircle, label: 'Claims' },
    { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
  ];

  const links = currentUser?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 z-50 glass border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <span className="text-white font-bold text-sm">L&F</span>
            </div>
            <span className="font-display font-bold text-white" style={{ letterSpacing: '-0.02em' }}>CampusLF</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        {currentUser && (
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
                {currentUser.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.role === 'admin' ? 'Administrator' : currentUser.department}</p>
              </div>
              {currentUser.role === 'admin' && (
                <Shield size={14} className="text-primary-400 shrink-0" />
              )}
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {links.map(({ to, icon: Icon, label, accent, primary }) => {
            const isActive = location.pathname === to && !to.includes('?');
            return (
              <Link key={to} to={to} onClick={onClose}>
                <div className={`nav-item ${isActive ? 'active' : ''}`} style={accent ? { color: '#fb923c' } : primary ? { color: '#a5b4fc' } : {}}>
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {currentUser && (
          <div className="p-3 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
