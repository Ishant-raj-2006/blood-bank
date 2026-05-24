import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Switch between Login and Register tabs
window.switchTab = function(tab) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  
  document.getElementById(tab).classList.add("active");
  event.target.classList.add("active");
};

// Admin Login
window.adminLogin = async function() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is admin
    const adminQuery = query(collection(db, "bloodCenterAdmins"), where("email", "==", email));
    const snapshot = await getDocs(adminQuery);
    
    if (snapshot.empty) {
      alert("Not authorized as blood center admin");
      return;
    }

    alert("Login successful!");
    window.location.href = "admin-dashboard.html";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
};

// Admin Register
window.adminRegister = async function() {
  const centerName = document.getElementById("registerCenterName").value;
  const pinCode = document.getElementById("registerPinCode").value;
  const address = document.getElementById("registerAddress").value;
  const phone = document.getElementById("registerPhone").value;
  const state = document.getElementById("registerState").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;

  // Validation
  if (!centerName || !pinCode || !address || !phone || !state || !email || !password || !confirmPassword) {
    alert("Please fill all fields");
    return;
  }

  if (!/^[0-9]{6}$/.test(pinCode)) {
    alert("Please enter a valid 6-digit pin code");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Save Blood Center Admin info in Firestore
    await addDoc(collection(db, "bloodCenterAdmins"), {
      uid,
      email,
      centerName,
      pinCode,
      address,
      phone,
      state,
      createdAt: new Date().toISOString(),
      role: "admin"
    });

    alert("Registration successful! Please login.");
    document.getElementById("registerCenterName").value = "";
    document.getElementById("registerPinCode").value = "";
    document.getElementById("registerAddress").value = "";
    document.getElementById("registerPhone").value = "";
    document.getElementById("registerState").value = "";
    document.getElementById("registerEmail").value = "";
    document.getElementById("registerPassword").value = "";
    document.getElementById("registerConfirmPassword").value = "";
    
    window.switchTab("login");
  } catch (error) {
    alert("Registration failed: " + error.message);
  }
};
