import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { ottieniOrariClassi, ottieniOrariAule, ottieniOrariProfessori, confrontaOrari } from 'parser-orario-galilei'
import { Orario } from 'parser-orario-galilei/lib/utils'
admin.initializeApp()
const firestore = admin.firestore()
const versione = 1.1

export const sincronizzaClassi = functions.runWith({
    memory: '1GB',
    timeoutSeconds: 100
}).region('europe-west2').pubsub.schedule('10 7 */1 * *').timeZone('Europe/Rome').onRun(async context => {
    try {
        console.time('Classi')

        // Recupero le impostaziono per le cloud function
        const impostazioniCloudFunction = (await firestore.collection('Impostazioni generali').doc('Cloud function').get()).data()
        
        if (impostazioniCloudFunction !== undefined) {
            // Recuper l'anno dalle impostazioni
            const anno = impostazioniCloudFunction.anno as string
            const listaClassiSalvate: string[] = []

            console.log('Anno: ' + anno)
    
            // Recupero gli orari delle classi
            const orariClassi = await ottieniOrariClassi(anno, true)

            console.log('Orari recuperati')
    
            // Aggiungo tutti gli orari nel database
            const risultati = await Promise.all(orariClassi.orari.map(async classe => {
                // Recupero l'orario attualmente salvato nel database per confrontarlo con quello appena recuperato
                const orarioSalvato = (await firestore.collection('Classi').doc(classe.nome).get()).data() as Orario | undefined

                console.log('Orario salvato recuperato')

                // Confronto i due orari
                let risultato = false // True se gli orari sono uguali
                if (orarioSalvato !== undefined) {
                    risultato = confrontaOrari(orarioSalvato, classe) === undefined
                }

                // Se gli orari sono diversi salvo quello precedente nello storico
                if (!risultato && orarioSalvato !== undefined) {
                    await firestore.collection('Classi').doc(classe.nome).collection('Storico').add(orarioSalvato)
                } // Altrimenti non c'è niente da salvare, mi risparmi un'operazione di scrittura
                
                // E salvo quello nuovo
                await firestore.collection('Classi').doc(classe.nome).set({
                    ...classe,
                    ultimoAggiornamento: admin.firestore.Timestamp.now()
                })
                
                listaClassiSalvate.push(classe.nome)
                
                return risultato
            }))
    
            console.log('Elementi modificati', risultati.filter(elemento => !elemento).length)
            console.timeEnd('Classi')
    
            await firestore.collection('Classi').doc('Indici').set({
                lista: listaClassiSalvate,
                ultimoAggiornamento: admin.firestore.Timestamp.now()                
            })
            
            console.log('Aggiornate ' + orariClassi.lista.length + ' classi nel database con successo')
        } else {
            console.error('Impostazioni cloud function mancanti')
        }
    } catch(err) {
        throw err
    }
})

export const sincronizzaAule = functions.runWith({
    memory: '1GB',
    timeoutSeconds: 100
}).region('europe-west2').pubsub.schedule('15 7 */1 * *').timeZone('Europe/Rome').onRun(async context => {
    try {
        console.time('Aule')

        const orariAule = await ottieniOrariAule('2019', true)

        await Promise.all(orariAule.orari.map(async aula => firestore.collection('Aule').doc(aula.nome).set({
            ...aula,
            ultimoAggiornamento: admin.firestore.Timestamp.now()
        })))

        console.timeEnd('Aule')

        await firestore.collection('Aule').doc('Indici').set({
            lista: orariAule.lista,
            ultimoAggiornamento: admin.firestore.Timestamp.now()                
        })
        
        console.log('V' + versione +' salvate ' + orariAule.lista.length + ' aule nel database con successo')
    } catch(err) {
        throw err
    }
})

export const sincronizzaProfessori = functions.runWith({
    memory: '1GB',
    timeoutSeconds: 100
}).region('europe-west2').pubsub.schedule('20 7 */1 * *').timeZone('Europe/Rome').onRun(async context => {
    try {
        console.time('Professori')
        const orariProfessori = await ottieniOrariProfessori(true)

        await Promise.all(orariProfessori.orari.map(async professore => firestore.collection('Professori').doc(professore.nome).set({
            ...professore,
            ultimoAggiornamento: admin.firestore.Timestamp.now()
        })))

        console.timeEnd('Professori')

        await firestore.collection('Professori').doc('Indici').set({
            lista: orariProfessori.lista,
            ultimoAggiornamento: admin.firestore.Timestamp.now()                
        })
        
        console.log('V' + versione +' salvati ' + orariProfessori.lista.length + ' professori nel database con successo')
    } catch(err) {
        throw err
    }
})