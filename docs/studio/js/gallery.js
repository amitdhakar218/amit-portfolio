const API_BASE = "/api/data";
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

async function loadGalleryList() {
  const statusEl = document.getElementById("gallery-status");
  try {
    const res = await fetch(`${API_BASE}/gallery.json`);
    if (!res.ok) throw new Error("Failed to fetch gallery.json");
    currentGalleryList = await res.json();
    if (statusEl) statusEl.textContent = `${currentGalleryList.length} image(s) loaded from server ✅`;
    renderGalleryList();
  } catch (err) {
    if (statusEl) statusEl.textContent = "⚠️ Could not load gallery.";
  }
}

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

async function handleGallerySubmit(e) {
  e.preventDefault();
  const title = document.getElementById("field-gallery-title").value.trim();
  const image = document.getElementById("field-gallery-image").value.trim();
  if (!title || !image) return;
  const itemData = { title, image, caption: document.getElementById("field-gallery-caption").value };
  const statusEl = document.getElementById("gallery-status");
  if (statusEl) statusEl.textContent = "Saving...";
  try {
    if (editingGalleryId) {
      await fetch(`${API_BASE}/gallery.json/item/${editingGalleryId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemData) });
      if (statusEl) statusEl.textContent = "✅ Updated permanently.";
    } else {
      await fetch(`${API_BASE}/gallery.json/item`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(itemData) });
      if (statusEl) statusEl.textContent = "✅ Added permanently.";
    }
    resetGalleryForm();
    loadGalleryList();
  } catch (err) {
    if (statusEl) statusEl.textContent = "❌ Save failed.";
  }
}

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


async function deleteGalleryItem(id) {
  const statusEl = document.getElementById("gallery-status");

  try {
    const ok = await deleteGalleryItemFromFirestore(id);

    if (!ok) throw new Error("Delete failed");

    if (statusEl) statusEl.textContent = "🗑️ Deleted from Firestore.";

    if (editingGalleryId === id) resetGalleryForm();

    loadGalleryList();

  } catch (err) {
    if (statusEl) statusEl.textContent = "❌ Delete failed.";
  }
}

function resetGalleryForm() {
  editingGalleryId = null;
  document.getElementById("gallery-form").reset();
  document.getElementById("field-gallery-id").value = "";
  document.getElementById("gallery-form-title").textContent = "Add New Image";
  document.getElementById("gallery-submit-btn").textContent = "+ Add Image";
  document.getElementById("gallery-cancel-btn").style.display = "none";
  document.getElementById("gallery-upload-status").textContent = "";
}
