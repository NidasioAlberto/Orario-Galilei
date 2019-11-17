import { ottieniOrariAule, ottieniOrariClassi, ottieniOrariProfessori, mostraOrario, estraiInformazioni, analizzaDati } from "../src"
import * as fs from 'fs'

let buffer = fs.readFileSync('CERRI_C.pdf');

estraiInformazioni(buffer).then(righe => {
    let orario = analizzaDati(righe, 'Cerri C')
    mostraOrario(orario)
})

/*console.time('Aule')
ottieniOrariAule('2020').then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Aule')
}).catch(console.log)*/

/*console.time('Classi')
ottieniOrariClassi('2020').then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.table(risultato.lista)
    console.timeEnd('Classi')
}).catch(console.log)*/

/*console.time('Prof')
ottieniOrariProfessori().then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.table(risultato.lista)
    console.timeEnd('Prof')
}).catch(console.log)*/