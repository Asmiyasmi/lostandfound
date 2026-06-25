export function formatDistanceToNow(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function generateId(prefix = '') {
  return prefix + Date.now() + Math.random().toString(36).slice(2, 7);
}

export function compressHashtags(text) {
  return text.split(/[\s,]+/)
    .filter(Boolean)
    .map(t => t.startsWith('#') ? t : '#' + t)
    .join(' ');
}

export function parseHashtags(text) {
  return text.match(/#\w+/g) || [];
}

export const CATEGORIES = [
  'Electronics', 'Documents', 'Accessories', 'Books', 'Bags', 'Clothing', 'Keys', 'Other',
];

export const LOCATIONS = [
  'Main Gate', 'Library', 'Main Canteen', 'Cafeteria', 'Block A', 'Block B', 'Block C',
  'Seminar Hall', 'Sports Ground', 'Hostel Block A', 'Hostel Block B', 'Parking Area',
  'Administrative Block', 'Gymnasium', 'Auditorium', 'Computer Lab', 'Workshop',
];
