document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("skills-list");
  if (!list) return;

  try {
    let skills = [];

    // 1. Firebase Realtime Database से डेटा फेच करने का प्रयास
    if (typeof firebase !== "undefined" && firebase.database) {
      const snapshot = await firebase.database().ref("skills").once("value");
      const data = snapshot.val();
      if (data) {
        skills = Array.isArray(data) ? data : Object.values(data);
      }
    }

    // 2. फ़ॉलबैक: यदि Firebase में डेटा नहीं है तो local JSON से फेच करें
    if (!skills || skills.length === 0) {
      const res = await fetch("shared/data/skills.json").catch(() => null) ||
                  await fetch("shared/data/skills.json").catch(() => null);
      if (res && res.ok) {
        skills = await res.json();
      }
    }

    list.innerHTML = "";

    if (!skills || skills.length === 0) {
      list.innerHTML = `<p class="text-muted">No skills found.</p>`;
      return;
    }

    // 3. स्किल्स को DOM में रेंडर करें
    skills.forEach((skill) => {
      const item = document.createElement("div");
      item.className = "skill-item";
      item.innerHTML = `
        <div class="skill-header">
          <span>${skill.name || 'Skill'}</span>
          <span class="text-muted">${skill.percentage || 0}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${skill.percentage || 0}%;"></div>
        </div>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading skills:", err);
    list.innerHTML = `<p class="text-muted">⚠️ Could not load skills.</p>`;
  }
});
