document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("certificates-grid");
  if (!grid) return;
  try {
    const res = await fetch("../shared/data/certificates.json");
    if (!res.ok) throw new Error("not found");
    const certificates = await res.json();
    grid.innerHTML = "";
    certificates.forEach((cert) => {
      const card = document.createElement("div");
      card.className = "card certificate-card";
      card.innerHTML = `<img src="${cert.image || 'assets/certificate-placeholder.png'}" alt="${cert.name}" class="radius-md" /><h3 class="card-title">${cert.name}</h3><p class="card-body text-muted">${cert.organization} • ${cert.date}</p>`;
      grid.appendChild(card);
    });
  } catch (err) { grid.innerHTML = `<p class="text-muted">⚠️ Could not load certificates.</p>`; }
});