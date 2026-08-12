let profileData = null;

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

function trackClick(type) {
  try {
    const blob = new Blob([JSON.stringify({ type })], { type: "application/json" });
    navigator.sendBeacon("/api/track/click", blob);
  } catch (err) {}
}

function trackVisit() {
  if (sessionStorage.getItem("visitCounted")) return;
  sessionStorage.setItem("visitCounted", "true");
  try {
    const blob = new Blob([JSON.stringify({})], { type: "application/json" });
    navigator.sendBeacon("/api/track/visit", blob);
  } catch (err) {}
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadThemeTokens();
  await loadProfileCommon();
  setCurrentYear();
  initNavbarScroll();
  initSidePanel();
  initFeedbackModal();
  initVisitorModal();
  initScrollReveal();
  trackVisit();
});

function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealElements.forEach((el) => observer.observe(el));
}

async function loadThemeTokens() {
  try {
    const res = await fetch("../shared/config/design-tokens.json");
    if (!res.ok) throw new Error("not found");
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
  } catch (err) { console.warn("Theme not loaded:", err.message); }
}

async function loadProfileCommon() {
  try {
    const res = await fetch("../shared/data/profile.json");
    if (!res.ok) throw new Error("not found");
    profileData = await res.json();
    window.profileData = profileData;

    const taglineEl = document.querySelector(".hero-tagline");
    if (taglineEl) taglineEl.textContent = profileData.tagline;

    const resumeBtn = document.getElementById("hero-resume-btn");
    const resumeDownloadBtn = document.getElementById("resume-download-btn");
    if (profileData.files?.resume) {
      if (resumeBtn) { resumeBtn.href = profileData.files.resume; resumeBtn.addEventListener("click", () => trackClick("resume")); }
      if (resumeDownloadBtn) { resumeDownloadBtn.href = profileData.files.resume; resumeDownloadBtn.addEventListener("click", () => trackClick("resume")); }
    }

    const logoImg = document.getElementById("brand-logo-img");
    if (logoImg && profileData.files?.logo) logoImg.src = profileData.files.logo;

    const heroSection = document.getElementById("home-hero");
    if (heroSection && profileData.files?.heroBackground) {
      heroSection.style.backgroundImage = `linear-gradient(rgba(5,5,5,0.88), rgba(5,5,5,0.94)), url('${profileData.files.heroBackground}')`;
      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundPosition = "center top";
    }

    const emailEl = document.getElementById("contact-email");
    if (emailEl && profileData.contact?.email) emailEl.href = `mailto:${profileData.contact.email}`;

    const phoneEl = document.getElementById("contact-phone");
    if (phoneEl) {
      if (profileData.contact?.phone) phoneEl.href = `tel:${profileData.contact.phone}`;
      else phoneEl.style.display = "none";
    }

    const footerLocation = document.getElementById("footer-location");
    if (footerLocation && profileData.contact?.location) footerLocation.textContent = `📍 ${profileData.contact.location}`;

    const aboutPhoto = document.querySelector(".about-photo");
    if (aboutPhoto && profileData.files?.profilePhoto) aboutPhoto.src = profileData.files.profilePhoto;
    const educationEl = document.getElementById("about-education");
    if (educationEl) educationEl.textContent = profileData.about?.education || "—";
    const experienceEl = document.getElementById("about-experience");
    if (experienceEl) experienceEl.textContent = profileData.about?.experience || "—";
    const goalsEl = document.getElementById("about-goals");
    if (goalsEl) goalsEl.textContent = profileData.about?.goals || "—";
    const aboutTextP = document.querySelector(".about-text > p");
    if (aboutTextP && profileData.about?.introduction) aboutTextP.textContent = profileData.about.introduction;

    const achievementsEl = document.getElementById("achievements-content");
    if (achievementsEl) {
      const text = (profileData.about?.achievements || "").trim();
      achievementsEl.innerHTML = text
        ? text.split("\n").filter(Boolean).map(line => `<p class="card-body" style="margin-bottom:8px;">🏆 ${line}</p>`).join("")
        : `<p class="card-body">No achievements added yet — add them via Studio → Profile.</p>`;
    }

    renderSocialLinks(profileData.socialLinks || []);
    document.title = `${profileData.name} | ${profileData.role}`;
    window.dispatchEvent(new CustomEvent("profileLoaded"));

  } catch (err) { console.warn("Profile not loaded:", err.message); }
}

function renderSocialLinks(links) {
  const heroContainer = document.getElementById("hero-social-links");
  const contactContainer = document.getElementById("contact-social-links");
  const buildLinks = () => links.map(link => {
    const slug = getIconSlug(link.url);
    const iconHtml = slug ? `<img src="https://cdn.simpleicons.org/${slug}/ffffff" style="width:18px;height:18px;" alt="${slug}" />` : "🔗";
    const label = link.label || "Link";
    return `<a href="${link.url}" class="btn btn-outline" target="_blank" title="${label}" onclick="trackClick('${slug || 'other'}')">${iconHtml} ${label}</a>`;
  }).join("");
  if (heroContainer) heroContainer.innerHTML = buildLinks();
  if (contactContainer) contactContainer.innerHTML = buildLinks();
}

function setCurrentYear() {
  const el = document.getElementById("current-year");
  if (el) el.textContent = new Date().getFullYear();
}

function initNavbarScroll() {
  const navbar = document.getElementById("main-navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
}

function initSidePanel() {
  const toggleBtn = document.getElementById("menu-toggle-btn");
  const overlay = document.getElementById("side-panel-overlay");
  const panel = document.getElementById("side-panel");
  const closeBtn = document.getElementById("side-panel-close");
  if (!toggleBtn || !overlay || !panel) return;
  const open = () => { overlay.classList.add("open"); panel.classList.add("open"); };
  const close = () => { overlay.classList.remove("open"); panel.classList.remove("open"); };
  toggleBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
  const feedbackLink = document.getElementById("side-panel-feedback-link");
  if (feedbackLink) {
    feedbackLink.addEventListener("click", (e) => {
      e.preventDefault(); close();
      const fo = document.getElementById("feedback-modal-overlay");
      if (fo) fo.style.display = "flex";
    });
  }
}

function initFeedbackModal() {
  const fab = document.getElementById("feedback-fab");
  const overlay = document.getElementById("feedback-modal-overlay");
  const closeBtn = document.getElementById("feedback-close-btn");
  const form = document.getElementById("feedback-form");
  if (!overlay || !form) return;
  if (fab) fab.addEventListener("click", () => { overlay.style.display = "flex"; });
  if (closeBtn) closeBtn.addEventListener("click", () => { overlay.style.display = "none"; });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById("feedback-status");
    const name = document.getElementById("fb-name").value.trim();
    const message = document.getElementById("fb-message").value.trim();
    if (!message) return;
    if (statusEl) statusEl.textContent = "Sending...";
    try {
      const res = await fetch("/api/public/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, message }) });
      if (!res.ok) throw new Error("Failed.");
      if (statusEl) statusEl.textContent = "✅ Thank you!";
      form.reset();
      setTimeout(() => { overlay.style.display = "none"; if (statusEl) statusEl.textContent = ""; }, 1500);
    } catch (err) { if (statusEl) statusEl.textContent = "❌ Failed to send."; }
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
    } catch (err) {}
    sessionStorage.setItem("visitorModalShown", "true");
    overlay.style.display = "none";
  });
  skipBtn.addEventListener("click", () => { sessionStorage.setItem("visitorModalShown", "true"); overlay.style.display = "none"; });
}