// app.js

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bloodForm =
document.getElementById("bloodForm");

bloodForm.addEventListener(
"submit",
async (e)=>{

  e.preventDefault();

  const name =
  document.getElementById("name").value;

  const bloodGroup =
  document.getElementById("bloodGroup").value;

  const hospital =
  document.getElementById("hospital").value;

  const city =
  document.getElementById("city").value;

  const phone =
  document.getElementById("phone").value;

  try{

    await addDoc(
      collection(db,"bloodRequests"),
      {
        name,
        bloodGroup,
        hospital,
        city,
        phone
      }
    );

    alert("Blood Request Submitted");

    bloodForm.reset();

    loadDonors();

  }catch(error){

    console.log(error);

  }

});

async function loadDonors(){

  const donorList =
  document.getElementById("donorList");

  donorList.innerHTML = "";

  const querySnapshot =
  await getDocs(collection(db,"donors"));

  querySnapshot.forEach((doc)=>{

    const donor = doc.data();

    donorList.innerHTML += `
      <div class="card">

        <h3>${donor.name}</h3>

        <p>
        Blood Group:
        ${donor.bloodGroup}
        </p>

        <p>
        City:
        ${donor.city}
        </p>

        <p>
        Phone:
        ${donor.phone}
        </p>

      </div>
    `;

  });

}

loadDonors();