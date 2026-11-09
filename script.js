const GITHUB_USERNAME = (window.location.hostname.endsWith('.github.io'))
  ? window.location.hostname.split('.')[0]
  : null;

const sectionsEl = document.getElementById('sections');
const userDisplay = document.getElementById('user-display');
const searchEl = document.getElementById('search');
const visibilityEl = document.getElementById('visibility');
const sortEl = document.getElementById('sort');
const authBtn = document.getElementById('auth-btn');
const clearAuthBtn = document.getElementById('clear-auth');

let allRepos = [];
let authToken = localStorage.getItem('gh_pat') || '';

function getUsername() { return GITHUB_USERNAME; }

function categoryOf(repo) {
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const name = repo.name.toLowerCase();
  if (repo.fork) return 'Fork';
  if (topics.includes('test') || topics.includes('prototype') || /test/.test(name)) return 'Lab/Test';
  if (topics.includes('cv') || topics.includes('resume')) return 'CV';
  if (topics.includes('ai') || topics.includes('agent')) return 'AI';
  if (topics.includes('infra') || topics.includes('devops')) return 'Infra';
  if (topics.includes('app')) return 'Prodotti';
  return 'Altro';
}

function createRepoElement(repo) {
  const li = document.createElement('li');
  li.className = 'repo-item';
  const badges = [];
  if (repo.private) badges.push('<span class="badge private">privato</span>');
  if (repo.fork) badges.push('<span class="badge fork">fork</span>');
  li.innerHTML = `
    <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a>${badges.join('')}</h3>
    <p class="description">${repo.description || 'Nessuna descrizione fornita.'}</p>
    <div class="topics">${(repo.topics||[]).map(t=>`<span class="topic">${t}</span>`).join('')}</div>
    <div class="metadata">
      <span><strong class="language">${repo.language || 'N/A'}</strong></span>
      <span>⭐ ${repo.stargazers_count}</span>
      <span>Aggiornato: ${new Date(repo.updated_at).toLocaleDateString()}</span>
    </div>
  `;
  return li;
}

async function fetchRepos() {
  const headers = authToken ? { Authorization: `token ${authToken}` } : {};
  let repos = [];
  if (authToken) {
    // fetch all repos (public + private) for authenticated user
    let page = 1;
    while (true) {
      const res = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`, { headers });
      if (!res.ok) throw new Error(`Auth API error ${res.status}`);
      const data = await res.json();
      repos = repos.concat(data);
      if (data.length < 100) break;
      page++;
    }
  } else if (GITHUB_USERNAME) {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error(`Public API error ${res.status}`);
    repos = await res.json();
  } else {
    throw new Error('Username non determinato');
  }
  // dedup by id
  const seen = new Set();
  allRepos = repos.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
  render();
}

function filteredRepos() {
  const q = searchEl.value.toLowerCase();
  const vis = visibilityEl.value;
  let list = allRepos.filter(r => {
    if (q && !r.name.toLowerCase().includes(q) && !(r.description||'').toLowerCase().includes(q)) return false;
    if (vis === 'public' && r.private) return false;
    if (vis === 'private' && !r.private) return false;
    return true;
  });
  const sort = sortEl.value;
  if (sort === 'name') list.sort((a,b)=>a.name.localeCompare(b.name));
  else if (sort === 'stars') list.sort((a,b)=>b.stargazers_count-a.stargazers_count);
  else list.sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
  return list;
}

function render() {
  sectionsEl.innerHTML = '';
  const groups = {};
  filteredRepos().forEach(r => {
    const c = categoryOf(r);
    (groups[c] = groups[c] || []).push(r);
  });
  const order = ['Prodotti','AI','CV','Infra','Lab/Test','Fork','Altro'];
  order.forEach(cat => {
    if (!groups[cat] || !groups[cat].length) return;
    const sec = document.createElement('section');
    sec.className = 'section';
    sec.innerHTML = `<h2>${cat} (${groups[cat].length})</h2><ul class="repo-grid"></ul>`;
    const ul = sec.querySelector('ul');
    groups[cat].forEach(r => ul.appendChild(createRepoElement(r)));
    sectionsEl.appendChild(sec);
  });
}

authBtn.addEventListener('click', () => {
  const t = prompt('Incolla un GitHub Personal Access Token (scope: repo) per vedere anche i repository privati. Il token resta solo nel tuo browser (localStorage).');
  if (t) { authToken = t.trim(); localStorage.setItem('gh_pat', authToken); fetchAndDisplay(); }
});
clearAuthBtn.addEventListener('click', () => {
  authToken = ''; localStorage.removeItem('gh_pat'); fetchAndDisplay();
});
searchEl.addEventListener('input', render);
visibilityEl.addEventListener('change', render);
sortEl.addEventListener('change', render);

async function fetchAndDisplay() {
  sectionsEl.innerHTML = '<div class="loading">Caricamento...</div>';
  try {
    if (GITHUB_USERNAME && userDisplay) userDisplay.textContent = `${GITHUB_USERNAME}'s`;
    await fetchRepos();
  } catch (e) {
    sectionsEl.innerHTML = `<div class="error">Errore: ${e.message}</div>`;
  }
}
fetchAndDisplay();
