import { ottieniOrariAule, ottieniOrariClassi, ottieniOrariProfessori, mostraOrario } from "../src";

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

console.time('Prof')
ottieniOrariProfessori().then((risultato) =>{
    //risultato.orari.forEach(orario => mostraOrario(orario))
    console.table(risultato.lista)
    console.timeEnd('Prof')
}).catch(console.log)