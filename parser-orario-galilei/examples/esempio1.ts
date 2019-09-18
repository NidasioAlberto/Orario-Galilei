import { ottieniOrariProfessori } from "../src";

const anno = '2019'

async function sincronizzaAule() {
    try {
        return await ottieniOrariProfessori(true, true)
    } catch(err) {
        throw err
    }
}

sincronizzaAule().then(dati => console.log('end')) // JSON.stringify(dati)))