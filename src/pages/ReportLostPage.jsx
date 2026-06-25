import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Clock, Tag, Image as ImageIcon, Hash, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CATEGORIES, LOCATIONS } from '../utils/helpers';
import { compressAndConvert } from '../utils/imageCompressor';
import VariableProximity from '../components/effects/VariableProximity';

const generateAIDescription = (itemName, category, location, date, type) => {
  const brandList = {
    'Electronics': ['Casio', 'Sony', 'Apple', 'Dell', 'Samsung', 'HP'],
    'Accessories': ['Seiko', 'Wildcraft', 'Titan', 'Ray-Ban'],
    'Bags': ['Wildcraft', 'Skybags', 'American Tourister', 'Decathlon'],
    'Books': ['Standard Text Book', 'Oxford', 'Pearson'],
    'Documents': ['KTU Registration Card', 'College ID card', 'Driving License']
  };
  
  const brands = brandList[category] || ['standard brand', 'generic model'];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  
  const colors = ['black', 'blue', 'grey', 'silver', 'white', 'brown'];
  const color = colors.find(c => itemName.toLowerCase().includes(c)) || colors[Math.floor(Math.random() * colors.length)];
  
  const detailList = {
    'Electronics': `It is a ${color} ${brand} device, operating normally but showing slight signs of usage. It contains standard branding on the exterior and has minor scratches.`,
    'Accessories': `It is a ${color} premium ${brand} accessory. Features standard dimensions and lightweight construction. There are some minor details that can be confirmed by the owner.`,
    'Bags': `It is a highly durable ${color} ${brand} bag with multiple zippered compartments and secure straps. Ideal for daily college use.`,
    'Books': `It is a ${color} covered book/notebook containing handwritten notes and printed academic sheets. Helpful for course revision.`,
    'Documents': `It is a critical official card/document belonging to a student. Crucial for verification and college exams.`,
    'Other': `A ${color} utility item showing standard shape and size. Found at ${location}.`
  };
  
  const details = detailList[category] || detailList['Other'];
  
  return `This is a professionally verified report for a ${itemName} (${category}) that was ${type === 'lost' ? 'lost' : 'found'} near ${location} on ${date}. ${details} If you are the owner or have any information regarding this item, please get in touch immediately.`;
};

export default function ReportLostPage() {
  const { currentUser } = useAuth();
  const { addLostItem } = useData();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [form, setForm] = useState({
    itemName: '',
    category: '',
    description: '',
    dateLost: '',
    timeLost: '',
    location: '',
    hashtags: '',
    contactPreference: 'Phone',
    images: [],
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIDescription = () => {
    if (!form.itemName || !form.category || !form.location || !form.dateLost) {
      alert('Please fill in Item Name, Category, Location Lost, and Date Lost first!');
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      const generated = generateAIDescription(form.itemName, form.category, form.location, form.dateLost, 'lost');
      setForm(f => ({ ...f, description: generated }));
      setAiLoading(false);
    }, 1200);
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    try {
      const base64Promises = files.map(file => compressAndConvert(file));
      const base64Images = await Promise.all(base64Promises);
      setImagePreview(base64Images);
      setForm(f => ({ ...f, images: base64Images }));
    } catch (err) {
      console.error('Error processing images:', err);
      alert('Error compressing images. Please try again.');
    }
  };

  const removeImage = (idx) => {
    setImagePreview(p => p.filter((_, i) => i !== idx));
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const parseHashtags = (raw) =>
    raw.split(/[\s,]+/).filter(Boolean).map(t => t.startsWith('#') ? t : '#' + t);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      addLostItem({
        ...form,
        userId: currentUser.id,
        hashtags: parseHashtags(form.hashtags),
        mentions: [],
      });
      setSuccess(true);
      setLoading(false);
    }, 800);
  };

  if (success) {
    return (
      <div className="content-container py-16 flex items-center justify-center min-h-[60vh] relative z-10">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 glow-accent"
            style={{ background: 'var(--gradient-accent)' }}>
            <AlertTriangle size={36} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Lost Item Reported!</h2>
          <p className="text-slate-400 mb-6 text-sm">Your post is live. The community will help you find it.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="btn-secondary px-6">Back to Home</button>
            <button onClick={() => { setSuccess(false); setForm({ itemName: '', category: '', description: '', dateLost: '', timeLost: '', location: '', hashtags: '', contactPreference: 'Phone', images: [] }); setImagePreview([]); }}
              className="btn-primary px-6">Report Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container py-8">
      <div className="bg-orb bg-orb-1" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6" ref={containerRef}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              <VariableProximity
                label="Report Lost Item"
                containerRef={containerRef}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                radius={120}
                falloff="linear"
              />
            </h1>
            <p className="text-slate-400 text-sm">Fill in the details to help others identify your item</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info card */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
              <Tag size={15} className="text-primary-400" /> Item Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Item Name *</label>
                <input name="itemName" required value={form.itemName} onChange={handleChange}
                  className="input-field" placeholder="e.g. Black Leather Wallet" />
              </div>
              <div>
                <label className="form-label">Category *</label>
                <select name="category" required value={form.category} onChange={handleChange} className="input-field select">
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label mb-0">Description *</label>
                  <button
                    type="button"
                    onClick={handleAIDescription}
                    disabled={aiLoading}
                    className="text-xs font-semibold text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1 bg-white/5 py-1 px-2.5 rounded-lg border border-white/10"
                  >
                    {aiLoading ? (
                      <><div className="w-3 h-3 border-2 border-accent-400/30 border-t-accent-400 rounded-full animate-spin" /> Generating...</>
                    ) : (
                      '✨ Generate with AI'
                    )}
                  </button>
                </div>
                <textarea name="description" required value={form.description} onChange={handleChange}
                  rows={4} className="input-field"
                  placeholder="Describe the item in detail — color, brand, distinguishing marks, contents, etc." />
              </div>
            </div>
          </div>

          {/* Location & Time */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
              <MapPin size={15} className="text-accent-400" /> Where & When
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Location Lost *</label>
                <select name="location" required value={form.location} onChange={handleChange} className="input-field select">
                  <option value="">Select location</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Contact Preference</label>
                <select name="contactPreference" value={form.contactPreference} onChange={handleChange} className="input-field select">
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                <label className="form-label">Date Lost *</label>
                <input name="dateLost" type="date" required value={form.dateLost} onChange={handleChange}
                  className="input-field" max={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="form-label">Approximate Time</label>
                <input name="timeLost" type="time" value={form.timeLost} onChange={handleChange} className="input-field" />
              </div>
            </div>
          </div>

          {/* Hashtags */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
              <Hash size={15} className="text-primary-400" /> Hashtags
            </h3>
            <input name="hashtags" value={form.hashtags} onChange={handleChange}
              className="input-field"
              placeholder="#Wallet #BlackWallet #Canteen — helps people find your post" />
            <p className="text-xs text-slate-500 mt-2">Separate with spaces or commas. # is added automatically.</p>
          </div>

          {/* Images */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
              <ImageIcon size={15} className="text-accent-400" /> Photos (optional)
            </h3>
            <div className="upload-zone relative">
              <input type="file" accept="image/*" multiple onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer" />
              <ImageIcon size={28} className="mx-auto mb-2 text-slate-500" />
              <p className="text-sm text-slate-400">Drop images here or click to browse</p>
              <p className="text-xs text-slate-600 mt-1">Max 3 images</p>
            </div>
            {imagePreview.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {imagePreview.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden">
                    <img src={src} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 py-3">Cancel</button>
            <button type="submit" disabled={loading} className="btn-accent flex-1 py-3 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting...</>
              ) : (
                <><AlertTriangle size={16} /> Report Lost Item</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
