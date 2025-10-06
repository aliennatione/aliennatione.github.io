/**
 * Ottiene lo username dall'hostname della GitHub Pages.
 * Esempio: "mioutente.github.io" -> "mioutente"
 */
function getUsernameFromUrl() {
    const hostname = window.location.hostname;
    
    if (hostname.endsWith('.github.io')) {
        // Splitta per '.' e prende la prima parte (lo username)
        return hostname.split('.')[0];
    }
    // Caso di fallback (es. se la pagina è ospitata altrove)
    return 'github'; // Puoi mettere qui un username noto per test
}

const GITHUB_USERNAME = getUsernameFromUrl();
const repoList = document.getElementById('repositories-list');
const userDisplay = document.getElementById('user-display');

// Aggiorna l'header con lo username dinamico
userDisplay.textContent = GITHUB_USERNAME ? `${GITHUB_USERNAME}'s` : 'I Miei';


/**
 * Genera l'HTML per un singolo repository.
 * @param {object} repo - L'oggetto repository dall'API di GitHub.
 */
function createRepoElement(repo) {
    const li = document.createElement('li');
    li.className = 'repo-item';
    
    // Nome e link
    const name = document.createElement('h3');
    name.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
    li.appendChild(name);

    // Descrizione
    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = repo.description || 'Nessuna descrizione fornita.';
    li.appendChild(desc);
    
    // Metadati (Lingua e Stelle)
    const details = document.createElement('div');
    details.className = 'metadata';
    details.innerHTML = `
        <span>
            <strong class="language">${repo.language || 'N/A'}</strong>
        </span>
        <span>
            ⭐ ${repo.stargazers_count}
        </span>
        <span>
            Aggiornato: ${new Date(repo.updated_at).toLocaleDateString()}
        </span>
    `;
    li.appendChild(details);

    return li;
}

/**
 * Funzione principale per recuperare e visualizzare i repository.
 */
async function fetchAndDisplayRepos() {
    if (!GITHUB_USERNAME) {
        repoList.innerHTML = `<li class="error">Errore: Impossibile determinare lo username GitHub dall'URL.</li>`;
        return;
    }

    const REPOS_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
    
    try {
        const response = await fetch(REPOS_API_URL);
        
        if (!response.ok) {
            // Gestione errore 404
            throw new Error(`Errore API: ${response.status} - Impossibile caricare i repository per l'utente ${GITHUB_USERNAME}.`);
        }

        const repositories = await response.json();
        
        // Svuota il messaggio di caricamento
        repoList.innerHTML = ''; 

        if (repositories.length === 0) {
            repoList.innerHTML = `<li class="loading">Nessun repository pubblico trovato per ${GITHUB_USERNAME}.</li>`;
            return;
        }

        // Ordina: prima i progetti più aggiornati
        repositories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Popola la griglia
        repositories.forEach(repo => {
            // L'API di default restituisce solo i pubblici in questo endpoint
            repoList.appendChild(createRepoElement(repo));
        });

    } catch (error) {
        console.error("Errore nel recupero dei repository:", error);
        repoList.innerHTML = `<li class="error">⚠️ Si è verificato un errore: ${error.message}</li>`;
    }
}

// Avvia il processo quando la pagina è caricata
fetchAndDisplayRepos();
