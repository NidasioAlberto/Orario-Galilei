# Modulo ```parser-orario-galilei```

Questo modulo npm permette di ottenere gli orari di classi, aule e professori per il Galilei di Crema.

Il codice si avvale di 2 librerie:

- axios: permette di effettuare chiamate http da node e mobile, questo ci permette di utilizzare la libreria anche nel browser (molto interessante se non si dispone di un server nel quale salvare le informazioni!)
- [pdfjs](https://mozilla.github.io/pdf.js/getting_started/): questa libreria sviluppata da Mozilla permette di recuperare informazioni da un file pdf

## Changelog

**1.0.0** Versione completa.

**1.1.0** L'obbiettivo di questa versione è quello di rielaborare il codice, risolvendo
    errori e bug e migliorare le performance del codice.

**2.0.0** Questa versione aggiunge supporto per typescript!

**2.2.0** Sistemato un bug, invece cha salvare il nome del professore nell'indice, veniva salvato l'oggetto professore

**2.2.2** L'ora degli orari adesso è salvata come  numero da 0 a 7 invece che come stringa

**2.2.3-4** Aggiunta una funzione per confrontare gli orari, è però ancora da migliorare

**2.3.0-5** Libreria pdfreader sostituita con pdfjs (su cui si basava) così da funzionare anche in un browser

**3.0.0** Questa versione permette di recuperare l'orario in modo più flessibile (è possibile farlo su qualsiasi pdf), riorganizza i dati dell'orario eliminando l'oranizzazione della tabella per giorni, implementa in modo completo il confronto tra due orari ed è più efficiente

**3.0.1** Ora vengono eliminati gli spazi nei nomi degli orari di aule e classi

...

**3.1.0** Aggiunta di dati per i log nei valori di ritorno delle funzioni ottieniOrari(Classi|Aule|Professori) ed eliminate delle ridondanze nel codice, ora le funzioni ottieniOrarioClassi e ottieniOrarioAule sono unite in un'unica funzione chiamata ottieniOrarioClassiOAule (lo stesso per ottieniListaClassiOAule). Migliorata inoltre la documentazione del codice

**3.2.0** Aggiornato parser per anno scolastico 2020-2021

## Esempio

Codice:

```Typescript
const anno = '2020'

//Classi
console.time('Classi')
ottieniOrariClassi('2020').then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Classi')
}).catch(console.log)
```
