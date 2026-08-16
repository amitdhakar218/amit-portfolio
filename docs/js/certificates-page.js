document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("certificates-grid");
  if (!grid) return;

  try {
    let certificates = [];

    // 1. Firebase Realtime Database से डेटा फेच करने का प्रयास
    if (typeof firebase !== "undefined" && firebase.database) {
      const snapshot = await firebase.database().ref("certificates").once("value");
      const data = snapshot.val();
      if (data) {
        certificates = Array.isArray(data) ? data : Object.values(data);
      }
    }

    // 2. फ़ॉलबैक: यदि Firebase में डेटा उपलब्ध नहीं है तो local JSON से फेच करें
    if (!certificates || certificates.length === 0) {
      const res = await fetch("shared/data/certificates.json").catch(() => null) ||
                  await fetch("shared/data/certificates.json").catch(() => null);
      if (res && res.ok) {
        certificates = await res.json();
      }
    }

    grid.innerHTML = "";

    if (!certificates || certificates.length === 0) {
      grid.innerHTML = `<p class="text-muted">No certificates found.</p>`;
      return;
    }

    // 3. सर्टिफिकेट कार्ड्स को DOM में रेंडर करें
    certificates.forEach((cert) => {
      const card = document.createElement("div");
      card.className = "card certificate-card";
      card.innerHTML = `
        <img src="${cert.image || 'assets/certificate-placeholder.png'}" alt="${cert.name || 'Certificate'}" class="radius-md" />
        <h3 class="card-title">${cert.name || 'Certificate'}</h3>
        <p class="card-body text-muted">${cert.organization || ''} ${cert.date ? '• ' + cert.date : ''}</p>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading certificates:", err);
    grid.innerHTML = `<p class="text-muted">⚠️ Could not load certificates.</p>`;
  }
});
