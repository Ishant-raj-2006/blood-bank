import { auth, db }
from "./firebase.js";

import {
  createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================
// CAPTCHA
// =====================

let captcha = "";

function generateCaptcha(){

  const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  captcha = "";

  for(let i=0; i<6; i++){

    captcha += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );

  }

  document.getElementById(
    "captchaText"
  ).innerText = captcha;

}

generateCaptcha();

window.generateCaptcha =
generateCaptcha;


// =====================
// SIGNUP
// =====================

window.signup = async function(){

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


  // Validation

  if(
    fullname === "" ||
    aadhaar === "" ||
    email === "" ||
    phone === "" ||
    bloodGroup === "" ||
    password === "" ||
    confirmPassword === "" ||
    captchaInput === ""
  ){

    alert("Please fill all fields");

    return;

  }

  // Aadhaar Validation

  if(aadhaar.length !== 12){

    alert("Aadhaar Number must be 12 digits");

    return;

  }

  // Password Match

  if(password !== confirmPassword){

    alert("Passwords do not match");

    return;

  }

  // Captcha Check

  if(captchaInput !== captcha){

    alert("Invalid Captcha");

    generateCaptcha();

    return;

  }

  try{

    // Firebase Auth

    const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Save User Data

    await addDoc(
      collection(db,"users"),
      {
        fullname,
        aadhaar,
        email,
        phone,
        bloodGroup
      }
    );

    alert("Registration Successful");

    window.location.href =
    "login.html";

  }catch(error){

    alert(error.message);

  }

}