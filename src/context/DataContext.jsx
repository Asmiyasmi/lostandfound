import { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { db } from '../../firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  onSnapshot, query, orderBy 
} from 'firebase/firestore';

const DataContext = createContext(null);

// Helper for relative dates in seeds
const daysAgo = (num) => {
  const d = new Date();
  d.setDate(d.getDate() - num);
  return d.toISOString();
};

const SEED_LOST = [
  { id: 'l1', userId: 'u1', itemName: 'Black Wallet', category: 'Accessories', description: 'Black leather bifold wallet with KTU ID and some cash inside. Lost near the canteen.', dateLost: daysAgo(2).split('T')[0], timeLost: '13:30', location: 'Main Canteen', images: ['https://images.unsplash.com/photo-1627124118974-1d98faaf72e2?auto=format&fit=crop&w=600&q=80'], hashtags: ['#Wallet', '#BlackWallet', '#Canteen'], mentions: [], contactPreference: 'Phone', status: 'active', createdAt: daysAgo(2) },
  { id: 'l2', userId: 'u2', itemName: 'Scientific Calculator', category: 'Electronics', description: 'Casio fx-991EX scientific calculator. Has my name written on the back in marker.', dateLost: daysAgo(4).split('T')[0], timeLost: '10:00', location: 'Block B Lab', images: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80'], hashtags: ['#Calculator', '#Casio', '#Lab'], mentions: [], contactPreference: 'Email', status: 'active', createdAt: daysAgo(4) },
  { id: 'l3', userId: 'u3', itemName: 'Student ID Card', category: 'Documents', description: 'KTU student ID card. Important for exams. Please contact ASAP.', dateLost: daysAgo(6).split('T')[0], timeLost: '09:15', location: 'Library', images: ['https://images.unsplash.com/photo-1578160112054-954a67602b88?auto=format&fit=crop&w=600&q=80'], hashtags: ['#IDCard', '#StudentID', '#Library'], mentions: [], contactPreference: 'Phone', status: 'active', createdAt: daysAgo(6) },
  { id: 'l4', userId: 'u1', itemName: 'Blue Backpack', category: 'Bags', description: 'Navy blue Wildcraft backpack with laptop compartment. Contains notes and charger.', dateLost: daysAgo(10).split('T')[0], timeLost: '16:00', location: 'Seminar Hall', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'], hashtags: ['#Backpack', '#Bag', '#SeminarHall'], mentions: [], contactPreference: 'Phone', status: 'active', createdAt: daysAgo(10) },
  { id: 'l5', userId: 'u2', itemName: 'iPhone 13', category: 'Electronics', description: 'Space grey iPhone 13 with a cracked screen protector. Has a blue case.', dateLost: daysAgo(15).split('T')[0], timeLost: '11:45', location: 'Hostel Block A', images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'], hashtags: ['#iPhone', '#Phone', '#Hostel'], mentions: [], contactPreference: 'Email', status: 'active', createdAt: daysAgo(15) },
  { id: 'l6', userId: 'u3', itemName: 'Mechanical Watch', category: 'Accessories', description: 'Silver Seiko mechanical watch. Sentimental value, please return.', dateLost: daysAgo(35).split('T')[0], timeLost: '14:20', location: 'Sports Ground', images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80'], hashtags: ['#Watch', '#Seiko', '#Sports'], mentions: [], contactPreference: 'Phone', status: 'active', createdAt: daysAgo(35) },
];

const SEED_FOUND = [
  { id: 'f1', userId: 'u2', itemName: 'Keys Bundle', category: 'Accessories', description: 'Bundle of 3 keys with a red keychain. Found near the parking area.', dateFound: daysAgo(1).split('T')[0], timeFound: '08:30', location: 'Parking Area', storageLocation: 'Security Office', images: ['https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80'], hashtags: ['#Keys', '#Keychain', '#Parking'], mentions: [], status: 'active', createdAt: daysAgo(1), qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=f1' },
  { id: 'f2', userId: 'u1', itemName: 'Notebook - Engineering Maths', category: 'Books', description: 'Spiral notebook with Engineering Mathematics notes. Name on front: Rahul.', dateFound: daysAgo(3).split('T')[0], timeFound: '12:00', location: 'Classroom 204', storageLocation: 'Department Office', images: ['https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80'], hashtags: ['#Notebook', '#Notes', '#Maths'], mentions: [], status: 'active', createdAt: daysAgo(3), qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=f2' },
  { id: 'f3', userId: 'u3', itemName: 'Earphones', category: 'Electronics', description: 'Sony WI-C200 wireless earphones in white. Found in the library reading room.', dateFound: daysAgo(5).split('T')[0], timeFound: '17:30', location: 'Library', storageLocation: 'Library Counter', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80'], hashtags: ['#Earphones', '#Sony', '#Library'], mentions: [], status: 'active', createdAt: daysAgo(5), qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=f3' },
  { id: 'f4', userId: 'u2', itemName: 'Spectacles', category: 'Accessories', description: 'Black rimmed prescription glasses in a brown case. Found at the cafeteria table.', dateFound: daysAgo(9).split('T')[0], timeFound: '13:00', location: 'Cafeteria', storageLocation: 'Cafeteria Counter', images: ['https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80'], hashtags: ['#Spectacles', '#Glasses', '#Cafeteria'], mentions: [], status: 'active', createdAt: daysAgo(9), qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=f4' },
  { id: 'f5', userId: 'u1', itemName: 'Umbrella', category: 'Accessories', description: 'Large black umbrella with wooden handle. Found near the main gate.', dateFound: daysAgo(12).split('T')[0], timeFound: '09:45', location: 'Main Gate', storageLocation: 'Watchman Cabin', images: ['https://images.unsplash.com/photo-1530322339898-3330368dfc3d?auto=format&fit=crop&w=600&q=80'], hashtags: ['#Umbrella', '#Rain', '#Gate'], mentions: [], status: 'active', createdAt: daysAgo(12), qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=f5' },
  { id: 'f6', userId: 'u3', itemName: 'Water Bottle', category: 'Other', description: 'Blue Milton thermosteel water bottle with college sticker. Found in the gym.', dateFound: daysAgo(40).split('T')[0], timeFound: '07:00', location: 'Gymnasium', storageLocation: 'Gym Reception', images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'], hashtags: ['#WaterBottle', '#Milton', '#Gym'], mentions: [], status: 'active', createdAt: daysAgo(40), qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=f6' },
];

const SEED_CLAIMS = [
  { id: 'c1', itemId: 'f1', claimerId: 'u2', name: 'Priya Nair', ktuId: 'KTU2022EC002', phone: '9876543211', proofDescription: 'The red keychain has a small scratch on the back. One of the keys is for a Yale lock.', proofImage: null, status: 'pending', adminRemarks: '', createdAt: daysAgo(1) },
  { id: 'c2', itemId: 'f3', claimerId: 'u2', name: 'Priya Nair', ktuId: 'KTU2022EC002', phone: '9876543211', proofDescription: 'The earphones have my initials PN scratched on the charging port cover.', proofImage: null, status: 'approved', adminRemarks: 'Verified ownership. Please collect from library.', createdAt: daysAgo(3) },
];

const SEED_NOTIFS = [
  { id: 'n1', userId: 'u2', message: 'Someone submitted a claim for Keys Bundle that you found.', read: false, timestamp: daysAgo(1), type: 'claim' },
  { id: 'n2', userId: 'u2', message: 'Your claim for Earphones has been approved!', read: false, timestamp: daysAgo(3), type: 'approved' },
  { id: 'n3', userId: 'u3', message: 'Admin has reviewed your post: Student ID Card.', read: true, timestamp: daysAgo(4), type: 'admin' },
];

export function DataProvider({ children }) {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedPosts, setSavedPosts] = useLocalStorage('clf_saved_posts', []);
  const [searchHistory, setSearchHistory] = useLocalStorage('clf_search_history', []);
  
  const { awardPoints } = useAuth();

  // ── Firestore real-time listener ────────────────────────────
  useEffect(() => {
    // 1. Sync lost items
    const unsubLost = onSnapshot(query(collection(db, 'lost_items'), orderBy('createdAt', 'desc')), async (snap) => {
      if (snap.empty) {
        const seedPromises = SEED_LOST.map(item => setDoc(doc(db, 'lost_items', item.id), item));
        await Promise.all(seedPromises);
      } else {
        setLostItems(snap.docs.map(d => d.data()));
      }
    });

    // 2. Sync found items
    const unsubFound = onSnapshot(query(collection(db, 'found_items'), orderBy('createdAt', 'desc')), async (snap) => {
      if (snap.empty) {
        const seedPromises = SEED_FOUND.map(item => setDoc(doc(db, 'found_items', item.id), item));
        await Promise.all(seedPromises);
      } else {
        setFoundItems(snap.docs.map(d => d.data()));
      }
    });

    // 3. Sync claims
    const unsubClaims = onSnapshot(query(collection(db, 'claims'), orderBy('createdAt', 'desc')), async (snap) => {
      if (snap.empty) {
        const seedPromises = SEED_CLAIMS.map(item => setDoc(doc(db, 'claims', item.id), item));
        await Promise.all(seedPromises);
      } else {
        setClaims(snap.docs.map(d => d.data()));
      }
    });

    // 4. Sync notifications
    const unsubNotifs = onSnapshot(query(collection(db, 'notifications'), orderBy('timestamp', 'desc')), async (snap) => {
      if (snap.empty) {
        const seedPromises = SEED_NOTIFS.map(item => setDoc(doc(db, 'notifications', item.id), item));
        await Promise.all(seedPromises);
      } else {
        setNotifications(snap.docs.map(d => d.data()));
      }
    });

    return () => {
      unsubLost();
      unsubFound();
      unsubClaims();
      unsubNotifs();
    };
  }, []); // eslint-disable-line

  // Similar item matching algorithm
  const findMatches = (targetItem, type) => {
    if (!targetItem) return [];
    const sourceList = type === 'lost' ? foundItems : lostItems;
    
    return sourceList
      .map(item => {
        if (targetItem.category.toLowerCase() !== item.category.toLowerCase()) {
          return null; // Must match category
        }
        
        let score = 25; // Base score for same category
        
        const tWords = targetItem.itemName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const iWords = item.itemName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const commonWords = tWords.filter(w => iWords.includes(w));
        score += commonWords.length * 20;

        const tLoc = targetItem.location.toLowerCase();
        const iLoc = item.location.toLowerCase();
        if (tLoc === iLoc) {
          score += 25;
        } else if (tLoc.includes(iLoc) || iLoc.includes(tLoc)) {
          score += 12;
        }

        const tDesc = targetItem.description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const iDesc = item.description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const commonDesc = tDesc.filter(w => iDesc.includes(w));
        score += commonDesc.length * 5;

        const finalPercentage = Math.min(98, score);
        return { item, matchPercentage: finalPercentage };
      })
      .filter(m => m !== null && m.matchPercentage >= 35 && m.item.status !== 'claimed' && m.item.status !== 'archived')
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  };

  // Expiry check useEffect
  useEffect(() => {
    if (lostItems.length === 0 && foundItems.length === 0) return;

    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    lostItems.forEach(async (item) => {
      if (item.status === 'active' && (now - new Date(item.createdAt).getTime()) > thirtyDays) {
        await updateDoc(doc(db, 'lost_items', item.id), { status: 'archived' });
        await addNotification(item.userId, `Your lost item post "${item.itemName}" was auto-archived after 30 days.`, 'admin');
      }
    });

    foundItems.forEach(async (item) => {
      if (item.status === 'active' && (now - new Date(item.createdAt).getTime()) > thirtyDays) {
        await updateDoc(doc(db, 'found_items', item.id), { status: 'archived' });
        await addNotification(item.userId, `Your found item post "${item.itemName}" was auto-archived after 30 days.`, 'admin');
      }
    });
  }, [lostItems, foundItems]); // eslint-disable-line

  // LOST ITEMS
  const addLostItem = async (data) => {
    const itemId = 'l' + Date.now();
    const item = { id: itemId, ...data, status: 'active', createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'lost_items', itemId), item);
    return item;
  };
  const updateLostItem = async (id, data) => {
    await updateDoc(doc(db, 'lost_items', id), data);
  };
  const deleteLostItem = async (id) => {
    await deleteDoc(doc(db, 'lost_items', id));
  };

  // FOUND ITEMS
  const addFoundItem = async (data) => {
    const itemId = 'f' + Date.now();
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${itemId}`;
    const item = { id: itemId, ...data, qrCode, status: 'active', createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'found_items', itemId), item);
    return item;
  };
  const updateFoundItem = async (id, data) => {
    await updateDoc(doc(db, 'found_items', id), data);
  };
  const deleteFoundItem = async (id) => {
    await deleteDoc(doc(db, 'found_items', id));
  };

  // CLAIMS
  const addClaim = async (data) => {
    const claimId = 'c' + Date.now();
    const claim = { id: claimId, ...data, status: 'pending', adminRemarks: '', createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'claims', claimId), claim);
    await addNotification(data.finderId, `Someone submitted a claim for "${data.itemName}" that you found.`, 'claim');
    return claim;
  };

  const updateClaim = async (id, data) => {
    const claimDocRef = doc(db, 'claims', id);
    const claimSnap = await getDoc(claimDocRef);
    if (!claimSnap.exists()) return;
    const c = claimSnap.data();

    await updateDoc(claimDocRef, data);
    
    // Award points when claims are approved
    if (data.status === 'approved' && c.status !== 'approved') {
      const foundDocRef = doc(db, 'found_items', c.itemId);
      const foundSnap = await getDoc(foundDocRef);
      if (foundSnap.exists()) {
        const found = foundSnap.data();
        await updateDoc(foundDocRef, { status: 'claimed' });
        
        // Associated lost item
        const lostSnap = await getDocs(query(collection(db, 'lost_items')));
        const lost = lostSnap.docs.map(d => d.data()).find(l => 
          l.itemName.toLowerCase() === found.itemName.toLowerCase() && 
          l.userId === c.claimerId &&
          l.status === 'active'
        );
        if (lost) {
          await updateDoc(doc(db, 'lost_items', lost.id), { status: 'claimed' });
        }

        // Reward finder (+20 points)
        if (found.userId) {
          await awardPoints(found.userId, 20);
          await addNotification(found.userId, `Verification successful! The owner claimed "${found.itemName}". You earned +20 points!`, 'approved');
        }

        // Reward owner/claimer (+10 points)
        if (c.claimerId) {
          await awardPoints(c.claimerId, 10);
        }
      }
    }
  };

  // NOTIFICATIONS
  const addNotification = async (userId, message, type = 'info') => {
    const notifId = 'n' + Date.now();
    const notif = { id: notifId, userId, message, read: false, timestamp: new Date().toISOString(), type };
    await setDoc(doc(db, 'notifications', notifId), notif);
  };
  const markNotifRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };
  const markAllRead = async (userId) => {
    const notifSnap = await getDocs(query(collection(db, 'notifications')));
    const batchPromises = notifSnap.docs
      .map(d => d.data())
      .filter(n => n.userId === userId && !n.read)
      .map(n => updateDoc(doc(db, 'notifications', n.id), { read: true }));
    await Promise.all(batchPromises);
  };

  // SAVED POSTS
  const toggleSave = (postId, type) => {
    const key = `${type}-${postId}`;
    setSavedPosts(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };
  const isSaved = (postId, type) => savedPosts.includes(`${type}-${postId}`);

  // SEARCH HISTORY
  const addSearchHistory = (term) => {
    if (!term.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(t => t !== term);
      return [term, ...filtered].slice(0, 10);
    });
  };
  const clearSearchHistory = () => setSearchHistory([]);

  // Trending hashtags (computed)
  const getTrending = () => {
    const all = [...lostItems, ...foundItems].flatMap(i => i.hashtags || []);
    const freq = {};
    all.forEach(h => { freq[h] = (freq[h] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([h]) => h);
  };

  return (
    <DataContext.Provider value={{
      lostItems, foundItems, claims, notifications, savedPosts, searchHistory,
      findMatches,
      addLostItem, updateLostItem, deleteLostItem,
      addFoundItem, updateFoundItem, deleteFoundItem,
      addClaim, updateClaim,
      addNotification, markNotifRead, markAllRead,
      toggleSave, isSaved,
      addSearchHistory, clearSearchHistory,
      getTrending,
      setLostItems, setFoundItems, setClaims,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
