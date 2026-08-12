const API_BASE = "/api/data";
const MAX_SOCIAL_LINKS = 15;
let socialLinks = [];

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

function iconImgTag(url) {
  const slug = getIconSlug(url);
  if (slug) return `<img src="https://cdn.simpleicons.org/${slug}/ffffff" style="width:20px;height:20px;" alt="${slug}" />`;
  return `🔗`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadProfileIntoForm();
  const form = document.getElementById("profile-form");
  if (form) form.addEventListener("submit", handleProfileSubmit);
  const addBtn = document.getElementById("add-social-link-btn");
  if (addBtn) addBtn.addEventListener("click", addSocialLinkRow);
});

async function loadProfileIntoForm() {
  const statusEl = document.getElementById("profile-status");
  try {
    const res = await fetch(`${API_BASE}/profile.json`);
    if (!res.ok) throw new Error("Failed to fetch profile.json");
    const data = await res.json();

    setValue("field-name", data.name);
    setValue("field-title", data.title);
    setValue("field-role", data.role);
    setValue("field-tagline", data.tagline);
    setValue("field-introduction", data.about?.introduction);
    setValue("field-education", data.about?.education);
    setValue("field-experience", data.about?.experience);
    setValue("field-goals", data.about?.goals);
    setValue("field-achievements", data.about?.achievements);
    setValue("field-email", data.contact?.email);
    setValue("field-phone", data.contact?.phone);
    setValue("field-location", data.contact?.location);
    setValue("field-resume", data.files?.resume);
    setValue("field-photo", data.files?.profilePhoto);
    setValue("field-logo", data.files?.logo);
    setValue("field-hero-bg", data.files?.heroBackground);

    socialLinks = Array.isArray(data.socialLinks) ? data.socialLinks : [];
    renderSocialLinks();

    if (statusEl) statusEl.textContent = "Profile data loaded from server ✅";
  } catch (err) {
    if (statusEl) statusEl.textContent = "⚠️ Could not load profile data. Is the backend running?";
  }
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.value = value;
}

function renderSocialLinks() {
  const container = document.getElementById("social-links-list");
  if (!container) return;
  container.innerHTML = "";
  socialLinks.forEach((link, index) => {
    const row = document.createElement("div");
    row.style.display = "flex"; row.style.gap = "var(--space-sm)"; row.style.alignItems = "center";
    row.innerHTML = `
      <span class="icon-preview" style="width:28px; text-align:center;">${iconImgTag(link.url)}</span>
      <input type="text" class="social-label-input" placeholder="Label" value="${link.label || ""}" style="flex:1; background-color: var(--color-background); border:1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-sm); color: var(--color-text);" />
      <input type="url" class="social-url-input" placeholder="https://..." value="${link.url || ""}" style="flex:2; background-color: var(--color-background); border:1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-sm); color: var(--color-text);" />
      <button type="button" class="btn btn-icon" data-index="${index}" data-action="remove-link">🗑️</button>
    `;
    container.appendChild(row);
    const urlInput = row.querySelector(".social-url-input");
    const iconSpan = row.querySelector(".icon-preview");
    urlInput.addEventListener("input", () => { iconSpan.innerHTML = iconImgTag(urlInput.value); });
  });
  container.querySelectorAll('[data-action="remove-link"]').forEach(btn => {
    btn.addEventListener("click", () => { socialLinks.splice(parseInt(btn.dataset.index, 10), 1); renderSocialLinks(); });
  });
  const addBtn = document.getElementById("add-social-link-btn");
  if (addBtn) addBtn.disabled = socialLinks.length >= MAX_SOCIAL_LINKS;
}

function addSocialLinkRow() {
  if (socialLinks.length >= MAX_SOCIAL_LINKS) return;
  socialLinks.push({ id: `social-${Date.now()}`, label: "", url: "" });
  renderSocialLinks();
}

function collectSocialLinksFromDOM() {
  const container = document.getElementById("social-links-list");
  if (!container) return [];
  const rows = container.children;
  const collected = [];
  for (let i = 0; i < rows.length; i++) {
    const label = rows[i].querySelector(".social-label-input")?.value.trim() || "";
    const url = rows[i].querySelector(".social-url-input")?.value.trim() || "";
    if (url) collected.push({ id: socialLinks[i]?.id || `social-${Date.now()}-${i}`, label, url });
  }
  return collected;
}

async function handleProfileSubmit(e) {
  e.preventDefault();
  const statusEl = document.getElementById("profile-status");
  const updatedData = {
    name: document.getElementById("field-name").value,
    title: document.getElementById("field-title").value,
    role: document.getElementById("field-role").value,
    tagline: document.getElementById("field-tagline").value,
    roles: [document.getElementById("field-role").value, document.getElementById("field-title").value].filter(Boolean),
    about: {
      introduction: document.getElementById("field-introduction").value,
      education: document.getElementById("field-education").value,
      experience: document.getElementById("field-experience").value,
      goals: document.getElementById("field-goals").value,
      achievements: document.getElementById("field-achievements").value
    },
    contact: {
      email: document.getElementById("field-email").value,
      phone: document.getElementById("field-phone").value,
      location: document.getElementById("field-location").value
    },
    socialLinks: collectSocialLinksFromDOM(),
    files: {
      resume: document.getElementById("field-resume").value,
      profilePhoto: document.getElementById("field-photo").value,
      logo: document.getElementById("field-logo").value,
      heroBackground: document.getElementById("field-hero-bg").value
    }
  };

  if (statusEl) statusEl.textContent = "Saving...";
  try {
    const res = await fetch(`${API_BASE}/profile.json`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error("Save rejected");
    socialLinks = updatedData.socialLinks;
    renderSocialLinks();
    if (statusEl) statusEl.textContent = "✅ Saved permanently to profile.json.";
  } catch (err) {
    if (statusEl) statusEl.textContent = "❌ Save failed. Is the backend running?";
  }
}