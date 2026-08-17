const CLOUDINARY_CLOUD_NAME = "va6h8cbz";
const CLOUDINARY_PRESET = "amit_portfolio_uploads";
const CONTACT_API_URL = "https://amit-contact-api-git-main-amitdhakar218s-projects.vercel.app/api/send-email";

// Get visitor IP and Country
async function getVisitorLocation() {
  try {
    const res = await fetch("https://ip-api.com/json/");
    const data = await res.json();
    return { ip: data.query, country: data.country, city: data.city };
  } catch (err) {
    return { ip: "unknown", country: "unknown", city: "unknown" };
  }
}

// Load Resumes
function loadResumes() {
  if (typeof firebase === "undefined" || !firebase.database) return;
  firebase.database().ref("resumes").once("value", snapshot => {
    const resumes = snapshot.val();
    const container = document.getElementById("resume-list-container");
    if (!resumes) {
      container.innerHTML = "<p class='text-muted'>No resumes available</p>";
      return;
    }
    const html = Object.entries(resumes).map(([id, resume]) => `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h4 style="margin: 0; color: var(--color-primary);">${resume.title}</h4>
            <p class="text-muted" style="margin: 4px 0;">${resume.description || ''}</p>
            <p class="text-muted" style="margin: 4px 0; font-size: 0.85em;">📥 ${resume.downloads || 0} | 📅 ${new Date(resume.uploadedAt).toLocaleDateString()}</p>
          </div>
          <div style="display: flex; gap: var(--space-sm);">
            <a href="${resume.fileURL}" class="btn btn-outline" target="_blank" onclick="trackResumeView('${id}', '${resume.title}')">👁️ View</a>
            <a href="${resume.fileURL}" class="btn btn-primary" download onclick="trackResumeDownload('${id}', '${resume.title}')">⬇️ Download</a>
          </div>
        </div>
      </div>
    `).join("");
    container.innerHTML = html;
  });
}

// Track Download
async function trackResumeDownload(resumeId, resumeTitle) {
  const userEmail = prompt("Enter your email:") || "anonymous@example.com";
  const userName = prompt("Enter your name (optional):") || "Anonymous";
  const location = await getVisitorLocation();
  try {
    await firebase.database().ref("resume-downloads").push({
      resumeId, resumeTitle, email: userEmail, name: userName,
      ip: location.ip, country: location.country, city: location.city,
      timestamp: new Date().toISOString()
    });
    firebase.database().ref(`resumes/${resumeId}/downloads`).once("value", snap => {
      firebase.database().ref(`resumes/${resumeId}/downloads`).set((snap.val() || 0) + 1);
    });
    loadResumes();
  } catch (err) {
    console.error(err);
  }
}

// Track View
async function trackResumeView(resumeId, resumeTitle) {
  const location = await getVisitorLocation();
  try {
    await firebase.database().ref("resume-views").push({
      resumeId, resumeTitle, ip: location.ip, country: location.country,
      city: location.city, timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
  }
}

// Contact Form
async function uploadToCloudinary(file, type) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Upload failed");
  return data.secure_url;
}

document.addEventListener("DOMContentLoaded", () => {
  loadResumes();
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const statusEl = document.getElementById("contact-form-status");
      const submitBtn = document.getElementById("cf-submit-btn");
      const emailVal = document.getElementById("cf-email").value.trim();
      const subjectVal = document.getElementById("cf-subject").value.trim();
      const messageVal = document.getElementById("cf-message").value.trim();
      const linkVal = document.getElementById("cf-link").value.trim();
      const imageFile = document.getElementById("cf-image").files[0];
      const videoFile = document.getElementById("cf-video").files[0];
      if (!emailVal || !messageVal) return;
      statusEl.style.color = "var(--color-muted)";
      submitBtn.disabled = true;
      try {
        let imageUrl = "", videoUrl = "";
        if (imageFile) {
          statusEl.textContent = "Uploading image...";
          imageUrl = await uploadToCloudinary(imageFile, "image");
        }
        if (videoFile) {
          statusEl.textContent = "Uploading video...";
          videoUrl = await uploadToCloudinary(videoFile, "video");
        }
        statusEl.textContent = "Sending...";
        const res = await fetch(CONTACT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailVal, subject: subjectVal, message: messageVal, imageUrl, videoUrl, linkUrl: linkVal })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed");
        if (typeof firebase !== "undefined" && firebase.database) {
          firebase.database().ref("visitors").push({ email: emailVal, subject: subjectVal, message: messageVal, timestamp: new Date().toISOString() });
        }
        statusEl.textContent = "✅ Sent!";
        statusEl.style.color = "var(--color-accent)";
        form.reset();
      } catch (err) {
        statusEl.textContent = `❌ ${err.message}`;
        statusEl.style.color = "#ef4444";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});
