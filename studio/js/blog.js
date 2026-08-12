/* ==========================================================
   Amit Studio — Blog Module Script
   Depends on: Backend API (api/server.js) — /api/data/blog.json
   Now connected to real backend: Create/Edit/Delete permanently
   update shared/data/blog.json via POST/PUT/DELETE.
   ========================================================== */

const API_BASE = "/api/data";
let editingBlogId = null;
let currentBlogList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadBlogList();

  const form = document.getElementById("blog-form");
  if (form) form.addEventListener("submit", handleBlogSubmit);

  const cancelBtn = document.getElementById("blog-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", resetBlogForm);
});

/* ---------- 1. Load blog.json from backend ---------- */
async function loadBlogList() {
  const statusEl = document.getElementById("blog-status");

  try {
    const res = await fetch(`${API_BASE}/blog.json`);
    if (!res.ok) throw new Error("Failed to fetch blog.json from backend");
    currentBlogList = await res.json();

    if (statusEl) statusEl.textContent = `${currentBlogList.length} article(s) loaded from server ✅`;
    renderBlogList();

  } catch (err) {
    console.warn("Blog data not loaded:", err.message);
    if (statusEl) statusEl.textContent = "⚠️ Could not load articles. Is the backend running?";
  }
}

/* ---------- 2. Render Blog Grid ---------- */
function renderBlogList() {
  const grid = document.getElementById("studio-blog-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (currentBlogList.length === 0) {
    grid.innerHTML = `<p class="text-muted">No articles yet. Create one above.</p>`;
    return;
  }

  currentBlogList.forEach((post) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3 class="card-title">${post.title}</h3>
      <p class="card-body text-muted" style="font-size:0.8rem;">${post.date || ""}</p>
      <p class="card-body">${post.content}</p>
      <div class="project-links" style="margin-top: var(--space-sm);">
        <button class="btn btn-icon" data-action="edit" data-id="${post.id}">✏️ Edit</button>
        <button class="btn btn-icon" data-action="delete" data-id="${post.id}">🗑️ Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-action="edit"]').forEach(btn =>
    btn.addEventListener("click", () => startEditBlog(btn.dataset.id))
  );
  grid.querySelectorAll('[data-action="delete"]').forEach(btn =>
    btn.addEventListener("click", () => deleteBlog(btn.dataset.id))
  );
}

/* ---------- 3. Create / Update Article on Submit (real backend calls) ---------- */
async function handleBlogSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("field-blog-title").value.trim();
  const content = document.getElementById("field-blog-content").value.trim();
  if (!title || !content) return;

  const postData = {
    title,
    content,
    date: document.getElementById("field-blog-date").value
  };

  const statusEl = document.getElementById("blog-status");
  if (statusEl) statusEl.textContent = "Saving...";

  try {
    if (editingBlogId) {
      const res = await fetch(`${API_BASE}/blog.json/item/${editingBlogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      });
      if (!res.ok) throw new Error("Backend rejected the update");
      if (statusEl) statusEl.textContent = "✅ Article updated permanently.";
    } else {
      const res = await fetch(`${API_BASE}/blog.json/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      });
      if (!res.ok) throw new Error("Backend rejected the create request");
      if (statusEl) statusEl.textContent = "✅ Article created permanently.";
    }

    resetBlogForm();
    loadBlogList();

  } catch (err) {
    console.error("Failed to save article:", err.message);
    if (statusEl) statusEl.textContent = "❌ Save failed. Is the backend running?";
  }
}

/* ---------- 4. Start Editing an Article ---------- */
function startEditBlog(id) {
  const post = currentBlogList.find(b => b.id === id);
  if (!post) return;

  editingBlogId = id;

  document.getElementById("field-blog-id").value = id;
  document.getElementById("field-blog-title").value = post.title || "";
  document.getElementById("field-blog-content").value = post.content || "";
  document.getElementById("field-blog-date").value = post.date || "";

  document.getElementById("blog-form-title").textContent = "Edit Article";
  document.getElementById("blog-submit-btn").textContent = "💾 Update Article";
  document.getElementById("blog-cancel-btn").style.display = "inline-flex";

  document.getElementById("blog-form").scrollIntoView({ behavior: "smooth" });
}

/* ---------- 5. Delete an Article (real backend call) ---------- */
async function deleteBlog(id) {
  const statusEl = document.getElementById("blog-status");
  if (statusEl) statusEl.textContent = "Deleting...";

  try {
    const res = await fetch(`${API_BASE}/blog.json/item/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Backend rejected the delete request");

    if (statusEl) statusEl.textContent = "🗑️ Article removed permanently.";
    if (editingBlogId === id) resetBlogForm();
    loadBlogList();

  } catch (err) {
    console.error("Failed to delete article:", err.message);
    if (statusEl) statusEl.textContent = "❌ Delete failed. Is the backend running?";
  }
}

/* ---------- 6. Reset Form to "Create" Mode ---------- */
function resetBlogForm() {
  editingBlogId = null;
  document.getElementById("blog-form").reset();
  document.getElementById("field-blog-id").value = "";
  document.getElementById("blog-form-title").textContent = "Create New Article";
  document.getElementById("blog-submit-btn").textContent = "+ Create Article";
  document.getElementById("blog-cancel-btn").style.display = "none";
}