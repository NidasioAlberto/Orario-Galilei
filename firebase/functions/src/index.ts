import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { ottieniOrariClassiOAule, ottieniOrariProfessori, confrontaOrari } from 'parser-orario-galilei'
import { Orario } from 'parser-orario-galilei/lib/utils'
import { ImpostazioniCloudFunction } from './utils/utils'
import { LogOrari } from './utils/log-orari.model'

admin.initializeApp()
const firestore = admin.firestore()

export const sincronizzaClassi = functions.runWith({
    memory: '1GB',
    timeoutSeconds: 100
}).region('europe-west2').pubsub.schedule('10 7 */1 * *').timeZone('Europe/Rome').onRun(() => sincronizzaOrari('Classi'))

export const sincronizzaAule = functions.runWith({
    memory: '1GB',
    timeoutSeconds: 100
}).region('europe-west2').pubsub.schedule('15 7 */1 * *').timeZone('Europe/Rome').onRun(() => sincronizzaOrari('Aule'))

export const sincronizzaProfessori = functions.runWith({
    memory: '1GB',
    timeoutSeconds: 100
}).region('europe-west2').pubsub.schedule('20 7 */1 * *').timeZone('Europe/Rome').onRun(() => sincronizzaOrari('Professori'))

async function sincronizzaOrari(collection: 'Classi' | 'Aule' | 'Professori') {
    try {
        console.time(collection)

        let orari: {
            orari: Orario[];
            lista: string[];
            orariNonRecuperati: string[];
        } | undefined = undefined

        // Recupero gli orari
        if(collection === 'Classi') {
            // Recupero le impostaziono per le cloud function
            const anno = ((await firestore.collection('Impostazioni generali').doc('Cloud function').get()).data() as ImpostazioniCloudFunction).anno
            if(anno === undefined) throw Error('Impostazioni cloud function mancanti')
            console.log('Anno: ' + anno)
            orari = await ottieniOrariClassiOAule(anno, 'Classi')
        } else if(collection === 'Aule') {
            // Recupero le impostaziono per le cloud function
            const anno = ((await firestore.collection('Impostazioni generali').doc('Cloud function').get()).data() as ImpostazioniCloudFunction).anno
            if(anno === undefined) throw Error('Impostazioni cloud function mancanti')            
            console.log('Anno: ' + anno)
            orari = await ottieniOrariClassiOAule(anno, 'Aule')
        } else if(collection === 'Professori') {
            orari = await ottieniOrariProfessori()
        }

        if(orari === undefined) throw Error('Orari non definiti, collection utilizzata: ' + collection) // Probabilemtne ci sarà un errore prima
        
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
    } catch(err) {
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