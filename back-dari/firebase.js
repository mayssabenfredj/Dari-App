const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBx_12w3w7ZKmAMGcXJv_bYHZsRy-f2-_s",
  authDomain: "dari-96768.firebaseapp.com",
  projectId: "dari-96768",
  storageBucket: "dari-96768.firebasestorage.app",
  messagingSenderId: "920683720983",
  appId: "1:920683720983:web:0f93743dd49503a0220752",
  measurementId: "G-LHDFP2YVYW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore instance and utility functions for querying
module.exports = { db, collection, addDoc, query, where, getDocs };
