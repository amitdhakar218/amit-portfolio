let editingBlogId = null;
let currentBlogList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadBlogList();

  const form = document.getElementById("blog-form");
  if (form) form.addEventListener("submit", handleBlogSubmit);

  const cancelBtn = document.getElementById("blog-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", resetBlogForm);
});

/* ---------- Helper: Convert Firebase Object to Array ---------- */
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((item, idx) => item ? { id: item.id || idx.toString(), ...item } : null).filter(Boolean);
  return Object.keys(val).map(key => ({ id: key, ...val[key] }));
}

/* ---------- 1. Load blog posts from Firebase Realtime Database ---------- */
function loadBlogList() {
  const statusEl = document.getElementById("blog-status");

  if (!db) {
    if (statusEl) statusEl.textContent = "⚠️ Firebase SDK not loaded.";
    return;
  }

  if (statusEl) statusEl.textContent = "Loading articles from Firebase...";

  db.ref("blog").on("value", (snapshot) => {
    if (snapshot.exists()) {
      currentBlogList = toArray(snapshot.val());
      if (statusEl) statusEl.textContent = `${currentBlogList.length} article(s) loaded from Firebase ✅`;
      renderBlogList();
    } else {
      currentBlogList = [];
      if (statusEl) statusEl.textContent = "0 articles found in database.";
      renderBlogList();
    }
  }, (error) => {
    console.error("Firebase read error:", error);
    if (statusEl) statusEl.textContent = `❌ Error loading articles: ${error.message}`;
  });
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

/* ---------- 3. Create / Update Article on Submit (Firebase) ---------- */
async function handleBlogSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("field-blog-title").value.trim();
  const content = document.getElementById("field-blog-content").value.trim();
  if (!title || !content) return;

  const postData = {
    title,
    content,
    date: document.getElementById("field-blog-date").value || ""
  };

  const statusEl = document.getElementById("blog-status");
  if (statusEl) statusEl.textContent = "Saving to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");

    if (editingBlogId) {
      await db.ref(`blog/${editingBlogId}`).update(postData);
      if (statusEl) statusEl.textContent = "✅ Article updated in Firebase!";
    } else {
      const newRef = db.ref("blog").push();
      await newRef.set({ ...postData, id: newRef.key });
      if (statusEl) statusEl.textContent = "✅ Article created in Firebase!";
    }

    resetBlogForm();

  } catch (err) {
    console.error("Failed to save article:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
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

/* ---------- 5. Delete an Article (Firebase) ---------- */
async function deleteBlog(id) {
  const statusEl = document.getElementById("blog-status");
  if (statusEl) statusEl.textContent = "Deleting from Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref(`blog/${id}`).remove();

    if (statusEl) statusEl.textContent = "🗑️ Article removed from Firebase!";
    if (editingBlogId === id) resetBlogForm();

  } catch (err) {
    console.error("Failed to delete article:", err.message);
    if (statusEl) statusEl.textContent = `❌ Delete failed: ${err.message}`;
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
