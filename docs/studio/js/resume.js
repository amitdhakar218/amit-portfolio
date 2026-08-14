const API_BASE = "/api/data";
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

async function loadResumeInfo() {
  const statusEl = document.getElementById("resume-status");
  try {
    const res = await fetch(`${API_BASE}/profile.json`);
    if (!res.ok) throw new Error("not found");
    fullProfileData = await res.json();
    updateResumeDisplay();
    if (statusEl) statusEl.textContent = "Resume info loaded from server ✅";
  } catch (err) {
    if (statusEl) statusEl.textContent = "⚠️ Could not load resume info.";
  }
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

async function handleResumeSubmit(e) {
  e.preventDefault();
  const newPath = document.getElementById("field-resume-path").value.trim();
  if (!newPath || !fullProfileData) return;
  const statusEl = document.getElementById("resume-status");
  if (statusEl) statusEl.textContent = "Saving...";
  const updatedProfile = { ...fullProfileData, files: { ...fullProfileData.files, resume: newPath } };
  try {
    await fetch(`${API_BASE}/profile.json`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedProfile) });
    fullProfileData = updatedProfile;
    updateResumeDisplay();
    if (statusEl) statusEl.textContent = "✅ Saved permanently.";
  } catch (err) {
    if (statusEl) statusEl.textContent = "❌ Save failed.";
  }
}