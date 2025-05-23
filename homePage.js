const animals = [
  { id: 'A001', type: 'Cow', status: 'Verified', lastCheck: '2025-05-20', gender: 'Female', age: 3, birthDate: '2022-02-15', vaccin: 'Up to date' },
  { id: 'A002', type: 'Sheep', status: 'Pending Verification', lastCheck: '2025-05-15', gender: 'Male', age: 1, birthDate: '2024-03-01', vaccin: 'Scheduled' },
  { id: 'A003', type: 'Cow', status: 'Non-Available', lastCheck: '2025-04-10', gender: 'Female', age: 5, birthDate: '2020-01-20', vaccin: 'N/A' },
];

const tableBody = document.getElementById("animal-body");
const searchInput = document.getElementById("search");
const noResults = document.getElementById("no-results");
const dialog = document.getElementById("dialog");
const animalForm = document.getElementById("animalForm");

function toggleDialog() {
  dialog.classList.toggle("hidden");
}

function renderAnimals(filtered) {
  tableBody.innerHTML = "";
  if (filtered.length === 0) {
    noResults.style.display = "block";
    return;
  }
  noResults.style.display = "none";

  filtered.forEach(animal => {
    const row = document.createElement("tr");
    let rowClass = "";
    if (animal.status === "Verified") rowClass = "bg-green";
    else if (animal.status === "Pending Verification") rowClass = "bg-yellow";
    else if (animal.status === "Non-Available") rowClass = "bg-red";
    row.className = rowClass;
    row.innerHTML = `
      <td>${animal.id}</td>
      <td>${animal.type}</td>
      <td>${animal.status}</td>
      <td>${animal.lastCheck}</td>
      <td class="action-cell">
        <button class='btn-update btn-action'><span>✏️</span> Update</button>
        <button class='btn-verify btn-action'><span>✅</span> Verify</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = animals.filter(animal => animal.id.toLowerCase().includes(term));
  renderAnimals(filtered);
});

animalForm.addEventListener("submit", e => {
  e.preventDefault();
  const formData = new FormData(animalForm);
  const newAnimal = {
    id: formData.get("rfid"),  // use RFID directly
    type: formData.get("type"),
    gender: formData.get("gender"),
    age: Number(formData.get("age")),
    birthDate: formData.get("birthDate"),
    vaccin: formData.get("vaccin"),
    lastCheck: new Date().toISOString().split('T')[0],
    status: "Pending Verification"
  };
  animals.push(newAnimal);
  toggleDialog();
  animalForm.reset();
  renderAnimals(animals);
});

renderAnimals(animals);
