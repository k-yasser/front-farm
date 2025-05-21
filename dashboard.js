// dashboard.js
const token = localStorage.getItem("token");

if (!token) {
  alert("You are not logged in!");
  window.location.href = "index.html"; // redirect to login page
} else {
  document.getElementById("token-display").innerText = `Token: ${token}`;
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
