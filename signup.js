import { auth }
from "./firebase.js";

import {
  createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.signup = async function(){

  const email =
  document.getElementById("email").value;

  const password =
  document.getElementById("password").value;

  try{

    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Signup Successful");

    window.location.href =
    "index.html";

  }catch(error){

    alert(error.message);

  }

}