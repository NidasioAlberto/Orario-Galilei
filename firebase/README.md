# Firebase

Questo documento descrive come è organizzata la parte su firebase del progetto orari galilei.

## Firestore

La parte più consistende del progetto è legata a Firestore, infatti tutti i dati sugli orari sono salvati al suo interno.

All'interno di Firestore sono salvati principalemnte i seguenti dati:

### Orari

Gli [orari](../parser-orario-galilei/src/utils.ts) sono di 3 tipo: ```Classi```, ```Aule``` e ```Professori```. Queste sono 3 liste (salvate in 3 collection differenti) nelle quali, oltre ai singoli orari, è salvato anche un documento chiamato [```Indici```](functions/src/utils/indici.model.ts) contenente una lista di tutti gli orari nella specifica collection.

### Feedback

In Firestore è presente anche una collection ```Messaggi``` con feedback dagli utenti. I documenti contengono un messaggio, la data e l'ora di quando sono stati inviati, i preferiti salvati in quel momento dall'utente (così per curiosità) ed eventualmente anche il nome del mittente (questo campo è falcoltativo).

### Log

Questa è una collection chiamata ```Log``` nella quale le cloud function lasciano un log ogni volta che finiscono l'esecuzione così da poter monitorare la raccolta degli orari dal sito della scuola.
I documenti salvati nella collection sono di tutte le cloud function e, per le varie funzioni le seguenti informazioni:
- [Funzioni degli orari](functions/src/utils/log-orari.model.ts)

### Impostazioni

Sono delle impostazioni per utili alle cloud function, in particolare è salvato per ora l'anno utilizzato nell'accesso ai dati degli orari sul sito della scuola.

## Hosting

Questa funzione è usata per "hostare" il sito internet. E' presente anche un secondo sito per eventuali test.

## Cloud function

Le cloud function principali sono 3 e si occupano di aggiornare gli orari.

In particolare queste tre funzioni sono collegate ad un trigger periodico e vengono eseguite ogni mattina. Il loro compito è quello di leggere la lista degli orari (di classi, aule e professori), recuperare i pdf, analizzarli e salvare eventuali modifiche degli orari in Firestore (aggiornando anche lo storico se necessario).