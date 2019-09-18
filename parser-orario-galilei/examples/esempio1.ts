import { ottieniOrariClassi } from "../src";

const anno = '2019'

async function sincronizzaAule() {
    try {
        return await ottieniOrariClassi('2020', true, true)
    } catch(err) {
        throw err
    }
}

sincronizzaAule().then(dati => console.log('end')) // JSON.stringify(dati)))