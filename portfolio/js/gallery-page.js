document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("current-year").textContent = new Date().getFullYear();

  const grid = document.getElementById("full-gallery-grid");
  try {
    const res = await fetch("../shared/data/gallery.json");
    if (!res.ok) throw new Error("gallery.json not found");
    const gallery = await res.json();
    grid.innerHTML = "";
    if (gallery.length === 0) { grid.innerHTML = `<p class="text-muted">No gallery images yet.</p>`; return; }
    gallery.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card certificate-card";
      card.innerHTML = `
        <img src="${item.image || 'assets/gallery-placeholder.png'}" alt="${item.title}" class="radius-md" />
        <h3 class="card-title">${item.title}</h3>
        ${item.caption ? `<p class="card-body text-muted">${item.caption}</p>` : ""}`;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p class="text-muted">⚠️ Could not load gallery.</p>`;
  }
});