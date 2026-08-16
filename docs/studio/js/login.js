const firebaseConfig = {
  apiKey: "AIzaSyBg8Y3T_B25Kvg6IHKNemu6JMAXUFhfn-M",
  authDomain: "amit-portfolio-79db4.firebaseapp.com",
  databaseURL: "https://amit-portfolio-79db4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "amit-portfolio-79db4",
  storageBucket: "amit-portfolio-79db4.firebasestorage.app",
  messagingSenderId: "925822310763",
  appId: "1:925822310763:web:c59695e6aab94e9cca942e",
  measurementId: "G-D45ZKBTBEY"
};

if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (form) form.addEventListener("submit", handleLogin);
});

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("field-username").value.trim();
  const password = document.getElementById("field-password").value;
  const statusEl = document.getElementById("login-status");
  const submitBtn = document.getElementById("login-submit-btn");

  if (!email || !password) return;

  if (statusEl) { statusEl.textContent = "Signing in..."; statusEl.style.color = "var(--color-muted)"; }
  if (submitBtn) submitBtn.disabled = true;

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    if (statusEl) { statusEl.textContent = "✅ Login successful. Redirecting..."; statusEl.style.color = "var(--color-accent)"; }
    setTimeout(() => { window.location.href = "index.html"; }, 800);
  } catch (err) {
    console.error("Login Error:", err);
    if (statusEl) { statusEl.textContent = `❌ ${err.message || "Login failed."}`; statusEl.style.color = "#ef4444"; }
    if (submitBtn) submitBtn.disabled = false;
  }
}
