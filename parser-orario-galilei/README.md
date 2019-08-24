# Modulo ```parser-orario-galilei```

Questo modulo npm permette di ottenere gli orari di classi, aule e professori per il Galilei di Crema

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
