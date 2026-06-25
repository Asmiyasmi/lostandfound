import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Search, TrendingUp, Plus, Clock, MapPin, Tag, BookmarkPlus, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { formatDistanceToNow, formatDate } from '../utils/helpers';
import GlareHover from '../components/effects/GlareHover';
import VariableProximity from '../components/effects/VariableProximity';

function ItemCard({ item, type, onSave, isSaved, onClaim }) {
  const isLost = type === 'lost';
  return (
    <GlareHover
      width="100%"
      height="100%"
      borderRadius="20px"
      borderColor="rgba(99,102,241,0.2)"
      background="var(--gradient-card)"
    >
      <div className="p-4 flex flex-col gap-3 cursor-pointer group h-full w-full justify-between" style={{ background: 'transparent', border: 'none' }}>
        {/* Image */}
        {item.images?.[0] && (
          <div className="relative overflow-hidden rounded-xl" style={{ height: '160px' }}>
            <img
              src={item.images[0]}
              alt={item.itemName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-2 left-2">
              <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
                {isLost ? '🔍 Lost' : '✅ Found'}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSave(item.id, type); }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all"
            >
              {isSaved ? <Bookmark size={14} fill="currentColor" /> : <BookmarkPlus size={14} />}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-snug line-clamp-1">{item.itemName}</h3>
            <span className="text-xs text-slate-500 shrink-0">{formatDistanceToNow(item.createdAt)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {item.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {isLost ? item.dateLost : item.dateFound}
          </span>
        </div>

        {/* Action */}
        {!isLost && onClaim && (
          <button
            onClick={() => onClaim(item)}
            className="btn-primary py-2 text-xs w-full mt-2"
          >
            Claim This Item
          </button>
        )}
      </div>
    </GlareHover>
  );
}

function ClaimModal({ item, onClose, onSubmit }) {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    ktuId: currentUser?.ktuId || '',
    phone: currentUser?.phone || '',
    proofDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onSubmit({ ...form, itemId: item.id, itemName: item.itemName, finderId: item.userId });
      setSuccess(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass rounded-3xl p-6" onClick={e => e.stopPropagation()}>
        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2">Claim Submitted!</h3>
            <p className="text-slate-400 text-sm mb-6">Your claim has been sent to the finder and admin for review.</p>
            <button onClick={onClose} className="btn-primary px-8">Done</button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-white mb-1">Claim Item</h3>
            <p className="text-sm text-slate-400 mb-4">Claiming: <span className="text-primary-400 font-semibold">{item.itemName}</span></p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="form-label">Your Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="input-field" />
              </div>
              <div>
                <label className="form-label">KTU ID</label>
                <input value={form.ktuId} onChange={e => setForm(f => ({ ...f, ktuId: e.target.value }))} required className="input-field" />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required className="input-field" />
              </div>
              <div>
                <label className="form-label">Proof of Ownership</label>
                <textarea
                  value={form.proofDescription}
                  onChange={e => setForm(f => ({ ...f, proofDescription: e.target.value }))}
                  required rows={3}
                  className="input-field"
                  placeholder="Describe unique identifying details that prove it's yours..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Submit Claim'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { currentUser } = useAuth();
  const { lostItems, foundItems, getTrending, toggleSave, isSaved, addClaim } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [claimItem, setClaimItem] = useState(null);
  const containerRef = useRef(null);

  const trending = getTrending();

  const recentLost = [...lostItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const recentFound = [...foundItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  const allItems = [
    ...lostItems.map(i => ({ ...i, type: 'lost' })),
    ...foundItems.map(i => ({ ...i, type: 'found' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 12);

  const displayItems = activeTab === 'all' ? allItems
    : activeTab === 'lost' ? recentLost.map(i => ({ ...i, type: 'lost' }))
    : recentFound.map(i => ({ ...i, type: 'found' }));

  return (
    <div className="content-container py-8">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-3" />

      {/* Hero greeting */}
      <div className="mb-8 relative z-10" ref={containerRef}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-black text-3xl text-white mb-1" style={{ letterSpacing: '-0.02em', minHeight: '40px' }}>
              <VariableProximity
                label={`Hey, ${currentUser?.name?.split(' ')[0] || 'User'} 👋`}
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={120}
                falloff="linear"
              />
            </h1>
            <p className="text-slate-400">Here's what's happening on campus today</p>
          </div>
          <div className="flex gap-2">
            <Link to="/report/lost">
              <button className="btn-accent flex items-center gap-2 py-2.5 px-4 text-sm">
                <Plus size={16} /> Report Lost
              </button>
            </Link>
            <Link to="/report/found">
              <button className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm">
                <Plus size={16} /> Report Found
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
        {[
          { icon: AlertTriangle, label: 'Items Lost', value: lostItems.length, color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
          { icon: CheckCircle, label: 'Items Found', value: foundItems.length, color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
          { icon: TrendingUp, label: 'Active Posts', value: lostItems.filter(i => i.status === 'active').length + foundItems.filter(i => i.status === 'active').length, color: '#a5b4fc', bg: 'rgba(99,102,241,0.1)' },
          { icon: Tag, label: 'Categories', value: 8, color: '#fb923c', bg: 'rgba(249,115,22,0.1)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <GlareHover key={label} borderRadius="20px" background="rgba(17,17,39,0.5)">
            <div className="p-4 flex items-center gap-3 w-full h-full" style={{ border: 'none', background: 'transparent' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          </GlareHover>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        {/* Main feed */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-5">
            {[
              { id: 'all', label: 'All Posts' },
              { id: 'lost', label: 'Lost Items' },
              { id: 'found', label: 'Found Items' },
            ].map(t => (
              <button key={t.id} id={`tab-${t.id}`}
                className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {displayItems.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Search size={48} className="mx-auto mb-3 opacity-20" />
              <p>No items yet. Be the first to post!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  type={item.type}
                  onSave={toggleSave}
                  isSaved={isSaved(item.id, item.type)}
                  onClaim={item.type === 'found' && item.userId !== currentUser?.id ? setClaimItem : null}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          <div className="text-center mt-8">
            <Link to={activeTab === 'lost' ? '/lost-items' : activeTab === 'found' ? '/found-items' : '/search'}>
              <button className="btn-secondary px-8">View All →</button>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Trending */}
          <div className="card p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-primary-400" /> Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {trending.map(tag => (
                <button key={tag} onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  className="hashtag text-xs">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="card p-4">
            <h3 className="font-semibold text-white mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/lost-items" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all">
                <AlertTriangle size={15} className="text-red-400" />
                <span className="text-sm text-slate-300">Browse Lost Items</span>
              </Link>
              <Link to="/found-items" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all">
                <CheckCircle size={15} className="text-green-400" />
                <span className="text-sm text-slate-300">Browse Found Items</span>
              </Link>
              <Link to="/search" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all">
                <Search size={15} className="text-primary-400" />
                <span className="text-sm text-slate-300">Advanced Search</span>
              </Link>
            </div>
          </div>

          {/* Recent activity */}
          <div className="card p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
              <Clock size={16} className="text-accent-400" /> Recent Activity
            </h3>
            <div className="space-y-3">
              {[...lostItems, ...foundItems]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 4)
                .map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${lostItems.find(l => l.id === item.id) ? 'bg-red-400' : 'bg-green-400'}`} />
                    <p className="text-xs text-slate-400 line-clamp-1">{item.itemName}</p>
                    <span className="text-xs text-slate-600 ml-auto shrink-0">{formatDistanceToNow(item.createdAt)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {claimItem && (
        <ClaimModal
          item={claimItem}
          onClose={() => setClaimItem(null)}
          onSubmit={(data) => { addClaim({ ...data, claimerId: currentUser.id }); setClaimItem(null); }}
        />
      )}
    </div>
  );
}
