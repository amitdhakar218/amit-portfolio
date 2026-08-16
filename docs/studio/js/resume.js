let fullProfileData = null;

document.addEventListener("DOMContentLoaded", () => {
  loadResumeInfo();
  const form = document.getElementById("resume-form");
  if (form) form.addEventListener("submit", handleResumeSubmit);

  const fileInput = document.getElementById("resume-file-upload");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const statusEl = document.getElementById("resume-upload-status");
      uploadFileToServer(fileInput.files[0], statusEl, (path) => {
        document.getElementById("field-resume-path").value = path;
      });
    });
  }
});

/* ---------- 1. Load Resume Info from Firebase Realtime Database ---------- */
function loadResumeInfo() {
  const statusEl = document.getElementById("resume-status");

  if (!db) {
    if (statusEl) statusEl.textContent = "⚠️ Firebase SDK not loaded.";
    return;
  }

  if (statusEl) statusEl.textContent = "Loading resume info from Firebase...";

  db.ref("profile").on("value", (snapshot) => {
    if (snapshot.exists()) {
      fullProfileData = snapshot.val();
      updateResumeDisplay();
      if (statusEl) statusEl.textContent = "Resume info loaded from Firebase ✅";
    } else {
      fullProfileData = { files: {} };
      updateResumeDisplay();
      if (statusEl) statusEl.textContent = "No profile data in Firebase yet.";
    }
  }, (error) => {
    console.error("Firebase read error:", error);
    if (statusEl) statusEl.textContent = `❌ Error loading resume info: ${error.message}`;
  });
}

function updateResumeDisplay() {
  const resumePath = fullProfileData?.files?.resume || "";
  const pathEl = document.getElementById("resume-current-path");
  const previewBtn = document.getElementById("resume-preview-btn");
  const inputEl = document.getElementById("field-resume-path");

  if (pathEl) pathEl.textContent = resumePath || "No resume set yet.";
  if (previewBtn) previewBtn.href = resumePath ? (resumePath.startsWith("http") ? resumePath : `../../portfolio/${resumePath}`) : "#";
  if (inputEl) inputEl.value = resumePath;
}

/* ---------- 2. Save Resume Path to Firebase ---------- */
async function handleResumeSubmit(e) {
  e.preventDefault();
  const newPath = document.getElementById("field-resume-path").value.trim();
  const statusEl = document.getElementById("resume-status");

  if (!newPath) return;

  if (statusEl) statusEl.textContent = "Saving to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");

    await db.ref("profile/files/resume").set(newPath);

    if (statusEl) statusEl.textContent = "✅ Saved permanently to Firebase!";
  } catch (err) {
    console.error("Failed to save resume path:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
  }
}
