const API_URL = "https://api.github.com/users/";

const form = document.getElementById("form");
const search = document.getElementById("search");
const main = document.getElementById("main");
const languageSelector = document.getElementById("language");

// Varsayılan dil
let currentLanguage = "tr";
let currentUser = null;
let currentRepos = [];

// Dil metinleri
const translations = {
  tr: {
    placeholder: "GitHub Kullanıcısı",
    userNotFound: "Aradığınız kullanıcı bulunamadı :(",
    repoError: "Repoları çekerken hata oluştu.",
    followers: "Takipçi",
    following: "Takip Ediyor",
    repositories: "Repo",
  },
  en: {
    placeholder: "GitHub User",
    userNotFound: "The user you are looking for was not found :(",
    repoError: "Error occurred while fetching repositories.",
    followers: "Followers",
    following: "Following",
    repositories: "Repository",
  },
};

languageSelector.addEventListener("change", (e) => {
  currentLanguage = e.target.value;
  updateLanguage();
  if (currentUser) {
    createUserCard(currentUser);
  }
  if (currentRepos.length > 0) {
    addReposToCard(currentRepos);
  }
});

updateLanguage();

function updateLanguage() {
  const texts = translations[currentLanguage];
  search.placeholder = texts.placeholder;
}

async function getUser(username) {
  try {
    const { data } = await axios(API_URL + username);
    currentUser = data;
    createUserCard(data);
    getRepos(username);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      createErrorCard(translations[currentLanguage].userNotFound);
    }
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = search.value;

  if (user) {
    getUser(user);
    search.value = "";
  }
});

function createUserCard(user) {
  const texts = translations[currentLanguage];
  const userName = user.name || user.login;
  const userBio = user.bio ? `<p>${user.bio}</p>` : "";
  const cardHTML = `
    <div class="card">
      <img
        class="user-image"
        src="${user.avatar_url}"
        alt="${user.name}"
      />
      <div class="user-info">
        <div class="user-name">
          <h2>${userName}</h2>
          <small>@${user.login}</small>
        </div>
      </div>
      ${userBio}
      <ul>
        <li>
          <i class="fa-solid fa-user-group"></i> ${user.followers}
          <strong>${texts.followers}</strong>
        </li>
        <li> ${user.following} <strong>${texts.following}</strong></li>
        <li>
          <i class="fa-solid fa-bookmark"></i> ${user.public_repos} <strong>${texts.repositories}</strong>
        </li>
      </ul>
      <div class="repos" id="repos"></div>
    </div>
  `;

  main.innerHTML = cardHTML;
}

function createErrorCard(msg) {
  const cardErrorHTML = `
    <div class="card">
      <h2>${msg}</h2>
    </div>
  `;

  main.innerHTML = cardErrorHTML;
}

async function getRepos(username) {
  try {
    const { data } = await axios(API_URL + username + "/repos");
    currentRepos = data;
    addReposToCard(data);
  } catch (err) {
    createErrorCard(translations[currentLanguage].repoError);
  }
}

function addReposToCard(repos) {
  const reposEl = document.getElementById("repos");

  reposEl.innerHTML = "";

  repos.slice(0, 3).forEach((repo) => {
    const reposLink = document.createElement("a");
    reposLink.href = repo.html_url;
    reposLink.target = "_blank";
    reposLink.innerHTML = ` <i class="fa-solid fa-book-bookmark"></i> ${repo.name} `;

    reposEl.appendChild(reposLink);
  });
}
