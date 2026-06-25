import { useState, useRef } from 'react';
import { CheckCircle, Search, MapPin, Clock, SlidersHorizontal, X, BookmarkPlus, Bookmark } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, CATEGORIES, LOCATIONS } from '../utils/helpers';
import GlareHover from '../components/effects/GlareHover';
import VariableProximity from '../components/effects/VariableProximity';

function ClaimModal({ item, currentUser, onClose, onSubmit }) {
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
      onSubmit({ ...form, itemId: item.id, itemName: item.itemName, finderId: item.userId, claimerId: currentUser.id });
      setSuccess(true);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass rounded-3xl p-6" onClick={e => e.stopPropagation()}>
        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2">Claim Submitted!</h3>
            <p className="text-slate-400 text-sm mb-6">Admin will review your claim shortly.</p>
            <button onClick={onClose} className="btn-primary px-8">Done</button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-white mb-1">Claim Found Item</h3>
            <p className="text-sm text-slate-400 mb-4">Claiming: <span className="text-primary-400 font-semibold">{item.itemName}</span></p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="form-label">Your Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="input-field" /></div>
              <div><label className="form-label">KTU ID</label>
                <input value={form.ktuId} onChange={e => setForm(f => ({ ...f, ktuId: e.target.value }))} required className="input-field" /></div>
              <div><label className="form-label">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required className="input-field" /></div>
              <div><label className="form-label">Proof of Ownership</label>
                <textarea value={form.proofDescription}
                  onChange={e => setForm(f => ({ ...f, proofDescription: e.target.value }))}
                  required rows={3} className="input-field"
                  placeholder="Describe unique details that prove this is yours..." /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Submit'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function FoundItemsPage() {
  const { foundItems, toggleSave, isSaved, addClaim, findMatches } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimItem, setClaimItem] = useState(null);
  const containerRef = useRef(null);

  const filtered = foundItems
    .filter(item => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        item.itemName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.hashtags?.some(h => h.toLowerCase().includes(q));
      const matchCategory = !selectedCategory || item.category === selectedCategory;
      const matchLocation = !selectedLocation || item.location === selectedLocation;
      return matchSearch && matchCategory && matchLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return a.itemName.localeCompare(b.itemName);
    });

  const clearFilters = () => { setSearch(''); setSelectedCategory(''); setSelectedLocation(''); setSortBy('newest'); };
  const hasFilters = search || selectedCategory || selectedLocation || sortBy !== 'newest';

  const matches = selectedItem ? findMatches(selectedItem, 'found') : [];

  return (
    <div className="content-container py-8">
      <div className="bg-orb bg-orb-2" />

      {/* Header */}
      <div className="mb-6 relative z-10" ref={containerRef}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
            <CheckCircle size={20} className="text-green-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              <VariableProximity
                label="Found Items"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={120}
                falloff="linear"
              />
            </h1>
            <p className="text-slate-400 text-sm">{foundItems.length} items found · {filtered.length} showing</p>
          </div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10" placeholder="Search found items..." />
        </div>
        <div className="flex gap-2">
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
            className="input-field select" style={{ width: 'auto', minWidth: '140px' }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-all ${showFilters ? 'bg-primary-600 border-primary-500 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <SlidersHorizontal size={16} />
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="p-3 rounded-xl border border-white/10 text-red-400 hover:bg-red-500/10 transition-all">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-5 relative z-10 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="form-label">Storage Location</label>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="input-field select">
              <option value="">All Locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="form-label">Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="relative z-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <CheckCircle size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium mb-1">No items found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(item => (
              <GlareHover
                key={item.id}
                width="100%"
                height="100%"
                borderRadius="20px"
                borderColor="rgba(99,102,241,0.2)"
                background="var(--gradient-card)"
              >
                <div className="p-0 overflow-hidden group cursor-pointer h-full w-full flex flex-col justify-between" style={{ background: 'transparent', border: 'none' }} onClick={() => setSelectedItem(item)}>
                  {item.images?.[0] && (
                    <div className="relative overflow-hidden" style={{ height: '160px' }}>
                      <img src={item.images[0]} alt={item.itemName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute top-2 left-2 badge badge-found">✅ Found</span>
                      <button onClick={e => { e.stopPropagation(); toggleSave(item.id, 'found'); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all">
                        {isSaved(item.id, 'found') ? <Bookmark size={13} fill="currentColor" /> : <BookmarkPlus size={13} />}
                      </button>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{item.category}</p>
                    <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">{item.itemName}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap mb-2">
                      <span className="flex items-center gap-1"><MapPin size={10} />{item.location}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{item.dateFound}</span>
                    </div>
                    {item.userId !== currentUser?.id && (
                      <button onClick={e => { e.stopPropagation(); setClaimItem(item); }}
                        className="btn-primary py-1.5 text-xs w-full mt-2">
                        Claim This
                      </button>
                    )}
                  </div>
                </div>
              </GlareHover>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content glass rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {selectedItem.images?.[0] && (
              <div className="relative" style={{ height: '220px' }}>
                <img src={selectedItem.images[0]} alt={selectedItem.itemName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-4 badge badge-found text-xs">✅ Found Item</span>
                <button onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 transition-all">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="p-5 overflow-y-auto max-h-[75vh]">
              <h3 className="text-xl font-bold text-white mb-1">{selectedItem.itemName}</h3>
              <span className="text-xs text-green-400 mb-3 inline-block">{selectedItem.category}</span>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{selectedItem.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Found At', value: selectedItem.location },
                  { label: 'Storage', value: selectedItem.storageLocation },
                  { label: 'Date Found', value: selectedItem.dateFound },
                  { label: 'Time', value: selectedItem.timeFound },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2.5 rounded-xl bg-white/5">
                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                    <p className="text-sm text-white font-medium">{value || '—'}</p>
                  </div>
                ))}
              </div>
              {selectedItem.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedItem.hashtags.map(h => <span key={h} className="hashtag text-xs">{h}</span>)}
                </div>
              )}
              {selectedItem.userId !== currentUser?.id && (
                <button onClick={() => { setSelectedItem(null); setClaimItem(selectedItem); }}
                  className="btn-primary w-full py-3 mb-4">
                  Submit a Claim
                </button>
              )}

              {/* AI Similar Matches */}
              {matches.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    ✨ AI Suggested Matches ({matches.length})
                  </h4>
                  <div className="space-y-2">
                    {matches.slice(0, 3).map(({ item: matchedItem, matchPercentage }) => (
                      <div key={matchedItem.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:border-primary-500/30 transition-all">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white line-clamp-1">{matchedItem.itemName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {matchedItem.location}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            {matchPercentage}% Match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {claimItem && (
        <ClaimModal
          item={claimItem}
          currentUser={currentUser}
          onClose={() => setClaimItem(null)}
          onSubmit={(data) => { addClaim(data); setClaimItem(null); }}
        />
      )}
    </div>
  );
}
