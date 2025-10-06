/**
 * Ottiene lo username dall'hostname della GitHub Pages.
 * Formato supportato: "mioutente.github.io" -> "mioutente"
 * @returns {string|null} Lo username ricavato.
 */
function getUsernameFromUrl() {
    const hostname = window.location.hostname;
    
    if (hostname.endsWith('.github.io')) {
        // Estrai lo username dalla prima parte del dominio (es. 'aliennatione')
        let username = hostname.split('.')[0];
        
        // Evita nomi di dominio non validi (localhost per User Pages)
        if (username === 'localhost' || username === '127' || !username) {
             return null; 
        }

        return username;
    }
    
    // Per domini custom o test locali complessi, ritorniamo null.
    return null; 
}

// ==========================================================
// Dichiarazioni Globali (Appaiono solo qui)
// ==========================================================
const GITHUB_USERNAME = getUsernameFromUrl();
const repoList = document.getElementById('repositories-list');
const userDisplay = document.getElementById('user-display');


/**
 * FUNZIONE DI DEBUG: Aggiorna l'header e logga lo username per la diagnostica.
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
 * Genera il markup HTML per un singolo repository.
 * @param {object} repo - L'oggetto repository dall'API di GitHub.
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


// ==========================================================
// INTEGRAZIONE MARKMAP STATICA
// ==========================================================
/**
 * Configura e renderizza la mappa mentale di esempio Markmap.
 */
function setupMarkmap() {
    const markmapContainer = document.getElementById('markmap-visualization');
    
    // Contenuto Markdown statico di esempio
    const markdownContent = `
# Obiettivi del Portfolio
## Funzionalità Base
### Requisiti
- Recupero dinamico dei repo
- Design responsive
### Sicurezza
- Solo chiamate lato client
- Nessun token esposto
## Prossimi Sviluppi
### Idee
- Filtro per linguaggio
- Pagina di dettaglio progetto
    `;
    
    // Controlla che il contenitore e le librerie siano disponibili
    if (markmapContainer && window.markmap && window.markmap.Markmap) {
        markmapContainer.innerHTML = ''; // Rimuovi il placeholder
        
        const { Markmap } = window.markmap;
        
        // 1. Trasforma il Markdown in dati per la mappa
        const transformer = new markmap.Transformer();
        const { root } = transformer.transform(markdownContent);

        // 2. Crea la mappa nel contenitore SVG
        Markmap.create(markmapContainer, {
            // Opzioni di visualizzazione
            preset: 'colorful' 
        }, root);
    } else {
        console.warn("Markmap non è pronto o le librerie non sono state caricate.");
    }
}


// Avvia il processo principale al caricamento della pagina
// ... (tutto il codice fetchAndDisplayRepos e setupMarkmap)

// Avvia il processo principale al caricamento della pagina
fetchAndDisplayRepos();

// MODIFICA QUI: Esegui setupMarkmap con un breve ritardo per garantire che le librerie del CDN siano pronte.
// Si usa un DOMContentLoaded per la logica principale, ma Markmap ha bisogno di un ulteriore ritardo.
document.addEventListener('DOMContentLoaded', () => {
    // Aggiungiamo un piccolo ritardo (es. 100ms) per dare il tempo alle librerie esterne di inizializzarsi
    setTimeout(setupMarkmap, 100); 
});
