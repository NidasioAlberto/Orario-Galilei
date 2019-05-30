const http = require('http')

/**
 * Questa funzione permette di ottenere la lista di tutte le classi del Galilei
 * @param {string} urlClassi 
 */
async function parseClassi(urlClassi = 'http://www.galileicrema.it:8080/intraitis/Didattica/orario/OrarioQueryClasse.asp') {
    //Recupero la pagina hmtl
    let paginaHtml = await ottieniPagina(urlClassi)

    //Estraggo le classi
    return paginaHtml.match(/Value="(.+)"/g).map(classe => {
        return classe.match(/"(.+)"/)[1]
    })
}

async function ottieniPagina(url) {
    //Controllo che i dati siano stringhe
    if(typeof url == 'string') {
        return new Promise((resolve, reject) => {
            http.get(url, (res) => {
                let content = ''

                res.setEncoding("utf8")

                res.on("data", function (chunk) {
                    content += chunk;
                })

                res.on("end", function () {
                    resolve(content)
                })
            }).on('error', (err) => {
                reject(err)
            })
        })
    } else {
        throw new TypeError('i parametri url e path non sono stringhe')
    }
}

module.exports = parseClassi