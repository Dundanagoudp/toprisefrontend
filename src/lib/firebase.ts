import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwNik4xmNLgKkwzMuPAGExlcUH_zViTaM",
  authDomain: "toprise-c2515.firebaseapp.com",
  projectId: "toprise-c2515",
  storageBucket: "toprise-c2515.firebasestorage.app",
  messagingSenderId: "627943781783",
  appId: "1:627943781783:web:dbf2547274fd3a223f00d2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
