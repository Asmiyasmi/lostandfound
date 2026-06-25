import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { db, auth } from '../../firebase';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';

const AuthContext = createContext(null);

const ADMIN_EMAIL = 'admin@campus.edu';
const ADMIN_PASSWORD = 'admin123';

const SEED_USERS = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex@campus.edu', password: 'password123', ktuId: 'KTU2021CS001', phone: '9876543210', department: 'Computer Science', role: 'student', profileImage: null, createdAt: new Date('2024-01-10').toISOString(), points: 120, badges: ['Helpful Student', 'Campus Hero', 'Lost & Found Champion'] },
  { id: 'u2', name: 'Priya Nair', email: 'priya@campus.edu', password: 'password123', ktuId: 'KTU2022EC002', phone: '9876543211', department: 'Electronics', role: 'student', profileImage: null, createdAt: new Date('2024-02-15').toISOString(), points: 65, badges: ['Helpful Student', 'Campus Hero'] },
  { id: 'u3', name: 'Rahul Menon', email: 'rahul@campus.edu', password: 'password123', ktuId: 'KTU2023ME003', phone: '9876543212', department: 'Mechanical', role: 'student', profileImage: null, createdAt: new Date('2024-03-05').toISOString(), points: 20, badges: ['Helpful Student'] },
];

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useLocalStorage('clf_current_user', null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // ── Firebase Auth and Firestore Users sync ────────────────────────────
  useEffect(() => {
    // 1. Sync authentication state
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setCurrentUser(userSnap.data());
        } else {
          const name = firebaseUser.displayName || firebaseUser.email;
          const u = {
            id: firebaseUser.uid,
            name,
            email: firebaseUser.email,
            ktuId: '',
            phone: '',
            department: '',
            role: 'student',
            profileImage: null,
            createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
            points: 0,
            badges: ['Helpful Student']
          };
          await setDoc(userDocRef, u);
          setCurrentUser(u);
        }
      } else {
        setCurrentUser(curr => {
          if (curr?.role === 'admin') return curr;
          return null;
        });
      }
      setSessionLoading(false);
    });

    // 2. Real-time users list listener for leaderboard & admin panel
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), async (snapshot) => {
      if (snapshot.empty) {
        // Seed users if database collection is empty
        const seedPromises = SEED_USERS.map(async (u) => {
          const profile = { ...u };
          delete profile.password; // Do not store password in firestore
          await setDoc(doc(db, 'users', u.id), profile);
        });
        await Promise.all(seedPromises);
      } else {
        const usersList = snapshot.docs.map(doc => ({ ...doc.data() }));
        setUsers(usersList);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUsers();
    };
  }, []); // eslint-disable-line

  // ── Auth actions ───────────────────────────────────────────────────────────
  const login = async (email, password, isAdmin = false) => {
    if (isAdmin) {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser = { id: 'admin', name: 'Administrator', email: ADMIN_EMAIL, role: 'admin' };
        setCurrentUser(adminUser);
        return { success: true, user: adminUser };
      }
      return { success: false, error: 'Invalid admin credentials' };
    }

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr) {
        // If user is a seed user in Firestore but not in Firebase Auth, automatically create them
        const matchingSeed = SEED_USERS.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (matchingSeed && (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential')) {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          await firebaseUpdateProfile(firebaseUser, { displayName: matchingSeed.name });
          
          const newProfile = { ...matchingSeed, id: firebaseUser.uid };
          delete newProfile.password;
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
        } else {
          throw authErr;
        }
      }

      const firebaseUser = userCredential.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);
      let userData;
      if (userSnap.exists()) {
        userData = userSnap.data();
      } else {
        userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email,
          email: firebaseUser.email,
          ktuId: '',
          phone: '',
          department: '',
          role: 'student',
          profileImage: null,
          createdAt: new Date().toISOString(),
          points: 0,
          badges: ['Helpful Student'],
        };
        await setDoc(userDocRef, userData);
      }

      setCurrentUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      let message = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      return { success: false, error: message };
    }
  };

  const register = async (formData) => {
    const { name, email, password, ktuId, phone, department } = formData;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await firebaseUpdateProfile(firebaseUser, { displayName: name });

      const userData = {
        id: firebaseUser.uid,
        name,
        email,
        ktuId,
        phone,
        department,
        role: 'student',
        profileImage: null,
        createdAt: new Date().toISOString(),
        points: 0,
        badges: ['Helpful Student'],
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setCurrentUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    if (currentUser?.role !== 'admin') {
      await signOut(auth);
    }
    setCurrentUser(null);
  };

  const updateProfile = async (data) => {
    const updated = { ...currentUser, ...data };
    if (currentUser?.role !== 'admin') {
      await updateDoc(doc(db, 'users', currentUser.id), data);
    }
    setCurrentUser(updated);
  };

  const awardPoints = async (userId, amount) => {
    if (userId === 'admin') return;
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const u = userSnap.data();
      const newPoints = Math.max(0, (u.points || 0) + amount);
      const badges = [];
      if (newPoints >= 0) badges.push('Helpful Student');
      if (newPoints >= 51) badges.push('Campus Hero');
      if (newPoints >= 101) badges.push('Lost & Found Champion');
      const updated = { ...u, points: newPoints, badges };
      await updateDoc(userDocRef, { points: newPoints, badges });
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(updated);
      }
    }
  };

  const removeUser = async (userId) => {
    if (userId === 'admin') return;
    await deleteDoc(doc(db, 'users', userId));
  };

  const suspendUser = async (userId) => {
    if (userId === 'admin') return;
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const u = userSnap.data();
      const newSuspended = !u.suspended;
      await updateDoc(userDocRef, { suspended: newSuspended });
    }
  };

  if (sessionLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a14'
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
        }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid rgba(99,102,241,0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      currentUser, users,
      login, register, logout, updateProfile,
      awardPoints, removeUser, suspendUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
