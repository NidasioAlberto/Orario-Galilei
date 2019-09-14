import { ottieniOrariClassi } from "../src";

const anno = '2019'

async function sincronizzaAule() {
    try {
        return await ottieniOrariClassi('2019')
    } catch(err) {
        throw err
    }
}

sincronizzaAule().then(dati => console.log(JSON.stringify(dati)))