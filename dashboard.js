// dashboard.js

const token = localStorage.getItem("token");

if (!token) {
  alert("You are not logged in!");
  window.location.href = "index.html"; // Redirect to login
} else {
  try {
    const decoded = jwt_decode(token);
    const userId = decoded.userId;

    // Fetch the user's full profile using their ID
    fetch(`http://localhost:8000/api/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or user not found");
        return res.json();
      })
      .then((data) => {
        if (data && data.data) {
          const { name, email, role } = data.data;
          document.getElementById("user-info").innerText = `Welcome, ${name} (${role})`;
          document.getElementById("token-time").innerText = `Email: ${email}`;
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user data:", err.message);
        document.getElementById("user-info").innerText = "Welcome (user info unavailable)";
      });

  } catch (err) {
    alert("Invalid token: " + err.message);
    localStorage.removeItem("token");
    window.location.href = "index.html";
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
