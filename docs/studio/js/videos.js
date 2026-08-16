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

/* ---------- Helper: Convert Firebase Object to Array ---------- */
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((item, idx) => item ? { id: item.id || idx.toString(), ...item } : null).filter(Boolean);
  return Object.keys(val).map(key => ({ id: key, ...val[key] }));
}

/* ---------- 1. Load videos from Firebase Realtime Database ---------- */
function loadVideosList() {
  const statusEl = document.getElementById("videos-status");

  if (!db) {
    if (statusEl) statusEl.textContent = "⚠️ Firebase SDK not loaded.";
    return;
  }

  if (statusEl) statusEl.textContent = "Loading videos from Firebase...";

  db.ref("videos").on("value", (snapshot) => {
    if (snapshot.exists()) {
      currentVideosList = toArray(snapshot.val());
      if (statusEl) statusEl.textContent = `${currentVideosList.length} video(s) loaded from Firebase ✅`;
      renderVideosList();
    } else {
      currentVideosList = [];
      if (statusEl) statusEl.textContent = "0 videos found in database.";
      renderVideosList();
    }
  }, (error) => {
    console.error("Firebase read error:", error);
    if (statusEl) statusEl.textContent = `❌ Error loading videos: ${error.message}`;
  });
}

/* ---------- 2. Render Videos List ---------- */
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

/* ---------- 3. Add / Update Video on Submit (Firebase) ---------- */
async function handleVideoSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("field-video-title").value.trim();
  const url = document.getElementById("field-video-url").value.trim();
  if (!title || !url) return;

  const videoData = { 
    title, 
    url, 
    description: document.getElementById("field-video-description").value || "" 
  };

  const statusEl = document.getElementById("videos-status");
  if (statusEl) statusEl.textContent = "Saving to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");

    if (editingVideoId) {
      await db.ref(`videos/${editingVideoId}`).update(videoData);
      if (statusEl) statusEl.textContent = "✅ Video updated in Firebase!";
    } else {
      const newRef = db.ref("videos").push();
      await newRef.set({ ...videoData, id: newRef.key });
      if (statusEl) statusEl.textContent = "✅ Video added to Firebase!";
    }

    resetVideoForm();
  } catch (err) {
    console.error("Failed to save video:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
  }
}

/* ---------- 4. Start Editing a Video ---------- */
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

/* ---------- 5. Delete a Video (Firebase) ---------- */
async function deleteVideo(id) {
  const statusEl = document.getElementById("videos-status");
  if (statusEl) statusEl.textContent = "Deleting from Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref(`videos/${id}`).remove();

    if (statusEl) statusEl.textContent = "🗑️ Video removed from Firebase!";
    if (editingVideoId === id) resetVideoForm();
  } catch (err) {
    console.error("Failed to delete video:", err.message);
    if (statusEl) statusEl.textContent = `❌ Delete failed: ${err.message}`;
  }
}

/* ---------- 6. Reset Form to "Add" Mode ---------- */
function resetVideoForm() {
  editingVideoId = null;
  document.getElementById("video-form").reset();
  document.getElementById("field-video-id").value = "";
  document.getElementById("video-form-title").textContent = "Add New Video";
  document.getElementById("video-submit-btn").textContent = "+ Add Video";
  document.getElementById("video-cancel-btn").style.display = "none";
  document.getElementById("video-upload-status").textContent = "";
}
