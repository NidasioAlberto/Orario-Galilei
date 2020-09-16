import {
    percorsoPrimario,
    percorsoListaClassi,
    percorsoListaAule,
    percorsoListaProfessori,
    lettereAlfabeto,
    RigaDati,
    giorni,
    Orario,
    etichetteOre,
    numeroMinimoEtichette,
    ElementoTabella,
    Info,
    RisultatoConfronto,
    regexInformazioni,
    regexEntrata
} from "./utils"
import axios from 'axios'
import { version } from "process"
const pdfjs = require('../pdfjs-2.2.228-dist/build/pdf')

/**
 * Lo scopo di questa libreria è di recuperare gli orari del Galilei Crema dai pdf pubblicati sul sito.
 * 
 * Le funzioni principali che il modulo offre sono:
 * - ottieniOrari(Classi|Aule|Professori): recuperano tutti gli orari dal sito
 * - ottieniOrario: dato un url di un pdf restituisce l'orario contenuto del documento
 * - ottieniLista(Classi|Aule|Professori): recupera la lista degli orari con o il loro nome o anche il link al pdf
 */

// Funzioni principali esportate dal modulo

/**
 * Questa funzione permette di ottenere la lista delle classi o delle aule
 * @param {string} urlPaginaDati url per raggiungere la pagina con la lista degli orari
 */
export async function ottieniListaClassiOAule(urlPaginaDati: string) {
    try {
        //!: Recupero i dati della pagina html
        let paginaHtml: string = await axios.get(urlPaginaDati).then(res => res.data)

        //2: Estraggo gli elementi
        let elementi = paginaHtml.match(/Value="(.+)"/g)

        //3: Controllo se ci sono dati disponibili
        if (elementi === null || elementi === undefined) throw Error('Nessun elemento trovato')

        //4: Recupero solo il nome e ritorno
        return elementi.map(elemento => {
            let match = elemento.match(/"(.+)"/)
            if (match != null) return match[1]
            else return null
        }).filter(elemento => elemento != null) as string[] //Rimuovo gli eventuali elementi nulli
    } catch (err) {
        throw Error('Impossibile recuperare la lista degli orari dalla pagina data')
    }
}

/**
 * Questra funzione permette di ottenere la lista dei professori e i link ai loro orari
 * @param {string} urlProf url per raggiungere i dati dei professori
 */
export async function ottieniListaProfessori(urlProf: string = percorsoPrimario + percorsoListaProfessori) {
    try {
        //             1: Per ogni lettera            2: Ottengo la pagina web
        let promesse = lettereAlfabeto.map(lettera => axios.get(urlProf + lettera).then(res => res.data).then((paginaHtml: string) => {
            try {
                //3: Estraggo le informazioni dei professori, quindi nomi e link ai link dei pdf
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
        throw Error('Impossibile recuperare i professori')
    }
}

/**
 * Questa funzione permette di ottenere l'orario di una classe, di un'aula o di un'insegnante dato un url
 * @param {string} urlPdf url per raggiungere l'orario da analizzare
 * @param {number} tipo 0 per classi, 1 per aule e 2 per prof
 * @param {boolean} debug per mostrare in nella console delle informazioni
 */
export async function ottieniOrario(urlPdf: string, nome: string): Promise<Orario> {
    try {
        //1: Scarico il file
        let buffer = await axios.get(urlPdf, {
            responseType: 'arraybuffer'
        }).then(res => res.data)

        //2: Estraggo le informazioni
        let righe = await estraiInformazioni(buffer as Buffer)

        //console.log(JSON.stringify(righe))

        //3: Cambio il formato dei dati
        let orario = analizzaDati(righe, nome)

        //4: Fine! ritorno i dati
        return orario
    } catch (err) {
        throw 'Impossibile recuperare l\'orario, ' + err
    }
}

/**
 * Questa funzione permette di ottenere la lista delle classi e tutti i loro orari
 * @param {number} anno anno da inserire nell'url
 * @param {string} tipo Tipo di orari da recuperare, Classi o Aule
 */
export async function ottieniOrariClassiOAule(anno: string, tipo: 'Classi' | 'Aule') {
    try {
        //1: Recupero la lista degli orari (i nomi)
        let nomiOrari = await ottieniListaClassiOAule(percorsoPrimario + (tipo === 'Classi' ? percorsoListaClassi : percorsoListaAule))

        //2: Recupero i loro orari e controllo quelli che non riesco a recuperare
        let orariNonRecuperati: string[] = []
        let orari = await Promise.all(nomiOrari.map(async nomeOrario => {
            try {
                return await ottieniOrario('https://www.galileicrema.edu.it/extra/orario/' + anno + '/' + nomeOrario + '.pdf', nomeOrario)
            } catch (err) {
                orariNonRecuperati.push(nomeOrario)
                return undefined
            }
        }).filter(promessa => promessa != undefined)) as Orario[]
        orari = orari.filter(orario => orario != undefined && orario.tabella != undefined).map(orario => {
            orario.nome = orario.nome.replace(/ /g, '')
            return orario
        })

        //3: Ritorno gli orari
        return {
            orari: orari,
            lista: orari.map(orario => orario.nome),
            orariNonRecuperati
        }
    } catch (err) {
        throw Error('Impossibile recuperare gli orari richiesti')
    }
}

/**
 * Questa funzione permette di ottenere la lista delle aule e tutti i loro orari
 * @param {boolean} tabellaPerGiorni true per ottenere l'orario organizzato anche per giorni
 * @param {boolean} debug per mostrare in nella console delle informazioni
 */
export async function ottieniOrariProfessori() {
    try {
        // 1: Recupero la lista dei professori
        let professori = await ottieniListaProfessori()

        // 2: Recupero i loro orari e controllo quelli che non riesco a recuperare
        let orariNonRecuperati: string[] = []
        let orari = await Promise.all(professori.map(async professore => {
            try {
                return await ottieniOrario('http://www.galileicrema.it:8080' + professore.percorsoOrario, professore.nome)
            } catch (err) {
                orariNonRecuperati.push(professore.nome)
                return undefined
            }
        }).filter(promessa => promessa != undefined)) as Orario[]
        orari = orari.filter(orario => orario != undefined && orario.tabella != undefined)

        // 3: Sistemo le lettere dei nomi a tutte minuscole e solo le iniziali maiuscole
        orari.map(orario => {
            const nomi = orario.nome.split(' ')

            orario.nome = nomi.map(nome => {
                nome = nome.toLowerCase()
                return nome.charAt(0).toUpperCase() + nome.slice(1)
            }).reduce((acc, nome, i) => {
                acc += nome
                if (i < nomi.length - 1) acc += ' '
                return acc
            }, '')

            return orario
        })

        // 4: Ritorno gli orari
        return {
            orari: orari,
            lista: orari.map(orario => orario.nome),
            orariNonRecuperati
        }
    } catch (err) {
        throw Error('Impossibile recuperare gli orari richiesti')
    }
}

/**
 * Questa funzione permette di confrontare due orari, nel caso siano identici ritorna undefined
 * altrimenti ritorna le coordinate degli elementi differenti (ora, giorno)
 * @param orario1 Primo orario da confrontare
 * @param orario2 Secondo orario da confrontare
 */
export function confrontaOrari(orario1: Orario, orario2: Orario): RisultatoConfronto[] | undefined {
    const differenze: RisultatoConfronto[] = []
    // All'interno dell'orario potrebbe esserci salvata anche la tebella per giorni, noi utilizzeremo solamente la tabella per ore

    // Confronto ora per ora
    for (let i = 0; i < 8; i++) {
        // Controllo se per quest'ora sono presenti degli impegni per i due orari
        const impegniOra1 = orario1.tabella.find(elemento => elemento.ora === i);
        const impegniOra2 = orario2.tabella.find(elemento => elemento.ora === i);

        // Controllo se entrambi gli impegni dell'ora corrente sono mancanti
        if (impegniOra1 !== undefined && impegniOra2 !== undefined) { // Sono entrambi validi
            // 1: Controllo ciascun giorno
            for (let j = 0; j < 6; j++) {
                // 2: Recupero se è presente l'impegno per questo giorno
                const orario1InfoGiorno = impegniOra1.info.find(elemento => elemento.giorno === j)
                const orario2InfoGiorno = impegniOra2.info.find(elemento => elemento.giorno === j)

                if (orario1InfoGiorno !== undefined && orario2InfoGiorno !== undefined) { //5.1 L'imegno è da controllare
                    //6: Confronto gli impegni
                    if (orario1InfoGiorno.elementi.length !== orario2InfoGiorno.elementi.length) { // Impegni diversi
                        differenze.push({
                            ora: i,
                            giorno: j
                        })
                    } else {
                        // Controllo il contetnuto degli elementi
                        const diversi = orario1InfoGiorno.elementi.reduce((acc, elemento1, k) => {
                            if (elemento1 !== orario2InfoGiorno.elementi[k]) {
                                return true
                            } else {
                                return acc
                            }
                        }, false) // Parto supponendo che non siano diversi

                        if (diversi) {
                            differenze.push({
                                ora: i,
                                giorno: j
                            })
                        }
                    }
                } else if (orario1InfoGiorno !== undefined) {
                    differenze.push({
                        ora: i,
                        giorno: j
                    })
                } else if (orario2InfoGiorno !== undefined) {
                    differenze.push({
                        ora: i,
                        giorno: j
                    })
                } else {
                    // Se sono entrambi undefined allora sono identici
                }
            }
        } else if (impegniOra1 !== undefined) { // Solo gli impegni del primo orario sono validi
            differenze.concat(impegniOra1.info.map(inf => {
                return {
                    ora: i,
                    giorno: inf.giorno
                } as RisultatoConfronto
            }))
        } else if (impegniOra2 !== undefined) { // Solo gli impegni del secondo orario sono validi
            differenze.concat(impegniOra2.info.map(inf => {
                return {
                    ora: i,
                    giorno: inf.giorno
                } as RisultatoConfronto
            }))
        } // Gli impegni di entrambi gli orari sono mancanti, quindi sono uguali
    }

    if (differenze.length > 0) {
        return differenze
    } else {
        return undefined
    }
}

//Funzioni secondarie

/**
 * Permette di ottenere le informazioni presenti nel pdf, lascia le stringhe come le trova
 * @param {Buffer} buffer 
 */
export async function estraiInformazioni(buffer: Buffer): Promise<RigaDati[]> {
    const render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false
    }

    //TODO: Controllare anche i metadati (cioè?)

    const doc = await pdfjs.getDocument(buffer).promise

    const numeroPagine = doc.numPages

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
                            if (Math.abs(riga.y - elemento.transform[4]) <= 1) {
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
 * Questa funzione permette di analizzare ed estrarre le informazioni e l'orario dai dati recuperati dal pdf
 * @param {RigaDati[]} righe Le righe del pdf
 * @param {string} nome Nome da inserire nell'orario
 */
export function analizzaDati(righe: RigaDati[], nome: string): Orario {

    // 1: Trovo la riga con SOLO i giorni della settimana
    const rigaGiorni = righe.find(riga => {
        // N.B. Questo questa parte richiede che i giorni nella tabella del pdf siano per forza quelli impostati come giorni
        // si potrebbe modificare per renderlo più flessibile

        // Controllo innanzi tutto se gli elementi della riga sono uguali ai giorni della settimana
        if (riga.elementi.length === giorni.length) {
            // Continuo controllando quali giorni sono presenti come elementi
            const giorniPresenti = giorni.map(giorno => {
                return riga.elementi.find(elemento => {
                    return elemento.testo === giorno
                })
            }).filter(giorno => giorno !== undefined)

            if (giorniPresenti.length !== giorni.length) {
                return false
            }

            return true
        } else {
            // Se non sono lo stesso numero non è sicuramente questa la linea
            return false
        }
    })

    // 2: Contorollo il risultato della scorsa operazione
    if (rigaGiorni === undefined) throw Error('Riga giorni non trovata') // La riga giorni non è stata trovata all'interno del pdf, ritorno un errore

    // 3: Trovo le righe con le etichette delle ore
    let etichetteOreDaTrovare = [...etichetteOre]
    const righeEtichetteOre = righe.map(riga => {
        // Parto dalla riga successiva a quella dei giorni

        // Controllo se la riga contiene l'etichetta di un'ora
        const elementoEtichetta = riga.elementi.find(elemento => { // Controllo in tutti gli elementi della riga
            const etichetta = elemento.testo.replace(/ /g, '') // Elimino eventuali spazi
            return etichetteOreDaTrovare.includes(etichetta) // Controllo se l'elemento è una etichetta, se sì l'ho trovato
        })

        // Se ho trovato l'etichetta la rimuovo da quelle ancora da trovare
        if (elementoEtichetta !== undefined) {
            etichetteOreDaTrovare.splice(etichetteOreDaTrovare.indexOf(elementoEtichetta.testo.replace(/ /g, '')), 1)

            return {
                x: elementoEtichetta.x,
                y: riga.y,
                testo: elementoEtichetta.testo,
                index: etichetteOre.indexOf(elementoEtichetta.testo.replace(/ /g, ''))
            }
        }

        return undefined
    }).filter(etichetta => etichetta !== undefined) as {
        x: number;
        y: number;
        testo: string;
        index: number;
    }[]
    righeEtichetteOre.sort((a, b) => a.index - b.index)

    // 4: Controllo che il numero di etichette trovare sia maggiore o uguale del limite minimo e non superiore al numero delle etichette
    if (righeEtichetteOre === undefined || righeEtichetteOre.length === 0) {
        // Le righe delle etichette ore non sono state trovate
        throw Error('Etichette ore non trovate')
    } else if (righeEtichetteOre.length < numeroMinimoEtichette || righeEtichetteOre.length > etichetteOre.length) {
        // Altrimenti o ne sono state trovate poche o troppe
        throw Error('Errore nella ricerca delle etichette ore, trovate ' + righeEtichetteOre.length + ' etichette')
    }

    // 3.2: Trovo il valore massimo della coordinata x delle etichette
    const maxXEtichetteOre = righeEtichetteOre.reduce((acc, elem) => {
        if (acc < elem.x) {
            return elem.x
        } else {
            return acc
        }
    }, 0)

    // N.B. Se arriviamo a questo punto abbiamo la riga dei giorni e le righe dove si trovano le etichette delle ore
    let min: number = 0
    let max: number = 0

    // 5: Calcolo la divisione delle colonne
    let divisoriGiorni: number[] = []

    // 5.1: Trovo il minimo e il massimo valore della coordinata x dei giorni della settimana che utilizzerò per capire in che giorno si trovano le info
    rigaGiorni.elementi.forEach((elemento, i) => {
        if (i == 0) {
            min = elemento.x
            max = elemento.x
        } else {
            if (elemento.x < min) min = elemento.x
            if (elemento.x > max) max = elemento.x
        }
    })

    // 5.2: Ora divido i numeri per il numero di giorni
    const spazioGiorni = (max - min) / (giorni.length - 1)
    for (let i = 0; i <= giorni.length; i++) {
        if (i === 0) {
            divisoriGiorni.push(maxXEtichetteOre) // Parto dalla posizione massima delle etichette, le info non potranno essere prima di loro
        } else {
            divisoriGiorni.push(min - spazioGiorni / 2 + spazioGiorni * i)
        }
    }

    // 6: Calcolo la divisione delle righe
    let divisoriOre: {
        start: number
        end: number
        index: number
    }[] = []

    // 6.2: Creo i divisori
    // N.B. Questi divisori saranno diversi da quelli dei giorni, per come è fatta la tabella devo avere anche gli estremi esterni,
    //      non solo i divisori interni
    const spazioOre = (righeEtichetteOre[righeEtichetteOre.length - 1].y - righeEtichetteOre[0].y) / (righeEtichetteOre.length - 1)
    const maxYOre = righeEtichetteOre[righeEtichetteOre.length - 1].y + (spazioOre / 2)
    const minYOre = righeEtichetteOre[0].y - (spazioOre / 2)
    for (let i = 0; i < righeEtichetteOre.length; i++) { // Parto dall'estremo sinistro e arrivo a quello destro passando per i divisori
        divisoriOre.push({
            start: righeEtichetteOre[0].y - (spazioOre / 2) + (spazioOre * i),
            end: righeEtichetteOre[0].y - (spazioOre / 2) + (spazioOre * (i + 1)),
            index: righeEtichetteOre[i].index
        })
    }

    // 7: Ora trovo le righe all'interno dei divisori ore
    let righeOre: RigaDati[][] = [] // [ora][righe]
    for (let i = 0; i < righeEtichetteOre.length; i++) righeOre.push([]) // Riempo l'array con 7 elementi vuoti
    righe.forEach(riga => {
        // Test, Controllo se la riga corrente ricade in qualche divisore ore
        const divisoreRiga = divisoriOre.find(divisore => riga.y > Math.min(divisore.start, divisore.end) && riga.y < Math.max(divisore.start, divisore.end))
        if (divisoreRiga !== undefined) {
            righeOre[divisoreRiga.index].push(riga)
        }
    })

    // 8: Per ciascuna riga di ciascuna ora trovo le info di caiscun giorno
    let tabella: ElementoTabella[] = righeOre.map((righeOra, i) => { // righe dell'ora i
        const info: Info[] = []

        for (let i = 0; i < divisoriGiorni.length - 1; i++) {
            info.push({
                giorno: i,
                elementi: righeOra.map(riga => {
                    const elementiGiorno = riga.elementi.filter(elemento => elemento.x > divisoriGiorni[i] && elemento.x <= divisoriGiorni[i + 1])
                    const info = elementiGiorno.reduce((acc, elemento) => acc += elemento.testo, '').replace(/ /g, '') // Concateno tutto quello che si strova sulla stessa riga
                    return info
                }).filter(elemento => elemento !== '') as string[]
            })
        }

        return {
            ora: i,
            // Rimuovo le info con nessun elemento
            info: info.filter(inf => inf.elementi.length > 0)
        } as ElementoTabella
    }).filter(elemento => elemento.info.length > 0) // Rimuovo gli elementi senza info

    // 9: Recupero le altre informazioni come versione, data, ecc...
    const righeCollassate = righe.map(riga => {
        // Concateno tutto il contenuto della riga
        return riga.elementi.reduce((acc, elemento) => acc += elemento.testo, '')
    })

    const testoRigaInformazioni = righeCollassate.find(testoRiga => {
        // Controllo se contine gli elementi
        return testoRiga.match(/Aggiornamento/)
    })

    // Controllo se è presente l'entrata per le classi
    const testoRigaEntrata = righeCollassate.find(testoRiga => {
        // Controllo se contine gli elementi
        return testoRiga.match(/entrata/i)
    })

    let dataAggiornamento, dataValidita, versione, entrata

    if (testoRigaInformazioni) {
        // Recupero le informazioni dal testo
        const match = testoRigaInformazioni.match(regexInformazioni)

        if (match) {
            // Se le informazioni sono presenti le salvo
            dataAggiornamento = new Date(
                (Number(match[3]) < 2000 ? Number(match[3]) + 2000 : Number(match[3])),
                Number(match[2]) - 1,
                Number(match[1])
            )

            dataValidita = new Date(
                (Number(match[7]) < 2000 ? Number(match[7]) + 2000 : Number(match[7])),
                Number(match[6]) - 1,
                Number(match[5])
            )

            versione = match[4]

        }
    }

    if (testoRigaEntrata) {
        // Recuper le informazioni
        const match = testoRigaEntrata.match(regexEntrata)

        if(match) {
            entrata = match[1].trim()
            entrata = entrata.charAt(0).toUpperCase() + entrata.slice(1)
        }
    }

    let risultato: Orario = {
        nome, tabella
    }

    if(dataAggiornamento !== undefined) risultato.dataAggiornamento = dataAggiornamento
    if(dataValidita !== undefined) risultato.dataValidita = dataValidita
    if(versione !== undefined) risultato.versione = versione
    if(entrata !== undefined) risultato.entrata = entrata

    return risultato
}

/**
 * Questa funzione permette di mostrare l'orario in un fomato comprensibile nella console
 * @param {*} tabellaPerOre l'orario diviso per ore
 */
export function mostraOrario(orario: Orario) {
    //once the table has been parse comletely we can show it in the console nicely

    let tabellaPerConsole: string[][] = []

    etichetteOre.map((etichettaOra, i) => {
        const ora = orario.tabella.find(elemento => elemento.ora === i)
        tabellaPerConsole.push(giorni.map((giorno, i) => {
            let info: string[] = []
            if (ora !== undefined && ora.info !== undefined) {
                const infoGiorno = ora.info.find(info => info.giorno == i)
                if (infoGiorno !== undefined && infoGiorno.elementi !== undefined) info = infoGiorno.elementi
            }
            let messaggio = '';
            if (info.length === 0) {
                messaggio = '*'
            } else {
                messaggio = info.reduce((acc, inf, i) => {
                    acc += inf
                    if (i < info.length - 1) acc += '-'
                    return acc
                }, '')
            }
            return messaggio;
        }));
    })

    console.log(orario.nome);
    if (orario.versione !== undefined) console.log('Versione: ' + orario.versione)
    if (orario.dataAggiornamento !== undefined) console.log('Data aggiornamento: ' + orario.dataAggiornamento.toDateString())
    if (orario.dataValidita !== undefined) console.log('Data validità: ' + orario.dataValidita.toDateString())
    if (orario.entrata !== undefined) console.log('Entrata: ' + orario.entrata)
    console.table(tabellaPerConsole)
}