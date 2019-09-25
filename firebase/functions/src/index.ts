import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { ottieniOrariClassi, ottieniOrariAule, ottieniOrariProfessori, confrontaOrari } from 'parser-orario-galilei'
import { Orario } from 'parser-orario-galilei/lib/utils'
admin.initializeApp()
const firestore = admin.firestore()

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

            console.log('Anno: ' + anno)
    
            // Recupero gli orari delle classi
            const orariClassi = await ottieniOrariClassi(anno, true)

            console.log('Orari recuperati')
    
            // Aggiungo tutti gli orari nel database
            let risultati = await Promise.all(orariClassi.orari.map(async classe => {
                // Recupero l'orario attualmente salvato nel database per confrontarlo con quello appena recuperato
                const orarioSalvato = (await firestore.collection('Classi').doc(classe.nome).get()).data() as Orario | undefined

                // Confronto i due orari
                let uguali = false // True se gli orari sono uguali
                if (orarioSalvato !== undefined) {
                    uguali = confrontaOrari(orarioSalvato, classe) === undefined
                }

                // Se gli orari sono diversi salvo quello precedente nello storico
                if (!uguali && orarioSalvato !== undefined) {
                    await firestore.collection('Classi').doc(classe.nome).collection('Storico').add(orarioSalvato)
                } // Altrimenti non c'è niente da salvare, mi risparmi un'operazione di scrittura
                
                // E salvo quello nuovo
                await firestore.collection('Classi').doc(classe.nome).set({
                    ...classe,
                    ultimoAggiornamento: admin.firestore.Timestamp.now()
                })
                
                return {
                    classe: classe.nome,
                    modificato: !uguali
                }
            }))

            risultati = risultati.filter(elemento => elemento.modificato)
    
            console.log('Elementi modificati', risultati.length, risultati.map(elem => elem.classe))
            console.timeEnd('Classi')
    
            await firestore.collection('Classi').doc('Indici').set({
                lista: orariClassi.lista,
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

        // Recupero le impostaziono per le cloud function
        const impostazioniCloudFunction = (await firestore.collection('Impostazioni generali').doc('Cloud function').get()).data()
        
        if (impostazioniCloudFunction !== undefined) {
            // Recuper l'anno dalle impostazioni
            const anno = impostazioniCloudFunction.anno as string

            console.log('Anno: ' + anno)

            const orariAule = await ottieniOrariAule('2019', true)

            console.log('Orari recuperati')

            // Aggiungo tutti gli orari nel database
            let risultati = await Promise.all(orariAule.orari.map(async aula => {
                // Recupero l'orario attualmente salvato nel database per confrontarlo con quello appena recuperato
                const orarioSalvato = (await firestore.collection('Classi').doc(aula.nome).get()).data() as Orario | undefined

                // Confronto i due orari
                let uguali = false // True se gli orari sono uguali
                if (orarioSalvato !== undefined) {
                    uguali = confrontaOrari(orarioSalvato, aula) === undefined
                }

                // Se gli orari sono diversi salvo quello precedente nello storico
                if (!uguali && orarioSalvato !== undefined) {
                    await firestore.collection('Aule').doc(aula.nome).collection('Storico').add(orarioSalvato)
                } // Altrimenti non c'è niente da salvare, mi risparmi un'operazione di scrittura

                // E salvo quello nuovo
                await firestore.collection('Aule').doc(aula.nome).set({
                    ...aula,
                    ultimoAggiornamento: admin.firestore.Timestamp.now()
                })
                
                return {
                    classe: aula.nome,
                    modificato: !uguali
                }
            }))

            risultati = risultati.filter(elemento => elemento.modificato)
    
            console.log('Elementi modificati', risultati.length, risultati.map(elem => elem.classe))
            console.timeEnd('Aule')

            await firestore.collection('Aule').doc('Indici').set({
                lista: orariAule.lista,
                ultimoAggiornamento: admin.firestore.Timestamp.now()                
            })
            
            console.log('Aggiornate ' + orariAule.lista.length + ' aule nel database con successo')
        } else {
            console.error('Impostazioni cloud function mancanti')
        }
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

        console.log('Orari recuperati')

        let risultati = await Promise.all(orariProfessori.orari.map(async professore => {
            // Recupero l'orario attualmente salvato nel database per confrontarlo con quello appena recuperato
            const orarioSalvato = (await firestore.collection('Professori').doc(professore.nome).get()).data() as Orario | undefined

            // Confronto i due orari
            let uguali = false // True se gli orari sono uguali
            if (orarioSalvato !== undefined) {
                uguali = confrontaOrari(orarioSalvato, professore) === undefined
            }

            // Se gli orari sono diversi salvo quello precedente nello storico
            if (!uguali && orarioSalvato !== undefined) {
                await firestore.collection('Professori').doc(professore.nome).collection('Storico').add(orarioSalvato)
            } // Altrimenti non c'è niente da salvare, mi risparmi un'operazione di scrittura

            // E salvo quello nuovo
            await firestore.collection('Professori').doc(professore.nome).set({
                ...professore,
                ultimoAggiornamento: admin.firestore.Timestamp.now()
            })
            
            return {
                classe: professore.nome,
                modificato: !uguali
            }
        }))

        risultati = risultati.filter(elemento => elemento.modificato)

        console.log('Elementi modificati', risultati.length, risultati.map(elem => elem.classe))
        console.timeEnd('Professori')

        await firestore.collection('Professori').doc('Indici').set({
            lista: orariProfessori.lista,
            ultimoAggiornamento: admin.firestore.Timestamp.now()                
        })
            
        console.log('Aggiornati ' + orariProfessori.lista.length + ' professorij nel database con successo')
    } catch(err) {
        throw err
    }
})