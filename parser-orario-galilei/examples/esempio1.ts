import { ottieniOrariClassi, ottieniOrariAule, ottieniOrariProfessori } from "../src";

const anno = '2019'

async function sincronizzaAule() {
    try {
        return await ottieniOrariAule('2019')
    } catch(err) {
        throw err
    }
}

sincronizzaAule().then(console.log)