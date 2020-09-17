import { ottieniOrariClassiOAule, ottieniOrariProfessori, mostraOrario, estraiInformazioni, analizzaDati, ottieniOrario } from "../src"
/*import * as fs from 'fs'

let buffer = fs.readFileSync('4TA.pdf');

estraiInformazioni(buffer).then(righe => {
    console.log(JSON.stringify(righe))
    let orario = analizzaDati(righe, 'Cerri C')
    mostraOrario(orario)
})*/

//ottieniOrario('https://www.galileicrema.edu.it/extra/orario/2021/1CA.pdf', '1CA')

console.time('Classi')
ottieniOrariClassiOAule('2021', 'Classi').then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Classi')
    console.log('Orari:', risultato.lista, risultato.lista.length)
    console.log('Orari non recuperati:', risultato.orariNonRecuperati, risultato.orariNonRecuperati.length)
}).catch(console.log)

/*console.time('Aule')
ottieniOrariClassiOAule('2021', 'Aule').then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Aule')
    console.log('Orari:', risultato.lista)
    console.log('Orari non recuperati:', risultato.orariNonRecuperati)
}).catch(console.log)*/

/*console.time('Prof')
ottieniOrariProfessori().then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Prof')
    console.log('Orari:', risultato.lista)
    console.log('Orari non recuperati:', risultato.orariNonRecuperati)
}).catch(console.log)*/