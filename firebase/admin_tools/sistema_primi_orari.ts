import * as admin from 'firebase-admin'

const serviceAccount = require("./admin_key.json")

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://orario-galilei.firebaseio.com"
})

const firestore = admin.firestore(app)

firestore.collection('Classi').get().then(query => {
    query.docs.forEach(doc => {
        doc.ref.collection('Storico').get().then(query2 => {
            console.log('Elemento padre', doc.data()['nome'])
            if(doc.data()['nome'] === undefined) return 
            console.log('Numero elementi storico', query2.docs.length)
            query2.docs.forEach(doc2 => {
                const data = doc2.data()
                var modificato = false

                if (data['dataValidita'] !== undefined) console.log('Data validità', (data['dataValidita'] as admin.firestore.Timestamp).toDate().toDateString())
                else {
                    console.log('Data validità mancante, la aggiungo impostandola a 12/09/2019')
                    data['dataValidita'] = new Date('2019-09-12')
                    modificato = true
                }

                if (data['tabella'] === undefined && data['tabelleOrario'] !== undefined) {
                    console.log('Tabella non presente mentre tabella orario presente, converto')

                    var tabella: {
                        ora: number;
                        info: {
                            giorno: number;
                            elementi: string[];
                        }[];
                    }[] = []
                    const tabellaPerOre = data['tabelleOrario']['tabellaPerOre'] as {
                        ora: number
                        info1: {
                            giorno: number
                            nome: string
                        }[]
                        info2: {
                            giorno: number
                            nome: string
                        }[]
                    }[]

                    tabellaPerOre.forEach(elemOra => {
                        var elemOraNuovo: {
                            ora: number;
                            info: {
                                giorno: number;
                                elementi: string[];
                            }[];
                        } = {
                            ora: elemOra.ora,
                            info: []
                        }

                        elemOra.info1.forEach(info => {
                            elemOraNuovo.info.push({
                                giorno: info.giorno,
                                elementi: [
                                    info.nome,
                                    elemOra.info2[elemOra.info1.indexOf(info)].nome
                                ]
                            })
                        })

                        tabella.push(elemOraNuovo)
                    })

                    data['tabella'] = tabella
                }

                if (data['tabelleOrario'] !== undefined && data['tabella'] !== undefined) {
                    console.log('Tabella orario presente, la rimuovo')
                    delete data['tabelleOrario']
                    modificato = true
                }

                if(data['versione'] === undefined) {
                    console.log('Versione mancante, la imposto a 1.0')
                    data['versione'] = '1.0'
                    modificato = true
                }

                if (modificato) {
                    console.log('Dati modificati, li aggiorno')
                    doc2.ref.set(data).then(() => {
                        console.log('Orario aggiornato')
                    })
                }
            })
        })
    })
})