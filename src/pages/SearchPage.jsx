import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, CheckCircle, X, Clock, MapPin, BookmarkPlus, Bookmark, History } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/helpers';
import GlareHover from '../components/effects/GlareHover';
import VariableProximity from '../components/effects/VariableProximity';

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lostItems, foundItems, searchHistory, addSearchHistory, clearSearchHistory, toggleSave, isSaved } = useData();
  const { currentUser } = useAuth();
  const containerRef = useRef(null);

  const params = new URLSearchParams(location.search);
  const initialQ = params.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [activeType, setActiveType] = useState('all');
  const [activeCategory, setActiveCategory] = useState('');
  const [hasSearched, setHasSearched] = useState(!!initialQ);

  const doSearch = (q) => {
    if (!q.trim()) return;
    addSearchHistory(q.trim());
    navigate(`/search?q=${encodeURIComponent(q.trim())}`, { replace: true });
    setHasSearched(true);
  };

  // Run initial search if q param exists
  useEffect(() => {
    if (initialQ) {
      addSearchHistory(initialQ);
    }
  }, []);

  const searchText = params.get('q') || '';

  const filterItems = (items, type) => {
    if (!searchText) return [];
    const q = searchText.toLowerCase();
    return items
      .filter(item => {
        const matchText =
          item.itemName.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.hashtags?.some(h => h.toLowerCase().includes(q));
        const matchCat = !activeCategory || item.category === activeCategory;
        return matchText && matchCat;
      })
      .map(i => ({ ...i, _type: type }));
  };

  const lostResults = filterItems(lostItems, 'lost');
  const foundResults = filterItems(foundItems, 'found');
  const allResults = [...lostResults, ...foundResults].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const displayResults = activeType === 'all' ? allResults
    : activeType === 'lost' ? lostResults
    : foundResults;

  return (
    <div className="content-container py-8">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-3" />

      {/* Header */}
      <div className="mb-6 relative z-10" ref={containerRef}>
        <h1 className="font-display font-bold text-2xl text-white mb-1">
          <VariableProximity
            label="Search"
            containerRef={containerRef}
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            radius={120}
            falloff="linear"
          />
        </h1>
        <p className="text-slate-400 text-sm">Find lost or found items across campus</p>
      </div>

      {/* Search Input */}
      <div className="relative z-10 mb-5">
        <form onSubmit={e => { e.preventDefault(); doSearch(query); }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input-field pl-12 pr-12 py-4 text-base"
              placeholder="Search by item name, category, location, hashtag..."
              style={{ borderRadius: '16px' }}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setHasSearched(false); navigate('/search'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filters row */}
      {hasSearched && searchText && (
        <div className="flex flex-wrap items-center gap-3 mb-5 relative z-10">
          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            {[
              { id: 'all', label: `All (${allResults.length})` },
              { id: 'lost', label: `Lost (${lostResults.length})` },
              { id: 'found', label: `Found (${foundResults.length})` },
            ].map(t => (
              <button key={t.id}
                className={`tab-btn py-1.5 text-xs ${activeType === t.id ? 'active' : ''}`}
                onClick={() => setActiveType(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}
            className="input-field select text-sm" style={{ width: 'auto', padding: '8px 36px 8px 12px' }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div className="relative z-10">
        {/* No query yet — show search history */}
        {!searchText && !hasSearched && (
          <div>
            {searchHistory.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <History size={15} /> Recent Searches
                  </h3>
                  <button onClick={clearSearchHistory} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map(term => (
                    <button key={term}
                      onClick={() => { setQuery(term); doSearch(term); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-primary-500 hover:text-white transition-all">
                      <History size={11} />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
                <Search size={28} className="text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Search Campus Lost & Found</h3>
              <p className="text-slate-400 text-sm">Type an item name, location, or hashtag to search</p>
            </div>
          </div>
        )}

        {/* Results */}
        {searchText && (
          <>
            {displayResults.length === 0 ? (
              <div className="text-center py-16">
                <Search size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium text-white mb-1">No results for "{searchText}"</p>
                <p className="text-slate-400 text-sm">Try different keywords or browse all items</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-400 mb-4">
                  {displayResults.length} result{displayResults.length !== 1 ? 's' : ''} for "<span className="text-white">{searchText}</span>"
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayResults.map(item => (
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
                            <img src={item.images[0]} alt={item.itemName}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <span className={`absolute top-2 left-2 badge ${item._type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                              {item._type === 'lost' ? '🔍 Lost' : '✅ Found'}
                            </span>
                            <button onClick={() => toggleSave(item.id, item._type)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all">
                              {isSaved(item.id, item._type) ? <Bookmark size={13} fill="currentColor" /> : <BookmarkPlus size={13} />}
                            </button>
                          </div>
                        )}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">{item.category}</p>
                            <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">{item.itemName}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-2">{item.description}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><MapPin size={10} />{item.location}</span>
                              <span className="flex items-center gap-1"><Clock size={10} />{item._type === 'lost' ? item.dateLost : item.dateFound}</span>
                            </div>
                            {item.hashtags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.hashtags.slice(0, 2).map(h => <span key={h} className="hashtag text-[10px] px-1.5 py-0.5">{h}</span>)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlareHover>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
