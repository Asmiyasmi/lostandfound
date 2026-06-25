import { useState, useRef } from 'react';
import { BarChart2, Users, AlertTriangle, CheckCircle, FileText, TrendingUp, Clock, Shield, Map, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDistanceToNow } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import GlareHover from '../../components/effects/GlareHover';
import VariableProximity from '../../components/effects/VariableProximity';

export default function AdminDashboardPage() {
  const { users } = useAuth();
  const { lostItems, foundItems, claims } = useData();
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const containerRef = useRef(null);

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: '#a5b4fc', bg: 'rgba(99,102,241,0.15)', to: '/admin/users' },
    { label: 'Lost Reports', value: lostItems.length, icon: AlertTriangle, color: '#f87171', bg: 'rgba(239,68,68,0.15)', to: '/admin/posts' },
    { label: 'Found Reports', value: foundItems.length, icon: CheckCircle, color: '#4ade80', bg: 'rgba(34,197,94,0.15)', to: '/admin/posts' },
    { label: 'Claims Pending', value: claims.filter(c => c.status === 'pending').length, icon: FileText, color: '#fb923c', bg: 'rgba(249,115,22,0.15)', to: '/admin/claims' },
  ];

  const recentActivity = [
    ...lostItems.map(i => ({ ...i, _type: 'lost', _label: `Lost: ${i.itemName}` })),
    ...foundItems.map(i => ({ ...i, _type: 'found', _label: `Found: ${i.itemName}` })),
    ...claims.map(c => ({ ...c, _type: 'claim', _label: `Claim: ${c.name} for ${c.itemName}` })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  // 1. Category breakdown (Donut Chart Data)
  const categoryStats = (() => {
    const cats = {};
    [...lostItems, ...foundItems].forEach(i => {
      cats[i.category] = (cats[i.category] || 0) + 1;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  })();

  const totalCatCount = categoryStats.reduce((acc, curr) => acc + curr[1], 0) || 1;

  let accumulatedPercent = 0;
  const donutSlices = categoryStats.map(([name, count], index) => {
    const percent = (count / totalCatCount) * 100;
    const r = 50;
    const circ = 2 * Math.PI * r; // ~314.16
    const strokeLength = (percent / 100) * circ;
    const strokeOffset = circ - strokeLength + (accumulatedPercent / 100) * circ;
    accumulatedPercent += percent;
    return {
      name,
      count,
      percent,
      strokeOffset,
      strokeLength,
      color: ['#6366f1', '#a5b4fc', '#f97316', '#4ade80', '#fb923c', '#ec4899'][index % 6]
    };
  });

  // 2. Hotspots Location frequency (Bar Chart & Heatmap Data)
  const hotspotList = [
    { name: 'Library', x: 120, y: 100, label: 'Library' },
    { name: 'Main Canteen', x: 340, y: 90, label: 'Canteen' },
    { name: 'Hostel Block A', x: 90, y: 250, label: 'Block A' },
    { name: 'Block B Lab', x: 230, y: 200, label: 'Block B' },
    { name: 'Seminar Hall', x: 420, y: 230, label: 'Auditorium' },
    { name: 'Sports Ground', x: 180, y: 350, label: 'Sports Area' },
    { name: 'Parking Area', x: 350, y: 330, label: 'Parking' }
  ];

  const hotspotCounts = (() => {
    const counts = {};
    hotspotList.forEach(h => { counts[h.name] = 0; });
    [...lostItems, ...foundItems].forEach(item => {
      let matched = null;
      const loc = item.location.toLowerCase();
      if (loc.includes('library')) matched = 'Library';
      else if (loc.includes('canteen')) matched = 'Main Canteen';
      else if (loc.includes('block a')) matched = 'Hostel Block A';
      else if (loc.includes('block b') || loc.includes('lab')) matched = 'Block B Lab';
      else if (loc.includes('seminar') || loc.includes('auditorium') || loc.includes('hall')) matched = 'Seminar Hall';
      else if (loc.includes('sports') || loc.includes('ground') || loc.includes('gym')) matched = 'Sports Ground';
      else if (loc.includes('parking') || loc.includes('gate')) matched = 'Parking Area';
      
      if (matched) {
        counts[matched] = (counts[matched] || 0) + 1;
      }
    });
    return counts;
  })();

  const maxHotspotCount = Math.max(...Object.values(hotspotCounts), 1);

  // 3. Monthly Trends (Line Chart Data)
  const monthlyTrends = (() => {
    const trends = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(curDate.getMonth() - i);
      const mName = months[d.getMonth()];
      const mIdx = d.getMonth();
      const yIdx = d.getFullYear();
      
      const lostCount = lostItems.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() === mIdx && itemDate.getFullYear() === yIdx;
      }).length;
      
      const foundCount = foundItems.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() === mIdx && itemDate.getFullYear() === yIdx;
      }).length;
      
      trends.push({ name: mName, lost: lostCount, found: foundCount });
    }
    return trends;
  })();

  const maxTrendValue = Math.max(...monthlyTrends.map(t => Math.max(t.lost, t.found)), 2);
  const getLineY = (value) => 160 - (value / maxTrendValue) * 120;

  const lostPoints = monthlyTrends.map((t, idx) => `${40 + idx * 70},${getLineY(t.lost)}`).join(' ');
  const foundPoints = monthlyTrends.map((t, idx) => `${40 + idx * 70},${getLineY(t.found)}`).join(' ');

  return (
    <div className="content-container py-8">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      {/* Header */}
      <div className="mb-6 relative z-10" ref={containerRef}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
            <Shield size={22} className="text-primary-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              <VariableProximity
                label="Admin Dashboard"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={120}
                falloff="linear"
              />
            </h1>
            <p className="text-slate-400 text-sm">Overview of campus lost & found activity</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
        {stats.map(({ label, value, icon: Icon, color, bg, to }) => (
          <Link key={label} to={to} className="h-full">
            <GlareHover
              borderRadius="24px"
              borderColor="rgba(99,102,241,0.2)"
              background="var(--gradient-card)"
              width="100%"
              height="100%"
            >
              <div className="p-5 hover:cursor-pointer h-full flex flex-col justify-between w-full" style={{ background: 'transparent', border: 'none' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <TrendingUp size={14} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </div>
            </GlareHover>
          </Link>
        ))}
      </div>

      {/* Analytics Visualization and Heatmap */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 relative z-10">
        {/* Heatmap overlay */}
        <GlareHover
          className="xl:col-span-2"
          borderRadius="24px"
          borderColor="rgba(99,102,241,0.2)"
          background="var(--gradient-card)"
          width="100%"
          height="100%"
        >
          <div className="p-5 flex flex-col justify-between min-h-[420px] w-full h-full" style={{ background: 'transparent', border: 'none' }}>
            <div>
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2 text-sm">
                <Map size={15} className="text-accent-400" /> Campus Hotspot Heatmap
              </h3>
              <p className="text-xs text-slate-400 mb-4">Pulse magnitude represents active lost & found reports at each site.</p>
            </div>

            <div className="relative w-full flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 overflow-hidden py-4">
              <svg viewBox="0 0 500 400" className="w-full max-w-[480px] h-auto">
                {/* Campus Grid Layout */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  </pattern>
                  <radialGradient id="hotspotGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Campus outlines */}
                {/* Main pathway */}
                <path d="M 50,220 Q 250,150 450,220" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="24" strokeLinecap="round" />
                <path d="M 230,50 L 230,350" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="16" strokeLinecap="round" />

                {/* Campus Buildings (Mock blueprints) */}
                {/* Admin block */}
                <rect x="210" y="40" width="40" height="20" rx="3" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
                {/* Library */}
                <rect x="80" y="70" width="70" height="50" rx="6" fill="none" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
                {/* Canteen */}
                <polygon points="320,60 370,60 360,110 330,110" fill="none" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
                {/* Block A */}
                <rect x="60" y="210" width="50" height="70" rx="4" fill="none" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
                {/* Block B */}
                <rect x="200" y="170" width="60" height="60" rx="4" fill="none" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
                {/* Auditorium */}
                <circle cx="420" cy="230" r="30" fill="none" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" />
                {/* Sports Ground outline */}
                <rect x="130" y="320" width="100" height="50" rx="25" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
                {/* Parking Area */}
                <rect x="310" y="300" width="80" height="60" rx="3" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Render Hotspots */}
                {hotspotList.map(h => {
                  const count = hotspotCounts[h.name] || 0;
                  const radius = 10 + Math.min(25, count * 6);
                  const isHovered = hoveredHotspot === h.name;
                  
                  return (
                    <g key={h.name}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredHotspot(h.name)}
                      onMouseLeave={() => setHoveredHotspot(null)}>
                      {count > 0 && (
                        <>
                          {/* Glowing radial outer shadow */}
                          <circle cx={h.x} cy={h.y} r={radius * 2} fill="url(#hotspotGlow)" opacity="0.6" />
                          {/* Pulsating ring */}
                          <circle cx={h.x} cy={h.y} r={radius + 6} fill="none" stroke="#f97316" strokeWidth="1" opacity="0.4">
                            <animate attributeName="r" values={`${radius};${radius + 12};${radius}`} dur="2.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                          </circle>
                        </>
                      )}
                      {/* Hotspot core */}
                      <circle cx={h.x} cy={h.y} r={count > 0 ? 6 : 4} fill={count > 0 ? '#f97316' : 'rgba(99,102,241,0.3)'} stroke="#0a0a14" strokeWidth="1" />
                      
                      {/* Hotspot label text */}
                      <text x={h.x} y={h.y - 12} textAnchor="middle" fill={isHovered || count > 0 ? '#ffffff' : '#94a3b8'} fontSize="9" fontWeight={count > 0 ? 'bold' : 'normal'}>
                        {h.label} {count > 0 ? `(${count})` : ''}
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              {/* Tooltip Overlay */}
              {hoveredHotspot && (
                <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white z-20">
                  <span className="font-semibold">{hoveredHotspot}:</span> {hotspotCounts[hoveredHotspot]} reports
                </div>
              )}
            </div>
          </div>
        </GlareHover>

        {/* Category donut breakdown */}
        <GlareHover
          borderRadius="24px"
          borderColor="rgba(99,102,241,0.2)"
          background="var(--gradient-card)"
          width="100%"
          height="100%"
        >
          <div className="p-5 flex flex-col justify-between w-full h-full" style={{ background: 'transparent', border: 'none' }}>
            <div>
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2 text-sm">
                <BarChart2 size={15} className="text-primary-400" /> Category Breakdown
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-semibold text-left">Distribution of reports by item type.</p>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <svg width="150" height="150" viewBox="0 0 120 120" className="rotate-[-90deg]">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                {donutSlices.map((slice, i) => (
                  <circle
                    key={slice.name}
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="12"
                    strokeDasharray={`${slice.strokeLength} 314.16`}
                    strokeDashoffset={slice.strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                ))}
              </svg>
              
              {/* Donut Legend */}
              <div className="w-full mt-5 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {donutSlices.map(slice => (
                  <div key={slice.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: slice.color }} />
                      <span className="text-slate-300 truncate">{slice.name}</span>
                    </div>
                    <span className="text-white font-semibold ml-2 shrink-0">{slice.count} ({Math.round(slice.percent)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlareHover>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Line Chart: Monthly Trends */}
        <GlareHover
          className="lg:col-span-2"
          borderRadius="24px"
          borderColor="rgba(99,102,241,0.2)"
          background="var(--gradient-card)"
          width="100%"
          height="100%"
        >
          <div className="p-5 flex flex-col justify-between w-full h-full" style={{ background: 'transparent', border: 'none' }}>
            <div>
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2 text-sm">
                <TrendingUp size={15} className="text-emerald-400" /> Monthly Trends
              </h3>
              <p className="text-xs text-slate-400 mb-4">Volume comparison of lost vs found reports over the last 6 months.</p>
            </div>

            <div className="py-2">
              <svg viewBox="0 0 420 200" className="w-full h-auto">
                {/* Grids */}
                <line x1="40" y1="40" x2="390" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="40" y1="100" x2="390" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="40" y1="160" x2="390" y2="160" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {/* Lost Line */}
                <polyline
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2.5"
                  points={lostPoints}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-1000"
                />
                {/* Found Line */}
                <polyline
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2.5"
                  points={foundPoints}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-1000"
                />

                {/* Data points */}
                {monthlyTrends.map((t, idx) => (
                  <g key={t.name}>
                    {/* Lost point */}
                    <circle cx={40 + idx * 70} cy={getLineY(t.lost)} r="4.5" fill="#f87171" stroke="#0a0a14" strokeWidth="1.5" />
                    {/* Found point */}
                    <circle cx={40 + idx * 70} cy={getLineY(t.found)} r="4.5" fill="#4ade80" stroke="#0a0a14" strokeWidth="1.5" />
                    
                    {/* X Axis Labels */}
                    <text x={40 + idx * 70} y="180" textAnchor="middle" fill="#94a3b8" fontSize="10">{t.name}</text>
                  </g>
                ))}

                {/* Legend */}
                <g transform="translate(320, 20)">
                  <circle cx="10" cy="5" r="4" fill="#f87171" />
                  <text x="20" y="9" fill="#94a3b8" fontSize="10">Lost</text>
                  <circle cx="50" cy="5" r="4" fill="#4ade80" />
                  <text x="60" y="9" fill="#94a3b8" fontSize="10">Found</text>
                </g>
              </svg>
            </div>
          </div>
        </GlareHover>

        {/* Recent Activity */}
        <GlareHover
          borderRadius="24px"
          borderColor="rgba(99,102,241,0.2)"
          background="var(--gradient-card)"
          width="100%"
          height="100%"
        >
          <div className="p-5 w-full h-full" style={{ background: 'transparent', border: 'none' }}>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
              <Clock size={15} className="text-primary-400" /> Recent Activity
            </h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {recentActivity.map((item, idx) => (
                <div key={item.id + idx} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm
                    ${item._type === 'lost' ? 'bg-red-500/15 text-red-400' :
                      item._type === 'found' ? 'bg-green-500/15 text-green-400' :
                      'bg-orange-500/15 text-orange-400'}`}>
                    {item._type === 'lost' ? '🔍' : item._type === 'found' ? '✅' : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 truncate">{item._label}</p>
                    <p className="text-[10px] text-slate-500">{formatDistanceToNow(item.createdAt)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                    item._type === 'claim'
                      ? item.status === 'pending' ? 'bg-orange-500/15 text-orange-400'
                      : item.status === 'approved' ? 'bg-green-500/15 text-green-400'
                      : 'bg-red-500/15 text-red-400'
                      : 'bg-white/5 text-slate-400'
                  }`}>
                    {item._type === 'claim' ? item.status : item._type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlareHover>
      </div>

      {/* Bottom section links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {[
          { to: '/admin/users', label: 'Manage Users', desc: 'Active student registry', icon: Users, color: '#a5b4fc' },
          { to: '/admin/posts', label: 'Moderation Queue', desc: 'Remove spam or duplicate posts', icon: AlertTriangle, color: '#f87171' },
          { to: '/admin/claims', label: 'Pending Claims', desc: 'Review ownership proof requests', icon: FileText, color: '#fb923c' },
        ].map(({ to, label, desc, icon: Icon, color }) => (
          <Link key={to} to={to}>
            <GlareHover
              borderRadius="16px"
              borderColor="rgba(99,102,241,0.2)"
              background="var(--gradient-card)"
              width="100%"
              height="100%"
            >
              <div className="p-4 flex items-center gap-4 hover:border-primary-500/40 transition-all w-full h-full" style={{ background: 'transparent', border: 'none' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{label}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                <span className="ml-auto text-slate-600 text-xs">→</span>
              </div>
            </GlareHover>
          </Link>
        ))}
      </div>
    </div>
  );
}
