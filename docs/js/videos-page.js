function getYouTubeId(url) {
  const match = (url || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const grid = document.getElementById("full-videos-grid");
  if (!grid) return;

  try {
    let videos = [];

    // 1. Firebase Realtime Database से डेटा फेच करने का प्रयास
    if (typeof firebase !== "undefined" && firebase.database) {
      const snapshot = await firebase.database().ref("videos").once("value");
      const data = snapshot.val();
      if (data) {
        videos = Array.isArray(data) ? data : Object.values(data);
      }
    }

    // 2. फ़ॉलबैक: यदि Firebase में डेटा नहीं है तो local JSON से फेच करें
    if (!videos || videos.length === 0) {
      const res = await fetch("shared/data/videos.json").catch(() => null) ||
                  await fetch("shared/data/videos.json").catch(() => null);
      if (res && res.ok) {
        videos = await res.json();
      }
    }

    grid.innerHTML = "";

    if (!videos || videos.length === 0) {
      grid.innerHTML = `<p class="text-muted">No videos yet.</p>`;
      return;
    }

    // 3. वीडियो कार्ड्स को DOM में रेंडर करें
    videos.forEach((video) => {
      const ytId = getYouTubeId(video.url || "");
      const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "assets/project-placeholder.png";
      const card = document.createElement("div");
      card.className = "card project-card";
      card.innerHTML = `
        <a href="${video.url}" target="_blank">
          <img src="${thumbnail}" alt="${video.title || 'Video'}" class="project-image radius-md" />
        </a>
        <h3 class="card-title">${video.title || 'Untitled Video'}</h3>
        ${video.description ? `<p class="card-body">${video.description}</p>` : ""}
        <div class="project-links">
          <a href="${video.url}" class="btn btn-icon" target="_blank">▶️ Watch</a>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading videos:", err);
    grid.innerHTML = `<p class="text-muted">⚠️ Could not load videos.</p>`;
  }
});
