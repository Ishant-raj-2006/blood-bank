import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentAdminId = null;
let currentAdminData = null;

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Check if admin is logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }

  try {
    const adminQuery = query(collection(db, "bloodCenterAdmins"), where("email", "==", user.email));
    const snapshot = await getDocs(adminQuery);

    if (snapshot.empty) {
      window.location.href = "admin-login.html";
      return;
    }

    const adminDoc = snapshot.docs[0];
    currentAdminId = adminDoc.id;
    currentAdminData = adminDoc.data();

    document.getElementById("centerInfo").innerHTML = `
      <strong>${currentAdminData.centerName}</strong><br>
      📍 ${currentAdminData.address} - Pin: ${currentAdminData.pinCode}<br>
      📞 ${currentAdminData.phone}
    `;

    // Load inventory
    loadInventory();
    loadCenterInfo();
  } catch (error) {
    console.error("Error:", error);
    window.location.href = "admin-login.html";
  }
});

// Switch between panels
window.switchPanel = function(panel) {
  document.querySelectorAll(".tab-panel").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-button").forEach(el => el.classList.remove("active"));

  document.getElementById(panel).classList.add("active");
  event.target.classList.add("active");
};

// Load inventory
async function loadInventory() {
  const inventoryDiv = document.getElementById("bloodInventory");
  inventoryDiv.innerHTML = "";

  try {
    const inventoryQuery = query(
      collection(db, "bloodInventory"),
      where("adminId", "==", currentAdminId)
    );
    const snapshot = await getDocs(inventoryQuery);
    const inventoryData = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      inventoryData[data.bloodGroup] = {
        docId: doc.id,
        units: data.units
      };
    });

    bloodGroups.forEach(group => {
      const existing = inventoryData[group];
      const units = existing ? existing.units : 0;

      inventoryDiv.innerHTML += `
        <div class="blood-group-card">
          <h3>${group}</h3>
          <div class="units" id="units-${group}">${units}</div>
          <input type="number" id="input-${group}" min="0" value="${units}" placeholder="Units">
          <button onclick="updateBloodGroup('${group}')">Update</button>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading inventory:", error);
  }
}

// Update single blood group
window.updateBloodGroup = async function(bloodGroup) {
  const inputValue = parseInt(document.getElementById(`input-${bloodGroup}`).value);

  if (isNaN(inputValue) || inputValue < 0) {
    alert("Please enter a valid number of units");
    return;
  }

  try {
    const inventoryQuery = query(
      collection(db, "bloodInventory"),
      where("adminId", "==", currentAdminId),
      where("bloodGroup", "==", bloodGroup)
    );
    const snapshot = await getDocs(inventoryQuery);

    if (snapshot.empty) {
      // Create new inventory entry
      await addDoc(collection(db, "bloodInventory"), {
        adminId: currentAdminId,
        centerName: currentAdminData.centerName,
        bloodGroup,
        units: inputValue,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update existing entry
      const docId = snapshot.docs[0].id;
      await updateDoc(doc(db, "bloodInventory", docId), {
        units: inputValue,
        updatedAt: new Date().toISOString()
      });
    }

    document.getElementById(`units-${bloodGroup}`).textContent = inputValue;
    showSuccessMessage(`${bloodGroup} updated to ${inputValue} units`);
  } catch (error) {
    alert("Error updating inventory: " + error.message);
  }
};

// Save all inventory at once
window.saveAllInventory = async function() {
  try {
    let updateCount = 0;

    for (const bloodGroup of bloodGroups) {
      const inputValue = parseInt(document.getElementById(`input-${bloodGroup}`).value);

      if (!isNaN(inputValue) && inputValue >= 0) {
        const inventoryQuery = query(
          collection(db, "bloodInventory"),
          where("adminId", "==", currentAdminId),
          where("bloodGroup", "==", bloodGroup)
        );
        const snapshot = await getDocs(inventoryQuery);

        if (snapshot.empty) {
          await addDoc(collection(db, "bloodInventory"), {
            adminId: currentAdminId,
            centerName: currentAdminData.centerName,
            bloodGroup,
            units: inputValue,
            updatedAt: new Date().toISOString()
          });
        } else {
          const docId = snapshot.docs[0].id;
          await updateDoc(doc(db, "bloodInventory", docId), {
            units: inputValue,
            updatedAt: new Date().toISOString()
          });
        }
        updateCount++;
      }
    }

    showSuccessMessage(`✅ All inventory saved! (${updateCount} blood groups updated)`);
  } catch (error) {
    alert("Error saving inventory: " + error.message);
  }
};

// Load center information
async function loadCenterInfo() {
  document.getElementById("centerName").value = currentAdminData.centerName;
  document.getElementById("centerPinCode").value = currentAdminData.pinCode;
  document.getElementById("centerAddress").value = currentAdminData.address;
  document.getElementById("centerPhone").value = currentAdminData.phone;
  document.getElementById("centerState").value = currentAdminData.state;
}

// Update center information
window.updateCenterInfo = async function() {
  const centerName = document.getElementById("centerName").value;
  const pinCode = document.getElementById("centerPinCode").value;
  const address = document.getElementById("centerAddress").value;
  const phone = document.getElementById("centerPhone").value;
  const state = document.getElementById("centerState").value;

  if (!centerName || !pinCode || !address || !phone || !state) {
    alert("Please fill all fields");
    return;
  }

  if (!/^[0-9]{6}$/.test(pinCode)) {
    alert("Please enter a valid 6-digit pin code");
    return;
  }

  try {
    await updateDoc(doc(db, "bloodCenterAdmins", currentAdminId), {
      centerName,
      pinCode,
      address,
      phone,
      state
    });

    currentAdminData = { ...currentAdminData, centerName, pinCode, address, phone, state };
    document.getElementById("centerInfo").innerHTML = `
      <strong>${centerName}</strong><br>
      📍 ${address} - Pin: ${pinCode}<br>
      📞 ${phone}
    `;

    showSuccessMessage("✅ Center information updated successfully!");
  } catch (error) {
    alert("Error updating center info: " + error.message);
  }
};

// Show success message
function showSuccessMessage(message) {
  const msgDiv = document.getElementById("successMsg");
  msgDiv.innerHTML = `<div class="success-msg">${message}</div>`;
  setTimeout(() => {
    msgDiv.innerHTML = "";
  }, 3000);
}

// Logout
window.adminLogout = async function() {
  if (confirm("Are you sure you want to logout?")) {
    await signOut(auth);
    window.location.href = "admin-login.html";
  }
};
