let profileData = null;
const HOME_LIMIT = 6;

const ICON_MAP = {
  "github.com": "github", "linkedin.com": "linkedin", "instagram.com": "instagram",
  "youtube.com": "youtube", "youtu.be": "youtube", "facebook.com": "facebook", "fb.com": "facebook",
  "twitter.com": "x", "x.com": "x", "wa.me": "whatsapp", "whatsapp.com": "whatsapp",
  "t.me": "telegram", "telegram": "telegram", "behance.net": "behance", "dribbble.com": "dribbble",
  "medium.com": "medium", "discord": "discord", "twitch.tv": "twitch", "reddit.com": "reddit"
};

function getIconSlug(url) {
  const u = (url || "").toLowerCase();
  for (const key in ICON_MAP) { if (u.includes(key)) return ICON_MAP[key]; }
  return null;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadThemeTokens();
  await applySectionVisibility();
  await loadProfile();
  initTypingAnimation();
  setCurrentYear();
  loadProjects();
  loadSkills();
  loadCertificates();
  loadGallery();
  loadVideos();
  loadBlog();
  initScrollReveal();
  initContactForm();
  initVisitorModal();
  initFeedbackModal();
  initNavbarScroll();
});

/* ---------- NEW: Load saved theme (fixes "Theme not working" bug) ---------- */
async function loadThemeTokens() {
  try {
    const res = await fetch("../shared/config/design-tokens.json");
    if (!res.ok) throw new Error("design-tokens.json not found");
    const tokens = await res.json();
    const root = document.documentElement.style;
    if (tokens.colors) {
      root.setProperty("--color-background", tokens.colors.background);
      root.setProperty("--color-surface", tokens.colors.surface);
      root.setProperty("--color-primary", tokens.colors.primary);
      root.setProperty("--color-accent", tokens.colors.accent);
      root.setProperty("--color-text", tokens.colors.text);
      root.setProperty("--color-muted", tokens.colors.muted);
      root.setProperty("--color-border", tokens.colors.border);
    }
    if (tokens.fonts?.primary) root.setProperty("--font-primary", tokens.fonts.primary);
  } catch (err) {
    console.warn("Theme tokens not loaded (using default CSS colors):", err.message);
  }
}

async function applySectionVisibility() {
  try {
    const res = await fetch("../shared/data/site-settings.json");
    if (!res.ok) throw new Error("site-settings.json not found yet");
    const data = await res.json();
    const sections = data.sections || {};
    Object.keys(sections).forEach((key) => {
      if (sections[key] === false) {
        const sectionEl = document.getElementById(key);
        if (sectionEl) sectionEl.style.display = "none";
        const navLink = document.querySelector(`.navbar-links a[href="#${key}"]`);
        if (navLink) navLink.parentElement.style.display = "none";
      }
    });
  } catch (err) { console.warn("Section visibility not loaded:", err.message); }
}

async function loadProfile() {
  try {
    const res = await fetch("../shared/data/profile.json");
    if (!res.ok) throw new Error("profile.json not found yet");
    profileData = await res.json();

    document.title = `${profileData.name} | ${profileData.role}`;
    const taglineEl = document.querySelector(".hero-tagline");
    if (taglineEl) taglineEl.textContent = profileData.tagline;

    const resumeBtn = document.getElementById("hero-resume-btn");
    if (resumeBtn && profileData.files?.resume) resumeBtn.href = profileData.files.resume;

    const educationEl = document.getElementById("about-education");
    if (educationEl) educationEl.textContent = profileData.about?.education || educationEl.textContent;
    const experienceEl = document.getElementById("about-experience");
    if (experienceEl) experienceEl.textContent = profileData.about?.experience || experienceEl.textContent;
    const goalsEl = document.getElementById("about-goals");
    if (goalsEl) goalsEl.textContent = profileData.about?.goals || goalsEl.textContent;
    const aboutTextP = document.querySelector(".about-text > p");
    if (aboutTextP && profileData.about?.introduction) aboutTextP.textContent = profileData.about.introduction;
    const aboutPhoto = document.querySelector(".about-photo");
    if (aboutPhoto && profileData.files?.profilePhoto) aboutPhoto.src = profileData.files.profilePhoto;

    const emailEl = document.getElementById("contact-email");
    if (emailEl && profileData.contact?.email) {
      emailEl.href = `mailto:${profileData.contact.email}`;
      emailEl.textContent = `📧 ${profileData.contact.email}`;
    }
    const phoneEl = document.getElementById("contact-phone");
    if (phoneEl && profileData.contact?.phone) {
      phoneEl.href = `tel:${profileData.contact.phone}`;
      phoneEl.textContent = `📱 ${profileData.contact.phone}`;
    } else if (phoneEl) { phoneEl.style.display = "none"; }

    const footerLocation = document.getElementById("footer-location");
    if (footerLocation && profileData.contact?.location) footerLocation.textContent = `📍 ${profileData.contact.location}`;

    /* NEW: dynamic logo */
    const logoImg = document.getElementById("brand-logo-img");
    if (logoImg && profileData.files?.logo) logoImg.src = profileData.files.logo;

    /* NEW: dynamic hero background */
    const heroSection = document.getElementById("home");
    if (heroSection && profileData.files?.heroBackground) {
      heroSection.style.backgroundImage =
        `linear-gradient(rgba(10,14,26,0.85), rgba(10,14,26,0.92)), url('${profileData.files.heroBackground}')`;
      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundPosition = "center top";
    }

    renderSocialLinks(profileData.socialLinks || []);
  } catch (err) { console.warn("Profile data not loaded yet:", err.message); }
}

function renderSocialLinks(links) {
  const heroContainer = document.getElementById("hero-social-links");
  const contactContainer = document.getElementById("contact-social-links");
  const buildLinks = () => links.map(link => {
    const slug = getIconSlug(link.url);
    const iconHtml = slug
      ? `<img src="https://cdn.simpleicons.org/${slug}/ffffff" style="width:18px;height:18px;" alt="${slug}" />`
      : "🔗";
    const label = link.label || "Link";
    return `<a href="${link.url}" class="btn btn-outline" target="_blank" title="${label}">${iconHtml} ${label}</a>`;
  }).join("");
  if (heroContainer) heroContainer.innerHTML = buildLinks();
  if (contactContainer) contactContainer.innerHTML = buildLinks();
}

function initTypingAnimation() {
  const el = document.getElementById("typing-text");
  if (!el) return;
  const roles = profileData?.roles?.length ? profileData.roles : ["AI Application Developer", "B.Tech Engineering Student", "JavaScript Developer", "Node.js Developer"];
  let roleIndex = 0, charIndex = 0, deleting = false;
  function type() {
    const currentRole = roles[roleIndex];
    if (!deleting) {
      el.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentRole.length) { deleting = true; setTimeout(type, 1500); return; }
    } else {
      el.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
    }
    setTimeout(type, deleting ? 50 : 100);
  }
  type();
}

function setCurrentYear() {
  const el = document.getElementById("current-year");
  if (el) el.textContent = new Date().getFullYear();
}

async function loadProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  try {
    const res = await fetch("../shared/data/projects.json");
    if (!res.ok) throw new Error("projects.json not found");
    const projects = await res.json();
    grid.innerHTML = "";
    projects.forEach((project) => {
      const card = document.createElement("div");
      card.className = "card project-card";
      card.innerHTML = `
        <img src="${project.screenshot || 'assets/project-placeholder.png'}" alt="${project.name}" class="project-image radius-md" />
        <h3 class="card-title">${project.name}</h3>
        <p class="card-body">${project.description}</p>
        <div class="project-tags">${(project.tech || []).map(tag => `<span class="badge-outline badge">${tag}</span>`).join("")}</div>
        <div class="project-links">
          ${project.github ? `<a href="${project.github}" class="btn btn-icon" target="_blank">GitHub</a>` : ""}
          ${project.demo ? `<a href="${project.demo}" class="btn btn-icon" target="_blank">Demo</a>` : ""}
          ${project.video ? `<a href="${project.video}" class="btn btn-icon" target="_blank">Video</a>` : ""}
        </div>`;
      grid.appendChild(card);
    });
  } catch (err) { console.warn("Projects not loaded:", err.message); }
}

async function loadSkills() {
  const list = document.getElementById("skills-list");
  if (!list) return;
  try {
    const res = await fetch("../shared/data/skills.json");
    if (!res.ok) throw new Error("skills.json not found");
    const skills = await res.json();
    list.innerHTML = "";
    skills.forEach((skill) => {
      const item = document.createElement("div");
      item.className = "skill-item";
      item.innerHTML = `<div class="skill-header"><span>${skill.name}</span><span class="text-muted">${skill.percentage}%</span></div><div class="progress-track"><div class="progress-fill" style="width: ${skill.percentage}%;"></div></div>`;
      list.appendChild(item);
    });
  } catch (err) { console.warn("Skills not loaded:", err.message); }
}

async function loadCertificates() {
  const grid = document.getElementById("certificates-grid");
  if (!grid) return;
  try {
    const res = await fetch("../shared/data/certificates.json");
    if (!res.ok) throw new Error("certificates.json not found");
    const certificates = await res.json();
    grid.innerHTML = "";
    certificates.forEach((cert) => {
      const card = document.createElement("div");
      card.className = "card certificate-card";
      card.innerHTML = `<img src="${cert.image || 'assets/certificate-placeholder.png'}" alt="${cert.name}" class="radius-md" /><h3 class="card-title">${cert.name}</h3><p class="card-body text-muted">${cert.organization} • ${cert.date}</p>`;
      grid.appendChild(card);
    });
  } catch (err) { console.warn("Certificates not loaded:", err.message); }
}

async function loadGallery() {
  const grid = document.getElementById("gallery-grid");
  const viewAllBox = document.getElementById("gallery-viewall");
  if (!grid) return;
  try {
    const res = await fetch("../shared/data/gallery.json");
    if (!res.ok) throw new Error("gallery.json not found");
    const gallery = await res.json();
    grid.innerHTML = "";
    if (gallery.length === 0) { grid.innerHTML = `<p class="text-muted">No gallery images yet.</p>`; return; }
    gallery.slice(0, HOME_LIMIT).forEach((item) => {
      const card = document.createElement("div");
      card.className = "card certificate-card";
      card.innerHTML = `<img src="${item.image || 'assets/gallery-placeholder.png'}" alt="${item.title}" class="radius-md" /><h3 class="card-title">${item.title}</h3>${item.caption ? `<p class="card-body text-muted">${item.caption}</p>` : ""}`;
      grid.appendChild(card);
    });
    if (gallery.length > HOME_LIMIT && viewAllBox) viewAllBox.innerHTML = `<a href="gallery.html" class="btn btn-outline">View All (${gallery.length}) →</a>`;
  } catch (err) { console.warn("Gallery not loaded:", err.message); }
}

function getYouTubeId(url) {
  const match = (url || "").match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

async function loadVideos() {
  const grid = document.getElementById("videos-grid");
  const viewAllBox = document.getElementById("videos-viewall");
  if (!grid) return;
  try {
    const res = await fetch("../shared/data/videos.json");
    if (!res.ok) throw new Error("videos.json not found");
    const videos = await res.json();
    grid.innerHTML = "";
    if (videos.length === 0) { grid.innerHTML = `<p class="text-muted">No videos yet.</p>`; return; }
    videos.slice(0, HOME_LIMIT).forEach((video) => {
      const ytId = getYouTubeId(video.url || "");
      const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "assets/project-placeholder.png";
      const card = document.createElement("div");
      card.className = "card project-card";
      card.innerHTML = `<a href="${video.url}" target="_blank"><img src="${thumbnail}" alt="${video.title}" class="project-image radius-md" /></a><h3 class="card-title">${video.title}</h3>${video.description ? `<p class="card-body">${video.description}</p>` : ""}<div class="project-links"><a href="${video.url}" class="btn btn-icon" target="_blank">▶️ Watch</a></div>`;
      grid.appendChild(card);
    });
    if (videos.length > HOME_LIMIT && viewAllBox) viewAllBox.innerHTML = `<a href="videos.html" class="btn btn-outline">View All (${videos.length}) →</a>`;
  } catch (err) { console.warn("Videos not loaded:", err.message); }
}

async function loadBlog() {
  const grid = document.getElementById("blog-grid");
  const viewAllBox = document.getElementById("blog-viewall");
  if (!grid) return;
  try {
    const res = await fetch("../shared/data/blog.json");
    if (!res.ok) throw new Error("blog.json not found");
    const posts = await res.json();
    grid.innerHTML = "";
    if (posts.length === 0) { grid.innerHTML = `<p class="text-muted">No blog posts yet.</p>`; return; }
    posts.slice(0, HOME_LIMIT).forEach((post) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h3 class="card-title">${post.title}</h3><p class="card-body text-muted" style="font-size:0.8rem;">${post.date || ""}</p><p class="card-body">${post.content}</p>`;
      grid.appendChild(card);
    });
    if (posts.length > HOME_LIMIT && viewAllBox) viewAllBox.innerHTML = `<a href="blog.html" class="btn btn-outline">View All (${posts.length}) →</a>`;
  } catch (err) { console.warn("Blog not loaded:", err.message); }
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("reveal-visible"); observer.unobserve(entry.target); } });
  }, { threshold: 0.15 });
  revealElements.forEach((el) => observer.observe(el));
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById("contact-form-status");
    const submitBtn = document.getElementById("cf-submit-btn");
    const emailVal = document.getElementById("cf-email").value.trim();
    const subjectVal = document.getElementById("cf-subject").value.trim();
    const messageVal = document.getElementById("cf-message").value.trim();
    const fileInput = document.getElementById("cf-attachment");
    if (!emailVal || !messageVal) return;
    const formData = new FormData();
    formData.append("visitorEmail", emailVal);
    formData.append("subject", subjectVal);
    formData.append("message", messageVal);
    if (fileInput.files[0]) formData.append("attachment", fileInput.files[0]);
    if (statusEl) { statusEl.textContent = "Sending..."; statusEl.style.color = "var(--color-muted)"; }
    if (submitBtn) submitBtn.disabled = true;
    try {
      const res = await fetch("/api/contact/send", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send.");
      if (statusEl) { statusEl.textContent = "✅ Sent! I'll get back to you soon."; statusEl.style.color = "var(--color-accent)"; }
      form.reset();
    } catch (err) {
      if (statusEl) { statusEl.textContent = `❌ ${err.message}`; statusEl.style.color = "#ef4444"; }
    } finally { if (submitBtn) submitBtn.disabled = false; }
  });
}

function initVisitorModal() {
  const overlay = document.getElementById("visitor-modal-overlay");
  const form = document.getElementById("visitor-form");
  const skipBtn = document.getElementById("visitor-skip-btn");
  if (!overlay || !form) return;
  if (sessionStorage.getItem("visitorModalShown")) { overlay.style.display = "none"; return; }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("vf-name").value.trim();
    const email = document.getElementById("vf-email").value.trim();
    const purpose = document.getElementById("vf-purpose").value.trim();
    if (!name || !email) return;
    try {
      await fetch("/api/public/visitor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, purpose }) });
    } catch (err) { console.warn("Visitor submit failed:", err.message); }
    sessionStorage.setItem("visitorModalShown", "true");
    overlay.style.display = "none";
  });
  skipBtn.addEventListener("click", () => { sessionStorage.setItem("visitorModalShown", "true"); overlay.style.display = "none"; });
}

function initFeedbackModal() {
  const fab = document.getElementById("feedback-fab");
  const overlay = document.getElementById("feedback-modal-overlay");
  const closeBtn = document.getElementById("feedback-close-btn");
  const form = document.getElementById("feedback-form");
  if (!fab || !overlay || !form) return;
  fab.addEventListener("click", () => { overlay.style.display = "flex"; });
  closeBtn.addEventListener("click", () => { overlay.style.display = "none"; });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById("feedback-status");
    const name = document.getElementById("fb-name").value.trim();
    const message = document.getElementById("fb-message").value.trim();
    if (!message) return;
    if (statusEl) statusEl.textContent = "Sending...";
    try {
      const res = await fetch("/api/public/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, message }) });
      if (!res.ok) throw new Error("Failed to send feedback.");
      if (statusEl) statusEl.textContent = "✅ Thank you for your feedback!";
      form.reset();
      setTimeout(() => { overlay.style.display = "none"; if (statusEl) statusEl.textContent = ""; }, 1500);
    } catch (err) { if (statusEl) statusEl.textContent = "❌ Failed to send. Try again."; }
  });
}

function initNavbarScroll() {
  const navbar = document.getElementById("main-navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
}