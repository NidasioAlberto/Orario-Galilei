# Organizzazione firestore

## Classi / Aule / Professori

``` typescript
Indici: {
    lista: [ "<nome>" ],
    ultimoAggiornamento: timestamp
}

<nome>: {
    dataAggiornamento: timestamp,
    dataValidita: timestamp,
    nome: string,
    tabella: [
        info: [
            {
                elementi: [ "<elemento>" ],
                giorno: 0
            }
        ],
        ora: number
    ],
    ultimoAggiornamento: timestamp,
    versione: string
}

<nome> -> Storico -> id -> orario //versione precedente dell'orario
```

## Storico

``` typescript
<Anno scolastico> -> Classi / Aule / Professori -> Indice + nomi // Collection precedente
```