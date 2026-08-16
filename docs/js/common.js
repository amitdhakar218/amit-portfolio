// ==========================================
// FIREBASE INITIALIZATION (PORTFOLIO SIDE)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBg8Y3T_B25Kvg6IHKNemu6JMAXUFhfn-M",
  authDomain: "amit-portfolio-79db4.firebaseapp.com",
  databaseURL: "https://amit-portfolio-79db4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "amit-portfolio-79db4",
  storageBucket: "amit-portfolio-79db4.firebasestorage.app",
  messagingSenderId: "925822310763",
  appId: "1:925822310763:web:c59695e6aab94e9cca942e",
  measurementId: "G-D45ZKBTBEY"
};

if (typeof firebase !== "undefined" && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

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
  const resumeBtn = document.getElementById("hero-resume-btn");
  if (resumeBtn) resumeBtn.addEventListener("click", () => trackClick("resume"));
});

function trackVisit() {
  if (typeof firebase === "undefined" || !firebase.database) return;
  if (sessionStorage.getItem("visitCounted")) return;
  firebase.database().ref("visits").push({ timestamp: new Date().toISOString() });
  sessionStorage.setItem("visitCounted", "true");
}

function trackClick(type) {
  if (typeof firebase === "undefined" || !firebase.database || !type) return;
  firebase.database().ref("clicks").push({ type, timestamp: new Date().toISOString() });
}

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
    let tokens = null;

    if (typeof firebase !== "undefined" && firebase.database) {
      const snapshot = await firebase.database().ref("themeTokens").once("value");
      tokens = snapshot.val();
    }

    if (!tokens) {
      const res = await fetch("shared/config/design-tokens.json").catch(() => null) || 
                  await fetch("shared/config/design-tokens.json").catch(() => null);
      if (!res || !res.ok) throw new Error("not found");
      tokens = await res.json();
    }

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
  } catch (err) { console.warn("Theme not loaded"); }
}

async function loadProfileCommon() {
  try {
    // Firebase से डेटा फेच करें
    if (typeof firebase !== "undefined" && firebase.database) {
      const snapshot = await firebase.database().ref("profile").once("value");
      profileData = snapshot.val();
    }
    
    // Fallback if empty
    if (!profileData) {
      const res = await fetch("shared/data/profile.json").catch(() => null) ||
                  await fetch("shared/data/profile.json").catch(() => null);
      if (res && res.ok) profileData = await res.json();
    }

    if (!profileData) return;

    window.profileData = profileData;
    const taglineEl = document.querySelector(".hero-tagline");
    if (taglineEl) taglineEl.textContent = profileData.tagline || "";
    
    const aboutIntro = document.getElementById("about-intro");
    if (aboutIntro) aboutIntro.textContent = profileData.about?.introduction || "";

    const educationEl = document.getElementById("about-education");
    if (educationEl) educationEl.textContent = profileData.about?.education || "—";
    
    const emailEl = document.getElementById("contact-email");
    if (emailEl && profileData.contact?.email) emailEl.href = `mailto:${profileData.contact.email}`;

    renderSocialLinks(profileData.socialLinks || []);

    if (profileData.files) {
      const logoEl = document.getElementById("brand-logo-img");
      if (logoEl && profileData.files.logo) logoEl.src = profileData.files.logo;

      const heroSection = document.getElementById("home-hero");
      if (heroSection && profileData.files.heroBackground) {
        heroSection.style.backgroundImage = `linear-gradient(rgba(5,5,5,0.85), rgba(5,5,5,0.92)), url('${profileData.files.heroBackground}')`;
      }

      const resumeBtn = document.getElementById("hero-resume-btn");
      if (resumeBtn && profileData.files.resume) resumeBtn.href = profileData.files.resume;

      const aboutPhoto = document.getElementById("about-photo");
      if (aboutPhoto && profileData.files.profilePhoto) aboutPhoto.src = profileData.files.profilePhoto;
    }
  } catch (err) { console.error("Profile load error:", err); }
}

function renderSocialLinks(links) {
  const heroContainer = document.getElementById("hero-social-links");
  const contactContainer = document.getElementById("contact-social-links");
  const buildLinks = () => links.map(link => {
    const slug = getIconSlug(link.url);
    return `<a href="${link.url}" class="btn btn-outline social-link-tracked" data-slug="${slug || ''}" target="_blank">${slug ? slug.toUpperCase() : "Link"}</a>`;
  }).join("");
  if (heroContainer) heroContainer.innerHTML = buildLinks();
  if (contactContainer) contactContainer.innerHTML = buildLinks();
  document.querySelectorAll(".social-link-tracked").forEach(a => {
    a.addEventListener("click", () => trackClick(a.dataset.slug));
  });
}

function setCurrentYear() {
  const el = document.getElementById("current-year");
  if (el) el.textContent = new Date().getFullYear();
}

function initNavbarScroll() {
  const navbar = document.getElementById("main-navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 80) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
}

function initSidePanel() {
  const toggleBtn = document.getElementById("menu-toggle-btn");
  const overlay = document.getElementById("side-panel-overlay");
  const panel = document.getElementById("side-panel");
  if (!toggleBtn || !overlay || !panel) return;
  toggleBtn.addEventListener("click", () => { overlay.classList.add("open"); panel.classList.add("open"); });
  overlay.addEventListener("click", () => { overlay.classList.remove("open"); panel.classList.remove("open"); });
}

function initFeedbackModal() {
  const fab = document.getElementById("feedback-fab");
  const overlay = document.getElementById("feedback-modal-overlay");
  if (!fab || !overlay) return;
  fab.addEventListener("click", () => overlay.style.display = "flex");
  document.getElementById("feedback-close-btn").addEventListener("click", () => overlay.style.display = "none");
  
  document.getElementById("feedback-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("fb-message").value;
    if (typeof firebase !== "undefined") {
      await firebase.database().ref("feedback").push({ message: msg, timestamp: new Date().toISOString() });
      document.getElementById("feedback-status").textContent = "✅ Sent!";
    }
  });
}

function initVisitorModal() {
  const overlay = document.getElementById("visitor-modal-overlay");
  if (!overlay || sessionStorage.getItem("visitorModalShown")) { if(overlay) overlay.style.display = "none"; return; }
  
  document.getElementById("visitor-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("vf-name").value;
    if (typeof firebase !== "undefined") {
      await firebase.database().ref("visitors").push({ name: name, timestamp: new Date().toISOString() });
    }
    sessionStorage.setItem("visitorModalShown", "true");
    overlay.style.display = "none";
  });
  document.getElementById("visitor-skip-btn").addEventListener("click", () => { sessionStorage.setItem("visitorModalShown", "true"); overlay.style.display = "none"; });
}