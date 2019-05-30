const parserOrario = require('./parser-orario-galilei')
const parserClassi = require('./parser-classi')

//parserOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/2019/ACHILLI%20G.pdf', 2)

//parserOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/2019/iLI1.pdf', 1)

//parserOrario('http://www.galileicrema.it:8080/intraitis/didattica/orario/2019/5TA.pdf', 0)

//provo ad ottenere la lista delle classi e i loro orari
const anno = '2019'
console.time('test')
parserClassi().then(async listaClassi => {
    for(const classe in listaClassi) {
        let urlPdf = 'http://www.galileicrema.it:8080/intraitis/didattica/orario/' + anno + '/' + listaClassi[classe] + '.pdf'
        console.log(urlPdf)
        try {
            await parserOrario(urlPdf, 0)
        } catch(err) {
            console.log(err)
        }
    }
    console.timeEnd('test')
})