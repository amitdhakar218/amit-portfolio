document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  try {
    let projects = [];

    // 1. Firebase Realtime Database से डेटा फेच करने का प्रयास
    if (typeof firebase !== "undefined" && firebase.database) {
      const snapshot = await firebase.database().ref("projects").once("value");
      const data = snapshot.val();
      if (data) {
        projects = Array.isArray(data) ? data : Object.values(data);
      }
    }

    // 2. फ़ॉलबैक: यदि Firebase में डेटा नहीं है तो local JSON से फेच करें
    if (!projects || projects.length === 0) {
      const res = await fetch("shared/data/projects.json").catch(() => null) ||
                  await fetch("shared/data/projects.json").catch(() => null);
      if (res && res.ok) {
        projects = await res.json();
      }
    }

    grid.innerHTML = "";

    if (!projects || projects.length === 0) {
      grid.innerHTML = `<p class="text-muted">No projects found.</p>`;
      return;
    }

    // 3. प्रोजेक्ट कार्ड्स को DOM में रेंडर करें
    projects.forEach((project) => {
      const card = document.createElement("div");
      card.className = "card project-card";
      card.innerHTML = `
        <img src="${project.screenshot || 'assets/project-placeholder.png'}" alt="${project.name || 'Project'}" class="project-image radius-md" />
        <h3 class="card-title">${project.name || 'Untitled Project'}</h3>
        <p class="card-body">${project.description || ''}</p>
        <div class="project-tags">${(project.tech || []).map(t => `<span class="badge-outline badge">${t}</span>`).join("")}</div>
        <div class="project-links">
          ${project.github ? `<a href="${project.github}" class="btn btn-icon" target="_blank">GitHub</a>` : ""}
          ${project.demo ? `<a href="${project.demo}" class="btn btn-icon" target="_blank">Demo</a>` : ""}
          ${project.video ? `<a href="${project.video}" class="btn btn-icon" target="_blank">Video</a>` : ""}
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading projects:", err);
    grid.innerHTML = `<p class="text-muted">⚠️ Could not load projects.</p>`;
  }
});
