// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9mX4uuYtw32fG4511T1V3jnfxjzrytD8",
  authDomain: "bload-75a70.firebaseapp.com",
  projectId: "bload-75a70",
  storageBucket: "bload-75a70.firebasestorage.app",
  messagingSenderId: "82960272785",
  appId: "1:82960272785:web:421447964a74967fec1e30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and db
export const auth = getAuth(app);
export const db = getFirestore(app);