import { useState, useRef } from 'react';
import { FileText, Search, CheckCircle, X, Clock, MessageSquare } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow, formatDate } from '../../utils/helpers';
import GlareHover from '../../components/effects/GlareHover';
import VariableProximity from '../../components/effects/VariableProximity';

export default function AdminClaimsPage() {
  const { claims, updateClaim, foundItems, addNotification } = useData();
  const { users } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const containerRef = useRef(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);

  const getUserName = (userId) => users.find(u => u.id === userId)?.name || userId;
  const getFoundItem = (itemId) => foundItems.find(i => i.id === itemId);

  const filtered = claims.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      c.name.toLowerCase().includes(q) ||
      c.itemName?.toLowerCase().includes(q) ||
      c.ktuId?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleDecision = (decision) => {
    setProcessing(true);
    setTimeout(() => {
      updateClaim(selectedClaim.id, { status: decision, adminRemarks: remarks });
      // Notify claimant
      addNotification(
        selectedClaim.claimerId,
        `Your claim for "${selectedClaim.itemName}" has been ${decision}.${remarks ? ` Admin note: ${remarks}` : ''}`,
        decision === 'approved' ? 'approved' : 'rejected'
      );
      setSelectedClaim(null);
      setRemarks('');
      setProcessing(false);
    }, 700);
  };

  const handleQRScanSimulation = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      updateClaim(selectedClaim.id, { status: 'approved', adminRemarks: remarks || 'Verified via QR Code scan.' });
      addNotification(
        selectedClaim.claimerId,
        `Your claim for "${selectedClaim.itemName}" was verified and approved via QR Code scan!`,
        'approved'
      );
      setSelectedClaim(null);
      setRemarks('');
    }, 1500);
  };

  const statusBadge = (status) => {
    if (status === 'pending') return <span className="badge badge-pending text-[9px]">⏳ Pending</span>;
    if (status === 'approved') return <span className="badge badge-approved text-[9px]">✅ Approved</span>;
    return <span className="badge badge-rejected text-[9px]">❌ Rejected</span>;
  };

  return (
    <div className="content-container py-8">
      <div className="bg-orb bg-orb-2" />
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6" ref={containerRef}>
          <h1 className="font-display font-bold text-2xl text-white mb-1">
            <VariableProximity
              label="Claims Management"
              containerRef={containerRef}
              fromFontVariationSettings="'wght' 400, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              radius={120}
              falloff="linear"
            />
          </h1>
          <p className="text-slate-400 text-sm">
            {claims.filter(c => c.status === 'pending').length} pending · {claims.length} total
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10" placeholder="Search by name, item, or KTU ID..." />
          </div>
          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} className={`tab-btn py-2 px-3 text-xs capitalize ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* Claims grid */}
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">
            <FileText size={40} className="mx-auto mb-3 opacity-20" />
            <p>No claims found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(claim => {
              const foundItem = getFoundItem(claim.itemId);
              return (
                <GlareHover
                  key={claim.id}
                  borderRadius="20px"
                  borderColor="rgba(99,102,241,0.2)"
                  background="var(--gradient-card)"
                  width="100%"
                  height="100%"
                >
                  <div className="p-4 cursor-pointer hover:border-primary-500/50 transition-all flex flex-col justify-between h-full w-full"
                    style={{ background: 'transparent', border: 'none' }}
                    onClick={() => { setSelectedClaim(claim); setRemarks(claim.adminRemarks || ''); }}>
                    <div>
                      {/* Item preview */}
                      {foundItem?.images?.[0] && (
                        <div className="relative overflow-hidden rounded-xl mb-3" style={{ height: '100px' }}>
                          <img src={foundItem.images[0]} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 left-2">{statusBadge(claim.status)}</div>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-white text-sm line-clamp-1">{claim.itemName || foundItem?.itemName}</h3>
                        {!foundItem?.images?.[0] && statusBadge(claim.status)}
                      </div>

                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-slate-400">Claimant: <span className="text-slate-200">{claim.name}</span></p>
                        <p className="text-xs text-slate-400">KTU: <span className="text-slate-200">{claim.ktuId}</span></p>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-3 italic">"{claim.proofDescription}"</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {formatDistanceToNow(claim.createdAt)}
                        </span>
                        {claim.status === 'pending' && (
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => { setSelectedClaim(claim); setRemarks(''); }}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-600/80 text-white hover:bg-primary-600 transition-all">
                              Review
                            </button>
                          </div>
                        )}
                      </div>

                      {claim.adminRemarks && (
                        <div className="mt-2 p-2 rounded-lg bg-white/5 text-xs text-slate-400 flex items-start gap-1.5">
                          <MessageSquare size={10} className="shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{claim.adminRemarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </GlareHover>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedClaim && (() => {
        const foundItem = getFoundItem(selectedClaim.itemId);
        return (
          <div className="modal-overlay" onClick={() => setSelectedClaim(null)}>
            <div className="modal-content glass rounded-3xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Review Claim</h3>
                <button onClick={() => setSelectedClaim(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[70vh] space-y-4 pr-1">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Item', value: selectedClaim.itemName },
                    { label: 'Claimant', value: selectedClaim.name },
                    { label: 'KTU ID', value: selectedClaim.ktuId },
                    { label: 'Phone', value: selectedClaim.phone },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-2.5 rounded-xl bg-white/5">
                      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                      <p className="text-sm text-white font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-slate-400 mb-1">Proof of Ownership:</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{selectedClaim.proofDescription}</p>
                </div>

                {/* QR Code Verification Section */}
                {selectedClaim.status === 'pending' && foundItem && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-xs text-slate-400 mb-2 font-semibold">QR Code Verification</p>
                    <div className="p-3 rounded-2xl bg-white w-32 h-32 flex items-center justify-center shadow-lg">
                      <img src={foundItem.qrCode} alt="Item Verification QR" className="w-full h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={handleQRScanSimulation}
                      disabled={scanning}
                      className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors flex items-center gap-1.5 shadow-md"
                    >
                      {scanning ? (
                        <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Simulating Scan...</>
                      ) : (
                        '🔍 Verify QR Scan'
                      )}
                    </button>
                  </div>
                )}

                <div>
                  <label className="form-label">Admin Remarks (optional)</label>
                  <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
                    rows={2} className="input-field"
                    placeholder="Add notes for the claimant..." />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 mt-4">
                {selectedClaim.status === 'pending' ? (
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedClaim(null)} className="btn-secondary flex-1 py-2.5">Close</button>
                    <button onClick={() => handleDecision('rejected')} disabled={processing || scanning}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-500 transition-all">
                      {processing ? '...' : '❌ Reject'}
                    </button>
                    <button onClick={() => handleDecision('approved')} disabled={processing || scanning}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition-all">
                      {processing ? '...' : '✅ Approve'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-3">{statusBadge(selectedClaim.status)}</div>
                    {selectedClaim.adminRemarks && (
                      <p className="text-sm text-slate-400 mb-4">{selectedClaim.adminRemarks}</p>
                    )}
                    <button onClick={() => setSelectedClaim(null)} className="btn-secondary px-8 py-2">Close</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
