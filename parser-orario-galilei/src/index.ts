import {
    percorsoPrimario,
    percorsoListaClassi,
    percorsoListaAule,
    percorsoListaProfessori,
    lettereAlfabeto,
    RigaDati,
    altezzeLineeDati,
    ElementoTabellaPerOre,
    ElementoTabellaPerGiorni,
    altezzaGiorni,
    giorni,
    InfoOre,
    TabelleOrario,
    Orario
} from "./utils"
import axios from 'axios'
const pdfjs = require('../pdfjs-2.1.266-dist/build/pdf')

/* Spiegazione:
Questo modulo permette di recuperare la lista di classi, aule e professori dell'istituro
Galileo Galilei.

Il codice si avvale di 2 librerie:
- axios: permette di effettuare chiamate http da node e mobile, questo ci permette di
    utilizzare la libreria anche nel browser (molto interessante se non si dispone di un
    server nel quale salvare le informazioni!)
- pdfjs: questa libreria sviluppata da Mozilla permette di recuperare informazioni da un
    file pdf

Change log

1.0.0 - Versione completa.

1.1.0 - L'obbiettivo di questa versione è quello di rielaborare il codice, risolvendo
    errori e bug e migliorare le performance del codice.

2.0.0 - Questa versione aggiunge supporto per typescript!
2.2.0 - Sistemato un bug, invece cha salvare il nome del professore nell'indice, veniva salvato l'oggetto professore
2.2.2 - L'ora degli orari adesso è salvata come  numero da 0 a 7 invece che come stringa
2.2.3-4 - Aggiunta una funzione per confrontare gli orari, è però ancora da migliorare
2.3.0 - Libreria pdfreader sostituita con pdfjs (su cui si basava) così da funzionare anche in un browser
*/

// Funzioni principali esportate dal modulo

/**
 * Questa funzione permette di ottenere la lista delle classi
 * @param {string} urlClassi url per raggiungere i dati delle classi
 */
export async function ottieniListaClassi(urlClassi: string = percorsoPrimario + percorsoListaClassi) {
    try {
        //!: Recupero i dati della pagina html
        let paginaHtml: string = await axios.get(urlClassi).then(res => res.data)

        //2: Estraggo le classi
        let classi = paginaHtml.match(/Value="(.+)"/g)

        //3: Controllo se ci sono dati disponibili
        if (classi == null) throw undefined

        //4: Reckupero solo il nome e ritorno
        return classi.map(classe => {
            let match = classe.match(/"(.+)"/)
            if (match != null) return match[1]
            else return null
        }).filter(classe => classe != null) as string[] //Rimuovo gli eventuali elementi nulli
    } catch (err) {
        throw 'Impossibile recuperare le classi'
    }
}

/**
 * Questa funzione permette di ottenere la lista di tutte le aule
 * @param {string} urlAule url per raggiungere i dati delle aule
 */
export async function ottieniListaAule(urlAule: string = percorsoPrimario + percorsoListaAule) {
    try {
        //1: Recupero la pagina hmtl
        let paginaHtml: string = await axios.get(urlAule).then(res => res.data)

        //2: Estraggo le aule
        let aule = paginaHtml.match(/Value="(.+)"/g)

        //3: Controllo se ci sono dati disponibili
        if (aule == null) throw undefined

        //4: Recupero solo il nome e ritorno
        return aule.map(aula => {
            let match = aula.match(/"(.+)"/)
            if (match != null) return match[1]
            else return null
        }).filter(aula => aula != null) as string[] //Rimuovo gli eventuali elementi nulli
    } catch (err) {
        throw 'Impossibile recuperare le aule'
    }
}

/**
 * Questra funzione permette di ottenere la lista dei professori e i link ai loro orari
 * @param {string} urlProf url per raggiungere i dati dei professori
 */
export async function ottieniListaProfessori(urlProf: string = percorsoPrimario + percorsoListaProfessori) {
    try {
        //             1: Per ogni lettera             2: Ottengo la pagina web
        let promesse = lettereAlfabeto.map(lettera => axios.get(urlProf + lettera).then(res => res.data).then((paginaHtml: string) => {
            try {
                //3: Estraggo le informazioni dei professori, quindi nomi e link ai link dei pdf ;)
                let informazioni = paginaHtml.match(/<a HREF="(.*?)">(?:(.|\n|\t|\r)*?)<FONT face="Verdana" size=3>(.*?)<\/font><\/a>/g)

                //3.1 Controllo se le informazioni sono presenti
                if (informazioni == null) throw undefined

                //4: Recupero tutti i link corretti ai pdf e riorganizzo le informazioni
                return informazioni.map(match => {
                    try {
                        let info = match.match(/<a HREF="(.*?)">(?:(?:.|\n|\t|\r)*?)<FONT face="Verdana" size=3>(.*?)<\/font><\/a>/)

                        if (info == null || info.length < 3) throw undefined

                        let professore = {
                            percorsoOrario: info[1],
                            nome: info[2]
                        }

                        return professore
                    } catch (err) {
                        return undefined
                    }
                }).filter(professore => professore != undefined) as {
                    percorsoOrario: string;
                    nome: string;
                }[]
            } catch (err) {
                return undefined
            }
        })).filter(promessa => promessa != undefined)

        let professori = await Promise.all(promesse).then(promesseCompletate => {
            return promesseCompletate.filter(promessaCompletata => promessaCompletata != undefined).reduce((acc, val) => {
                if (acc != undefined && val != undefined) return acc.concat(val)
                if (val != undefined) return val
                else return []
            }, [])
        })

        if (professori == undefined) throw undefined

        return professori as {
            percorsoOrario: string;
            nome: string;
        }[]
    } catch (err) {
        throw 'Impossibile recuperare i professori'
    }
}

/**
 * Questa funzione permette di ottenere l'orario di una classe, di un'aula o di un'insegnante dato un url
 * @param {string} urlPdf url per raggiungere l'orario da analizzare
 * @param {number} tipo 0 per classi, 1 per aule e 2 per prof
 * @param {boolean} debug per mostrare in nella console delle informazioni
 */
export async function ottieniOrario(urlPdf: string, tipo: 0 | 1 | 2, tabellaPerGiorni: boolean = false, debug: boolean = false) {
    if (debug) console.time(urlPdf)
    try {
        //Controllo se urlPdf è una stringa
        if (typeof urlPdf == 'string') {
            //1: Scarico il file
            //let buffer = await fetch(urlPdf).then(res => res.arrayBuffer())
            let buffer = await axios.get(urlPdf, {
                responseType: 'arraybuffer'
            }).then(res => res.data)

            //2: Estraggo le informazioni
            let righe = await estraiInformazioni(buffer as Buffer)

            //3: cambio il formato dei dati
            let dati = analizzaDati(righe, tipo, tabellaPerGiorni)

            //-: formatto i dati per mostrarli nella console
            if (debug) {
                mostraTabella(dati.tabellaPerOre)
                console.timeEnd(urlPdf)
            }

            //4: fine! ritorno i dati
            return dati
        } else {
            throw 'url non corretto'
        }
    } catch (err) {
        if (debug) console.log(err)
        throw 'impossibile recuperare l\'orario'
    }
}

/**
 * Questa funzione permette di ottenere la lista delle classi e tutti i loro orari
 * @param {number} anno anno da inserire nell'url
 * @param {boolean} tabellaPerGiorni true per ottenere l'orario organizzato anche per giorni
 * @param {boolean} debug per mostrare in nella console delle informazioni
 */
export async function ottieniOrariClassi(anno: string, tabellaPerGiorni: boolean = false, debug: boolean = false) {
    try {
        //1: Recupero la lista delle classi
        let classi = await ottieniListaClassi()

        if (debug) console.log(classi)

        //2: Recupero i loro orari
        let orari = await Promise.all(classi.map(async classe => {
            try {
                return {
                    nome: classe,
                    tabelleOrario: await ottieniOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/' + anno + '/' + classe + '.pdf', 0, tabellaPerGiorni, debug)
                }
            } catch (err) {
                return undefined
            }
        }).filter(promessa => promessa != undefined)) as Orario[]

        //3: Ritorno gli orari
        return {
            orari: orari.filter(orario => orario != undefined && orario.tabelleOrario != undefined),
            lista: orari.filter(orario => orario != undefined && orario.tabelleOrario != undefined).map(orario => orario.nome)
        }
    } catch (err) {
        if (debug) console.log(err)
        throw 'impossibile recuperare classi e orari'
    }
}

/**
 * Questa funzione permette di ottenere la lista delle aule e tutti i loro orari
 * @param {number} anno anno da inserire nell'url
 * @param {boolean} tabellaPerGiorni true per ottenere l'orario organizzato anche per giorni
 * @param {boolean} debug per mostrare in nella console delle informazioni
 */
export async function ottieniOrariAule(anno: string, tabellaPerGiorni: boolean = false, debug = false) {
    try {
        //1: Recupero la lista delle aule
        let aule = await ottieniListaAule()

        //2: Recupero i loro orari
        let orari = await Promise.all(aule.map(async aula => {
            try {
                return {
                    nome: aula,
                    tabelleOrario: await ottieniOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/' + anno + '/' + aula + '.pdf', 1, tabellaPerGiorni, debug)
                }
            } catch (err) {
                return undefined
            }
        }).filter(promessa => promessa != undefined)) as Orario[]

        //3: Ritorno gli orari
        return {
            orari: orari.filter(orario => orario != undefined && orario.tabelleOrario != undefined),
            lista: orari.filter(orario => orario != undefined && orario.tabelleOrario != undefined).map(orario => orario.nome)
        }
    } catch (err) {
        throw 'impossibile recuperare aule e orari'
    }
}

/**
 * Questa funzione permette di ottenere la lista delle aule e tutti i loro orari
 * @param {boolean} tabellaPerGiorni true per ottenere l'orario organizzato anche per giorni
 * @param {boolean} debug per mostrare in nella console delle informazioni
 */
export async function ottieniOrariProfessori(tabellaPerGiorni: boolean = false, debug = false) {
    try {
        //1: Recupero la lista dei professori
        let professori = await ottieniListaProfessori()

        //2: Recupero i loro orari
        let orari = await Promise.all(professori.map(async professore => {
            try {
                return {
                    nome: professore.nome,
                    tabelleOrario: await ottieniOrario('http://www.galileicrema.it:8080' + professore.percorsoOrario, 2, tabellaPerGiorni, debug)
                }
            } catch (err) {
                return undefined
            }
        }).filter(promessa => promessa != undefined)) as Orario[]

        //3: Ritorno gli orari
        return {
            orari: orari.filter(orario => orario != undefined && orario.tabelleOrario != undefined),
            lista: orari.filter(orario => orario != undefined && orario.tabelleOrario != undefined).map(orario => orario.nome)
        }
    } catch (err) {
        throw 'impossibile recuperare aule e orari'
    }
}

/**
 * Funzione ancora in sviluppo!!
 * Questa funzione permette di confrontare due orari, nel caso sia identici ritorna undeifned
 * altrimenti ritorna gli elementi differenti in formato Orario
 * @param orario1 Primo orario da confrontare
 * @param orario2 Secondo orario da confrontare
 */
export function confrontaOrari(orario1: Orario, orario2: Orario): {
    ora: number
    orario1: {
        info1: string[]
        info2: string[]
    }
    orario2: {
        info1: string[]
        info2: string[]
    }
}[] | undefined {
    const differenzePerOre: {
        ora: number
        orario1: {
            info1: string[]
            info2: string[]
        }
        orario2: {
            info1: string[]
            info2: string[]
        }
    }[] = []
    // All'interno dell'orario potrebbe esserci salvata anche la tebella per giorni, noi utilizzeremo solamente la tabella per ore

    // Recupero le tabelle per ore di entrambi gli orari
    const tabellaPerOre1 = orario1.tabelleOrario.tabellaPerOre
    const tabellaPerOre2 = orario2.tabelleOrario.tabellaPerOre

    // Confronto ora per ora
    for (let i = 0; i < 8 /*8 ore di lezione*/; i++) {
        // Controllo se per quest'ora sono presenti degli impegni per i due orari
        const impegniOra1 = tabellaPerOre1.find(elemento => elemento.ora === i)
        const impegniOra2 = tabellaPerOre2.find(elemento => elemento.ora === i)

        // Controllo se entrambi gli impegni dell'ora corrente sono mancanti
        if (impegniOra1 !== undefined && impegniOra2 !== undefined) { // Sono entrambi avalidi
            const differenzeOra: {
                ora: number
                orario1: {
                    info1: string[]
                    info2: string[]
                }
                orario2: {
                    info1: string[]
                    info2: string[]
                }
            } = {
                ora: i,
                orario1: {
                    info1: [],
                    info2: []
                },
                orario2: {
                    info1: [],
                    info2: []
                }
            }
            
            //4: Controllo ciascun giorno
            for(let j = 0; j < 6 /*6 giorni di lezione a settimana*/; j++) {
                //5: Recupero se è presente l'impegno per questo giorno

                // Info 1
                const imegno1info1 = impegniOra1.info1.find(elemento => elemento.giorno === j)
                const imegno2info1 = impegniOra2.info1.find(elemento => elemento.giorno === j)
                
                // Info 2
                const imegno1info2 = impegniOra1.info2.find(elemento => elemento.giorno === j)
                const imegno2info2 = impegniOra2.info2.find(elemento => elemento.giorno === j)

                if (
                    imegno1info1 !== undefined &&
                    imegno2info1 !== undefined &&
                    imegno1info2 !== undefined &&
                    imegno2info2 !== undefined
                ) { //5.1 L'imegno è da controllare
                    //6: Confronto gli impegni
                    if (
                        imegno1info1.nome !== imegno2info1.nome &&
                        imegno1info2.nome !== imegno2info2.nome
                    ) { // Impegni diversi
                        differenzeOra.orario1.info1.push(imegno1info1.nome)
                        differenzeOra.orario1.info2.push(imegno1info2.nome)
                        differenzeOra.orario2.info1.push(imegno2info1.nome)
                        differenzeOra.orario2.info2.push(imegno2info2.nome)
                    }
                } else if (
                    imegno1info1 !== undefined &&
                    imegno1info2 !== undefined
                ) {
                    differenzeOra.orario1.info1.push(imegno1info1.nome)
                    differenzeOra.orario1.info2.push(imegno1info2.nome)
                } else if (
                    imegno2info1 !== undefined &&
                    imegno2info2 !== undefined
                ) {
                    differenzeOra.orario2.info1.push(imegno2info1.nome)
                    differenzeOra.orario2.info2.push(imegno2info2.nome)
                } else {
                    
                }
            }

            if (
                differenzeOra.orario1.info1.length !== 0 &&
                differenzeOra.orario1.info2.length !== 0 &&
                differenzeOra.orario2.info1.length !== 0 &&
                differenzeOra.orario2.info2.length !== 0
            ) {
                differenzePerOre.push(differenzeOra)
            }
        } else if (impegniOra1 !== undefined) { // Solo gli impegni del primo orario sono validi
            differenzePerOre.push({
                ora: i,
                orario1: {
                    info1: impegniOra1.info1.map(info => info.nome),
                    info2: impegniOra1.info2.map(info => info.nome)
                },
                orario2: {
                    info1: [],
                    info2: []
                }
            })
        } else if (impegniOra2 !== undefined) { // Solo gli impegni del secondo orario sono validi
            differenzePerOre.push({
                ora: i,
                orario1: {
                    info1: [],
                    info2: []
                },
                orario2: {
                    info1: impegniOra2.info1.map(info => info.nome),
                    info2: impegniOra2.info2.map(info => info.nome)
                }
            })
        } // Gli impegni di entrambi gli orari sono mancanti, quindi sono diversi
    }

    if (differenzePerOre.length > 0) {
        return differenzePerOre
    } else {
        return undefined
    }
}

//Funzioni secondarie

/**
 * Permette di ottenere le informazioni presenti nel pdf
 * @param {Buffer} buffer 
 */
/*async function estraiInformazioni(buffer: Buffer): Promise < RigaDati[] > {
    let righe: RigaDati[] = []
    return new Promise((resolve, reject) => {
        new pdfreader.PdfReader().parseBuffer(buffer, (err: any, item: any) => {
            if (err) {
                reject(err)
            } else if (item != undefined) {
                //Processo i dati
                if (item.x != undefined && item.y != undefined) {
                    //1: controllo se la riga è già stata registrata
                    let trovato = false
                    righe.forEach(riga => {
                        if (riga.y == item.y) {
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
                    if (!trovato) righe.push({
                        y: item.y,
                        elementi: [{
                            x: item.x,
                            testo: item.text
                        }]
                    })
                }
            } else {
                //I dati sono pronti, li ritorno se non sono vuoti
                if (righe.length > 0) resolve(righe)
                else reject('nessun dato trovato')
            }
        })
    })
}*/

export async function estraiInformazioni(buffer: Buffer): Promise<RigaDati[]> {
    const render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false
    }

    const doc = await pdfjs.getDocument(buffer)

    const numeroPagine = doc.numPages

    console.log('numero pagine', numeroPagine)

    if (numeroPagine >= 1) {
        return doc.getPage(1)
            .then((datiPagina: any) => datiPagina.getTextContent(render_options))
            .then((pagina: {
                items?: {
                    width: number
                    height: number
                    str: string
                    transform: [number, number, number, number, number, number]
                }[]
            }) => {
                if (pagina.items !== undefined) {
                    return pagina.items.map(item => {
                        return {
                            width: item.width,
                            height: item.height,
                            text: item.str,
                            transform: item.transform
                        }
                    }).filter(item => item.text !== ' ')
                } else {
                    return []
                }
            }).then((elementi: {
                width: number
                height: number
                transform: [number, number, number, number, number, number]
                text: string
            }[]) => {
                let righe: RigaDati[] = []

                // Divido gli elementi in righe

                elementi.forEach(elemento => {
                    if (elemento.transform !== undefined) {
                        //1: Controllo se la riga è già stata registrata
                        let trovato = false
                        righe.forEach(riga => {
                            if (riga.y == elemento.transform[4]) {
                                riga.elementi.push({
                                    x: elemento.transform[5],
                                    //y: item.y,
                                    testo: elemento.text
                                })
                                trovato = true
                                return false
                            }
                        })
    
                        //2: altrimenti la aggiungo
                        if (!trovato) righe.push({
                            y: elemento.transform[4],
                            elementi: [{
                                x: elemento.transform[5],
                                testo: elemento.text
                            }]
                        })
                    }
                })

                return righe
            })
    } else {
        return []
    }
}

/**
 * Questa funzione permette di analizzare ed estrarre le infomrazioni e l'orario dai dati recuperati dal pdf
 * @param {RigaDati[]} righe le righe del pdf
 * @param {number} tipo 0 per classi, 1 per aule e 2 per prof 
 */
function analizzaDati(righe: RigaDati[], tipo: number, tabellaPerGiorniRichiesta: boolean = false): TabelleOrario {
    let min: number = 0,
        max: number = 0
    let divisori: number[] = []
    let tabellaPerOre: ElementoTabellaPerOre[] = []

    //1: Trovo il minimo e il massimo valore x dei giorni della settimana che utilizzerò per capire in che giorno si trovano le magterie e le aule
    righe.forEach(riga => {
        if (riga.y == altezzaGiorni[tipo]) {
            riga.elementi.forEach((elemento, i) => {
                if (i == 0) {
                    min = elemento.x
                    max = elemento.x
                } else {
                    if (elemento.x < min) min = elemento.x
                    if (elemento.x > max) max = elemento.x
                }
            })
            return false //Per interrompere il ciclo
        }
    })

    //2: Ora divido i numeri in 6 sezioni
    let spazio = (max - min) / 5
    for (let i = 0; i < 5; i++) {
        divisori.push(min + spazio / 2 + spazio * i)
    }

    //3: A questo punto trovo le informazioni (prima e seconda riga) per ciascuna ora
    altezzeLineeDati[tipo].forEach(altezzaLineaDati => {
        tabellaPerOre.push({
            ora: trasformaOra(altezzaLineaDati.ora),
            info1: dividiRiga(divisori, righe.find(riga => {
                return riga.y == altezzaLineaDati.altezze[0]
            })),
            info2: dividiRiga(divisori, righe.find(riga => {
                return riga.y == altezzaLineaDati.altezze[1]
            }))
        })
    })

    if (tabellaPerGiorniRichiesta) {
        let tabellaPerGiorni: ElementoTabellaPerGiorni[] = []

        //4: Trasformo i dati della divisione per ore a una divisione per giorni
        giorni.forEach((giorno, i) => {
            tabellaPerGiorni.push({
                giorno: giorni.indexOf(giorno),
                info1: [],
                info2: []
            })

            tabellaPerOre.forEach(ora => {
                let tmp = ora.info1.find(info => info.giorno == i)
                tabellaPerGiorni[i].info1.push({
                    nome: (tmp != undefined ? tmp.nome : ''),
                    //nome: (ora.info1[i].nome != undefined ? ora.info1[i].nome : ''),
                    ora: ora.ora
                })

                tmp = ora.info2.find(info => info.giorno == i)
                tabellaPerGiorni[i].info2.push({
                    nome: (tmp != undefined ? tmp.nome : ''),
                    //nome: (ora.info2[i].nome != undefined ? ora.info2[i].nome : ''),
                    ora: ora.ora
                })
            })

            tabellaPerGiorni[i].info1 = tabellaPerGiorni[i].info1.filter(info => info.nome != '')
            tabellaPerGiorni[i].info2 = tabellaPerGiorni[i].info2.filter(info => info.nome != '')
        })

        return {
            tabellaPerOre,
            tabellaPerGiorni
        }
    } else {
        return {
            tabellaPerOre
        }
    }
}

/**
 * Permette di suddividere le rige delle materie e delle aule in base ai dati dei divisori
 * @param {number[]} divisori 
 * @param {RigaDati} riga 
 */
function dividiRiga(divisori: number[], riga ? : RigaDati) {
    let divisioni: InfoOre[] = []
    giorni.forEach(giorno => {
        divisioni.push({
            giorno: giorni.indexOf(giorno),
            nome: ''
        })
    })

    if (riga != undefined) {
        //Lunedì - sabato
        for (let i = -1; i < 5; i++) {
            divisioni[i + 1].nome = riga.elementi.filter(elemento => {
                return (i != -1 ? elemento.x > divisori[i] : true) && (i != 4 ? elemento.x < divisori[i + 1] : true)
            }).map(elemento => elemento.testo.replace(/ /g, '')).join('')
            if (divisioni[i + 1].nome == undefined) divisioni[i + 1].nome = ''
        }
    }

    //TODO: rimuovere tutte le divisioni dove il nome è nullo

    return divisioni.filter(divisione => divisione.nome != '')
}

/**
 * Questa funzione permette di mostrare l'orario in un fomato comprensibile nella console
 * @param {*} tabellaPerOre l'orario diviso per ore
 */
function mostraTabella(tabellaPerOre: ElementoTabellaPerOre[]) {
    //once the table has been parse comletely we can show it in the console nicely

    let tabellaPerConsole: string[][] = []

    tabellaPerOre.forEach(ora => {
        tabellaPerConsole.push(ora.info1.map((info1s, i) => {
            let tmp = ora.info2.find(info2s => info2s.giorno == i)
            if ((info1s != undefined && info1s.nome != undefined) && tmp != undefined && tmp.nome != undefined)
                return info1s.nome + '-' + tmp.nome
            else return '*'
        }))
    })

    console.table(tabellaPerConsole)
}

/**
 * Permette di convertire la dicitura dell'ora in un valore da 0 a 7
 * @param ora ora in formato stringa
 */
function trasformaOra(ora: string) {
    switch (ora) {
        case '1':
            return 0
        case '2':
            return 1
        case '3':
            return 2
        case '4':
            return 3
        case '5':
            return 4
        case '6':
            return 5
        case '1p':
            return 6
        case '2p':
            return 7
        default:
            return NaN
    }
}
