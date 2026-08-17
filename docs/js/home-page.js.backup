document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    loadHomeProjects(),
    loadHomeSkills(),
    loadHomeCertificates(),
    loadHomeGallery(),
    loadHomeVideos(),
    loadHomeBlog()
  ]);
});

async function getFirebaseList(path, fallbackFile) {
  let data = [];

  try {
    if (typeof firebase !== "undefined" && firebase.database) {
      const snapshot = await firebase.database().ref(path).once("value");
      const value = snapshot.val();

      if (value) {
        data = Array.isArray(value) ? value : Object.values(value);
      }
    }

    if (!data.length && fallbackFile) {
      const res = await fetch(fallbackFile);
      if (res.ok) data = await res.json();
    }
  } catch (err) {
    console.error(`Error loading ${path}:`, err);
  }

  return data || [];
}

function showMessage(id, message) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<p class="text-muted">${message}</p>`;
}

async function loadHomeProjects() {
  const container = document.getElementById("projects-content");
  if (!container) return;

  const projects = await getFirebaseList("projects", "shared/data/projects.json");

  if (!projects.length) {
    showMessage("projects-content", "No projects found.");
    return;
  }

  container.innerHTML = "";
  container.className = "projects-grid";

  projects.forEach((project) => {
    const card = document.createElement("div");
    card.className = "card project-card";

    card.innerHTML = `
      <img
        src="${project.screenshot || "assets/project-placeholder.png"}"
        alt="${project.name || "Project"}"
        class="project-image radius-md"
      />
      <h3 class="card-title">${project.name || "Untitled Project"}</h3>
      <p class="card-body">${project.description || ""}</p>

      <div class="project-tags">
        ${(project.tech || [])
          .map((tag) => `<span class="badge-outline badge">${tag}</span>`)
          .join("")}
      </div>

      <div class="project-links">
        ${
          project.github
            ? `<a href="${project.github}" class="btn btn-icon" target="_blank" rel="noopener">GitHub</a>`
            : ""
        }
        ${
          project.demo
            ? `<a href="${project.demo}" class="btn btn-icon" target="_blank" rel="noopener">Demo</a>`
            : ""
        }
        ${
          project.video
            ? `<a href="${project.video}" class="btn btn-icon" target="_blank" rel="noopener">Video</a>`
            : ""
        }
      </div>
    `;

    container.appendChild(card);
  });
}

async function loadHomeSkills() {
  const container = document.getElementById("skills-content");
  if (!container) return;

  const skills = await getFirebaseList("skills", "shared/data/skills.json");

  if (!skills.length) {
    showMessage("skills-content", "No skills found.");
    return;
  }

  container.innerHTML = "";
  container.className = "skills-list";

  skills.forEach((skill) => {
    const item = document.createElement("div");
    item.className = "skill-item";

    const percentage = Number(skill.percentage) || 0;

    item.innerHTML = `
      <div class="skill-header">
        <span>${skill.name || "Skill"}</span>
        <span class="text-muted">${percentage}%</span>
      </div>

      <div class="progress-track">
        <div
          class="progress-fill"
          style="width: ${percentage}%;">
        </div>
      </div>
    `;

    container.appendChild(item);
  });
}

async function loadHomeCertificates() {
  const container = document.getElementById("certificates-content");
  if (!container) return;

  const certificates = await getFirebaseList(
    "certificates",
    "shared/data/certificates.json"
  );

  if (!certificates.length) {
    showMessage("certificates-content", "No certificates found.");
    return;
  }

  container.innerHTML = "";
  container.className = "certificates-grid";

  certificates.forEach((cert) => {
    const card = document.createElement("div");
    card.className = "card certificate-card";

    card.innerHTML = `
      <img
        src="${cert.image || "assets/certificate-placeholder.png"}"
        alt="${cert.name || "Certificate"}"
        class="radius-md"
      />

      <h3 class="card-title">${cert.name || "Certificate"}</h3>

      <p class="card-body text-muted">
        ${cert.organization || ""}
        ${cert.date ? ` • ${cert.date}` : ""}
      </p>
    `;

    container.appendChild(card);
  });
}

async function loadHomeGallery() {
  const container = document.getElementById("gallery-content");
  if (!container) return;

  const gallery = await getFirebaseList("gallery", "shared/data/gallery.json");

  if (!gallery.length) {
    showMessage("gallery-content", "No gallery images yet.");
    return;
  }

  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(240px, 1fr))";
  container.style.gap = "var(--space-lg)";

  gallery.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card certificate-card";

    card.innerHTML = `
      <img
        src="${item.image || "assets/gallery-placeholder.png"}"
        alt="${item.title || "Gallery Image"}"
        class="radius-md"
      />

      <h3 class="card-title">${item.title || ""}</h3>

      ${
        item.caption
          ? `<p class="card-body text-muted">${item.caption}</p>`
          : ""
      }
    `;

    container.appendChild(card);
  });
}

function getYouTubeId(url) {
  const match = (url || "").match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );

  return match ? match[1] : null;
}

async function loadHomeVideos() {
  const container = document.getElementById("videos-content");
  if (!container) return;

  const videos = await getFirebaseList("videos", "shared/data/videos.json");

  if (!videos.length) {
    showMessage("videos-content", "No videos yet.");
    return;
  }

  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
  container.style.gap = "var(--space-lg)";

  videos.forEach((video) => {
    const ytId = getYouTubeId(video.url || "");

    const thumbnail = ytId
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : "assets/project-placeholder.png";

    const card = document.createElement("div");
    card.className = "card project-card";

    card.innerHTML = `
      <a href="${video.url || "#"}" target="_blank" rel="noopener">
        <img
          src="${thumbnail}"
          alt="${video.title || "Video"}"
          class="project-image radius-md"
        />
      </a>

      <h3 class="card-title">${video.title || "Untitled Video"}</h3>

      ${
        video.description
          ? `<p class="card-body">${video.description}</p>`
          : ""
      }

      <div class="project-links">
        ${
          video.url
            ? `<a href="${video.url}" class="btn btn-icon" target="_blank" rel="noopener">▶️ Watch</a>`
            : ""
        }
      </div>
    `;

    container.appendChild(card);
  });
}

async function loadHomeBlog() {
  const container = document.getElementById("blog-content");
  if (!container) return;

  const posts = await getFirebaseList("blog", "shared/data/blog.json");

  if (!posts.length) {
    showMessage("blog-content", "No blog posts yet.");
    return;
  }

  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(280px, 1fr))";
  container.style.gap = "var(--space-lg)";

  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3 class="card-title">${post.title || "Untitled"}</h3>

      <p
        class="card-body text-muted"
        style="font-size:0.8rem; margin-bottom:var(--space-xs);"
      >
        ${post.date || ""}
      </p>

      <p class="card-body">
        ${post.content || post.description || ""}
      </p>
    `;

    container.appendChild(card);
  });
}
