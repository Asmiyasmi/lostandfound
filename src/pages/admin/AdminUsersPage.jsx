import { useState, useRef } from 'react';
import { Users, Search, Shield, Trash2, Ban, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import GlareHover from '../../components/effects/GlareHover';
import VariableProximity from '../../components/effects/VariableProximity';

export default function AdminUsersPage() {
  const { users, removeUser, suspendUser } = useAuth();
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { type, userId, name }
  const containerRef = useRef(null);

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.ktuId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = () => {
    if (confirmAction.type === 'remove') removeUser(confirmAction.userId);
    if (confirmAction.type === 'suspend') suspendUser(confirmAction.userId);
    setConfirmAction(null);
  };

  return (
    <div className="content-container py-8">
      <div className="bg-orb bg-orb-1" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3" ref={containerRef}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Users size={18} className="text-primary-400" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">
                <VariableProximity
                  label="User Management"
                  containerRef={containerRef}
                  fromFontVariationSettings="'wght' 400, 'opsz' 9"
                  toFontVariationSettings="'wght' 1000, 'opsz' 40"
                  radius={120}
                  falloff="linear"
                />
              </h1>
              <p className="text-slate-400 text-sm">{users.length} registered users</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by name, email, or KTU ID..." />
        </div>

        {/* Table */}
        <GlareHover
          borderRadius="24px"
          borderColor="rgba(99,102,241,0.2)"
          background="var(--gradient-card)"
          width="100%"
          height="100%"
        >
          <div className="overflow-hidden w-full h-full" style={{ background: 'transparent', border: 'none' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['User', 'KTU ID', 'Department', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: 'var(--gradient-primary)' }}>
                            {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{user.ktuId || '—'}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{user.department || '—'}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{user.phone || '—'}</td>
                      <td className="px-4 py-3">
                        {user.suspended ? (
                          <span className="badge badge-rejected text-[10px]">Suspended</span>
                        ) : (
                          <span className="badge badge-approved text-[10px]">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setConfirmAction({ type: 'suspend', userId: user.id, name: user.name })}
                            title={user.suspended ? 'Unsuspend' : 'Suspend'}
                            className={`p-1.5 rounded-lg transition-all ${user.suspended ? 'text-green-400 hover:bg-green-500/15' : 'text-yellow-400 hover:bg-yellow-500/15'}`}>
                            {user.suspended ? <CheckCircle size={14} /> : <Ban size={14} />}
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'remove', userId: user.id, name: user.name })}
                            title="Remove user"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Users size={40} className="mx-auto mb-2 opacity-20" />
                  <p>No users match your search</p>
                </div>
              )}
            </div>
          </div>
        </GlareHover>
      </div>

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="glass rounded-3xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: confirmAction.type === 'remove' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)' }}>
                {confirmAction.type === 'remove' ? <Trash2 size={20} className="text-red-400" /> : <Ban size={20} className="text-yellow-400" />}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {confirmAction.type === 'remove' ? 'Remove User' : 'Suspend User'}
              </h3>
              <p className="text-slate-400 text-sm mb-5">
                Are you sure you want to {confirmAction.type} <span className="text-white font-semibold">{confirmAction.name}</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction(null)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button onClick={handleAction}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all ${confirmAction.type === 'remove' ? 'bg-red-600 hover:bg-red-500' : 'bg-yellow-600 hover:bg-yellow-500'}`}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
