// ✅ Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAhc9Hk2fNPsmwpMrWsijZqmRZ6NUbJFQ8",
  authDomain: "college-b8571.firebaseapp.com",
  projectId: "college-b8571",
  storageBucket: "college-b8571.firebasestorage.app",
  messagingSenderId: "527561181583",
  appId: "1:527561181583:web:4701620c178c073020e3fa",
  measurementId: "G-XC7V54ZLEC",
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Firestore for database
const db = getFirestore(app);

// ✅ Firebase Auth (for OTP login)
const auth = getAuth(app);

// ✅ Firebase Storage (for screenshots)
const storage = getStorage(app, "gs://college-b8571.appspot.com");

// ✅ Export all needed functions
export { db, auth, storage, RecaptchaVerifier, signInWithPhoneNumber };