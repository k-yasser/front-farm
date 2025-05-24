let animals = [];
let types = [];
let currentUserId = null;

const token = localStorage.getItem("token");
const tableBody = document.getElementById("animal-body");
const searchInput = document.getElementById("search");
const noResults = document.getElementById("no-results");
const dialog = document.getElementById("dialog");
const animalForm = document.getElementById("animalForm");
const typeSelect = document.getElementById("animal-type-select");

// ==== AUTHENTICATION & USER INFO ====

if (!token) {
  alert("You are not logged in!");
  window.location.href = "sign.html";
} else {
  try {
    const decoded = jwt_decode(token);

    fetch("http://localhost:8000/api/v1/users/logging/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData) => {
        const { _id, name } = userData.data;
        currentUserId = _id;
        document.getElementById("welcome-msg").innerText = `Welcome, ${name}!`;

        return Promise.all([
          fetch("http://localhost:8000/api/v1/animals/mine", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/api/v1/types")
        ]);
      })
      .then(async ([animalRes, typeRes]) => {
        const animalsData = await animalRes.json();
        const typesData = await typeRes.json();

        animals = animalsData.data;
        types = typesData.data;

        populateTypeSelect(types);
        renderAnimals(animals);
      })
      .catch((err) => {
        console.error("Error loading user or animals:", err.message);
        document.getElementById("welcome-msg").innerText = "Welcome!";
      });

  } catch (err) {
    alert("Invalid token: " + err.message);
    localStorage.removeItem("token");
    window.location.href = "sign.html";
  }
}

// ==== LOGOUT ====

function logout() {
  localStorage.removeItem("token");
  window.location.href = "sign.html";
}

// ==== UI FUNCTIONS ====

function toggleDialog() {
  dialog.classList.toggle("hidden");
}

function populateTypeSelect(types) {
  typeSelect.innerHTML = "";
  types.forEach(type => {
    const option = document.createElement("option");
    option.value = type._id;
    option.textContent = type.name;
    typeSelect.appendChild(option);
  });
}

// ==== RENDER ANIMALS ====

function renderAnimals(filtered) {
  tableBody.innerHTML = "";
  if (!filtered.length) {
    noResults.style.display = "block";
    return;
  }
  noResults.style.display = "none";

  filtered.forEach((animal) => {
    const row = document.createElement("tr");
    let rowClass = "";

    if (animal.status === "verified") rowClass = "bg-green";
    else if (animal.status === "pending") rowClass = "bg-yellow";
    else if (animal.status === "non-available") rowClass = "bg-red";

    row.className = rowClass;

    row.innerHTML = `
      <td>${animal.rfid}</td>
      <td>${animal.name || animal.type?.name || 'Unknown'}</td>
      <td>${animal.status}</td>
      <td>${animal.lastCheck || '-'}</td>
      <td class="action-cell">
        <button class='btn-update btn-action'><span>✏️</span> Update</button>
        <button class='btn-verify btn-action' onclick="verifyAnimal('${animal._id}')"><span>✅</span> Verify</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// ==== VERIFY ANIMAL ====

async function verifyAnimal(id) {
  try {
    const res = await fetch(`http://localhost:8000/api/v1/animals/verify/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Verification failed");
    const updatedAnimal = await res.json();
    animals = animals.map(a => (a._id === id ? updatedAnimal.data : a));
    renderAnimals(animals);
    alert("Animal verified successfully.");
  } catch (err) {
    alert("Failed to verify animal: " + err.message);
  }
}

// ==== SEARCH FILTER ====

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = animals.filter((animal) =>
    animal.rfid.toLowerCase().includes(term)
  );
  renderAnimals(filtered);
});

// ==== FORM SUBMIT ====

animalForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(animalForm);
  const selectedTypeId = formData.get("type-select");

  const newAnimal = {
    rfid: formData.get("rfid"),
    name: typeSelect.options[typeSelect.selectedIndex].textContent,
    type: selectedTypeId,
    gender: formData.get("gender").toLowerCase(),
    age: Number(formData.get("age")),
    birthDate: formData.get("birthDate"),
    vaccin: formData.get("vaccin")?.toLowerCase() === 'yes',
    owner: currentUserId, // ✅ REQUIRED for backend
  };

  try {
    const res = await fetch("http://localhost:8000/api/v1/animals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newAnimal),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.msg || "Failed to add animal");
    }

    const created = await res.json();
    animals.push(created.data);
    renderAnimals(animals);
    toggleDialog();
    animalForm.reset();
  } catch (err) {
    alert("Error: " + err.message);
  }
});
