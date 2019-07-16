import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { ottieniOrariClassi, ottieniOrariAule, ottieniOrariProfessori } from 'parser-orario-galilei/lib/index'
admin.initializeApp()
const firestore = admin.firestore()

export const sincronizzaClassi = functions.pubsub.schedule('10 7 */1 * *').timeZone('Europe/Rome').onRun(async context => {
    try {
        const orariClassi = await ottieniOrariClassi('2019')

        return Promise.all(orariClassi.orari.map(async classe => firestore.collection('Classi').doc(classe.nome).set({
            ...orariClassi.orari,
            ultimoAggiornamento: admin.firestore.Timestamp.now()
        })).concat(
            firestore.collection('Classi').doc('Indici').set({
                lista: orariClassi.lista,
                ultimoAggiornamento: admin.firestore.Timestamp.now()                
            })
        )).then(() => {
            console.log('salvate ' + orariClassi.lista.length + ' classi nel database con successo')
        })
    } catch(err) {
        throw err
    }
})

export const sincronizzaAule = functions.pubsub.schedule('15 7 */1 * *').timeZone('Europe/Rome').onRun(async context => {
    try {
        const orariAule = await ottieniOrariAule('2019')

        return Promise.all(orariAule.orari.map(async aula => firestore.collection('Aule').doc(aula.nome).set({
            ...orariAule.orari,
            ultimoAggiornamento: admin.firestore.Timestamp.now()
        })).concat(
            firestore.collection('Aule').doc('Indici').set({
                lista: orariAule.lista,
                ultimoAggiornamento: admin.firestore.Timestamp.now()                
            })
        )).then(() => {
            console.log('salvate ' + orariAule.lista.length + ' aule nel database con successo')
        })
    } catch(err) {
        throw err
    }
})

export const sincronizzaProfessori = functions.pubsub.schedule('20 7 */1 * *').timeZone('Europe/Rome').onRun(async context => {
    try {
        const orariProfessori = await ottieniOrariProfessori()

        return Promise.all(orariProfessori.orari.map(async professore => firestore.collection('Professori').doc(professore.nome).set({
            ...orariProfessori.orari,
            ultimoAggiornamento: admin.firestore.Timestamp.now()
        })).concat(
            firestore.collection('Professori').doc('Indici').set({
                lista: orariProfessori.lista,
                ultimoAggiornamento: admin.firestore.Timestamp.now()                
            })
        )).then(() => {
            console.log('salvati ' + orariProfessori.lista.length + ' professori nel database con successo')
        })
    } catch(err) {
        throw err
    }
})