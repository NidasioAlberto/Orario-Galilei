import { ottieniOrariClassi, ottieniOrariAule, ottieniOrariProfessori } from "../src";

const anno = '2019'

//Classi
console.time('classi')
ottieniOrariClassi(anno).then((dati) => {
    console.timeEnd('classi')
    console.log(JSON.stringify(dati[0]))
}).catch(console.log)