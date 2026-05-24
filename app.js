// app.js

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bloodForm = document.getElementById("bloodForm");

bloodForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const bloodGroup = document.getElementById("bloodGroup").value;
  const hospital = document.getElementById("hospital").value;
  const city = document.getElementById("city").value;
  const pinCode = document.getElementById("pinCode").value;
  const phone = document.getElementById("phone").value;

  if (!/^[0-9]{6}$/.test(pinCode)) {
    alert("Please enter a valid 6-digit pin code");
    return;
  }

  try {
    await addDoc(collection(db, "bloodRequests"), {
      name,
      bloodGroup,
      hospital,
      city,
      pinCode,
      phone
    });

    alert("Blood Request Submitted");

    await loadBloodCenterCount(pinCode);
    bloodForm.reset();
  } catch (error) {
    console.log(error);
  }
});

async function loadBloodCenterCount(pinCode = "") {
  const countMessage = document.getElementById("bloodCenterCount");
  if (!countMessage) return;

  if (!/^[0-9]{6}$/.test(pinCode)) {
    countMessage.textContent = "Enter a 6-digit pin code to see available blood centers.";
    return;
  }

  countMessage.textContent = "Searching blood centers...";

  try {
    const centerQuery = query(collection(db, "bloodCenters"), where("pinCode", "==", pinCode));
    const snapshot = await getDocs(centerQuery);
    const count = snapshot.size;

    countMessage.textContent = `${count} blood center${count !== 1 ? "s" : ""} available in pin code ${pinCode}.`;
  } catch (error) {
    countMessage.textContent = "Unable to load blood center count right now.";
  }
}

async function loadDonors() {
  const donorList = document.getElementById("donorList");
  if (!donorList) return;
  
  donorList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "donors"));
  querySnapshot.forEach((doc) => {
    const donor = doc.data();
    donorList.innerHTML += `
      <div class="card">
        <h3>${donor.name}</h3>
        <p>Blood Group: ${donor.bloodGroup}</p>
        <p>City: ${donor.city}</p>
        <p>Phone: ${donor.phone}</p>
      </div>
    `;
  });
}

loadDonors();

const pinCodeInput = document.getElementById("pinCode");
if (pinCodeInput) {
  pinCodeInput.addEventListener("input", async () => {
    const pin = pinCodeInput.value.trim();
    if (/^[0-9]{6}$/.test(pin)) {
      await loadBloodCenterCount(pin);
    } else {
      document.getElementById("bloodCenterCount").textContent = "";
    }
  });
}

loadBloodCenterCount();
