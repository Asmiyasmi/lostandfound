import { useRef } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { formatDistanceToNow } from '../utils/helpers';

const typeColors = {
  claim: '#f97316',
  approved: '#4ade80',
  rejected: '#f87171',
  admin: '#a5b4fc',
  returned: '#4ade80',
  comment: '#fb923c',
  info: '#94a3b8',
};

const typeIcons = {
  claim: '📬',
  approved: '✅',
  rejected: '❌',
  admin: '🛡️',
  returned: '📦',
  comment: '💬',
  info: '🔔',
};

export default function NotificationsPanel({ onClose }) {
  const { currentUser } = useAuth();
  const { notifications, markNotifRead, markAllRead } = useData();

  const userNotifs = notifications
    .filter(n => n.userId === currentUser?.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="absolute right-0 top-12 w-80 glass rounded-2xl shadow-2xl border border-white/10 animate-fade-in z-50" style={{ maxHeight: '420px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary-400" />
          <span className="text-sm font-semibold text-white">Notifications</span>
          {userNotifs.filter(n => !n.read).length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white" style={{ background: 'var(--gradient-accent)' }}>
              {userNotifs.filter(n => !n.read).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => markAllRead(currentUser?.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="Mark all read"
          >
            <CheckCheck size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {userNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Bell size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          userNotifs.map(notif => (
            <div
              key={notif.id}
              onClick={() => markNotifRead(notif.id)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all border-b border-white/5 hover:bg-white/5 ${!notif.read ? 'bg-primary-500/5' : ''}`}
            >
              <span className="text-lg shrink-0 mt-0.5">{typeIcons[notif.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-200 leading-relaxed">{notif.message}</p>
                <p className="text-xs mt-1" style={{ color: typeColors[notif.type] || '#94a3b8' }}>
                  {formatDistanceToNow(notif.timestamp)}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
