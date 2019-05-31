const pdfreader = require("pdfreader")
const fetch = require('node-fetch')
const fs = require('fs')

/* Spiegazione:
Il module pdfreader ha una funzione per analizzare le tabelle presenti nei pdf,
ma non funziona con il pdf della scuola. Per questo motivo utilizzo la funzione
base della libreria che permette di ottenere ogni elemento di testo presenti nel
pdf con le rispettive coordinate. Questo ci permette di capire cosa c'è e su
quele riga e, visto che l'altezza delle righe sono sempre le stesse possiamo
leggerle manualmente una volta e poi utilizzare questi dati per ottenere gli orari.
Questa libreria funziona sia con gli orari degli studenti, sia con quelli delle
aule e sia con quelli degli insegnanti.

Change log

1.0.0 - Versione completa.

1.1.0 - L'obbiettivo di questa versione è quello di rielaborare il codice, risolvendo
    errori e bug e migliorare le performance del codice.
*/

//Dati essenziali per l'elaborazione delle pagine e dei pdf
const altezzaGiorni = [6.615, 6.885, 6.105] //0 = classi, 1 = aule, 2 = prof
const altezzeLineeDati = [
    [
        {
            ora: '1',
            altezze: [7.432, 8.302]
        }, {
            ora: '2',
            altezze: [9.12, 9.99]
        }, {
            ora: '3',
            altezze: [10.8, 11.67]
        }, {
            ora: '4',
            altezze: [12.487, 13.357]
        }, {
            ora: '5',
            altezze: [14.175, 15.045]
        }, {
            ora: '6',
            altezze: [15.855, 16.725]
        }, {
            ora: '1p',
            altezze: [17.625, 18.495]
        }, {
            ora: '2p',
            altezze: [19.312, 20.182]
        }
    ], [
        {
            ora: '1',
            altezze: [7.710000000000001, 8.58]
        }, {
            ora: '2',
            altezze: [9.39, 10.26]
        }, {
            ora: '3',
            altezze: [11.077, 11.947]
        }, {
            ora: '4',
            altezze: [12.765, 13.635]
        }, {
            ora: '5',
            altezze: [14.445, 15.315000000000001]
        }, {
            ora: '6',
            altezze: [0, 0]
        }, {
            ora: '1p',
            altezze: [17.812, 18.682]
        }, {
            ora: '2p',
            altezze: [19.5, 20.37]
        }
    ], [
        {
            ora: '1',
            altezze: [6.922, 7.792]
        }, {
            ora: '2',
            altezze: [8.61, 9.48]
        }, {
            ora: '3',
            altezze: [10.297, 11.16]
        }, {
            ora: '4',
            altezze: [11.977, 12.847]
        }, {
            ora: '5',
            altezze: [13.665, 14.535]
        }, {
            ora: '6',
            altezze: [15.344999999999999, 16.215]
        }, {
            ora: '1p',
            altezze: [17.122, 17.985]
        }, {
            ora: '2p',
            altezze: [18.802, 19.672]
        }
    ]
]
const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const lettereAlfabeto = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const percorsoPrimario = 'http://www.galileicrema.it:8080'
const percorsoListaClassi = '/intraitis/Didattica/orario/OrarioQueryClasse.asp'
const percorsoListaAule = '/intraitis/didattica/orario/orarioqueryaula.asp'
const percorsoListaProfessori = '/Intraitis/Lib/ListaInsegnanti.asp?prossima=/Intraitis/Didattica/Orario/OrarioCaricaDocente.asp&cosa=ORARIO%20SETTIMANALE&lettera='

//Funzioni principali esportate dal modulo

/**
 * Questa funzione permette di ottenere la lista delle classi
 * @param {string} urlClassi 
 */
async function ottieniListaClassi(urlClassi = percorsoPrimario + percorsoListaClassi) {
    try {
        //1: Recupero la pagina hmtl
        let paginaHtml = await fetch(urlClassi).then(res => res.text())
    
        //2: Estraggo le classi
        let classi = paginaHtml.match(/Value="(.+)"/g)
        return classi.map(classe => classe.match(/"(.+)"/)[1])
    } catch(err) {
        throw 'Impossibile recuperare le aule'
    }
}
exports.ottieniListaClassi = ottieniListaClassi

/**
 * Questa funzione permette di ottenere la lista di tutte le aule
 * @param {string} urlAule 
 */
async function ottieniListaAule(urlAule = percorsoPrimario + percorsoListaAule) {
    try {
        //1: Recupero la pagina hmtl
        let paginaHtml = await fetch(urlAule).then(res => res.text())

        //2: Estraggo le aule
        let aule = paginaHtml.match(/Value="(.+)"/g)
        return aule.map(classe => classe.match(/"(.+)"/)[1])
    } catch(err) {
        throw 'Impossibile recuperare le aule'
    }
}
exports.ottieniListaAule = ottieniListaAule

/**
 * Questra funzione permette di ottenere la lista dei professori e i link ai loro orari
 * @param {string} urlProf 
 */
async function ottieniListaProfessori(urlProf = percorsoPrimario + percorsoListaProfessori) {
    try {
        //             1: Per ogni lettera             2: Ottengo la pagina web
        let promesse = lettereAlfabeto.map(lettera => fetch(urlProf + lettera).then(res => res.text()).then(paginaHtml => {
            try {
                //3: Estraggo le informazioni dei professori, quindi nomi e link ai link dei pdf ;)
                let informazioni = paginaHtml.match(/<a HREF="(.*?)">(?:(.|\n|\t|\r)*?)<FONT face="Verdana" size=3>(.*?)<\/font><\/a>/g)
    
                //4: recupero tutti i link corretti ai pdf e riorganizzo le informazioni
                return informazioni.map(match => {
                    try {
                        let info = match.match(/<a HREF="(.*?)">(?:(?:.|\n|\t|\r)*?)<FONT face="Verdana" size=3>(.*?)<\/font><\/a>/)

                        let professore = {
                            percorsoOrario: info[1],
                            nome: info[2]
                        }

                        return professore
                    } catch(err) {
                        return undefined
                    }
                })//.filter(professore => professore != undefined)
            } catch(err) {
                return undefined
            }
        }))

        return Promise.all(promesse).then(promesseCompletate => {
            return promesseCompletate.filter(promessaCompletata => promessaCompletata != undefined).reduce((acc, val) => acc.concat(val), [])
        })
    } catch(err) {
        throw 'Impossibile recuperare i professori'
    }
}
exports.ottieniListaProfessori = ottieniListaProfessori

/**
 * Questa funzione permette di ottenere l'orario di una classe, di un'aula o di un'insegnante dato un url
 * @param {string} urlPdf
 * @param {number} tipo
 * @param {boolean} debug
 */
async function ottieniOrario(urlPdf, tipo, debug = false) {
    if(debug) console.time(urlPdf)
    try {
        //Controllo se urlPdf è una stringa
        if(typeof urlPdf == 'string') {
            //1: Scarico il file
            let buffer = await fetch(urlPdf).then(res => res.buffer())
    
            //2: Estraggo le informazioni
            let righe = await estraiInformazioni(buffer)

            //3: cambio il formato dei dati
            let dati = analizzaDati(righe, tipo)
            
            //-: formatto i dati per mostrarli nella console
            if(debug) {
                mostraTabella(dati.tabellaPerOre)
                console.timeEnd(urlPdf)
            }

            //4: fine! ritorno i dati
            return dati
        } else {
            throw 'url non corretto'
        }
    } catch(err) {
        return undefined
        //throw 'impossibile recuperare l\'orario'
    }
}
exports.ottieniOrario = ottieniOrario

/**
 * Questa funzione permette di ottenere la lista delle classi e tutti i loro orari
 * @param {number} anno
 */
async function ottieniOrariClassi(anno, debug = false) {
    try {
        //1: Recupero la lista delle classi
        let classi = await ottieniListaClassi()
    
        //2: Recupero i loro orari
        let orari = await Promise.all(classi.map(async classe => {
            try {
                return {
                    classe,
                    orario: await ottieniOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/' + anno + '/' + classe + '.pdf', 0, debug)
                }
            } catch(err) {
                return undefined
            }
        }).filter(promessa => promessa != undefined))
    
        //3: Ritorno gli orari
        return orari.filter(orario => orario.orario != undefined)
    } catch(err) {
        throw 'impossibile recuperare classi e orari'
    }
}
exports.ottieniOrariClassi = ottieniOrariClassi

/**
 * Questa funzione permette di ottenere la lista delle aule e tutti i loro orari
 * @param {number} anno 
 */
async function ottieniOrariAule(anno, debug = false) {
    try {
        //1: Recupero la lista delle aule
        let aule = await ottieniListaAule()
    
        //2: Recupero i loro orari
        let orari = await Promise.all(aule.map(async aula => {
            try {
                return {
                    aula,
                    orario: await ottieniOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/' + anno + '/' + aula + '.pdf', 1, debug)
                }
            } catch(err) {
                return undefined
            }
        }).filter(promessa => promessa != undefined))
        
        //3: Ritorno gli orari
        return orari.filter(orario => orario.orario != undefined)
    } catch(err) {
        console.log(err)
        throw 'impossibile recuperare aule e orari'
    }
}
exports.ottieniOrariAule = ottieniOrariAule

/**
 * Questa funzione permette di ottenere la lista delle aule e tutti i loro orari
 */
async function ottieniOrariProfessori(debug = false) {
    try {
        //1: Recupero la lista dei professori
        let professori = await ottieniListaProfessori()
    
        //2: Recupero i loro orari
        let orari = await Promise.all(professori.map(async professore => {
            try {
                return {
                    professore: professore.nome,
                    orario: await ottieniOrario('http://www.galileicrema.it:8080' + professore.percorsoOrario, 2, debug)
                }
            } catch(err) {
                return undefined
            }
        }).filter(promessa => promessa != undefined))
        
        //3: Ritorno gli orari
        return orari.filter(orario => orario.orario != undefined)
    } catch(err) {
        console.log(err)
        throw 'impossibile recuperare aule e orari'
    }
}
exports.ottieniOrariProfessori = ottieniOrariProfessori

//Funzioni secondarie

/**
 * Permette di ottenere le informazioni presenti nel pdf
 * @param {Buffer} buffer 
 */
async function estraiInformazioni(buffer) {
    let righe = []
    return new Promise((resolve, reject) => {
        new pdfreader.PdfReader().parseBuffer(buffer, (err, item) => {
            if(err) {
                reject(err)
            } else if(item != undefined) {
                //Processo i dati
                if(item.x != undefined && item.y != undefined) {
                    //1: controllo se la riga è già stata registrata
                    let trovato = false
                    righe.forEach(riga => {
                        if(riga.y == item.y) {
                            riga.elementi.push({
                                x: item.x,
                                //y: item.y,
                                testo: item.text
                            })
                            trovato = true
                            return false
                        }
                    })
                    //2: altrimenti la aggiungo
                    if(!trovato) righe.push({
                        y: item.y,
                        elementi: [
                            {
                                x: item.x,
                                //y: item.y,
                                testo: item.text
                            }
                        ]
                    })
                }
            } else {
                //I dati sono pronti, li ritorno se non sono vuoti
                if(righe.length > 0) resolve(righe)
                else reject('nessun dato trovato')
            }
        })
    })
}

/**
 * Questa funzione permette di analizzare ed estrarre le infomrazioni e l'orario dai dati recuperati dal pdf
 * @param {array} righe le righe del pdf
 * @param {number} tipo 0 per classi, 1 per aule e 2 per prof 
 */
function analizzaDati(righe, tipo) {
    let min, max
    let divisori = []
    let tabellaPerOre = []
    let tabellaPerGiorni = []

    //1: Trovo il minimo e il massimo valore x dei giorni della settimana che utilizzerò per capire in che giorno si trovano le magterie e le aule
    righe.forEach(riga => {
        if(riga.y == altezzaGiorni[tipo]) {
            riga.elementi.forEach((elemento, i) => {
                if(i == 0) {
                    min = elemento.x
                    max = elemento.x
                } else {
                    if(elemento.x < min) min = elemento.x
                    if(elemento.x > max) max = elemento.x
                }
            })
            return false //Per interrompere il ciclo
        }
    })

    //2: Ora divido i numeri in 6 sezioni
    let spazio = (max - min) / 5
    for(let i = 0; i < 5; i++) {
        divisori.push(min + spazio/2 + spazio * i)
    }

    //3: A questo punto trovo le informazioni (prima e seconda riga) per ciascuna ora
    altezzeLineeDati[tipo].forEach(altezzaLineaDati => {
        tabellaPerOre.push({
            ora: altezzaLineaDati.ora,
            info1: dividiRiga(divisori, righe.find(riga => {
                return riga.y == altezzaLineaDati.altezze[0]
            })),
            info2: dividiRiga(divisori, righe.find(riga => {
                return riga.y == altezzaLineaDati.altezze[1]
            }))
        })
    })

    //4: Trasformo i dati dlla divisione per ore a una divisione per giorni
    giorni.forEach((giorno, i) => {
        tabellaPerGiorni.push({
            giorno,
            info1: [],
            info2: []
        })
 
        tabellaPerOre.forEach(ora => {
            tabellaPerGiorni[i].info1.push({
                name: ora.info1[i].nome,
                timeFrameName: ora.giorno
            })
            tabellaPerGiorni[i].info2.push({
                name: ora.info2[i].nome,
                timeFrameName: ora.timeFrameName
            })
        })
    })

    return {
        tabellaPerOre,
        tabellaPerGiorni
    }
}

/**
 * Permette di suddividere le rige delle materie e delle aule in base ai dei divisori
 * @param {*} divisori 
 * @param {*} riga 
 */
function dividiRiga(divisori, riga) {
    let divisioni = []
    giorni.forEach(giorno => {
        divisioni.push({
            giorno
        })
    })

    if(riga != undefined) {
        //Lunedì - sabato
        for(let i = -1; i < 5; i++) {
            divisioni[i + 1].nome = riga.elementi.filter(elemento => {
                return (i != -1 ? elemento.x > divisori[i] : true) && (i != 4 ? elemento.x < divisori[i + 1] : true)
            }).map(elemento => elemento.testo.replace(/ /g, '')).join('')
            if(divisioni[i + 1].nome == '') divisioni[i + 1].nome = undefined
        }
    }

    return divisioni
}

/**
 * Questa funzione permette di mostrare l'orario in un fomato comprensibile nella console
 * @param {*} tabellaPerOre l'orario diviso per ore
 */
function mostraTabella(tabellaPerOre) {
    //once the table has been parse comletely we can show it in the console nicely

    let tabellaPerConsole = []

    tabellaPerOre.forEach(ora => {
        tabellaPerConsole.push(ora.info1.map((info1s, i) => {
            if(info1s.nome != undefined && ora.info2[i].nome != undefined)
                return info1s.nome + '-' + ora.info2[i].nome
            else return '*'
        }))
    })

    console.table(tabellaPerConsole)
}