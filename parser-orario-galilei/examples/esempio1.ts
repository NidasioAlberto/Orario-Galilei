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
import { estraiInformazioni, analizzaDati, mostraTabella } from "../src";


let dataBuffer = readFileSync('examples/aula.pdf');


estraiInformazioni(dataBuffer).then(righeDati => {
    const tab = analizzaDati(righeDati, 1)

    mostraTabella(tab.tabellaPerOre, 'iLEL')
})