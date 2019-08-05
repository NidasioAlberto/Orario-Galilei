db.enablePersistence()
.then(() => {
    console.log('persistance enabled')
})
.catch(err => {
    if(err.code == 'failed-precondition') {
        console.log('persistance fallita')
    } else if(err.code == 'unimplemented') {
        console.log('persistance non disponibile')
    }
})

db.collection('test').onSnapshot(snap => {
    snap.docChanges().forEach(change => {
        if(change.type === 'added') {
            console.log(change.doc.data())
            aggiungiOrario(change.doc.data(), change.doc.id)
        }
    })
})

const recipes = document.querySelector('.recipes')

function aggiungiOrario(dati, id) {
    const html = `
        <div class="card-panel recipe white row" data-id="${id}">
        <div class="recipe-details">
            <div class="recipe-title">${dati.nome}</div>
            <div class="recipe-ingredients">${dati.nome}</div>
        </div>
        </div>
    `
    recipes.innerHTML += html;
}