const pdfreader = require("pdfreader")
const http = require('http')
const fs = require('fs')

//0 = classi, 1 = aule, 2 = prof
const altezzaGiorni = [6.615, 6.885, 6.105]
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

/*
    Spiegazione:
    La libreire pdfreader ha una funzione per analizzare le tabelle presenti nei pdf, ma non funziona con il pdf della scuola.
    Per questo motivo utilizzo la funzione base della libreria che permette di ottenere ogni elemento di testo presenti nel
    pdf con le rispettive coordinate. Questo ci permette di capire cosa c'è e su quele riga e, visto che l'altezza delle righe
    sono sempre le stesse possiamo leggerle manualmente una volta e poi utilizzare questi dati per ottenere gli orari.
    Questa libreria funziona sia con gli orari degli studenti, sia con quelli delle aule e sia con quelli degli insegnanti.
*/

/**
 * Questa funzione accetta l'url da cui scaricare il pdf, lo converte e ritorna i dati
 * @param {stirng} urlPdf 
 * @param {number} tipo 0 per classi, 1 per aule e 2 per prof 
 * @param {number} tipo 0 per classi, 1 per aule e 2 per prof
 */
async function parseOrario(urlPdf, tipo, debug = false) {
    //Controllo se urlPdf è una stringa
    if(typeof urlPdf == 'string') {
        //1: scarico il file
        await scaricaFile(urlPdf, 'tmp.pdf')

        //2: estraggo le informazioni
        let righe = await estraiInformazioni('tmp.pdf')

        //3: cambio il formato dei dati
        let dati = analizzaDati(righe, tipo)

        //-: formatto i dati per mostrarli nella console
        if(debug) mostraTabella(dati.tabellaPerOre)

        //console.log(JSON.stringify(dati.tabellaPerOre))

        //4: fine! ritorno i dati
        return dati
    } else {
        throw new TypeError('il parametro urlPdf non è una stringa')
    }
}

/**
 * Questa funzione permette di scaricare un file dato un url
 * @param {*} pdfUrl indirizzo url del file da scaricare
 */
async function scaricaFile(url, path) {
    //Controllo che i dati siano stringhe
    if(typeof url == 'string' && typeof path == 'string') {
        return new Promise((resolve, reject) => {
            var file = fs.createWriteStream(path)
            http.get(url, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close()
                    resolve()
                })
            }).on('error', (err) => {
                fs.unlink(path)
                reject(err)
            })
        })
    } else {
        throw new TypeError('i parametri url e path non sono stringhe')
    }
}

/**
 * Questa funzione permette di leggere un pdf ed ottenere i dati al suo intenrno divisi per righe
 * @param {string} path percorso del file pdf da leggere
 */
async function estraiInformazioni(path) {
    //Controllo che il parametri sia una stringa
    if(typeof path == 'string') {
        return new Promise((resolve, reject) => {
            let righe = []
            fs.readFile(path, (err, pdfBuffer) => {
                if(err) {
                    reject(err)
                } else {
                    new pdfreader.PdfReader().parseBuffer(pdfBuffer, (err2, item) => {
                        if(err2) {
                            reject(err2)
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
                            //I dati sono pronti, li ritorno
                            resolve(righe)
                        }
                    })
                }
            })
        })
    } else {
        throw new TypeError('il parametro path non è una stringa')
    }
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

    //Trovo il minimo e il massimo valore x dei giorni della settimana che utilizzerò per capire in che giorno si trovano le magterie e le aule
    righe.forEach(riga => {
        if(riga.y == altezzaGiorni[tipo]) {
            riga.elementi.forEach((elemento, i) => {
                //console.log(element)
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

    //Ora divido i numeri in 6 sezioni
    let spazio = (max - min) / 5
    for(let i = 0; i < 5; i++) {
        divisori.push(min + spazio/2 + spazio * i)
    }

    //A questo punto trovo le informazioni (prima e seconda riga) per ciascuna ora
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

    //transform the data from byTimeFrame to byDay
    //Trasformo i dati dlla divisione per ore a una divisione per giorni
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
            tabellaPerGiorni[i].info1.push({
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
        //Lunedì - venerdì
        for(let i = -1; i < 5; i++) {
            divisioni[i + 1].nome = riga.elementi.filter(elemento => {
                return (i != -1 ? elemento.x > divisori[i] : true) && (1 != 4 ? elemento.x < divisori[i + 1] : true)
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

module.exports = parseOrario