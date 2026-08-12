/* ==========================================================
   Amit Studio — Login Script
   Depends on: Backend API — /api/auth/login
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (form) form.addEventListener("submit", handleLogin);
});

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("field-username").value.trim();
  const password = document.getElementById("field-password").value;
  const statusEl = document.getElementById("login-status");
  const submitBtn = document.getElementById("login-submit-btn");

  if (!username || !password) return;

  if (statusEl) {
    statusEl.textContent = "Signing in...";
    statusEl.style.color = "var(--color-muted)";
  }
  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Login failed.");
    }

    if (statusEl) {
      statusEl.textContent = "✅ Login successful. Redirecting...";
      statusEl.style.color = "var(--color-accent)";
    }

    window.location.href = "index.html";

  } catch (err) {
    if (statusEl) {
      statusEl.textContent = `❌ ${err.message}`;
      statusEl.style.color = "#ef4444";
    }
    if (submitBtn) submitBtn.disabled = false;
  }
}