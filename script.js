// ** PASSO 1: Sostituisci "MIOTENTE" con il tuo username di GitHub **
const GITHUB_USERNAME = "MIOTENTE"; 
const REPOS_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
const repoList = document.getElementById('repositories-list');

/**
 * Funzione per generare il markup HTML per un singolo repository.
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
    if (repo.description) {
        const desc = document.createElement('p');
        desc.textContent = repo.description;
        li.appendChild(desc);
    }
    
    // Linguaggio principale e stelle
    const details = document.createElement('p');
    details.innerHTML = `
        **Lingua:** ${repo.language || 'Non specificata'} | 
        **Stelle:** ${repo.stargazers_count} | 
        **Ultimo Aggiornamento:** ${new Date(repo.updated_at).toLocaleDateString()}
    `;
    li.appendChild(details);

    return li;
}

/**
 * Funzione principale per recuperare e visualizzare i repository.
 */
async function fetchAndDisplayRepos() {
    try {
        const response = await fetch(REPOS_API_URL);
        
        if (!response.ok) {
            throw new Error(`Errore API: ${response.status} - Impossibile caricare i repository.`);
        }

        const repositories = await response.json();
        
        // Svuota il messaggio di caricamento
        repoList.innerHTML = ''; 

        if (repositories.length === 0) {
            repoList.innerHTML = '<li>Nessun repository pubblico trovato.</li>';
            return;
        }

        // Ordina i repository per data di aggiornamento (più recente in alto)
        repositories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Aggiunge ogni repository alla lista
        repositories.forEach(repo => {
            // L'API di default restituisce solo i pubblici, ma potresti filtrare ulteriormente se necessario
            if (!repo.private) { 
                repoList.appendChild(createRepoElement(repo));
            }
        });

    } catch (error) {
        console.error("Errore nel recupero dei repository:", error);
        repoList.innerHTML = `<li>Si è verificato un errore durante il caricamento dei progetti: ${error.message}</li>`;
    }
}

// Avvia il processo quando la pagina è caricata
fetchAndDisplayRepos();
