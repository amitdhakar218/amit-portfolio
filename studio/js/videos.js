const API_BASE = "/api/data";
let editingVideoId = null;
let currentVideosList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadVideosList();
  const form = document.getElementById("video-form");
  if (form) form.addEventListener("submit", handleVideoSubmit);
  const cancelBtn = document.getElementById("video-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", resetVideoForm);

  const fileInput = document.getElementById("video-file-upload");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const statusEl = document.getElementById("video-upload-status");
      uploadFileToServer(fileInput.files[0], statusEl, (path) => {
        document.getElementById("field-video-url").value = path;
      });
    });
  }
});

async function loadVideosList() {
  const statusEl = document.getElementById("videos-status");
  try {
    const res = await fetch(`${API_BASE}/videos.json`);
    if (!res.ok) throw new Error("not found");
    currentVideosList = await res.json();
    if (statusEl) statusEl.textContent = `${currentVideosList.length} video(s) loaded from server ✅`;
    renderVideosList();
  } catch (err) {
    if (statusEl) statusEl.textContent = "⚠️ Could not load videos.";
  }
}

function renderVideosList() {
  const grid = document.getElementById("studio-videos-grid");
  if (!grid) return;
  grid.innerHTML = "";
  if (currentVideosList.length === 0) { grid.innerHTML = `<p class="text-muted">No videos yet.</p>`; return; }
  currentVideosList.forEach((video) => {
    const card = document.createElement("div");
    card.className = "card";
    const isUploaded = video.url?.startsWith("assets/uploads/");
    const linkHref = isUploaded ? `../../portfolio/${video.url}` : video.url;
    card.innerHTML = `
      <h3 class="card-title">${video.title}</h3>
      ${video.description ? `<p class="card-body text-muted">${video.description}</p>` : ""}
      <p class="card-body text-mono" style="font-size:0.8rem; word-break:break-all;">${video.url || ""}</p>
      <div class="project-links" style="margin-top: var(--space-sm);">
        ${video.url ? `<a href="${linkHref}" class="btn btn-icon" target="_blank">▶️ Watch</a>` : ""}
        <button class="btn btn-icon" data-action="edit" data-id="${video.id}">✏️ Edit</button>
        <button class="btn btn-icon" data-action="delete" data-id="${video.id}">🗑️ Delete</button>
      </div>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll('[data-action="edit"]').forEach(btn => btn.addEventListener("click", () => startEditVideo(btn.dataset.id)));
  grid.querySelectorAll('[data-action="delete"]').forEach(btn => btn.addEventListener("click", () => deleteVideo(btn.dataset.id)));
}

async function handleVideoSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("field-video-title").value.trim();
  const url = document.getElementById("field-video-url").value.trim();
  if (!title || !url) return;
  const videoData = { title, url, description: document.getElementById("field-video-description").value };
  const statusEl = document.getElementById("videos-status");
  if (statusEl) statusEl.textContent = "Saving...";
  try {
    if (editingVideoId) {
      await fetch(`${API_BASE}/videos.json/item/${editingVideoId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(videoData) });
      if (statusEl) statusEl.textContent = "✅ Updated permanently.";
    } else {
      await fetch(`${API_BASE}/videos.json/item`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(videoData) });
      if (statusEl) statusEl.textContent = "✅ Added permanently.";
    }
    resetVideoForm();
    loadVideosList();
  } catch (err) {
    if (statusEl) statusEl.textContent = "❌ Save failed.";
  }
}

function startEditVideo(id) {
  const video = currentVideosList.find(v => v.id === id);
  if (!video) return;
  editingVideoId = id;
  document.getElementById("field-video-id").value = id;
  document.getElementById("field-video-title").value = video.title || "";
  document.getElementById("field-video-url").value = video.url || "";
  document.getElementById("field-video-description").value = video.description || "";
  document.getElementById("video-form-title").textContent = "Edit Video";
  document.getElementById("video-submit-btn").textContent = "💾 Update Video";
  document.getElementById("video-cancel-btn").style.display = "inline-flex";
  document.getElementById("video-form").scrollIntoView({ behavior: "smooth" });
}

async function deleteVideo(id) {
  const statusEl = document.getElementById("videos-status");
  try {
    await fetch(`${API_BASE}/videos.json/item/${id}`, { method: "DELETE" });
    if (statusEl) statusEl.textContent = "🗑️ Removed permanently.";
    if (editingVideoId === id) resetVideoForm();
    loadVideosList();
  } catch (err) {
    if (statusEl) statusEl.textContent = "❌ Delete failed.";
  }
}

function resetVideoForm() {
  editingVideoId = null;
  document.getElementById("video-form").reset();
  document.getElementById("field-video-id").value = "";
  document.getElementById("video-form-title").textContent = "Add New Video";
  document.getElementById("video-submit-btn").textContent = "+ Add Video";
  document.getElementById("video-cancel-btn").style.display = "none";
  document.getElementById("video-upload-status").textContent = "";
}