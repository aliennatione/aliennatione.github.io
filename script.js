/**
 * Ottiene lo username dall'hostname della GitHub Pages.
 * Formato supportato: "mioutente.github.io" -> "mioutente"
 * @returns {string|null} Lo username ricavato.
 */
function getUsernameFromUrl() {
    const hostname = window.location.hostname;
    
    // Controlla se siamo su un dominio github.io (User Page)
    if (hostname.endsWith('.github.io')) {
        // Estrai lo username dalla prima parte del dominio (es. 'aliennatione')
        let username = hostname.split('.')[0];
        
        // Se il risultato è 'localhost' o un IP di test, torna null
        if (username === 'localhost' || username === '127') {
             return null; 
        }

        return username;
    }
    
    // Ritorna null se non è un dominio GitHub Pages di formato noto.
    return null; 
}

// ==========================================================
// Dichiarazioni Globali (Dichiarate SOLO qui una volta)
// ==========================================================
const GITHUB_USERNAME = getUsernameFromUrl();
const repoList = document.getElementById('repositories-list');
const userDisplay = document.getElementById('user-display');


/**
 * FUNZIONE DI DEBUG: Aggiorna l'header e logga lo username.
 * @param {string|null} username - Lo username ricavato.
 */
function debugDisplayUsername(username) {
    if (userDisplay) {
        if (username) {
            userDisplay.textContent = `${username}'s`;
            // Log nella console per debug
            console.info(`[DEBUG] Username ricavato dall'URL e utilizzato per API: ${username}`);
        } else {
            userDisplay.textContent = 'I Miei';
            console.warn("[DEBUG] Username non ricavato. Assicurati che l'hostname sia nel formato 'username.github.io'.");
        }
    }
}


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
    // 1. Esegue il debug dello username prima della chiamata
    debugDisplayUsername(GITHUB_USERNAME); 

    if (!GITHUB_USERNAME) {
        repoList.innerHTML = `<li class="error">Errore: Impossibile determinare lo username GitHub dall'URL.</li>`;
        return;
    }

    const REPOS_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
    
    try {
        const response = await fetch(REPOS_API_URL);
        
        if (!response.ok) {
            // Logga lo stato esatto dell'errore (404, 403, ecc.)
            console.error(`[API ERROR] Stato: ${response.status}. URL chiamata: ${REPOS_API_URL}`);
            
            throw new Error(`Errore API: ${response.status} - Impossibile caricare i repository per l'utente ${GITHUB_USERNAME}.`);
        }

        const repositories = await response.json();
        
        repoList.innerHTML = ''; // Svuota il messaggio di caricamento

        if (repositories.length === 0) {
            repoList.innerHTML = `<li class="loading">Nessun repository pubblico trovato per ${GITHUB_USERNAME}.</li>`;
            return;
        }

        // Ordina: prima i progetti più aggiornati
        repositories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Popola la griglia
        repositories.forEach(repo => {
            repoList.appendChild(createRepoElement(repo));
        });

    } catch (error) {
        console.error("Errore irreversibile nel recupero:", error);
        repoList.innerHTML = `<li class="error">⚠️ Si è verificato un errore durante la chiamata: ${error.message}. Verifica la console per dettagli.</li>`;
    }
}

// Avvia il processo
fetchAndDisplayRepos();
