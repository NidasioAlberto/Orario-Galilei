import { ottieniOrariClassiOAule, ottieniOrariProfessori, mostraOrario, estraiInformazioni, analizzaDati } from "../src"
//import * as fs from 'fs'

//let buffer = fs.readFileSync('CERRI_C.pdf');

/*estraiInformazioni(buffer).then(righe => {
    let orario = analizzaDati(righe, 'Cerri C')
    mostraOrario(orario)
})*/

console.time('Classi')
ottieniOrariClassiOAule('2020', 'Classi').then((risultato) =>{
    //risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Classi')
    console.log('Orari:', risultato.lista)
    console.log('Orari non recuperati:', risultato.orariNonRecuperati)
}).catch(console.log)

console.time('Aule')
ottieniOrariClassiOAule('2020', 'Aule').then((risultato) =>{
    //risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Aule')
    console.log('Orari:', risultato.lista)
    console.log('Orari non recuperati:', risultato.orariNonRecuperati)
}).catch(console.log)

console.time('Prof')
ottieniOrariProfessori().then((risultato) =>{
    //risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Prof')
    console.log('Orari:', risultato.lista)
    console.log('Orari non recuperati:', risultato.orariNonRecuperati)
}).catch(console.log)