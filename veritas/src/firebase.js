// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDRpD1yiKtIiWu1NMLIiw_JuDqfQmKv3rs",
  authDomain: "veritas-abb13.firebaseapp.com",
  projectId: "veritas-abb13",
  storageBucket: "veritas-abb13.firebasestorage.app",
  messagingSenderId: "961306034620",
  appId: "1:961306034620:web:3cc5b1603f62bbe38f2bb9",
  measurementId: "G-J7ZRZBXY4X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);