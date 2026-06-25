import { useState, useRef } from 'react';
import { AlertTriangle, Search, Filter, MapPin, Clock, SlidersHorizontal, X, BookmarkPlus, Bookmark } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow, CATEGORIES, LOCATIONS } from '../utils/helpers';
import GlareHover from '../components/effects/GlareHover';
import VariableProximity from '../components/effects/VariableProximity';

export default function LostItemsPage() {
  const { lostItems, toggleSave, isSaved, findMatches } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const containerRef = useRef(null);

  const filtered = lostItems
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

  const clearFilters = () => {
    setSearch(''); setSelectedCategory(''); setSelectedLocation(''); setSortBy('newest');
  };
  const hasFilters = search || selectedCategory || selectedLocation || sortBy !== 'newest';

  const matches = selectedItem ? findMatches(selectedItem, 'lost') : [];

  return (
    <div className="content-container py-8">
      <div className="bg-orb bg-orb-1" />

      {/* Header */}
      <div className="mb-6 relative z-10" ref={containerRef}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              <VariableProximity
                label="Lost Items"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={120}
                falloff="linear"
              />
            </h1>
            <p className="text-slate-400 text-sm">{lostItems.length} reported items · {filtered.length} showing</p>
          </div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by name, description, or hashtag..."
          />
        </div>
        <div className="flex gap-2">
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field select" style={{ width: 'auto', minWidth: '140px' }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-all ${showFilters ? 'bg-primary-600 border-primary-500 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <SlidersHorizontal size={16} />
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="p-3 rounded-xl border border-white/10 text-red-400 hover:bg-red-500/10 transition-all">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Extra filters */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-5 relative z-10 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="form-label">Location</label>
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
            <Search size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium mb-1">No items found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
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
                      <span className="absolute top-2 left-2 badge badge-lost">🔍 Lost</span>
                      <button
                        onClick={e => { e.stopPropagation(); toggleSave(item.id, 'lost'); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all"
                      >
                        {isSaved(item.id, 'lost') ? <Bookmark size={13} fill="currentColor" /> : <BookmarkPlus size={13} />}
                      </button>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{item.category}</p>
                    <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">{item.itemName}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={10} />{item.location}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{item.dateLost}</span>
                    </div>
                  </div>
                </div>
              </GlareHover>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content glass rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {selectedItem.images?.[0] && (
              <div className="relative" style={{ height: '220px' }}>
                <img src={selectedItem.images[0]} alt={selectedItem.itemName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-4 badge badge-lost text-xs">🔍 Lost Item</span>
                <button onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 text-white hover:bg-black/70 transition-all">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="p-5 overflow-y-auto max-h-[75vh]">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedItem.itemName}</h3>
                  <span className="text-xs text-primary-400">{selectedItem.category}</span>
                </div>
                <button onClick={() => toggleSave(selectedItem.id, 'lost')}
                  className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all">
                  {isSaved(selectedItem.id, 'lost') ? <Bookmark size={16} fill="currentColor" /> : <BookmarkPlus size={16} />}
                </button>
              </div>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{selectedItem.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Location', value: selectedItem.location },
                  { label: 'Date Lost', value: selectedItem.dateLost },
                  { label: 'Time', value: selectedItem.timeLost },
                  { label: 'Contact', value: selectedItem.contactPreference },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2.5 rounded-xl bg-white/5">
                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                    <p className="text-sm text-white font-medium">{value}</p>
                  </div>
                ))}
              </div>
              {selectedItem.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedItem.hashtags.map(h => <span key={h} className="hashtag text-xs">{h}</span>)}
                </div>
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
    </div>
  );
}
