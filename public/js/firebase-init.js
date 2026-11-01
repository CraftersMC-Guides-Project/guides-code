// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAn7vfm3mQb1PR0ppAyBj_5dRsngCAlXnk",
  authDomain: "craftersmc-guides-cab30.firebaseapp.com",
  projectId: "craftersmc-guides-cab30",
  storageBucket: "craftersmc-guides-cab30.firebasestorage.app",
  messagingSenderId: "924655326351",
  appId: "1:924655326351:web:bf07720a8f5787aec04cfa"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

if (typeof window !== "undefined") {
  window.firebaseApp = app;
  window.firebaseConfig = firebaseConfig;
}

export default app;

