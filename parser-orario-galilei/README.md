# Modulo ```parser-orario-galilei```

Questo modulo npm permette di ottenere gli orari di classi, aule e professori per il Galilei di Crema.

Il codice si avvale di 2 librerie:
- axios: permette di effettuare chiamate http da node e mobile, questo ci permette di
    utilizzare la libreria anche nel browser (molto interessante se non si dispone di un
    server nel quale salvare le informazioni!)
- pdfjs: questa libreria sviluppata da Mozilla permette di recuperare informazioni da un
    file pdf

## Changelog

**1.0.0** Versione completa.

**1.1.0** L'obbiettivo di questa versione è quello di rielaborare il codice, risolvendo
    errori e bug e migliorare le performance del codice.

**2.0.0** Questa versione aggiunge supporto per typescript!

**2.2.0** Sistemato un bug, invece cha salvare il nome del professore nell'indice, veniva salvato l'oggetto professore

**2.2.2** L'ora degli orari adesso è salvata come  numero da 0 a 7 invece che come stringa

**2.2.3-4** Aggiunta una funzione per confrontare gli orari, è però ancora da migliorare

**2.3.0-5** Libreria pdfreader sostituita con pdfjs (su cui si basava) così da funzionare anche in un browser

**3.0.0** (In sviluppo) Ora non è più necessario specificare la posizione degli elementi nel pdf per poter ottenere l'orario

## Esempio

Codice:

```Typescript
const anno = '2019'

//Classi
console.time('classi')
ottieniOrariClassi(anno).then((dati) => {
    console.timeEnd('classi')
    console.log(JSON.stringify(dati[0]))
}).catch(console.log)
```

Output:

```JSON
{
    "classe":"1CA",
    "orario":{
        "tabellaPerOre":[
            {
                "ora":"1",
                "info1":[
                    {
                        "giorno":0,
                        "nome":"Disegno"
                    },
                    ...
                ],
                "info2":[
                    {
                        "giorno":0,
                        "nome":"iLCB"
                    },
                    ...
                ]
            },
            ...
        ]
    }
}
```
