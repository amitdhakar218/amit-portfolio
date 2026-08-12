function getYouTubeId(url) {
  const match = (url || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("current-year").textContent = new Date().getFullYear();

  const grid = document.getElementById("full-videos-grid");
  try {
    const res = await fetch("../shared/data/videos.json");
    if (!res.ok) throw new Error("videos.json not found");
    const videos = await res.json();
    grid.innerHTML = "";
    if (videos.length === 0) { grid.innerHTML = `<p class="text-muted">No videos yet.</p>`; return; }
    videos.forEach((video) => {
      const ytId = getYouTubeId(video.url || "");
      const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "assets/project-placeholder.png";
      const card = document.createElement("div");
      card.className = "card project-card";
      card.innerHTML = `
        <a href="${video.url}" target="_blank"><img src="${thumbnail}" alt="${video.title}" class="project-image radius-md" /></a>
        <h3 class="card-title">${video.title}</h3>
        ${video.description ? `<p class="card-body">${video.description}</p>` : ""}
        <div class="project-links"><a href="${video.url}" class="btn btn-icon" target="_blank">▶️ Watch</a></div>`;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p class="text-muted">⚠️ Could not load videos.</p>`;
  }
});