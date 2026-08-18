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
  "github.com": "github",
  "linkedin.com": "linkedin",
  "instagram.com": "instagram",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "facebook.com": "facebook",
  "fb.com": "facebook",
  "twitter.com": "x",
  "x.com": "x",
  "wa.me": "whatsapp",
  "whatsapp.com": "whatsapp",
  "t.me": "telegram",
  "telegram": "telegram",
  "behance.net": "behance",
  "dribbble.com": "dribbble",
  "medium.com": "medium",
  "discord": "discord",
  "twitch.tv": "twitch",
  "reddit.com": "reddit"
};

function getIconSlug(url) {
  const u = (url || "").toLowerCase();
  for (const key in ICON_MAP) {
    if (u.includes(key)) return ICON_MAP[key];
  }
  return null;
}

function getSocialIcon(slug) {
  const icons = {
    github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7A11.3 11.3 0 0 0 8.4 22.8c.57.1.78-.25.78-.55v-2.1c-3.18.69-3.85-1.35-3.85-1.35-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.54-.29-5.2-1.27-5.2-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.13 1.17a10.9 10.9 0 0 1 5.7 0c2.17-1.48 3.13-1.17 3.13-1.17.62 1.57.23 2.73.11 3.02.73.8 1.18 1.82 1.18 3.07 0 4.39-2.67 5.35-5.21 5.64.41.36.78 1.07.78 2.16v3.2c0 .3.21.65.79.54A11.3 11.3 0 0 0 12 .7Z"/></svg>`,
      linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A2.03 2.03 0 1 0 5.25 7.06 2.03 2.03 0 0 0 5.25 3ZM20.44 13.42c0-3.46-1.84-5.07-4.3-5.07-1.98 0-2.86 1.09-3.35 1.85V8.5H9.41V20h3.38v-6.06c0-1.6.3-3.15 2.28-3.15 1.95 0 1.98 1.83 1.98 3.25V20h3.39v-6.58Z"/></svg>`,
      youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.55 3.6 12 3.6 12 3.6s-7.55 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/></svg>`,
      instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 0 0 12 9.5ZM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>`
    };

    return icons[slug] || `<span class="social-icon-fallback">🔗</span>`;
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
    const label = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Link";
    return `<a href="${link.url}" class="btn btn-outline social-link-tracked" data-slug="${slug || ''}" target="_blank" rel="noopener noreferrer" aria-label="${label}">
      <span class="social-icon">${getSocialIcon(slug)}</span>
      <span>${label}</span>
    </a>`;
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
  const sideLink = document.getElementById("side-panel-feedback-link");
  const overlay = document.getElementById("feedback-modal-overlay");
  const closeBtn = document.getElementById("feedback-close-btn");
  const form = document.getElementById("feedback-form");

  if (!overlay || !form) return;

  const openModal = (e) => {
    if (e) e.preventDefault();
    overlay.style.display = "flex";
  };

  const closeModal = () => {
    overlay.style.display = "none";
  };

  if (fab) fab.addEventListener("click", openModal);
  if (sideLink) sideLink.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("fb-name")?.value.trim() || "";
    const message = document.getElementById("fb-message")?.value.trim() || "";
    const status = document.getElementById("feedback-status");
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!message) return;

    if (submitBtn) submitBtn.disabled = true;
    if (status) status.textContent = "Sending...";

    try {
      if (typeof firebase === "undefined" || !firebase.database) {
        throw new Error("Firebase connection unavailable");
      }

      await firebase.database().ref("feedback").push({
        name,
        message,
        timestamp: new Date().toISOString()
      });

      if (status) {
        status.textContent = "✅ Feedback sent successfully!";
        status.style.color = "var(--color-accent)";
      }

      form.reset();

      setTimeout(() => {
        closeModal();
        if (status) status.textContent = "";
      }, 1200);

    } catch (err) {
      console.error("Feedback error:", err);

      if (status) {
        status.textContent = `❌ ${err.message}`;
        status.style.color = "#ef4444";
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
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