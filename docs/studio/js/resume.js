const firebaseConfig = {
  apiKey: "AIzaSyBg8Y3T_B25Kvg6IHKNemu6JMAXUFhfn-M",
  authDomain: "amit-portfolio-79db4.firebaseapp.com",
  databaseURL: "https://amit-portfolio-79db4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "amit-portfolio-79db4",
  storageBucket: "amit-portfolio-79db4.firebasestorage.app",
  appId: "1:925822310763:web:c59695e6aab94e9cca942e"
};

if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

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
    // Upload to Firebase Storage
    const fileName = `resumes/${Date.now()}-${file.name}`;
    const storageRef = firebase.storage().ref(fileName);
    await storageRef.put(file);
    const downloadURL = await storageRef.getDownloadURL();

    // Save to Realtime Database
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
          <button class="btn btn-outline delete-resume" data-id="${id}" style="padding: var(--space-xs) var(--space-sm);">🗑️ Delete</button>
        </div>
      </div>
    `).join("");

    container.innerHTML = html;

    // Delete button listeners
    document.querySelectorAll(".delete-resume").forEach(btn => {
      btn.addEventListener("click", (e) => deleteResume(e.target.dataset.id));
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
