let editingGalleryId = null;
let currentGalleryList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadGalleryList();
  const form = document.getElementById("gallery-form");
  if (form) form.addEventListener("submit", handleGallerySubmit);
  const cancelBtn = document.getElementById("gallery-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", resetGalleryForm);

  const fileInput = document.getElementById("gallery-file-upload");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const statusEl = document.getElementById("gallery-upload-status");
      uploadFileToServer(fileInput.files[0], statusEl, (path) => {
        document.getElementById("field-gallery-image").value = path;
      });
    });
  }
});

/* ---------- Helper: Convert Firebase Object to Array ---------- */
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((item, idx) => item ? { id: item.id || idx.toString(), ...item } : null).filter(Boolean);
  return Object.keys(val).map(key => ({ id: key, ...val[key] }));
}

/* ---------- 1. Load gallery from Firebase Realtime Database ---------- */
function loadGalleryList() {
  const statusEl = document.getElementById("gallery-status");

  if (!db) {
    if (statusEl) statusEl.textContent = "⚠️ Firebase SDK not loaded.";
    return;
  }

  if (statusEl) statusEl.textContent = "Loading gallery from Firebase...";

  db.ref("gallery").on("value", (snapshot) => {
    if (snapshot.exists()) {
      currentGalleryList = toArray(snapshot.val());
      if (statusEl) statusEl.textContent = `${currentGalleryList.length} image(s) loaded from Firebase ✅`;
      renderGalleryList();
    } else {
      currentGalleryList = [];
      if (statusEl) statusEl.textContent = "0 images found in database.";
      renderGalleryList();
    }
  }, (error) => {
    console.error("Firebase read error:", error);
    if (statusEl) statusEl.textContent = `❌ Error loading gallery: ${error.message}`;
  });
}

/* ---------- 2. Render Gallery List ---------- */
function renderGalleryList() {
  const grid = document.getElementById("studio-gallery-grid");
  if (!grid) return;
  grid.innerHTML = "";
  if (currentGalleryList.length === 0) { grid.innerHTML = `<p class="text-muted">No images yet.</p>`; return; }
  
  currentGalleryList.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card certificate-card";
    const imgSrc = item.image?.startsWith("http") ? item.image : `../../portfolio/${item.image || 'assets/gallery-placeholder.png'}`;
    card.innerHTML = `
      <img src="${imgSrc}" alt="${item.title}" class="radius-md" />
      <h3 class="card-title">${item.title}</h3>
      ${item.caption ? `<p class="card-body text-muted">${item.caption}</p>` : ""}
      <div class="project-links" style="margin-top: var(--space-sm);">
        <button class="btn btn-icon" data-action="edit" data-id="${item.id}">✏️ Edit</button>
        <button class="btn btn-icon" data-action="delete" data-id="${item.id}">🗑️ Delete</button>
      </div>`;
    grid.appendChild(card);
  });
  
  grid.querySelectorAll('[data-action="edit"]').forEach(btn => btn.addEventListener("click", () => startEditGalleryItem(btn.dataset.id)));
  grid.querySelectorAll('[data-action="delete"]').forEach(btn => btn.addEventListener("click", () => deleteGalleryItem(btn.dataset.id)));
}

/* ---------- 3. Add / Update Gallery Item on Submit (Firebase) ---------- */
async function handleGallerySubmit(e) {
  e.preventDefault();
  const title = document.getElementById("field-gallery-title").value.trim();
  const image = document.getElementById("field-gallery-image").value.trim();
  if (!title || !image) return;

  const itemData = { 
    title, 
    image, 
    caption: document.getElementById("field-gallery-caption").value || "" 
  };

  const statusEl = document.getElementById("gallery-status");
  if (statusEl) statusEl.textContent = "Saving to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");

    if (editingGalleryId) {
      await db.ref(`gallery/${editingGalleryId}`).update(itemData);
      if (statusEl) statusEl.textContent = "✅ Image updated in Firebase!";
    } else {
      const newRef = db.ref("gallery").push();
      await newRef.set({ ...itemData, id: newRef.key });
      if (statusEl) statusEl.textContent = "✅ Image added to Firebase!";
    }

    resetGalleryForm();
  } catch (err) {
    console.error("Failed to save gallery item:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
  }
}

/* ---------- 4. Start Editing a Gallery Item ---------- */
function startEditGalleryItem(id) {
  const item = currentGalleryList.find(g => g.id === id);
  if (!item) return;
  editingGalleryId = id;
  document.getElementById("field-gallery-id").value = id;
  document.getElementById("field-gallery-title").value = item.title || "";
  document.getElementById("field-gallery-image").value = item.image || "";
  document.getElementById("field-gallery-caption").value = item.caption || "";
  document.getElementById("gallery-form-title").textContent = "Edit Image";
  document.getElementById("gallery-submit-btn").textContent = "💾 Update Image";
  document.getElementById("gallery-cancel-btn").style.display = "inline-flex";
  document.getElementById("gallery-form").scrollIntoView({ behavior: "smooth" });
}

/* ---------- 5. Delete a Gallery Item (Firebase) ---------- */
async function deleteGalleryItem(id) {
  const statusEl = document.getElementById("gallery-status");
  if (statusEl) statusEl.textContent = "Deleting from Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref(`gallery/${id}`).remove();

    if (statusEl) statusEl.textContent = "🗑️ Image removed from Firebase!";
    if (editingGalleryId === id) resetGalleryForm();
  } catch (err) {
    console.error("Failed to delete gallery item:", err.message);
    if (statusEl) statusEl.textContent = `❌ Delete failed: ${err.message}`;
  }
}

/* ---------- 6. Reset Form to "Add" Mode ---------- */
function resetGalleryForm() {
  editingGalleryId = null;
  document.getElementById("gallery-form").reset();
  document.getElementById("field-gallery-id").value = "";
  document.getElementById("gallery-form-title").textContent = "Add New Image";
  document.getElementById("gallery-submit-btn").textContent = "+ Add Image";
  document.getElementById("gallery-cancel-btn").style.display = "none";
  document.getElementById("gallery-upload-status").textContent = "";
}
