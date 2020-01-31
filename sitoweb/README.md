# Sito web

Questo è il componente principale del progetto.

È realizzato con il framework Angular e implementa la tecnologia PWA. In questo modo è possiblile fornire agli utenti l'esperienza di un'app tramite un sito.

## Struttura dei componenti

Questo è un riassunto dei moduli che compongono l'app:

### Moduli principali

Questi moduli corrispondono al contenuto principale di differenti pagine all'interno dell'app

- Preferiti

- Ricerca

- Orario

- Informazioni

### Moduli secondari

Qui invece sono elencati i moduli utilizzati da quelli principali per comporre quello che viene visualizzato a schermo

#### Navbar

La navbar è visualizzata in tutte le pagine ed è composta da 3 elementi principali: bottone home, barra di ricerca e bottone filtri

![Navbar chiusa](./readme_screenshots/navbar_closed.png)

- Il **bottone home** (quello con il logo della scuola) permette ovviamente di tornarnare alla pagina principale ovunque ci si trovi

- La **barra di ricerca** permette di inserire in input un filtro che verrà applicati al nome di tutti gli orari (o ad alcune specifiche categorie, vedi filtri)

- Il **bottone filtri** se schiacciato rivela un sottomenù per filtrare i risulati della ricerca (classi, professori o aule come mostrato qui)

![Navbar chiusa](./readme_screenshots/navbar_opened.png)

#### Grafico orario

Questo componenti è utilizzato esclusivamente dalla pagina orario e rappresente in una tabella un dato orario

![Navbar chiusa](./readme_screenshots/grafico_orario.png)

#### Lista orari

La lista orari otilizza un sotto-componente elemento lista orari per formare una lista verticale di orari.
L'elemento lista orari è contiene

![Navbar chiusa](./readme_screenshots/esempio_di_ricerca.png)

#### Lista impegni

La lista impegni è il componente utilizzato per visualizzare i prossimi n (attualmente 2) impegni a partire dal momento corrente

![Navbar chiusa](./readme_screenshots/lista_impegni.png)