document.addEventListener("DOMContentLoaded", async () => {
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const grid = document.getElementById("full-gallery-grid");
  if (!grid) return;

  try {
    let gallery = [];

    // 1. Firebase Realtime Database से डेटा फेच करने का प्रयास
    if (typeof firebase !== "undefined" && firebase.database) {
      const snapshot = await firebase.database().ref("gallery").once("value");
      const data = snapshot.val();
      if (data) {
        gallery = Array.isArray(data) ? data : Object.values(data);
      }
    }

    // 2. फ़ॉलबैक: यदि Firebase में डेटा नहीं है तो local JSON से फेच करें
    if (!gallery || gallery.length === 0) {
      const res = await fetch("shared/data/gallery.json").catch(() => null) ||
                  await fetch("shared/data/gallery.json").catch(() => null);
      if (res && res.ok) {
        gallery = await res.json();
      }
    }

    grid.innerHTML = "";

    if (!gallery || gallery.length === 0) {
      grid.innerHTML = `<p class="text-muted">No gallery images yet.</p>`;
      return;
    }

    // 3. गैलरी आइटम्स को DOM में रेंडर करें
    gallery.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card certificate-card";
      card.innerHTML = `
        <img src="${item.image || 'assets/gallery-placeholder.png'}" alt="${item.title || 'Gallery Image'}" class="radius-md" />
        <h3 class="card-title">${item.title || ''}</h3>
        ${item.caption ? `<p class="card-body text-muted">${item.caption}</p>` : ""}
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading gallery:", err);
    grid.innerHTML = `<p class="text-muted">⚠️ Could not load gallery.</p>`;
  }
});
