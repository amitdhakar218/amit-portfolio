// Firebase already initialized by app.js - don't re-initialize

async function uploadResume() {
  const title = document.getElementById("resume-title").value.trim();
  const description = document.getElementById("resume-description").value.trim();
  const fileInput = document.getElementById("resume-file");
  const statusEl = document.getElementById("resume-upload-status");
  const uploadBtn = document.getElementById("resume-upload-btn");

  if (!title || !fileInput.files[0]) {
    statusEl.textContent = "❌ Title and file required";
    statusEl.style.color = "#ef4444";
    return;
  }

  const file = fileInput.files[0];
  statusEl.textContent = "Uploading...";
  statusEl.style.color = "var(--color-muted)";
  uploadBtn.disabled = true;

  try {
    if (typeof firebase === "undefined" || !firebase.storage) {
      throw new Error("Firebase Storage not available");
    }

    const fileName = `resumes/${Date.now()}-${file.name}`;
    const storageRef = firebase.storage().ref(fileName);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();

    const resumeId = Date.now().toString();
    await firebase.database().ref(`resumes/${resumeId}`).set({
      id: resumeId,
      title: title,
      description: description,
      fileURL: downloadURL,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      downloads: 0
    });

    statusEl.textContent = "✅ Resume uploaded!";
    statusEl.style.color = "var(--color-accent)";
    document.getElementById("resume-title").value = "";
    document.getElementById("resume-description").value = "";
    fileInput.value = "";
    loadResumes();
  } catch (err) {
    console.error("Upload error:", err);
    statusEl.textContent = `❌ ${err.message}`;
    statusEl.style.color = "#ef4444";
  } finally {
    uploadBtn.disabled = false;
  }
}

function loadResumes() {
  if (typeof firebase === "undefined" || !firebase.database) return;

  firebase.database().ref("resumes").once("value", snapshot => {
    const resumes = snapshot.val();
    const container = document.getElementById("resume-list-container");

    if (!resumes) {
      container.innerHTML = "<p class='text-muted'>No resumes yet</p>";
      return;
    }

    const html = Object.entries(resumes).map(([id, resume]) => `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h4 style="margin: 0; color: var(--color-primary);">${resume.title}</h4>
            <p class="text-muted" style="margin: 4px 0;">${resume.description || 'No description'}</p>
            <p class="text-muted" style="margin: 4px 0; font-size: 0.85em;">
              📥 ${resume.downloads || 0} downloads | 📅 ${new Date(resume.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <button class="btn btn-outline delete-resume" data-id="${id}">🗑️ Delete</button>
        </div>
      </div>
    `).join("");

    container.innerHTML = html;

    document.querySelectorAll(".delete-resume").forEach(btn => {
      btn.addEventListener("click", () => deleteResume(btn.dataset.id));
    });
  });
}

function deleteResume(id) {
  if (!confirm("Delete this resume?")) return;
  firebase.database().ref(`resumes/${id}`).remove().then(() => {
    loadResumes();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("resume-upload-btn").addEventListener("click", uploadResume);
  loadResumes();
});
