import { useState, useRef } from 'react';
import { AlertTriangle, CheckCircle, Search, Trash2, X, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import GlareHover from '../../components/effects/GlareHover';
import VariableProximity from '../../components/effects/VariableProximity';

export default function AdminPostsPage() {
  const { lostItems, foundItems, deleteLostItem, deleteFoundItem, updateLostItem, updateFoundItem } = useData();
  const { users } = useAuth();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const containerRef = useRef(null);

  const getUserName = (userId) => users.find(u => u.id === userId)?.name || 'Unknown';

  const allPosts = [
    ...lostItems.map(i => ({ ...i, _type: 'lost' })),
    ...foundItems.map(i => ({ ...i, _type: 'found' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = allPosts.filter(item => {
    const matchTab = tab === 'all' || item._type === tab;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      item.itemName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const handleDelete = () => {
    if (confirmDelete._type === 'lost') deleteLostItem(confirmDelete.id);
    else deleteFoundItem(confirmDelete.id);
    setConfirmDelete(null);
  };

  const toggleStatus = (item) => {
    const newStatus = item.status === 'active' ? 'closed' : 'active';
    if (item._type === 'lost') updateLostItem(item.id, { status: newStatus });
    else updateFoundItem(item.id, { status: newStatus });
  };

  return (
    <div className="content-container py-8">
      <div className="bg-orb bg-orb-1" />
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6" ref={containerRef}>
          <h1 className="font-display font-bold text-2xl text-white mb-1">
            <VariableProximity
              label="All Posts"
              containerRef={containerRef}
              fromFontVariationSettings="'wght' 400, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              radius={120}
              falloff="linear"
            />
          </h1>
          <p className="text-slate-400 text-sm">{lostItems.length} lost · {foundItems.length} found · {allPosts.length} total</p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10" placeholder="Search posts..." />
          </div>
          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'lost', label: 'Lost' },
              { id: 'found', label: 'Found' },
            ].map(t => (
              <button key={t.id} className={`tab-btn py-2 px-4 text-xs ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
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
                    {['Item', 'Type', 'Category', 'Location', 'Posted By', 'Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id + item._type} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.images?.[0] && (
                            <img src={item.images[0]} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          )}
                          <span className="text-white font-medium truncate max-w-[120px]">{item.itemName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-[9px] ${item._type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                          {item._type === 'lost' ? '🔍 Lost' : '✅ Found'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{item.category}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{item.location}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{getUserName(item.userId)}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleStatus(item)}
                          className={`badge text-[9px] cursor-pointer transition-all ${item.status === 'active' ? 'badge-approved' : 'badge-pending'}`}>
                          {item.status === 'active' ? 'Active' : 'Closed'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setConfirmDelete(item)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Filter size={40} className="mx-auto mb-2 opacity-20" />
                  <p>No posts match your search</p>
                </div>
              )}
            </div>
          </div>
        </GlareHover>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="glass rounded-3xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-500/15">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Delete Post</h3>
              <p className="text-slate-400 text-sm mb-5">
                Delete "<span className="text-white font-semibold">{confirmDelete.itemName}</span>"? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-500 transition-all">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
