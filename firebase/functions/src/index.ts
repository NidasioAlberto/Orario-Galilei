import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp()
const firestore = admin.firestore()
const parserGalilei = require('parser-orario-galilei')

export const sincronizzaClassi = functions.pubsub.schedule('10 7 */1 * *').onRun(async context => {
    try {
        const orariClassi: {
            classe: string,
            orario: {
                tabellaPerOre: any[]
                tabellaPerGiorni: any[]
            }
        }[] = await parserGalilei.ottieniOrariClassi(2019)

        
        return Promise.all(orariClassi.map(async classe => firestore.collection('Classi').doc(classe.classe).set({
            nome: classe.classe,
            orarioPerOre: classe.orario.tabellaPerOre,
            orarioPerGiorni: classe.orario.tabellaPerGiorni,
            ultimoAggiornamento: admin.firestore.Timestamp.now()
        }))).then(() => {
            console.log('salvate ' + orariClassi.length + ' classi nel database con successo')
        })
    } catch(err) {
        throw err
    }
})

export const sincronizzaAule = functions.pubsub.schedule('15 7 */1 * *').onRun(async context => {
    try {
        const orariAule: {
            aula: string,
            orario: {
                tabellaPerOre: any[]
                tabellaPerGiorni: any[]
            }
        }[] = await parserGalilei.ottieniOrariAule(2019)

        
        return Promise.all(orariAule.map(async aula => firestore.collection('Aule').doc(aula.aula).set({
            nome: aula.aula,
            orarioPerOre: aula.orario.tabellaPerOre,
            orarioPerGiorni: aula.orario.tabellaPerGiorni,
            ultimoAggiornamento: admin.firestore.Timestamp.now()
        }))).then(() => {
            console.log('salvate ' + orariAule.length + ' aule nel database con successo')
        })
    } catch(err) {
        throw err
    }
})

export const sincronizzaProfessori = functions.pubsub.schedule('20 7 */1 * *').onRun(async context => {
    try {
        const orariProfessori: {
            professore: string,
            orario: {
                tabellaPerOre: any[]
                tabellaPerGiorni: any[]
            }
        }[] = await parserGalilei.ottieniOrariProfessori()

        
        return Promise.all(orariProfessori.map(async professore => firestore.collection('Professori').doc(professore.professore).set({
            nome: professore.professore,
            orarioPerOre: professore.orario.tabellaPerOre,
            orarioPerGiorni: professore.orario.tabellaPerGiorni,
            ultimoAggiornamento: admin.firestore.Timestamp.now()
        }))).then(() => {
            console.log('salvati ' + orariProfessori.length + ' professori nel database con successo')
        })
    } catch(err) {
        throw err
    }
})