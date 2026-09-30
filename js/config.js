/**
 * SETTINGS: admin email, logo files, Firebase project keys and startup.
 * Loaded first. Change the admin email, logos or Firebase project here.
 */

// Only these emails can edit. Everyone else who signs in is view-only.
const ADMIN_EMAILS = ["rhyant13th@gmail.com"];

// Logo picture files (replace the PNG in assets/, keep the same file name)
// ---------- ANALYTICS REPORTS (new tab) ----------
const PGO_LOGO_URI = "assets/seal-report.png";
const PGO_LOGO_HEADER_URI = "assets/seal-header.png";
const PGO_LOGO_LOGIN_URI = "assets/seal-login.png";

// Firebase project keys + startup (Firebase web keys are public by design;
// real protection comes from your Firestore security rules)
const firebaseConfig = {
  apiKey: "AIzaSyAhfpg6aVJlazzuyelcPILDzEVtqdlBrKw",
  authDomain: "tourism-inventory-e44d0.firebaseapp.com",
  projectId: "tourism-inventory-e44d0",
  storageBucket: "tourism-inventory-e44d0.firebasestorage.app",
  messagingSenderId: "269769924283",
  appId: "1:269769924283:web:39be26bb7ef751fabb539e"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
window.auth = firebase.auth();
