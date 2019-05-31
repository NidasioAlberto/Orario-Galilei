const parserGalilei = require('./parser-orario-galilei')

//Qesto codice permette di testare il modulo parserGalilei, cambiare la costante debug per visualizzare sulla linea di comndo gli orari

const debug = false

console.time('classi')
parserGalilei.ottieniOrariClassi(2019, debug).then(orariClassi => {
    console.log(JSON.stringify(orariClassi))
    console.timeEnd('classi')
})

/*console.time('aule')
parserGalilei.ottieniOrariAule(2019, debug).then(orariAule => {
    console.timeEnd('aule')
})

console.time('prof')
parserGalilei.ottieniOrariProfessori(debug).then(orariProfessori => {
    console.timeEnd('prof')
})*/