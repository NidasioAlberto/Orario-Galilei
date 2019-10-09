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
} from "./utils"
import axios from 'axios'
const pdfjs = require('../pdfjs-2.1.266-dist/build/pdf')

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
export async function ottieniOrario(urlPdf: string, nome: string): Promise<Orario> {
    try {
        //1: Scarico il file
        //let buffer = await fetch(urlPdf).then(res => res.arrayBuffer())
        let buffer = await axios.get(urlPdf, {
            responseType: 'arraybuffer'
        }).then(res => res.data)

        //2: Estraggo le informazioni
        let righe = await estraiInformazioni(buffer as Buffer)

        //3: cambio il formato dei dati
        let orario = analizzaDati(righe, nome)

        //4: fine! ritorno i dati
        return orario
    } catch (err) {
        throw 'Impossibile recuperare l\'orario, ' + err
    }
}

/**
 * Questa funzione permette di ottenere la lista delle classi e tutti i loro orari
 * @param {number} anno anno da inserire nell'url
 * @param {boolean} tabellaPerGiorni true per ottenere l'orario organizzato anche per giorni
 * @param {boolean} debug debug per mostrare nella console delle informazioni
 */
export async function ottieniOrariClassi(anno: string) {
    try {
        //1: Recupero la lista delle classi
        let classi = await ottieniListaClassi()

        //2: Recupero i loro orari
        let orari = await Promise.all(classi.map(async classe => {
            try {
                return await ottieniOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/' + anno + '/' + classe + '.pdf', classe)
            } catch (err) {
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
            lista: orari.map(orario => orario.nome)
        }
    } catch (err) {
        throw 'impossibile recuperare classi e orari, ' + err
    }
}

/**
 * Questa funzione permette di ottenere la lista delle aule e tutti i loro orari
 * @param {number} anno anno da inserire nell'url
 * @param {boolean} tabellaPerGiorni true per ottenere l'orario organizzato anche per giorni
 * @param {boolean} debug per mostrare in nella console delle informazioni
 */
export async function ottieniOrariAule(anno: string) {
    try {
        //1: Recupero la lista delle aule
        let aule = await ottieniListaAule()

        //2: Recupero i loro orari
        let orari = await Promise.all(aule.map(async aula => {
            try {
                return await ottieniOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/' + anno + '/' + aula + '.pdf', aula)
            } catch (err) {
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
            lista: orari.map(orario => orario.nome)
        }
    } catch (err) {
        throw 'impossibile recuperare aule e orari, ' + err
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

        console.table(professori)

        // 2: Recupero i loro orari
        let orari = await Promise.all(professori.map(async professore => {
            try {
                return await ottieniOrario('http://www.galileicrema.it:8080' + professore.percorsoOrario, professore.nome)
            } catch (err) {
                console.log(professore.nome, err)
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
            lista: orari.map(orario => orario.nome)
        }
    } catch (err) {
        throw 'impossibile recuperare aule e orari, ' + err
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
 * Questa funzione permette di analizzare ed estrarre le infomrazioni e l'orario dai dati recuperati dal pdf
 * @param {RigaDati[]} righe le righe del pdf
 * @param {number} tipo 0 per classi, 1 per aule e 2 per prof 
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
    if (rigaGiorni === undefined) {
        // La riga giorni non è stata trovata la riga con i giorni all'interno del pdf, ritorno un errore
        throw 'Riga giorni non trovata'
    }

    // 3: Trovo le righe con le etichette delle ore
    let etichetteOreDaTrovare = [...etichetteOre]
    const righeEtichetteOre = righe.map(riga => {
        // Parto dalla riga successiva a quella dei giorni
        if (riga.y > rigaGiorni.y) { // Questo funziona anche nel caso le righe non siano ordinate per y
            // Controllo se la riga contiene l'etichetta di un'ora
            const elementoEtichetta = riga.elementi.find(elemento => {
                const etichetta = elemento.testo.replace(/ /g, '') // Elimino tutti gli spazi

                return etichetteOreDaTrovare.includes(etichetta)
            })

            if (elementoEtichetta !== undefined) {
                // Rimuovo l'etichetta da quelle ancora da trovare
                etichetteOreDaTrovare.splice(etichetteOreDaTrovare.indexOf(elementoEtichetta.testo.replace(/ /g, '')), 1)

                return {
                    x: elementoEtichetta.x,
                    y: riga.y,
                    testo: elementoEtichetta.testo
                }
            }
        }
        return undefined
    }).filter(etichetta => etichetta !== undefined) as {
        x: number;
        y: number;
        testo: string;
    }[]

    // 4: Controllo che il numero di etichette trovare sia maggiore o uguale del limite minimo e non superiore al numero delle etichette
    if (righeEtichetteOre === undefined || righeEtichetteOre.length === 0) {
        // La riga giorni non è stata trovata la riga con i giorni all'interno del pdf, ritorno un errore
        throw Error('Etichette ore non trovate')
    } else if (righeEtichetteOre.length < numeroMinimoEtichette || righeEtichetteOre.length > etichetteOre.length) {
        // Altrimenti o ne sono state trovate poche o troppe
        throw Error('Errore nella ricerca delle etichette ore, trovate ' + righeEtichetteOre.length + ' etichette')
    }

    // 3.2: Trovo il valore massimo x delle etichette
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

    // 5.1: Trovo il minimo e il massimo valore x dei giorni della settimana che utilizzerò per capire in che giorno si trovano le info
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
    let divisoriOre: number[] = []

    // 6.1: Trovo il massimo e il minimo dei valori y delle righe con le etichette (ovviamente il minimo sarà la riga con la prima ora
    // e il massimo quella con l'ultima ora)
    righeEtichetteOre.forEach((riga, i) => {
        if (i == 0) {
            min = riga.y
            max = riga.y
        } else {
            if (riga.y < min) min = riga.y
            if (riga.y > max) max = riga.y
        }
    })

    // 6.2: Creo i divisori
    // N.B. Questi divisori saranno diversi da quelli dei giorni, per come è fatta la tabella devo avere anche gli estremi esterni,
    //      non solo i divisori interni
    const spazioOre = (max - min) / (righeEtichetteOre.length - 1)
    const minYOre = min - (spazioOre / 2)
    const maxYOre = max + (spazioOre / 2)
    for (let i = 0; i <= righeEtichetteOre.length; i++) { // Parto dall'estremo sinistro e arrivo a quello destro passando per i divisori
        divisoriOre.push(min - (spazioOre / 2) + (spazioOre * i))
    }

    // 7: Ora trovo le righe all'interno dei divisori ore
    let righeOre: RigaDati[][] = [] // [ora][righe]
    for (let i = 0; i < righeEtichetteOre.length; i++) righeOre.push([])
    righe.forEach(riga => {
        if (minYOre < riga.y && riga.y <= maxYOre) {
            const oraCorrente = Math.floor((riga.y - minYOre) / spazioOre)

            righeOre[oraCorrente].push(riga)
        }
    })

    // 8: Per ciascuna riga di ciascuna ora trovo le info di ciscun giorno
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
    const testoRigaInformazioni = righe.map(riga => {
        // Concateno tutto il contenuto della riga
        return riga.elementi.reduce((acc, elemento) => acc += elemento.testo, '')
    }).find(testoRiga => {
        // Controllo se contine gli elementi
        return testoRiga.match(/Aggiornamento/)
    })

    if (testoRigaInformazioni) {
        // Recupero le informazioni dal testo
        const match = testoRigaInformazioni.match(/Aggiornamento.+(\d\d)[\/\.](\d\d)[\/\.](\d+).+v.+(\d+).+(\d+).+Valido.+dal.+(\d\d)[\/\.](\d\d)[\/\.](\d+)/)

        if (match) {
            // Se le informazioni sono presenti le salvo
            const dataAggiornamento = new Date(
                (Number(match[3]) < 2000 ? Number(match[3]) + 2000 : Number(match[3])),
                Number(match[2]) - 1,
                Number(match[1])
            )

            const dataValidita = new Date(
                (Number(match[8]) < 2000 ? Number(match[8]) + 2000 : Number(match[8])),
                Number(match[7]) - 1,
                Number(match[6])
            )

            const versione = Number(match[4]) + Number(match[5]) / ((Math.floor(Math.log10(Number(match[5]))) + 1) * 10)

            return {
                nome,
                tabella,
                dataAggiornamento,
                dataValidita,
                versione
            }
        }
    }

    return {
        nome,
        tabella
    }
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
    if (orario.versione !== undefined) console.log('Versione: ', orario.versione)
    if (orario.dataAggiornamento !== undefined) console.log('Data aggiornamento: ', orario.dataAggiornamento.toDateString())
    if (orario.dataValidita !== undefined) console.log('Data validità: ', orario.dataValidita.toDateString())
    console.table(tabellaPerConsole)
}