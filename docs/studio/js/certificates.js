const API_BASE = "/api/data";
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

async function loadCertificatesList() {
  const statusEl = document.getElementById("certificates-status");
  try {
    const res = await fetch(`${API_BASE}/certificates.json`);
    if (!res.ok) throw new Error("not found");
    currentCertificatesList = await res.json();
    if (statusEl) statusEl.textContent = `${currentCertificatesList.length} certificate(s) loaded from server ✅`;
    renderCertificatesList();
  } catch (err) {
    if (statusEl) statusEl.textContent = "⚠️ Could not load certificates.";
  }
}

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

async function handleCertificateSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("field-certificate-name").value.trim();
  const organization = document.getElementById("field-certificate-org").value.trim();
  if (!name || !organization) return;
  const certData = {
    name, organization,
    date: document.getElementById("field-certificate-date").value,
    image: document.getElementById("field-certificate-image").value || "assets/certificate-placeholder.png",
    pdf: document.getElementById("field-certificate-pdf").value
  };
  const statusEl = document.getElementById("certificates-status");
  if (statusEl) statusEl.textContent = "Saving...";
  try {
    if (editingCertificateId) {
      await fetch(`${API_BASE}/certificates.json/item/${editingCertificateId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(certData) });
      if (statusEl) statusEl.textContent = "✅ Updated permanently.";
    } else {
      await fetch(`${API_BASE}/certificates.json/item`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(certData) });
      if (statusEl) statusEl.textContent = "✅ Added permanently.";
    }
    resetCertificateForm();
    loadCertificatesList();
  } catch (err) {
    if (statusEl) statusEl.textContent = "❌ Save failed.";
  }
}

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

async function deleteCertificate(id) {
  const statusEl = document.getElementById("certificates-status");
  try {
    await fetch(`${API_BASE}/certificates.json/item/${id}`, { method: "DELETE" });
    if (statusEl) statusEl.textContent = "🗑️ Removed permanently.";
    if (editingCertificateId === id) resetCertificateForm();
    loadCertificatesList();
  } catch (err) {
    if (statusEl) statusEl.textContent = "❌ Delete failed.";
  }
}

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