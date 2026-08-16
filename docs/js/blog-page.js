document.addEventListener("DOMContentLoaded", async () => {
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const grid = document.getElementById("full-blog-grid");
  if (!grid) return;

  try {
    let posts = [];

    // 1. Firebase Realtime Database से डेटा फेच करने का प्रयास
    if (typeof firebase !== "undefined" && firebase.database) {
      const snapshot = await firebase.database().ref("blog").once("value");
      const data = snapshot.val();
      if (data) {
        posts = Array.isArray(data) ? data : Object.values(data);
      }
    }

    // 2. फ़ॉलबैक: यदि Firebase में डेटा नहीं है तो local JSON से फेच करें
    if (!posts || posts.length === 0) {
      const res = await fetch("shared/data/blog.json").catch(() => null) ||
                  await fetch("shared/data/blog.json").catch(() => null);
      if (res && res.ok) {
        posts = await res.json();
      }
    }

    grid.innerHTML = "";

    if (!posts || posts.length === 0) {
      grid.innerHTML = `<p class="text-muted">No blog posts yet.</p>`;
      return;
    }

    // 3. ब्लॉग आर्टिकल्स को DOM में रेंडर करें
    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3 class="card-title">${post.title || "Untitled"}</h3>
        <p class="card-body text-muted" style="font-size:0.8rem; margin-bottom: var(--space-xs);">${post.date || ""}</p>
        <p class="card-body">${post.content || post.description || ""}</p>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading blog posts:", err);
    grid.innerHTML = `<p class="text-muted">⚠️ Could not load blog posts.</p>`;
  }
});
