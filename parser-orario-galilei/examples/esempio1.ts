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
import { estraiInformazioni, analizzaDati, mostraTabella, ottieniOrariProfessori } from "../src";


let dataBuffer = readFileSync('examples/test.pdf');


/*estraiInformazioni(dataBuffer).then(righeDati => {
    console.log(righeDati)

    const tab = analizzaDati(righeDati, 2)

    mostraTabella(tab.tabellaPerOre)
})*/

ottieniOrariProfessori(true, true).then(() =>{
    console.log('fine')
})