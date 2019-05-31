import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp()
const firestore = admin.firestore()
const parserGalilei = require('parser-orario-galilei')

export const sincronizzaClassi = functions.pubsub.schedule('* * * * *').onRun(async context => {
    try {
        const orariClassi: {
            classe: string,
            orario: {
                tabellaPerOre: any[]
                tabellaPerGiorni: any[]
            }
        }[] = await parserGalilei.ottieniOrariClassi(2019)

        console.log('salvo ' + orariClassi.length + ' classi nel database')
    
        return Promise.all(orariClassi.map(async classe => {
            try {
                let result = await firestore.collection('Classi').doc(classe.classe).set({
                    orarioPerOre: classe.orario.tabellaPerOre,
                    orarioPerGiorni: classe.orario.tabellaPerGiorni
                })
                return result
            } catch(err) {
                console.log('errore', err, JSON.stringify(classe))
                return
            }
        }))
    } catch(err) {
        throw err
    }
})