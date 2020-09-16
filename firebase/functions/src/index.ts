import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import { ottieniOrariClassiOAule, ottieniOrariProfessori, confrontaOrari } from 'parser-orario-galilei'
import { Orario } from 'parser-orario-galilei/lib/utils'

import { ImpostazioniCloudFunction } from './utils/impostazioni-cloud-function'
import { LogOrari } from './utils/log-orari.model'
import { Indici } from './utils/indici.model'
import { OrarioFirestore } from './utils/orario.model'

admin.initializeApp()
const firestore = admin.firestore()
const bucket = admin.storage().bucket()

// Funzione per spostare nella collection storico tutti gli orari attualmente salvati nelle collection Classi, Aule e Professori. Usata alla fine dell'anno scolastico
export const concludiAnno = functions.region('europe-west2').firestore.document('Storico/{annoScolastico}').onCreate(async (change, context) => {
    // Imposto lo stato a "salvataggio iniziato"
    await change.ref.update({ stato: 'Salvataggio iniziato' })

    // Recupero gli indici da Firestore
    const classi = await firestore.collection('Classi').doc('Indici').get().then(doc => doc.data() as Indici)
    const aule = await firestore.collection('Aule').doc('Indici').get().then(doc => doc.data() as Indici)
    const professori = await firestore.collection('Professori').doc('Indici').get().then(doc => doc.data() as Indici)

    // Svuoto gli indici
    await firestore.collection('Classi').doc('Indici').set({ lista: [], ultimoAggiornamento: admin.firestore.Timestamp.now() })
    await firestore.collection('Aule').doc('Indici').set({ lista: [], ultimoAggiornamento: admin.firestore.Timestamp.now() })
    await firestore.collection('Professori').doc('Indici').set({ lista: [], ultimoAggiornamento: admin.firestore.Timestamp.now() })

    // Copio gli indici nello storico
    await firestore.collection('Storico').doc(context.params.annoScolastico).collection('Classi').doc('Indici').set(classi)
    await firestore.collection('Storico').doc(context.params.annoScolastico).collection('Aule').doc('Indici').set(aule)
    await firestore.collection('Storico').doc(context.params.annoScolastico).collection('Professori').doc('Indici').set(professori)

    // Sposto gli orari nello storico
    await Promise.all(classi.lista.map(async docId => spostaOrario(docId, context.params.annoScolastico, 'Classi')))
    await Promise.all(aule.lista.map(async docId => spostaOrario(docId, context.params.annoScolastico, 'Aule')))
    await Promise.all(professori.lista.map(async docId => spostaOrario(docId, context.params.annoScolastico, 'Professori')))

    // Aggiorno lo stato a "salvataggio completato"
    await change.ref.update({ stato: 'Salvataggio completato', dataSalvataggio: admin.firestore.Timestamp.now() })
})

async function spostaOrario(docId: string, annoScolastico: string, collection: string) {
    // Per ogni orario bisogna spostare il documento e la subcollection storico (che contiene le varie versioni degli orari)
    // Nella collection Storico le varie versioni di un dato orario saranno contenute tutte in un unico documento e non più in subcollection

    // Recuper l'orario
    const docRef = firestore.collection(collection).doc(docId)
    const doc = await docRef.get();

    // Recupero le versioni dell'orario presenti nella subcollection Storico
    const storicoVersioni = await docRef.collection('Storico').get()
    const versioni = await Promise.all(storicoVersioni.docs.map(async doc_ => {
        // Recupero l'orario
        let data = doc_.data() as OrarioFirestore

        // Elimino il documento
        await doc_.ref.delete()

        return data
    }))

    // Aggiungo alle versioni l'ultima presente dei dati del documento
    versioni.push(doc.data() as OrarioFirestore)

    // Elimino l'orario
    await docRef.delete()

    // Salvo il nuovo documento
    await firestore.collection('Storico').doc(annoScolastico).collection(collection).doc(docId).set({ versioni })
}

// Funzione per sincronizzare gli orari
export const sincronizzaOrari = functions.runWith({
    memory: '1GB',
    timeoutSeconds: 300
}).region('europe-west2').firestore.document('Sincronizzazioni/{idRichiesta}').onCreate(async (change, context) => {
    // Imposto lo stato della richiesta a "Sincronizzazione iniziata"
    await change.ref.update({ stato: "Sincronizzazione avviata" })

    // Preparo il file json degli orari
    try {
        // Sincronizzo gli orari di classi, aule e professori
        await _sincronizzaOrari('Classi')
        await _sincronizzaOrari('Aule')
        await _sincronizzaOrari('Professori')

        await preparaBackupOrari()

        // Aggiorno lo stato della richiesta a "Sincronizzazione attivata"
        // TODO: inserisco i risultati ottenuti
        await change.ref.update({ stato: "Sincronizzazione completata", dataSincronizzazione: admin.firestore.Timestamp.now() })
    } catch (err) {
        // Aggiorno lo stato della richiesta a "Sincronizzazione fallita"
        await change.ref.update({ stato: "Sincronizzazione fallita", dataSincronizzazione: admin.firestore.Timestamp.now(), errore: String(err) })
    }

})

async function _sincronizzaOrari(collection: 'Classi' | 'Aule' | 'Professori') {
    try {
        console.time(collection)

        let orari: {
            orari: Orario[];
            lista: string[];
            orariNonRecuperati: string[];
        } | undefined = undefined

        // Recupero gli orari
        if (collection === 'Classi') {
            // Recupero le impostaziono per le cloud function
            const anno = ((await firestore.collection('Impostazioni generali').doc('Cloud function').get()).data() as ImpostazioniCloudFunction).anno
            if (anno === undefined) throw Error('Impostazioni cloud function mancanti')
            console.log('Anno: ' + anno)
            orari = await ottieniOrariClassiOAule(anno, 'Classi')
        } else if (collection === 'Aule') {
            // Recupero le impostaziono per le cloud function
            const anno = ((await firestore.collection('Impostazioni generali').doc('Cloud function').get()).data() as ImpostazioniCloudFunction).anno
            if (anno === undefined) throw Error('Impostazioni cloud function mancanti')
            console.log('Anno: ' + anno)
            orari = await ottieniOrariClassiOAule(anno, 'Aule')
        } else if (collection === 'Professori') {
            orari = await ottieniOrariProfessori()
        }

        if (orari === undefined) throw Error('Orari non definiti, collection utilizzata: ' + collection) // Probabilemtne ci sarà un errore prima

        // Aggiungo tutti gli orari nel database
        const risultati = await Promise.all(orari.orari.map(async orario => {
            // Recupero l'orario attualmente salvato nel database per confrontarlo con quello appena recuperato
            const docRef = firestore.collection(collection).doc(orario.nome)
            const doc = await docRef.get()
            const orarioSalvato = doc.data() as Orario | undefined

            // Confronto i due orari
            let uguali = false // True se gli orari sono uguali
            if (orarioSalvato !== undefined && orarioSalvato.tabella !== undefined) {
                uguali = confrontaOrari(orarioSalvato, orario) === undefined
            }

            // Se gli orari sono diversi salvo quello precedente nello storico (se non è nullo)
            if (!uguali && orarioSalvato !== undefined) {
                await firestore.collection(collection).doc(orario.nome).collection('Storico').add(orarioSalvato)
            } // Altrimenti non c'è niente da salvare, mi risparmi un'operazione di scrittura

            // E salvo quello nuovo
            if (doc.exists) { // Se il documento già esiste lo aggiorno
                await docRef.update({
                    ...orario,
                    ultimoAggiornamento: admin.firestore.Timestamp.now()
                })
            } else { // Altrimenti lo assegno (creo)
                await docRef.set({
                    ...orario,
                    ultimoAggiornamento: admin.firestore.Timestamp.now()
                })
            }

            return {
                nome: orario.nome,
                modificato: !uguali
            }
        }))

        // Recupero gli elementi modificati
        const risultatiPositiivi = risultati.filter(elemento => elemento.modificato).map(elemento => elemento.nome)
        const risultatiNegtivi = risultati.filter(elemento => !elemento.modificato).map(elemento => elemento.nome)

        console.log('Elementi modificati', risultatiPositiivi.length, risultatiPositiivi)
        console.timeEnd(collection)

        await firestore.collection(collection).doc('Indici').update({
            lista: admin.firestore.FieldValue.arrayUnion(...orari.lista),
            ultimoAggiornamento: admin.firestore.Timestamp.now()
        })

        console.log('Aggiornati ' + orari.lista.length + ' orari nel database con successo')

        //Per ultimo salvo un documento di log
        const log: LogOrari = {
            cloudFunction: 'sincoronizza' + collection,
            stato: 'ok',
            orariModificati: risultatiPositiivi,
            orariNonModificati: risultatiNegtivi,
            orariNonRecuperati: orari.orariNonRecuperati,
            data: admin.firestore.Timestamp.now()
        }
        await firestore.collection('Log').add(log)
    } catch (err) {
        // Salvo un log di errore
        const log: LogOrari = {
            cloudFunction: 'sincoronizza' + collection,
            stato: 'err',
            messaggioErrore: err.toString(),
            data: admin.firestore.Timestamp.now()
        }
        await firestore.collection('Log').add(log)
        throw err
    }
}

async function preparaBackupOrari() {
    // Recupero gli indici da Firestore
    const classi = await firestore.collection('Classi').doc('Indici').get().then(doc => doc.data() as Indici)
    const aule = await firestore.collection('Aule').doc('Indici').get().then(doc => doc.data() as Indici)
    const professori = await firestore.collection('Professori').doc('Indici').get().then(doc => doc.data() as Indici)

    // Recupero tutti gli orari
    let orariClassi = await Promise.all(classi.lista.map(docId => firestore.collection('Classi').doc(docId).get())).then(docs => docs.map(doc => doc.data() as OrarioFirestore))
    let orariAule = await Promise.all(aule.lista.map(docId => firestore.collection('Aule').doc(docId).get())).then(docs => docs.map(doc => doc.data() as OrarioFirestore))
    let orariProfessori = await Promise.all(professori.lista.map(docId => firestore.collection('Professori').doc(docId).get())).then(docs => docs.map(doc => doc.data() as OrarioFirestore))

    // Traduco tutte le date da Firestore Timestamp in Date
    orariClassi = orariClassi.map(orario => {
        orario.dataAggiornamento = (orario.dataAggiornamento as admin.firestore.Timestamp).toDate()
        orario.dataValidita = (orario.dataValidita as admin.firestore.Timestamp).toDate()
        orario.ultimoAggiornamento = (orario.ultimoAggiornamento as admin.firestore.Timestamp).toDate()
        return orario
    })
    orariAule = orariAule.map(orario => {
        orario.dataAggiornamento = (orario.dataAggiornamento as admin.firestore.Timestamp).toDate()
        orario.dataValidita = (orario.dataValidita as admin.firestore.Timestamp).toDate()
        orario.ultimoAggiornamento = (orario.ultimoAggiornamento as admin.firestore.Timestamp).toDate()
        return orario
    })
    orariProfessori = orariProfessori.map(orario => {
        orario.dataAggiornamento = (orario.dataAggiornamento as admin.firestore.Timestamp).toDate()
        orario.dataValidita = (orario.dataValidita as admin.firestore.Timestamp).toDate()
        orario.ultimoAggiornamento = (orario.ultimoAggiornamento as admin.firestore.Timestamp).toDate()
        return orario
    })

    // Preparo un file json che include tutti gli orari
    const orari = { orariClassi, orariAule, orariProfessori }

    await bucket.file('backup-orari/ultima_versione.json').save(JSON.stringify(orari), {
        gzip: true,
        contentType: 'application/json'
    }).then(() => console.log('Creazione backup-orari completato'))
}