import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import { Indici } from './utils/indici.model'
import { OrarioFirestore } from './utils/orario.model'

admin.initializeApp()
const firestore = admin.firestore()

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