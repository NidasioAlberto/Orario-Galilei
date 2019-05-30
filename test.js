const parserGalilei = require('./parser-orario-galilei')

const anno = '2019'
console.time('test')

async function testAsincrono() {
    try {
        Promise.all([
            parserGalilei.parserClassi().then(async classi => {
                console.log('Classi', classi, classi.length)
                
                let promesse = []
                classi.forEach(classe => {
                    let promessa
                    try {
                        promessa = parserGalilei.parserOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/' + anno + '/' + classe + '.pdf', 0)
                    } catch(err) {
                        console.log('errore con la classe', classe, err)
                    }
                    promesse.push(promessa)
                })
                return Promise.all(promesse)
            }),
            parserGalilei.parserAule().then(async aule => {
                console.log('Aule', aule, aule.length)
                
                let promesse = []
                aule.forEach(aula => {
                    let promessa
                    try {
                        promessa = parserGalilei.parserOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/' + anno + '/' + aula + '.pdf', 1)
                    } catch(err) {
                        console.log('errore con l\'aula', aula, err)
                    }
                    promesse.push(promessa)
                })
                return Promise.all(promesse)
            }),
            parserGalilei.parserProf().then(async professori => {
                console.log('Professsori', professori, professori.length)
                
                let promesse = []
                professori.forEach(professore => {
                    let promessa
                    try {
                        promessa = parserGalilei.parserOrario('http://www.galileicrema.it:8080' + professore.percorsoOrario, 2)
                    } catch(err) {
                        console.log('errore con il professore', professore, err)
                    }
                    promesse.push(promessa)
                })
                return Promise.all(promesse)
            })
        ]).then(() => {
            console.timeEnd('test')
        })
    } catch(err) {
        console.log(err)
    }
}

testAsincrono()