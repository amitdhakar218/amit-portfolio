document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("current-year").textContent = new Date().getFullYear();

  const grid = document.getElementById("full-blog-grid");
  try {
    const res = await fetch("../shared/data/blog.json");
    if (!res.ok) throw new Error("blog.json not found");
    const posts = await res.json();
    grid.innerHTML = "";
    if (posts.length === 0) { grid.innerHTML = `<p class="text-muted">No blog posts yet.</p>`; return; }
    posts.forEach((post) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3 class="card-title">${post.title}</h3>
        <p class="card-body text-muted" style="font-size:0.8rem;">${post.date || ""}</p>
        <p class="card-body">${post.content}</p>`;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p class="text-muted">⚠️ Could not load blog posts.</p>`;
  }
});