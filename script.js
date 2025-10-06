/**
 * Ottiene lo username dall'hostname della GitHub Pages.
 * Copre il formato standard: "mioutente.github.io" -> "mioutente"
 * @returns {string|null} Lo username ricavato.
 */
function getUsernameFromUrl() {
    const hostname = window.location.hostname;
    
    // Controlla se siamo su un dominio github.io (User Page)
    if (hostname.endsWith('.github.io')) {
        // Estrai lo username dalla prima parte del dominio (es. 'aliennatione')
        // Esempio: "aliennatione.github.io" -> ["aliennatione", "github", "io"]
        let username = hostname.split('.')[0];
        
        // Se il risultato è un dominio di test locale o un IP, torna null
        if (username === 'localhost' || username === '127') {
             return null; 
        }

        return username;
    }
    
    // Ritorna null se non è un dominio GitHub Pages di formato noto.
    return null; 
}

const GITHUB_USERNAME = getUsernameFromUrl();
const repoList = document.getElementById('repositories-list');
const userDisplay = document.getElementById('user-display');


// ==========================================================
// FUNZIONE DI DEBUG: Mostra lo username in un elemento visibile
// ==========================================================
function debugDisplayUsername(username) {
    if (userDisplay) {
        if (username) {
            userDisplay.textContent = `${username}'s`;
            // Aggiunge un piccolo messaggio di debug per conferma
            console.info(`[DEBUG] Username ricavato dall'URL: ${username}`);
        } else {
            userDisplay.textContent = 'I Miei';
            console.warn("[DEBUG] Username non ricavato. Verificare che l'hostname sia nel formato 'username.github.io'.");
        }
    }
}

// ==========================================================
// Funzioni di Rendering e API
// ==========================================================

/**
 * Genera l'HTML per un singolo repository.
 */
function createRepoElement(repo) {
    const li = document.createElement('li');
    li.className = 'repo-item';
    
    const name = document.createElement('h3');
    name.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
    li.appendChild(name);

    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = repo.description || 'Nessuna descrizione fornita.';
    li.appendChild(desc);
    
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
    debugDisplayUsername(GITHUB_USERNAME); // Esegue il debug

    if (!GITHUB_USERNAME) {
        repoList.innerHTML = `<li class="error">Errore: Impossibile determinare lo username GitHub dall'URL. Usa "username.github.io".</li>`;
        return;
    }

    const REPOS_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
    
    try {
        const response = await fetch(REPOS_API_URL);
        
        if (!response.ok) {
            // Se fallisce, qui GITHUB_USERNAME contiene un valore valido (es. 'aliennatione')
            throw new Error(`Errore API: ${response.status} - Impossibile caricare i repository per l'utente ${GITHUB_USERNAME}.`);
        }

        const repositories = await response.json();
        
        repoList.innerHTML = ''; // Svuota il messaggio di caricamento

        if (repositories.length === 0) {
            repoList.innerHTML = `<li class="loading">Nessun repository pubblico trovato per ${GITHUB_USERNAME}.</li>`;
            return;
        }

        repositories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        repositories.forEach(repo => {
            // L'API usata ritorna solo repository pubblici, quindi non serve un filtro esplicito
            repoList.appendChild(createRepoElement(repo));
        });

    } catch (error) {
        console.error("Errore nel recupero dei repository:", error);
        repoList.innerHTML = `<li class="error">⚠️ Si è verificato un errore durante la chiamata: ${error.message}</li>`;
    }
}

// Avvia il processo
fetchAndDisplayRepos();
