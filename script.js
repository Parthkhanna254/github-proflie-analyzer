document.getElementById("searchBtn").addEventListener("click", getProfile);

async function getProfile() {
  const username = document.getElementById("username").value.trim();

  if (!username) {
    alert("Enter username");
    return;
  }

  document.getElementById("loading").classList.remove("hidden");

  try {
    const profileRes = await fetch(`https://api.github.com/users/${username}`);
    if (!profileRes.ok) throw new Error("User not found");

    const profile = await profileRes.json();

    const repoRes = await fetch(profile.repos_url);
    const repos = await repoRes.json();

    displayProfile(profile);
    showTopRepos(repos);
    analyzeRepos(repos);

  } catch (error) {
    alert(error.message);
  }

  document.getElementById("loading").classList.add("hidden");
}

function displayProfile(profile) {
  const profileDiv = document.getElementById("profile");
  profileDiv.classList.remove("hidden");

  profileDiv.innerHTML = `
    <img src="${profile.avatar_url}" class="profile-img">
    <h2>${profile.name || profile.login}</h2>
    <p>${profile.bio || "No bio available"}</p>

    <div class="stats">
      <div>
        <h3>${profile.followers}</h3>
        <p>Followers</p>
      </div>
      <div>
        <h3>${profile.following}</h3>
        <p>Following</p>
      </div>
      <div>
        <h3>${profile.public_repos}</h3>
        <p>Repos</p>
      </div>
    </div>
  `;
}

function showTopRepos(repos) {
  const repoDiv = document.getElementById("repos");
  repoDiv.classList.remove("hidden");

  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  repoDiv.innerHTML = `
    <h3>Top Repositories ⭐</h3>
    ${topRepos.map(repo => `
      <div>
        <strong>${repo.name}</strong> — ⭐ ${repo.stargazers_count}
      </div>
    `).join("")}
  `;
}

function analyzeRepos(repos) {
  let languageCount = {};

  repos.forEach(repo => {
    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    }
  });

  createChart(languageCount);
}

function createChart(data) {
  const chartCard = document.getElementById("chartCard");
  chartCard.classList.remove("hidden");

  const ctx = document.getElementById("chart");

  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data)
      }]
    }
  });
}