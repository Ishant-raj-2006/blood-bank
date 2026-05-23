import { auth, db }
from "./firebase.js";

import {
  signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================
// CAPTCHA
// ======================

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


// ======================
// LOGIN
// ======================

window.login = async function(){

  const aadhaar =
  document.getElementById("aadhaar").value;

  const password =
  document.getElementById("password").value;

  const captchaInput =
  document.getElementById("captchaInput").value;


  if(
    aadhaar === "" ||
    password === "" ||
    captchaInput === ""
  ){

    alert("Please fill all fields");

    return;

  }

  // CAPTCHA CHECK

  if(captchaInput !== captcha){

    alert("Invalid Captcha");

    generateCaptcha();

    return;

  }

  try{

    // Find email using Aadhaar

    const querySnapshot =
    await getDocs(
      collection(db,"users")
    );

    let userEmail = "";

    querySnapshot.forEach((doc)=>{

      const user = doc.data();

      if(user.aadhaar === aadhaar){

        userEmail = user.email;

      }

    });

    if(userEmail === ""){

      alert("Aadhaar not found");

      return;

    }

    // Firebase Login

    await signInWithEmailAndPassword(
      auth,
      userEmail,
      password
    );

    alert("Login Successful");

    window.location.href =
    "index.html";

  }catch(error){

    alert(error.message);

  }

}