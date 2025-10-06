/**
 * Ottiene lo username dall'hostname della GitHub Pages.
 * Formato supportato: "mioutente.github.io" -> "mioutente"
 * @returns {string|null} Lo username ricavato.
 */
function getUsernameFromUrl() {
    const hostname = window.location.hostname;
    
    if (hostname.endsWith('.github.io')) {
        let username = hostname.split('.')[0];
        
        if (username === 'localhost' || username === '127' || !username) {
             return null; 
        }

        return username;
    }
    
    return null; 
}

// ==========================================================
// Dichiarazioni Globali
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
        
        repoList.innerHTML = ''; 

        if (repositories.length === 0) {
            repoList.innerHTML = `<li class="loading">Nessun repository pubblico trovato per ${GITHUB_USERNAME}.</li>`;
            return;
        }

        repositories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

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
 * Usa l'oggetto globale 'markmap' fornito dal file bundle.
 */
function setupMarkmap() {
    const markmapContainer = document.getElementById('markmap-visualization');
    
    const markdownContent = `
# Obiettivi del Portfolio v0.18.12
## Funzionalità Base
### Moduli Risolti
- Problema CDN risolto con Bundle
- Conflitto MIME type risolto
- Sincronizzazione script gestita
### Dati Dinamici
- Recupero dei Repository da API
- Visualizzazione ordinata
## Prossimi Sviluppi
### Idee
- Filtro per linguaggio
- Supporto al tema scuro
    `;
    
    // Controlla che l'oggetto Markmap sia disponibile dalla finestra globale
    if (markmapContainer && window.markmap && window.markmap.Markmap) { 
        markmapContainer.innerHTML = ''; 
        
        // Estrai Transformer e Markmap dall'oggetto globale
        const { Transformer, Markmap } = window.markmap;
        
        const transformer = new Transformer();
        const { root } = transformer.transform(markdownContent);

        Markmap.create(markmapContainer, {
            preset: 'colorful' 
        }, root);
    } else {
        console.warn("Markmap non è pronto o le librerie non sono state caricate.");
    }
}


// Avvia il processo principale
fetchAndDisplayRepos();
// ... (tutto il codice fetchAndDisplayRepos e setupMarkmap) ...

// Avvia il processo principale
fetchAndDisplayRepos();

// ==========================================================
// AVVIO SICURO DI MARKMAP
// ==========================================================
function safeMarkmapStart() {
    // Controlliamo ogni 50ms se la libreria Markmap è stata caricata dal CDN
    if (window.markmap && window.markmap.Markmap) {
        // La libreria è pronta, eseguiamo la funzione
        setupMarkmap();
    } else {
        // Non è ancora pronta, riproviamo tra 50ms
        console.info("Markmap non ancora pronto. Riprovo in 50ms...");
        setTimeout(safeMarkmapStart, 50);
    }
}

// Avvia il processo di controllo dopo che il DOM è caricato
document.addEventListener('DOMContentLoaded', safeMarkmapStart);
