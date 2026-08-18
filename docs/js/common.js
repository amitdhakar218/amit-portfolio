// ==========================================
// FIREBASE INITIALIZATION
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

if (
  typeof firebase !== "undefined" &&
  !firebase.apps.length
) {
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

    if (u.includes(key)) {
      return ICON_MAP[key];
    }

  }

  return null;
}


function getSocialIcon(slug) {

  const icons = {

    github:
      `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 .7A11.3 11.3 0 0 0 8.4 22.8c.57.1.78-.25.78-.55v-2.1c-3.18.69-3.85-1.35-3.85-1.35-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.54-.29-5.2-1.27-5.2-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.13 1.17a10.9 10.9 0 0 1 5.7 0c2.17-1.48 3.13-1.17 3.13-1.17.62 1.57.23 2.73.11 3.02.73.8 1.18 1.82 1.18 3.07 0 4.39-2.67 5.35-5.21 5.64.41.36.78 1.07.78 2.16v3.2c0 .3.21.65.79.54A11.3 11.3 0 0 0 12 .7Z"/>
      </svg>`,

    linkedin:
      `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A2.03 2.03 0 1 0 5.25 7.06 2.03 2.03 0 0 0 5.25 3ZM20.44 13.42c0-3.46-1.84-5.07-4.3-5.07-1.98 0-2.86 1.09-3.35 1.85V8.5H9.41V20h3.38v-6.06c0-1.6.3-3.15 2.28-3.15 1.95 0 1.98 1.83 1.98 3.25V20h3.39v-6.58Z"/>
      </svg>`,

    youtube:
      `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.55 3.6 12 3.6 12 3.6s-7.55 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/>
      </svg>`,

    instagram:
      `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 12 16.5 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 0 0 12 9.5ZM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>
      </svg>`
  };

  return (
    icons[slug] ||
    `<span class="social-icon-fallback">🔗</span>`
  );
}


// ==========================================
// DOM READY
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await loadThemeTokens();

    await loadProfileCommon();

    setCurrentYear();

    initNavbarScroll();

    initSidePanel();

    initFeedbackModal();

    initVisitorModal();

    initScrollReveal();

    trackVisit();

    const resumeBtn =
      document.getElementById(
        "hero-resume-btn"
      );

    if (resumeBtn) {

      resumeBtn.addEventListener(
        "click",
        () => trackClick("resume")
      );

    }

  }
);


// ==========================================
// VISIT TRACKING
// ==========================================

function trackVisit() {

  if (
    typeof firebase === "undefined" ||
    !firebase.database
  ) {
    return;
  }

  if (
    sessionStorage.getItem("visitCounted")
  ) {
    return;
  }

  firebase
    .database()
    .ref("visits")
    .push({
      timestamp:
        new Date().toISOString()
    });

  sessionStorage.setItem(
    "visitCounted",
    "true"
  );
}


function trackClick(type) {

  if (
    typeof firebase === "undefined" ||
    !firebase.database ||
    !type
  ) {
    return;
  }

  firebase
    .database()
    .ref("clicks")
    .push({
      type,
      timestamp:
        new Date().toISOString()
    });
}


// ==========================================
// SCROLL REVEAL
// ==========================================

function initScrollReveal() {

  const revealElements =
    document.querySelectorAll(".reveal");

  if (!revealElements.length) {
    return;
  }

  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "reveal-visible"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: 0.1
      }
    );

  revealElements.forEach(
    (el) => observer.observe(el)
  );
}


// ==========================================
// THEME
// ==========================================

async function loadThemeTokens() {

  try {

    let tokens = null;


    if (
      typeof firebase !== "undefined" &&
      firebase.database
    ) {

      const snapshot =
        await firebase
          .database()
          .ref("themeTokens")
          .once("value");

      tokens = snapshot.val();

    }


    if (!tokens) {

      const response =
        await fetch(
          "shared/config/design-tokens.json"
        );

      if (!response.ok) {
        throw new Error("Theme not found");
      }

      tokens =
        await response.json();

    }


    const root =
      document.documentElement.style;


    if (tokens.colors) {

      root.setProperty(
        "--color-background",
        tokens.colors.background
      );

      root.setProperty(
        "--color-surface",
        tokens.colors.surface
      );

      root.setProperty(
        "--color-primary",
        tokens.colors.primary
      );

      root.setProperty(
        "--color-accent",
        tokens.colors.accent
      );

      root.setProperty(
        "--color-text",
        tokens.colors.text
      );

      root.setProperty(
        "--color-muted",
        tokens.colors.muted
      );

      root.setProperty(
        "--color-border",
        tokens.colors.border
      );

    }

  } catch (error) {

    console.warn(
      "Theme not loaded",
      error
    );

  }
}


// ==========================================
// PROFILE DATA
// ==========================================

async function loadProfileCommon() {

  try {

    let data = null;


    /*
      FIRST:
      Load the same profile data from Firebase.
    */

    if (
      typeof firebase !== "undefined" &&
      firebase.database
    ) {

      const snapshot =
        await firebase
          .database()
          .ref("profile")
          .once("value");

      data = snapshot.val();

    }


    /*
      FALLBACK:
      If Firebase profile is empty,
      load the local profile.json.
    */

    if (!data) {

      try {

        const response =
          await fetch(
            "shared/data/profile.json"
          );

        if (response.ok) {
          data =
            await response.json();
        }

      } catch (error) {

        console.warn(
          "Local profile fallback failed",
          error
        );

      }

    }


    if (!data) {

      console.warn(
        "Profile data not available"
      );

      return;

    }


    profileData = data;

    window.profileData =
      profileData;


    // ======================================
    // TAGLINE
    // ======================================

    const taglineElements =
      document.querySelectorAll(
        ".hero-tagline"
      );

    taglineElements.forEach(
      (element) => {

        element.textContent =
          profileData.tagline || "";

      }
    );


    // ======================================
    // ABOUT INTRODUCTION
    // ======================================

    const aboutIntroText =
      profileData.about?.introduction ||
      "";


    const aboutIntroElements =
      document.querySelectorAll(
        "#about-intro, #home-about-content"
      );


    aboutIntroElements.forEach(
      (element) => {

        element.textContent =
          aboutIntroText;

      }
    );


    // ======================================
    // ABOUT EDUCATION
    // ======================================

    const educationText =
      profileData.about?.education ||
      "—";


    const educationElements =
      document.querySelectorAll(
        "#about-education, #home-about-education"
      );


    educationElements.forEach(
      (element) => {

        element.textContent =
          educationText;

      }
    );


    // ======================================
    // ABOUT EXPERIENCE
    // ======================================

    const experienceText =
      profileData.about?.experience ||
      "—";


    const experienceElements =
      document.querySelectorAll(
        "#about-experience, #home-about-experience"
      );


    experienceElements.forEach(
      (element) => {

        element.textContent =
          experienceText;

      }
    );


    // ======================================
    // ABOUT GOALS
    // ======================================

    const goalsText =
      profileData.about?.goals ||
      "—";


    const goalsElements =
      document.querySelectorAll(
        "#about-goals, #home-about-goals"
      );


    goalsElements.forEach(
      (element) => {

        element.textContent =
          goalsText;

      }
    );


    // ======================================
    // CONTACT EMAIL
    // ======================================

    const email =
      profileData.contact?.email ||
      "";


    const emailElements =
      document.querySelectorAll(
        "#contact-email, #home-contact-email"
      );


    emailElements.forEach(
      (element) => {

        if (email) {

          element.href =
            `mailto:${email}`;

        }

      }
    );


    // ======================================
    // CONTACT PHONE
    // ======================================

    const phone =
      profileData.contact?.phone ||
      profileData.contact?.mobile ||
      "";


    const phoneElements =
      document.querySelectorAll(
        "#contact-phone, #home-contact-phone"
      );


    phoneElements.forEach(
      (element) => {

        if (phone) {

          const cleanPhone =
            String(phone)
              .replace(/[^\d+]/g, "");

          element.href =
            `tel:${cleanPhone}`;

        }

      }
    );


    // ======================================
    // SOCIAL LINKS
    // ======================================

    renderSocialLinks(
      profileData.socialLinks || []
    );


    // ======================================
    // FILES
    // ======================================

    if (profileData.files) {

      const logoElements =
        document.querySelectorAll(
          "#brand-logo-img"
        );


      if (profileData.files.logo) {

        logoElements.forEach(
          (element) => {

            element.src =
              profileData.files.logo;

          }
        );

      }


      const aboutPhotoElements =
        document.querySelectorAll(
          "#about-photo, #home-about-photo"
        );


      if (
        profileData.files.profilePhoto
      ) {

        aboutPhotoElements.forEach(
          (element) => {

            element.src =
              profileData.files.profilePhoto;

          }
        );

      }


      const resumeBtn =
        document.getElementById(
          "hero-resume-btn"
        );


      if (
        resumeBtn &&
        profileData.files.resume
      ) {

        resumeBtn.href =
          profileData.files.resume;

      }

    }


  } catch (error) {

    console.error(
      "Profile load error:",
      error
    );

  }

}


// ==========================================
// SOCIAL LINKS
// ==========================================

function renderSocialLinks(links) {

  const contactContainer =
    document.getElementById(
      "contact-social-links"
    );


  const homeContactContainer =
    document.getElementById(
      "home-contact-social-links"
    );


  const buildLinks = () => {

    return links
      .map(
        (link) => {

          const slug =
            getIconSlug(link.url);

          const label =
            slug
              ? slug.charAt(0).toUpperCase() +
                slug.slice(1)
              : "Link";


          return `
            <a
              href="${link.url}"
              class="btn btn-outline social-link-tracked"
              data-slug="${slug || ""}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="${label}"
            >
              <span class="social-icon">
                ${getSocialIcon(slug)}
              </span>

              <span>
                ${label}
              </span>
            </a>
          `;

        }
      )
      .join("");

  };


  const html =
    buildLinks();


  if (contactContainer) {

    contactContainer.innerHTML =
      html;

  }


  if (homeContactContainer) {

    homeContactContainer.innerHTML =
      html;

  }


  document
    .querySelectorAll(
      ".social-link-tracked"
    )
    .forEach(
      (link) => {

        link.addEventListener(
          "click",
          () => {

            trackClick(
              link.dataset.slug
            );

          }
        );

      }
    );

}


// ==========================================
// YEAR
// ==========================================

function setCurrentYear() {

  const elements =
    document.querySelectorAll(
      "#current-year"
    );


  elements.forEach(
    (element) => {

      element.textContent =
        new Date().getFullYear();

    }
  );

}


// ==========================================
// NAVBAR
// ==========================================

function initNavbarScroll() {

  const navbar =
    document.getElementById(
      "main-navbar"
    );


  if (!navbar) {
    return;
  }


  window.addEventListener(
    "scroll",
    () => {

      if (window.scrollY > 80) {

        navbar.classList.add(
          "scrolled"
        );

      } else {

        navbar.classList.remove(
          "scrolled"
        );

      }

    }
  );

}


// ==========================================
// SIDE PANEL
// ==========================================

function initSidePanel() {

  const toggleBtn =
    document.getElementById(
      "menu-toggle-btn"
    );

  const overlay =
    document.getElementById(
      "side-panel-overlay"
    );

  const panel =
    document.getElementById(
      "side-panel"
    );


  if (
    !toggleBtn ||
    !overlay ||
    !panel
  ) {

    return;

  }


  toggleBtn.addEventListener(
    "click",
    () => {

      overlay.classList.add(
        "open"
      );

      panel.classList.add(
        "open"
      );

    }
  );


  overlay.addEventListener(
    "click",
    () => {

      overlay.classList.remove(
        "open"
      );

      panel.classList.remove(
        "open"
      );

    }
  );

}


// ==========================================
// FEEDBACK
// ==========================================

function initFeedbackModal() {

  const fab =
    document.getElementById(
      "feedback-fab"
    );

  const sideLink =
    document.getElementById(
      "side-panel-feedback-link"
    );

  const overlay =
    document.getElementById(
      "feedback-modal-overlay"
    );

  const closeBtn =
    document.getElementById(
      "feedback-close-btn"
    );

  const form =
    document.getElementById(
      "feedback-form"
    );


  if (!overlay || !form) {
    return;
  }


  const openModal =
    (event) => {

      if (event) {
        event.preventDefault();
      }

      overlay.style.display =
        "flex";

    };


  const closeModal =
    () => {

      overlay.style.display =
        "none";

    };


  if (fab) {

    fab.addEventListener(
      "click",
      openModal
    );

  }


  if (sideLink) {

    sideLink.addEventListener(
      "click",
      openModal
    );

  }


  if (closeBtn) {

    closeBtn.addEventListener(
      "click",
      closeModal
    );

  }


  overlay.addEventListener(
    "click",
    (event) => {

      if (
        event.target === overlay
      ) {

        closeModal();

      }

    }
  );


  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const name =
        document
          .getElementById("fb-name")
          ?.value
          .trim() || "";


      const message =
        document
          .getElementById("fb-message")
          ?.value
          .trim() || "";


      const status =
        document.getElementById(
          "feedback-status"
        );


      const submitBtn =
        form.querySelector(
          'button[type="submit"]'
        );


      if (!message) {
        return;
      }


      if (submitBtn) {
        submitBtn.disabled = true;
      }


      if (status) {
        status.textContent =
          "Sending...";
      }


      try {

        if (
          typeof firebase === "undefined" ||
          !firebase.database
        ) {

          throw new Error(
            "Firebase connection unavailable"
          );

        }


        await firebase
          .database()
          .ref("feedback")
          .push({
            name,
            message,
            timestamp:
              new Date().toISOString()
          });


        if (status) {

          status.textContent =
            "✅ Feedback sent successfully!";

          status.style.color =
            "var(--color-accent)";

        }


        form.reset();


        setTimeout(
          () => {

            closeModal();

            if (status) {
              status.textContent =
                "";
            }

          },
          1200
        );


      } catch (error) {

        console.error(
          "Feedback error:",
          error
        );


        if (status) {

          status.textContent =
            `❌ ${error.message}`;

          status.style.color =
            "#ef4444";

        }


      } finally {

        if (submitBtn) {
          submitBtn.disabled = false;
        }

      }

    }
  );

}


// ==========================================
// VISITOR MODAL
// ==========================================

function initVisitorModal() {

  const overlay =
    document.getElementById(
      "visitor-modal-overlay"
    );


  if (
    !overlay ||
    sessionStorage.getItem(
      "visitorModalShown"
    )
  ) {

    if (overlay) {
      overlay.style.display =
        "none";
    }

    return;

  }


  const visitorForm =
    document.getElementById(
      "visitor-form"
    );


  const skipBtn =
    document.getElementById(
      "visitor-skip-btn"
    );


  if (visitorForm) {

    visitorForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();


        const name =
          document
            .getElementById("vf-name")
            ?.value
            .trim() || "";


        try {

          if (
            typeof firebase !== "undefined" &&
            firebase.database
          ) {

            await firebase
              .database()
              .ref("visitors")
              .push({
                name,
                timestamp:
                  new Date().toISOString()
              });

          }

        } catch (error) {

          console.error(
            "Visitor save error:",
            error
          );

        }


        sessionStorage.setItem(
          "visitorModalShown",
          "true"
        );


        overlay.style.display =
          "none";

      }
    );

  }


  if (skipBtn) {

    skipBtn.addEventListener(
      "click",
      () => {

        sessionStorage.setItem(
          "visitorModalShown",
          "true"
        );

        overlay.style.display =
          "none";

      }
    );

  }

}
