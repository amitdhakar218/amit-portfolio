document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("skills-list");
  if (!list) return;
  try {
    const res = await fetch("../shared/data/skills.json");
    if (!res.ok) throw new Error("not found");
    const skills = await res.json();
    list.innerHTML = "";
    skills.forEach((skill) => {
      const item = document.createElement("div");
      item.className = "skill-item";
      item.innerHTML = `<div class="skill-header"><span>${skill.name}</span><span class="text-muted">${skill.percentage}%</span></div><div class="progress-track"><div class="progress-fill" style="width: ${skill.percentage}%;"></div></div>`;
      list.appendChild(item);
    });
  } catch (err) { list.innerHTML = `<p class="text-muted">⚠️ Could not load skills.</p>`; }
});