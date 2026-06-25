import { useState, useRef } from 'react';
import { User, Bell, Bookmark, Settings, AlertTriangle, CheckCircle, Clock, MapPin, Edit2, Save, X, Camera, Trophy, Trash2, Archive, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { formatDistanceToNow, formatDate } from '../utils/helpers';
import GlareHover from '../components/effects/GlareHover';
import VariableProximity from '../components/effects/VariableProximity';

const TABS = [
  { id: 'posts', label: 'My Posts', icon: AlertTriangle },
  { id: 'rewards', label: 'Leaderboard', icon: Trophy },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function EditPostModal({ item, type, onClose, onSave }) {
  const [form, setForm] = useState({
    itemName: item.itemName,
    description: item.description,
    location: item.location,
    ...(type === 'found' ? { storageLocation: item.storageLocation || '' } : {})
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item.id, form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass rounded-3xl p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-4">Edit Report</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Item Name</label>
            <input value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} required className="input-field" />
          </div>
          <div>
            <label className="form-label">Location</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required className="input-field" />
          </div>
          {type === 'found' && (
            <div>
              <label className="form-label">Storage Location</label>
              <input value={form.storageLocation} onChange={e => setForm(f => ({ ...f, storageLocation: e.target.value }))} className="input-field" />
            </div>
          )}
          <div>
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
            <button type="submit" className="btn-primary flex-1 py-2.5">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { currentUser, updateProfile, users } = useAuth();
  const { 
    lostItems, foundItems, savedPosts, notifications, 
    toggleSave, isSaved, markNotifRead, markAllRead,
    updateLostItem, deleteLostItem, updateFoundItem, deleteFoundItem
  } = useData();
  const containerRef = useRef(null);

  const params = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(params.get('tab') || 'posts');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
  });
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const myLostItems = lostItems.filter(i => i.userId === currentUser?.id);
  const myFoundItems = foundItems.filter(i => i.userId === currentUser?.id);
  const myNotifs = notifications.filter(n => n.userId === currentUser?.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const unreadCount = myNotifs.filter(n => !n.read).length;

  const savedItems = savedPosts.map(key => {
    const [type, id] = key.split('-');
    const item = type === 'lost' ? lostItems.find(i => i.id === id) : foundItems.find(i => i.id === id);
    return item ? { ...item, _type: type } : null;
  }).filter(Boolean);

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile(editForm);
      setEditMode(false);
      setSaving(false);
    }, 500);
  };

  const handleSavePostEdit = (id, formData) => {
    if (editingPost.type === 'lost') {
      updateLostItem(id, formData);
    } else {
      updateFoundItem(id, formData);
    }
    setEditingPost(null);
  };

  const leaderboardUsers = [...users]
    .filter(u => u.role !== 'admin')
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const typeColors = { claim: '#f97316', approved: '#4ade80', rejected: '#f87171', admin: '#a5b4fc', info: '#94a3b8' };
  const typeIcons = { claim: '📬', approved: '✅', rejected: '❌', admin: '🛡️', info: '🔔' };

  return (
    <div className="content-container py-8">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="card p-6 mb-6" ref={containerRef}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: 'var(--gradient-primary)' }}>
                {currentUser?.profileImage
                  ? <img src={currentUser.profileImage} className="w-full h-full rounded-2xl object-cover" />
                  : initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center bg-primary-600 text-white shadow-lg hover:bg-primary-500 transition-all">
                <Camera size={13} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {editMode ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">Name</label>
                      <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        className="input-field text-sm py-2" />
                    </div>
                    <div>
                      <label className="form-label">Phone</label>
                      <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        className="input-field text-sm py-2" />
                    </div>
                    <div>
                      <label className="form-label">Department</label>
                      <input value={editForm.department} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                        className="input-field text-sm py-2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                      <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => setEditMode(false)} className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5">
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                    <h2 className="font-display font-bold text-xl text-white">
                      <VariableProximity
                        label={currentUser?.name || ''}
                        containerRef={containerRef}
                        fromFontVariationSettings="'wght' 400, 'opsz' 9"
                        toFontVariationSettings="'wght' 1000, 'opsz' 40"
                        radius={120}
                        falloff="linear"
                      />
                    </h2>
                    <button onClick={() => setEditMode(true)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                      <Edit2 size={14} />
                    </button>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{currentUser?.email}</p>
                  
                  {/* Points and Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3 justify-center sm:justify-start">
                    <span className="text-xs bg-amber-500/10 border border-amber-500/25 text-amber-400 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                      🏆 {currentUser?.points || 0} pts
                    </span>
                    {(currentUser?.badges || []).map(b => (
                      <span key={b} className="text-xs bg-primary-500/10 border border-primary-500/25 text-primary-400 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        🏅 {b}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    {[
                      { label: 'KTU ID', value: currentUser?.ktuId },
                      { label: 'Dept', value: currentUser?.department },
                      { label: 'Phone', value: currentUser?.phone },
                    ].map(({ label, value }) => (
                      <div key={label} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-xs text-slate-500">{label}: </span>
                        <span className="text-xs text-white">{value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 shrink-0">
              {[
                { value: myLostItems.length, label: 'Lost' },
                { value: myFoundItems.length, label: 'Found' },
                { value: savedItems.length, label: 'Saved' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} id={`profile-tab-${id}`}
              className={`tab-btn flex items-center gap-1.5 whitespace-nowrap ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}>
              <Icon size={14} />
              {label}
              {id === 'notifications' && unreadCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-accent-500 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'posts' && (
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">My Lost Reports ({myLostItems.length})</h3>
            {myLostItems.length === 0 ? (
              <div className="card p-8 text-center text-slate-500 mb-5">
                <AlertTriangle size={32} className="mx-auto mb-2 opacity-20" />
                <p>No lost items reported yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {myLostItems.map(item => (
                  <GlareHover
                    key={item.id}
                    borderRadius="20px"
                    borderColor="rgba(99,102,241,0.2)"
                    background="var(--gradient-card)"
                    width="100%"
                    height="100%"
                  >
                    <div className="p-0 overflow-hidden flex flex-col h-full w-full justify-between" style={{ background: 'transparent', border: 'none' }}>
                      <div>
                        {item.images?.[0] && (
                          <img src={item.images[0]} className="w-full h-36 object-cover" />
                        )}
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-white text-sm line-clamp-1">{item.itemName}</h4>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              item.status === 'claimed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              item.status === 'archived' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {item.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mb-2">{item.location}</p>
                          <p className="text-xs text-slate-500">{formatDate(item.dateLost)}</p>
                        </div>
                      </div>

                      <div className="p-3 pt-0 flex items-center gap-1.5 flex-wrap">
                        <button onClick={() => setEditingPost({ item, type: 'lost' })}
                          className="flex items-center gap-1 text-[10px] text-primary-400 hover:text-primary-300 transition-colors bg-white/5 py-1 px-2.5 rounded-lg border border-white/10">
                          <Edit2 size={10} /> Edit
                        </button>
                        {item.status === 'active' && (
                          <>
                            <button onClick={() => updateLostItem(item.id, { status: 'claimed' })}
                              className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 py-1 px-1.5 rounded-lg border border-white/10">
                              <CheckSquare size={10} /> Mark Claimed
                            </button>
                            <button onClick={() => updateLostItem(item.id, { status: 'archived' })}
                              className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors bg-white/5 py-1 px-1.5 rounded-lg border border-white/10">
                              <Archive size={10} /> Archive
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteLostItem(item.id)}
                          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors bg-white/5 py-1 px-2.5 rounded-lg border border-white/10 ml-auto">
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    </div>
                  </GlareHover>
                ))}
              </div>
            )}

            <h3 className="font-semibold text-white mb-3 text-sm">My Found Reports ({myFoundItems.length})</h3>
            {myFoundItems.length === 0 ? (
              <div className="card p-8 text-center text-slate-500">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-20" />
                <p>No found items reported yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myFoundItems.map(item => (
                  <GlareHover
                    key={item.id}
                    borderRadius="20px"
                    borderColor="rgba(99,102,241,0.2)"
                    background="var(--gradient-card)"
                    width="100%"
                    height="100%"
                  >
                    <div className="p-0 overflow-hidden flex flex-col h-full w-full justify-between" style={{ background: 'transparent', border: 'none' }}>
                      <div>
                        {item.images?.[0] && (
                          <img src={item.images[0]} className="w-full h-36 object-cover" />
                        )}
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-white text-sm line-clamp-1">{item.itemName}</h4>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              item.status === 'claimed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              item.status === 'archived' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              {item.status === 'active' ? 'Found' : item.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mb-2">{item.location}</p>
                          <p className="text-xs text-slate-500">{formatDate(item.dateFound)}</p>
                        </div>
                      </div>

                      <div className="p-3 pt-0 flex items-center gap-1.5 flex-wrap">
                        <button onClick={() => setEditingPost({ item, type: 'found' })}
                          className="flex items-center gap-1 text-[10px] text-primary-400 hover:text-primary-300 transition-colors bg-white/5 py-1 px-2.5 rounded-lg border border-white/10">
                          <Edit2 size={10} /> Edit
                        </button>
                        {item.status === 'active' && (
                          <>
                            <button onClick={() => updateFoundItem(item.id, { status: 'claimed' })}
                              className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors bg-white/5 py-1 px-1.5 rounded-lg border border-white/10">
                              <CheckSquare size={10} /> Mark Claimed
                            </button>
                            <button onClick={() => updateFoundItem(item.id, { status: 'archived' })}
                              className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors bg-white/5 py-1 px-1.5 rounded-lg border border-white/10">
                              <Archive size={10} /> Archive
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteFoundItem(item.id)}
                          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors bg-white/5 py-1 px-2.5 rounded-lg border border-white/10 ml-auto">
                          <Trash2 size={10} /> Delete
                        </button>
                      </div>
                    </div>
                  </GlareHover>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Rewards Card */}
            <div className="card p-6 relative overflow-hidden">
              <div className="bg-orb bg-orb-3" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-2">My Rewards Status</h3>
                <p className="text-slate-400 text-sm mb-4">Earn badges and climb the leaderboard by helping classmates retrieve their items.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-xs text-slate-500 mb-1">Total Points</p>
                    <p className="text-3xl font-extrabold text-amber-400">{currentUser?.points || 0}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Current Level Badge</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {currentUser?.points >= 101 ? '👑 Lost & Found Champion' :
                       currentUser?.points >= 51 ? '⚡ Campus Hero' : '🌱 Helpful Student'}
                    </p>
                  </div>
                </div>

                {/* Progress bar to next level */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>Progress to next badge</span>
                    <span>
                      {currentUser?.points >= 101 ? 'Max Rank Reached' :
                       currentUser?.points >= 51 ? `${currentUser.points} / 100 pts` : `${currentUser.points} / 50 pts`}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: currentUser?.points >= 101 ? '100%' :
                               currentUser?.points >= 51 ? `${((currentUser.points - 50) / 50) * 100}%` : `${(currentUser.points / 50) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    🎁 Points Scheme: <span className="text-slate-400">+20</span> points for returning found items · <span className="text-slate-400">+10</span> points for successful claim verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Leaderboard list */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="text-amber-400" size={20} /> Campus Leaderboard
              </h3>
              <div className="space-y-3">
                {leaderboardUsers.map((user, idx) => {
                  const isSelf = user.id === currentUser?.id;
                  const rankIcons = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={user.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isSelf ? 'bg-primary-500/10 border-primary-500/30' : 'bg-white/5 border-white/5'
                      }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center text-sm font-bold text-slate-400 shrink-0">
                          {rankIcons[idx] || `${idx + 1}`}
                        </span>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: isSelf ? 'var(--gradient-accent)' : 'var(--gradient-primary)' }}>
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${isSelf ? 'text-primary-300' : 'text-white'}`}>
                            {user.name} {isSelf && '(You)'}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{user.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {user.points >= 101 ? 'Champion' : user.points >= 51 ? 'Hero' : 'Helper'}
                        </span>
                        <span className="font-bold text-sm text-white bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 shrink-0">
                          {user.points || 0} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {savedItems.length === 0 ? (
              <div className="card p-12 text-center text-slate-500">
                <Bookmark size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium mb-1">No saved posts</p>
                <p className="text-sm">Bookmark items to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedItems.map(item => (
                  <GlareHover
                    key={item.id + item._type}
                    borderRadius="20px"
                    borderColor="rgba(99,102,241,0.2)"
                    background="var(--gradient-card)"
                    width="100%"
                    height="100%"
                  >
                    <div className="p-0 overflow-hidden group flex flex-col h-full w-full justify-between" style={{ background: 'transparent', border: 'none' }}>
                      {item.images?.[0] && (
                        <div className="relative overflow-hidden" style={{ height: '150px' }}>
                          <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className={`absolute top-2 left-2 badge ${item._type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                            {item._type === 'lost' ? '🔍 Lost' : '✅ Found'}
                          </span>
                          <button onClick={() => toggleSave(item.id, item._type)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white hover:bg-red-500/80 transition-all">
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-semibold text-white text-sm mb-1">{item.itemName}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} />{item.location}</p>
                      </div>
                    </div>
                  </GlareHover>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="font-semibold text-white text-sm">
                Notifications {unreadCount > 0 && <span className="ml-1 text-xs text-accent-400">({unreadCount} unread)</span>}
              </h3>
              {unreadCount > 0 && (
                <button onClick={() => markAllRead(currentUser?.id)}
                  className="text-xs text-slate-400 hover:text-white transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            {myNotifs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Bell size={40} className="mx-auto mb-3 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              myNotifs.map(notif => (
                <div key={notif.id} onClick={() => markNotifRead(notif.id)}
                  className={`flex items-start gap-3 p-4 cursor-pointer border-b border-white/5 hover:bg-white/5 transition-all ${!notif.read ? 'bg-primary-500/5' : ''}`}>
                  <span className="text-xl shrink-0 mt-0.5">{typeIcons[notif.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 leading-relaxed">{notif.message}</p>
                    <p className="text-xs mt-1" style={{ color: typeColors[notif.type] || '#94a3b8' }}>
                      {formatDistanceToNow(notif.timestamp)}
                    </p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2" />}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-4">Account Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: currentUser?.name },
                { label: 'Email', value: currentUser?.email },
                { label: 'KTU ID', value: currentUser?.ktuId },
                { label: 'Phone', value: currentUser?.phone },
                { label: 'Department', value: currentUser?.department },
                { label: 'Member Since', value: formatDate(currentUser?.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="text-sm text-white font-medium">{value || '—'}</span>
                </div>
              ))}
              <button onClick={() => setActiveTab('posts') || setEditMode(true)}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
                <Edit2 size={16} /> Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {editingPost && (
        <EditPostModal
          item={editingPost.item}
          type={editingPost.type}
          onClose={() => setEditingPost(null)}
          onSave={handleSavePostEdit}
        />
      )}
    </div>
  );
}
