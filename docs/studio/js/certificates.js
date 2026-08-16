let editingCertificateId = null;
let currentCertificatesList = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCertificatesList();
  const form = document.getElementById("certificate-form");
  if (form) form.addEventListener("submit", handleCertificateSubmit);
  const cancelBtn = document.getElementById("certificate-cancel-btn");
  if (cancelBtn) cancelBtn.addEventListener("click", resetCertificateForm);

  const imgUpload = document.getElementById("certificate-image-upload");
  if (imgUpload) {
    imgUpload.addEventListener("change", () => {
      const statusEl = document.getElementById("certificate-image-upload-status");
      uploadFileToServer(imgUpload.files[0], statusEl, (path) => {
        document.getElementById("field-certificate-image").value = path;
      });
    });
  }

  const pdfUpload = document.getElementById("certificate-pdf-upload");
  if (pdfUpload) {
    pdfUpload.addEventListener("change", () => {
      const statusEl = document.getElementById("certificate-pdf-upload-status");
      uploadFileToServer(pdfUpload.files[0], statusEl, (path) => {
        document.getElementById("field-certificate-pdf").value = path;
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

/* ---------- 1. Load certificates from Firebase Realtime Database ---------- */
function loadCertificatesList() {
  const statusEl = document.getElementById("certificates-status");

  if (!db) {
    if (statusEl) statusEl.textContent = "⚠️ Firebase SDK not loaded.";
    return;
  }

  if (statusEl) statusEl.textContent = "Loading certificates from Firebase...";

  db.ref("certificates").on("value", (snapshot) => {
    if (snapshot.exists()) {
      currentCertificatesList = toArray(snapshot.val());
      if (statusEl) statusEl.textContent = `${currentCertificatesList.length} certificate(s) loaded from Firebase ✅`;
      renderCertificatesList();
    } else {
      currentCertificatesList = [];
      if (statusEl) statusEl.textContent = "0 certificates found in database.";
      renderCertificatesList();
    }
  }, (error) => {
    console.error("Firebase read error:", error);
    if (statusEl) statusEl.textContent = `❌ Error loading certificates: ${error.message}`;
  });
}

/* ---------- 2. Render Certificates List ---------- */
function renderCertificatesList() {
  const grid = document.getElementById("studio-certificates-grid");
  if (!grid) return;
  grid.innerHTML = "";
  if (currentCertificatesList.length === 0) { grid.innerHTML = `<p class="text-muted">No certificates yet.</p>`; return; }
  
  currentCertificatesList.forEach((cert) => {
    const card = document.createElement("div");
    card.className = "card certificate-card";
    const imgSrc = cert.image?.startsWith("http") ? cert.image : `../../portfolio/${cert.image || 'assets/certificate-placeholder.png'}`;
    card.innerHTML = `
      <img src="${imgSrc}" alt="${cert.name}" class="radius-md" />
      <h3 class="card-title">${cert.name}</h3>
      <p class="card-body text-muted">${cert.organization || ""} • ${cert.date || ""}</p>
      ${cert.pdf ? `<p class="card-body text-muted text-mono" style="font-size:0.8rem;">📎 ${cert.pdf}</p>` : ""}
      <div class="project-links" style="margin-top: var(--space-sm);">
        <button class="btn btn-icon" data-action="edit" data-id="${cert.id}">✏️ Edit</button>
        <button class="btn btn-icon" data-action="delete" data-id="${cert.id}">🗑️ Delete</button>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-action="edit"]').forEach(btn => btn.addEventListener("click", () => startEditCertificate(btn.dataset.id)));
  grid.querySelectorAll('[data-action="delete"]').forEach(btn => btn.addEventListener("click", () => deleteCertificate(btn.dataset.id)));
}

/* ---------- 3. Add / Update Certificate on Submit (Firebase) ---------- */
async function handleCertificateSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("field-certificate-name").value.trim();
  const organization = document.getElementById("field-certificate-org").value.trim();
  if (!name || !organization) return;

  const certData = {
    name, 
    organization,
    date: document.getElementById("field-certificate-date").value || "",
    image: document.getElementById("field-certificate-image").value || "assets/certificate-placeholder.png",
    pdf: document.getElementById("field-certificate-pdf").value || ""
  };

  const statusEl = document.getElementById("certificates-status");
  if (statusEl) statusEl.textContent = "Saving to Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");

    if (editingCertificateId) {
      await db.ref(`certificates/${editingCertificateId}`).update(certData);
      if (statusEl) statusEl.textContent = "✅ Certificate updated in Firebase!";
    } else {
      const newRef = db.ref("certificates").push();
      await newRef.set({ ...certData, id: newRef.key });
      if (statusEl) statusEl.textContent = "✅ Certificate added to Firebase!";
    }

    resetCertificateForm();
  } catch (err) {
    console.error("Failed to save certificate:", err.message);
    if (statusEl) statusEl.textContent = `❌ Save failed: ${err.message}`;
  }
}

/* ---------- 4. Start Editing a Certificate ---------- */
function startEditCertificate(id) {
  const cert = currentCertificatesList.find(c => c.id === id);
  if (!cert) return;
  editingCertificateId = id;
  document.getElementById("field-certificate-id").value = id;
  document.getElementById("field-certificate-name").value = cert.name || "";
  document.getElementById("field-certificate-org").value = cert.organization || "";
  document.getElementById("field-certificate-date").value = cert.date || "";
  document.getElementById("field-certificate-image").value = cert.image || "";
  document.getElementById("field-certificate-pdf").value = cert.pdf || "";
  document.getElementById("certificate-form-title").textContent = "Edit Certificate";
  document.getElementById("certificate-submit-btn").textContent = "💾 Update Certificate";
  document.getElementById("certificate-cancel-btn").style.display = "inline-flex";
  document.getElementById("certificate-form").scrollIntoView({ behavior: "smooth" });
}

/* ---------- 5. Delete a Certificate (Firebase) ---------- */
async function deleteCertificate(id) {
  const statusEl = document.getElementById("certificates-status");
  if (statusEl) statusEl.textContent = "Deleting from Firebase...";

  try {
    if (!db) throw new Error("Firebase DB connection missing");
    await db.ref(`certificates/${id}`).remove();

    if (statusEl) statusEl.textContent = "🗑️ Certificate removed from Firebase!";
    if (editingCertificateId === id) resetCertificateForm();
  } catch (err) {
    console.error("Failed to delete certificate:", err.message);
    if (statusEl) statusEl.textContent = `❌ Delete failed: ${err.message}`;
  }
}

/* ---------- 6. Reset Form to "Add" Mode ---------- */
function resetCertificateForm() {
  editingCertificateId = null;
  document.getElementById("certificate-form").reset();
  document.getElementById("field-certificate-id").value = "";
  document.getElementById("certificate-form-title").textContent = "Add New Certificate";
  document.getElementById("certificate-submit-btn").textContent = "+ Add Certificate";
  document.getElementById("certificate-cancel-btn").style.display = "none";
  document.getElementById("certificate-image-upload-status").textContent = "";
  document.getElementById("certificate-pdf-upload-status").textContent = "";
}
