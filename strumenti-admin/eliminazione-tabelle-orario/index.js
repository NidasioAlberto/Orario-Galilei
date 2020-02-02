var admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://orario-galilei.firebaseio.com'
});

const firestore = admin.firestore()

firestore.collection('Aule').get().then(query => {
    return Promise.all(query.docs.map(doc => {
        const data = doc.data()
        delete data.tabelleOrario
        return doc.ref.set(data)
    }))
}).then(() => console.log('Aule completate')).catch(err => console.log('Errore:', err))

firestore.collection('Classi').get().then(query => {
    return Promise.all(query.docs.map(doc => {
        const data = doc.data()
        delete data.tabelleOrario
        return doc.ref.set(data)
    }))
}).then(() => console.log('Classi completate')).catch(err => console.log('Errore:', err))

firestore.collection('Professori').get().then(query => {
    return Promise.all(query.docs.map(doc => {
        const data = doc.data()
        delete data.tabelleOrario
        return doc.ref.set(data)
    }))
}).then(() => console.log('Professori completate')).catch(err => console.log('Errore:', err))