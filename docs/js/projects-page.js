document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  try {
    const res = await fetch("../shared/data/projects.json");
    if (!res.ok) throw new Error("not found");
    const projects = await res.json();
    grid.innerHTML = "";
    projects.forEach((project) => {
      const card = document.createElement("div");
      card.className = "card project-card";
      card.innerHTML = `
        <img src="${project.screenshot || 'assets/project-placeholder.png'}" alt="${project.name}" class="project-image radius-md" />
        <h3 class="card-title">${project.name}</h3>
        <p class="card-body">${project.description}</p>
        <div class="project-tags">${(project.tech || []).map(t => `<span class="badge-outline badge">${t}</span>`).join("")}</div>
        <div class="project-links">
          ${project.github ? `<a href="${project.github}" class="btn btn-icon" target="_blank">GitHub</a>` : ""}
          ${project.demo ? `<a href="${project.demo}" class="btn btn-icon" target="_blank">Demo</a>` : ""}
          ${project.video ? `<a href="${project.video}" class="btn btn-icon" target="_blank">Video</a>` : ""}
        </div>`;
      grid.appendChild(card);
    });
  } catch (err) { grid.innerHTML = `<p class="text-muted">⚠️ Could not load projects.</p>`; }
});