// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAn7vfm3mQb1PR0ppAyBj_5dRsngCAlXnk",
  authDomain: "craftersmc-guides-cab30.firebaseapp.com",
  projectId: "craftersmc-guides-cab30",
  storageBucket: "craftersmc-guides-cab30.firebasestorage.app",
  messagingSenderId: "924655326351",
  appId: "1:924655326351:web:bf07720a8f5787aec04cfa"
};

if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = firebaseConfig;
}
