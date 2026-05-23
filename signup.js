// ======================
// FIREBASE IMPORTS
// ======================

import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================
// CAPTCHA
// ======================

let captcha = "";

window.generateCaptcha = function () {

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  captcha = "";

  for (let i = 0; i < 6; i++) {

    captcha += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );

  }

  document.getElementById(
    "captchaText"
  ).innerHTML = captcha;

};


// First Captcha

window.generateCaptcha();


// ======================
// SIGNUP FUNCTION
// ======================

window.signup = async function () {

  const fullname =
    document.getElementById("fullname").value;

  const aadhaar =
    document.getElementById("aadhaar").value;

  const email =
    document.getElementById("email").value;

  const phone =
    document.getElementById("phone").value;

  const bloodGroup =
    document.getElementById("bloodGroup").value;

  const password =
    document.getElementById("password").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;

  const captchaInput =
    document.getElementById("captchaInput").value;


  // ======================
  // VALIDATION
  // ======================

  if (
    fullname === "" ||
    aadhaar === "" ||
    email === "" ||
    phone === "" ||
    bloodGroup === "" ||
    password === "" ||
    confirmPassword === "" ||
    captchaInput === ""
  ) {

    alert("Please fill all fields");

    return;

  }


  // Aadhaar Validation

  if (aadhaar.length !== 12) {

    alert("Aadhaar Number must be 12 digits");

    return;

  }


  // Password Match

  if (password !== confirmPassword) {

    alert("Passwords do not match");

    return;

  }


  // CAPTCHA Validation

  if (captchaInput !== captcha) {

    alert("Invalid Captcha");

    window.generateCaptcha();

    return;

  }


  // ======================
  // FIREBASE SIGNUP
  // ======================

  try {

    // Authentication

    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );


    // Save User Data

    await addDoc(
      collection(db, "users"),
      {
        fullname,
        aadhaar,
        email,
        phone,
        bloodGroup
      }
    );

    alert("Registration Successful");


    // Redirect

    window.location.href =
      "login.html";

  }

  catch (error) {

    alert(error.message);

  }

};