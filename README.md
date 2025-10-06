# 🚀 Dynamic-GitHub-Portfolio

Questo progetto è un template di portfolio personale basato su **GitHub Pages**. La sua caratteristica principale è la capacità di **recuperare e visualizzare dinamicamente** l'elenco dei repository pubblici di un utente GitHub specifico utilizzando l'API REST, senza richiedere la configurazione manuale di un token API o di un backend.

## 🎯 Obiettivi e Finalità

L'obiettivo primario di questo template è fornire agli sviluppatori un modo rapido, sicuro ed esteticamente gradevole per creare la propria pagina personale `username.github.io`.

1.  **Automazione:** Elencare i progetti aggiornati in tempo reale dopo ogni push su GitHub (senza richiedere un aggiornamento manuale del portfolio).
2.  **Sicurezza:** Utilizzare esclusivamente chiamate API pubbliche lato client (JavaScript) per garantire la massima sicurezza (nessun token segreto esposto).
3.  **Coesione:** Dimostrare come implementare codice JavaScript che ricavi lo username direttamente dall'URL della pagina (`username.github.io`).
4.  **Estetica:** Fornire un design moderno e reattivo con integrazione opzionale di **Markmap.js** per visualizzare contenuti Markdown.

## 🛠️ Tecnologie Utilizzate

* **HTML5/CSS3:** Per la struttura e lo stile del layout.
* **Vanilla JavaScript (ES6+):** Per la logica di fetching e il rendering dinamico dei dati.
* **GitHub REST API:** Endpoint `GET /users/{username}/repos` per il recupero dei metadati dei progetti.
* **GitHub Pages:** Servizio di hosting statico gratuito.
* **Markmap.js:** Librerie esterne per la visualizzazione di mappe mentali da codice Markdown (incluse in `index.html`).

## ⚙️ Istruzioni per l'Installazione e l'Uso

Questo progetto è configurato come un "User Page" di GitHub Pages.

### 1. Preparazione del Repository

1.  Crea un nuovo repository su GitHub.
2.  **Nome del Repository:** Deve essere esattamente `IL_TUO_USERNAME.github.io` (sostituisci `IL_TUO_USERNAME` con il tuo username).
3.  **Clona** il repository in locale.

### 2. Deployment

1.  Copia tutti i file contenuti in questo template (`index.html`, `script.js`, etc.) nella directory root del tuo repository locale.
2.  **Commit e Push:**
    ```bash
    git add .
    git commit -m "Inizializzazione portfolio dinamico"
    git push origin main
    ```

### 3. Abilitazione su GitHub Pages

Per i repository `username.github.io`, GitHub Pages è spesso abilitato di default sul branch `main`.

* Vai su **Settings** del tuo repository.
* Seleziona **Pages** dalla sidebar.
* Assicurati che **Source** sia impostato su `Deploy from a branch` e che il branch sia `main` (o quello che hai usato).
* Dopo pochi istanti, il tuo portfolio sarà online all'indirizzo `https://IL_TUO_USERNAME.github.io`.

### 4. Debug in Locale

Se testi il progetto su `localhost`, la funzione `getUsernameFromUrl()` fallirà. Per i test locali, dovrai temporaneamente modificare la funzione in `script.js` per restituire il tuo username fisso come valore di fallback.
