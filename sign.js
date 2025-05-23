// app.js

// Handle panel switching
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const forgotBtn = document.getElementById("showForgot");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

forgotBtn.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
  container.classList.add("forgot-mode");
});

// Handle form submissions
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

// ✅ SIGN UP
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;

  try {
    const res = await fetch("http://localhost:8000/api/v1/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username, // ✅ Match backend expected field
        email,
        password,
        passwordConfirm: confirmPassword, // ✅ Match backend validator field
      }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Signup successful!");
      window.location.href = "dashboard.html"; // ✅ Optional redirect after signup
    } else {
      alert(data.message || "Signup failed");
    }
  } catch (error) {
    alert("Network error: " + error.message);
  }
});

// ✅ LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch("http://localhost:8000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Check response content-type to avoid JSON parsing errors
    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text(); // fallback: read text response
      throw new Error("Server did not return JSON:\n" + text);
    }

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      window.location.href = "dashboard.html"; // ✅ Redirect to dashboard
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    alert("Network error: " + error.message);
  }
});




//links 
window.addEventListener("DOMContentLoaded", () => {
  if (window.location.hash === "#signup") {
    container.classList.add("sign-up-mode");
  }
});