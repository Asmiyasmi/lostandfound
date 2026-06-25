import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1I0OFp8fDrSJ5uw2iS0oWoU7lrGbq2cM",
  authDomain: "campuslf-8cfe0.firebaseapp.com",
  projectId: "campuslf-8cfe0",
  storageBucket: "campuslf-8cfe0.firebasestorage.app",
  messagingSenderId: "162602090287",
  appId: "1:162602090287:web:b1f0241dadb07e462bebda",
  measurementId: "G-B1BY6J24WQ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
