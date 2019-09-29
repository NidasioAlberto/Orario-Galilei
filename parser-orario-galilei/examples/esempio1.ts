/*import { ottieniOrariProfessori } from "../src";

const anno = '2019'

async function sincronizzaAule() {
    try {
        return await ottieniOrariProfessori(true, true)
    } catch(err) {
        throw err
    }
}

sincronizzaAule().then(dati => console.log('end')) // JSON.stringify(dati)))*/

import { readFileSync } from 'fs'
import { estraiInformazioni, analizzaDati, mostraOrario, ottieniOrariAule, ottieniOrariClassi, ottieniOrariProfessori } from "../src";


let dataBuffer = readFileSync('examples/4EA.pdf');

estraiInformazioni(dataBuffer).then(righeDati => {
    //console.log(righeDati.map(elemento => elemento.elementi))

    const orario = analizzaDati(righeDati, 'Questo è un test')

    //console.log(tab)

    mostraOrario(orario)

    console.log(JSON.stringify(orario))
    console.log(JSON.stringify(orario).length)
})

/*console.time('Aule')
ottieniOrariAule('2020').then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Aule')
}).catch(console.log)*/

/*console.time('Classi')
ottieniOrariClassi('2020').then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Classi')
}).catch(console.log)*/

/*console.time('Prof')
ottieniOrariProfessori().then((risultato) =>{
    risultato.orari.forEach(orario => mostraOrario(orario))
    console.timeEnd('Prof')
}).catch(console.log)*/