# Orario Galilei

L'app è disponibile qui: [orario-galilei.web.app](https://orario-galilei.web.app/)

Questo progetto serve a leggere, gestire e presentare gli orari di classi, aule e professori dell'istituto Galileo Galilei Crema.

E' suddiviso in:

- Una modulo npm per recuperare e tradurre gli orari da pdf a json
- Un sito web ([PWA](https://developers.google.com/web/progressive-web-apps/)) che presenta le informazioni agli utenti
- Un progetto Firebase per memorizzare le informazioni e servire il sito

## Modulo NPM ```parser-orario-galilei```

Questo modulo permette di effettuare 3 operazioni principali:

- Ottenere la lista di aule, classi e professori
- Recuperare un orario a partire dal link e tradurlo in dati
- Ottenere tutti gli orari di aule, classi e professori

Potete installare questo modulo nel vostro progetto tramite npm:

```npm i parser-orario-galilei```

Visitate la [pagina del modulo](https://www.npmjs.com/package/parser-orario-galilei) o la directory parser-orario-galilei per una documentazione più dettagliata e degli esempi.

## Sito web PWA

Il sito web [orario-galilei.web.app](https://orario-galilei.web.app/) mette a disposizione gli orari in modo semplice e veloce.

In più il sito web è una [PWA](https://developers.google.com/web/progressive-web-apps/)! È quindi possibile "installare" il direttamente dal browser ed utilizzarlo come un'app nativa.

## Progetto Firebase

Per mettere in funzione il tutto è stato utilizzato Firebase, in particolare Firestore, Cloud Functions e Hosting.

### Cloud Functions

Sono state create 3 funzioni che ogni mattina si occupano di sincronizzare gli orari. In questo modo i dati proposti agli utenti sono sempre aggiornati con l'ultima versione degli orari.

### Firestore

I dati analizzati dalle cloud function venogono salvati nel Firestore per renderle facilmente accessibili dal sito.

### Hosting

Il sito web è servito tramite Firebase.

## Altri approfindimenti

Per qualsiasi informazione contattatemi pure: nidasioalberto@gmail.com
