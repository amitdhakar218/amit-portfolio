// ... (ऊपर वाला कोड जहाँ तक आपने दिया था)

/* ---------- बाकी डेटा लोडर्स ---------- */
async function loadCertificates() {
  onValue(ref(rtdb, "certificates"), (snapshot) => {
    const data = toArray(snapshot.val());
    const grid = document.getElementById("certificates-grid");
    if (!grid) return;
    grid.innerHTML = data.map(c => `
      <div class="card certificate-card">
        <img src="${c.image || 'assets/certificate-placeholder.png'}" class="radius-md" />
        <h3 class="card-title">${c.name}</h3>
        <p class="card-body text-muted">${c.organization} • ${c.date}</p>
      </div>`).join("");
  });
}

async function loadGallery() {
  onValue(ref(rtdb, "gallery"), (snapshot) => {
    const data = toArray(snapshot.val());
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;
    grid.innerHTML = data.slice(0, HOME_LIMIT).map(i => `
      <div class="card certificate-card">
        <img src="${i.image || 'assets/gallery-placeholder.png'}" class="radius-md" />
        <h3 class="card-title">${i.title}</h3>
        ${i.caption ? `<p class="card-body text-muted">${i.caption}</p>` : ""}
      </div>`).join("");
  });
}

async function loadVideos() {
  onValue(ref(rtdb, "videos"), (snapshot) => {
    const data = toArray(snapshot.val());
    const grid = document.getElementById("videos-grid");
    if (!grid) return;
    grid.innerHTML = data.slice(0, HOME_LIMIT).map(v => {
      const ytId = v.url.split('v=')[1] || v.url.split('/').pop();
      return `
        <div class="card project-card">
          <a href="${v.url}" target="_blank"><img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" class="project-image radius-md" /></a>
          <h3 class="card-title">${v.title}</h3>
          <div class="project-links"><a href="${v.url}" class="btn btn-icon" target="_blank">▶️ Watch</a></div>
        </div>`;
    }).join("");
  });
}

async function loadBlog() {
  onValue(ref(rtdb, "blog"), (snapshot) => {
    const data = toArray(snapshot.val());
    const grid = document.getElementById("blog-grid");
    if (!grid) return;
    grid.innerHTML = data.slice(0, HOME_LIMIT).map(b => `
      <div class="card">
        <h3 class="card-title">${b.title}</h3>
        <p class="card-body text-muted">${b.date || ""}</p>
        <p class="card-body">${b.content}</p>
      </div>`).join("");
  });
}

/* ---------- हेल्पर्स और एनिमेशन ---------- */
function initTypingAnimation() {
  const el = document.getElementById("typing-text");
  if (!el) return;
  const roles = ["AI Application Developer", "B.Tech Engineering Student", "Web Developer"];
  let roleIndex = 0, charIndex = 0, deleting = false;
  function type() {
    const current = roles[roleIndex];
    el.textContent = deleting ? current.substring(0, charIndex--) : current.substring(0, charIndex++);
    if (!deleting && charIndex === current.length) deleting = true;
    else if (deleting && charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
    setTimeout(type, deleting ? 50 : 100);
  }
  type();
}

function initNavbarScroll() {
  window.addEventListener("scroll", () => {
    const nav = document.getElementById("main-navbar");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 80);
  });
}

function initSidePanel() {
  const toggle = document.getElementById("menu-toggle-btn");
  const panel = document.getElementById("side-panel");
  const overlay = document.getElementById("side-panel-overlay");
  if (toggle) toggle.addEventListener("click", () => { panel.classList.add("open"); overlay.classList.add("open"); });
  if (overlay) overlay.addEventListener("click", () => { panel.classList.remove("open"); overlay.classList.remove("open"); });
}

function setCurrentYear() { document.getElementById("current-year").textContent = new Date().getFullYear(); }

function initScrollReveal() {
  const obs = new IntersectionObserver(ent => ent.forEach(e => { if (e.isIntersecting) e.target.classList.add("reveal-visible"); }));
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "messages"), {
      email: document.getElementById("cf-email").value,
      message: document.getElementById("cf-message").value,
      timestamp: serverTimestamp()
    });
    alert("Sent!");
    form.reset();
  });
}

function initVisitorModal() {
  const overlay = document.getElementById("visitor-modal-overlay");
  if (sessionStorage.getItem("visitor")) overlay.style.display = "none";
  document.getElementById("visitor-form").addEventListener("submit", () => sessionStorage.setItem("visitor", "true"));
  document.getElementById("visitor-skip-btn").addEventListener("click", () => { sessionStorage.setItem("visitor", "true"); overlay.style.display = "none"; });
}
