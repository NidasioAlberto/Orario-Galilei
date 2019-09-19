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
import { estraiInformazioni } from "../src";


let dataBuffer = readFileSync('/Users/albertonidasio/Documents/GitHub/Orario-Galilei/parser-orario-galilei/examples/test.pdf');


estraiInformazioni(dataBuffer).then(console.log)