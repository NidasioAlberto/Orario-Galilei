"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const pdfreader = require('pdfreader');
const fs = require("fs");
const path_1 = require("path");
const utils_1 = require("./utils");
//Set your service account api key file
var serviceAccount = require('../../../orario-galilei-firebase-adminsdk-vk1y2-0e394acee6.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://orario-galilei.firebaseio.com'
});
const db = admin.firestore();
const anno = '2018-2019';
/**
 * Questa funzione sposta tutti gli orari dalle collection Classi, Aule e Professori alla collection Storico/{Anno}
 */
function salvaStoricoOrari() {
    return __awaiter(this, void 0, void 0, function* () {
        // Collection Classi
        const classi = yield db.collection('Classi').get();
        for (let doc of classi.docs) {
            // Copio l'orario in /Storico/{Anno}
            yield db.collection('Storico').doc(anno).collection('Classi').doc(doc.id).set(doc.data());
            // Elimino i dati dalla collection Classi
            yield doc.ref.delete();
            console.log(doc.id);
        }
        // Collection Aule
        const aule = yield db.collection('Aule').get();
        for (let doc of aule.docs) {
            // Copio l'orario in /Storico/{Anno}
            yield db.collection('Storico').doc(anno).collection('Aule').doc(doc.id).set(doc.data());
            // Elimino i dati dalla collection Aule
            yield doc.ref.delete();
            console.log(doc.id);
        }
        // Collection Professori
        const prof = yield db.collection('Professori').get();
        for (let doc of prof.docs) {
            // Copio l'orario in /Storico/{Anno}
            yield db.collection('Storico').doc(anno).collection('Professori').doc(doc.id).set(doc.data());
            // Elimino i dati dalla collection Professori
            yield doc.ref.delete();
            console.log(doc.id);
        }
    });
}
/*salvaStoricoOrari().then(() => {
    console.log('Fine')
}).catch(err => {
    console.log('Errore', err)
})*/
function caricaOrarioProvvisorio() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let pagine = [{
                    pagina: 2,
                    righe: []
                }, {
                    pagina: 3,
                    righe: []
                }, {
                    pagina: 4,
                    righe: []
                }, {
                    pagina: 5,
                    righe: []
                }, {
                    pagina: 6,
                    righe: []
                }];
            let paginaCorrente = -1;
            fs.readFile(path_1.join(__dirname, '../assets/', 'Orario_provvisorio_19-20.pdf'), (err, pdfBuffer) => {
                new pdfreader.PdfReader().parseBuffer(pdfBuffer, (err, item) => {
                    if (err) {
                        reject(err);
                    }
                    else if (item != undefined) {
                        //Processo i dati
                        if (item.x != undefined && item.y != undefined && paginaCorrente >= 2) {
                            //1: controllo se la riga è già stata registrata
                            let trovato = false;
                            pagine[paginaCorrente - 2].righe.forEach(riga => {
                                if (riga.y == item.y) {
                                    riga.elementi.push({
                                        x: item.x,
                                        testo: item.text
                                    });
                                    trovato = true;
                                    return false;
                                }
                            });
                            //2: altrimenti la aggiungo
                            if (!trovato)
                                pagine[paginaCorrente - 2].righe.push({
                                    y: item.y,
                                    elementi: [{
                                            x: item.x,
                                            testo: item.text
                                        }]
                                });
                        }
                        else if (item.page !== undefined) {
                            paginaCorrente = item.page;
                            pagine[paginaCorrente - 2] = {
                                pagina: paginaCorrente,
                                righe: []
                            };
                        }
                    }
                    else {
                        //I dati sono pronti, li ritorno se non sono vuoti
                        if (pagine[paginaCorrente - 2].righe.length > 0) {
                            resolve(pagine);
                        }
                        else
                            reject('nessun dato trovato');
                    }
                });
            });
        });
    });
}
caricaOrarioProvvisorio().then((pagine) => __awaiter(void 0, void 0, void 0, function* () {
    let classi = [];
    for (const pagina of pagine) {
        const dati = analizzaDati(pagina.righe);
        for (const dato of dati) {
            console.log('salvo ' + dato.nome);
            classi.push(dato.nome);
            yield db.collection('Classi').doc(dato.nome).set(dato);
        }
    }
    yield db.collection('Classi').doc('Indici').set({
        lista: classi,
        ultimoAggiornamento: new Date()
    });
})).then(() => {
    console.log('fine');
}).catch(err => {
    console.log('Errore', err);
});
function analizzaDati(righe) {
    let min = 0, max = 0;
    let divisori = [];
    let tabellaPerOreTemporanea = [];
    let tabellaPerOre;
    //1: Trovo il minimo e il massimo valore x dei giorni della settimana che utilizzerò per capire in che giorno si trovano le materie e le aule
    righe.forEach(riga => {
        if (riga.y == utils_1.altezzaNomi) {
            riga.elementi.forEach((elemento, i) => {
                if (i == 0) {
                    min = elemento.x;
                    max = elemento.x;
                }
                else {
                    if (elemento.x < min)
                        min = elemento.x;
                    if (elemento.x > max)
                        max = elemento.x;
                }
            });
            return false; //Per interrompere il ciclo
        }
    });
    //2: Ora divido i numeri in 6 sezioni
    let spazio = (max - min) / 15;
    for (let i = 0; i < 15; i++) {
        divisori.push(min + spazio / 2 + spazio * i);
    }
    //3: Recupero la riga con i nomi delle classi
    let datiClassi = righe.find(riga => riga.y === utils_1.altezzaNomi);
    let classi = [];
    if (datiClassi !== undefined) {
        classi = datiClassi.elementi.map(elemento => elemento.testo);
    }
    //4: A questo punto trovo le informazioni (prima e seconda riga) per ciascuna ora
    utils_1.altezzeLineeDati.forEach(altezzaLineaDati => {
        dividiRiga(divisori, classi, righe.find(riga => {
            return riga.y == altezzaLineaDati.altezze[0];
        }));
        tabellaPerOreTemporanea.push({
            ora: trasformaOra(altezzaLineaDati.ora),
            giorno: altezzaLineaDati.giorno,
            info1: dividiRiga(divisori, classi, righe.find(riga => {
                return riga.y == altezzaLineaDati.altezze[0];
            })),
            info2: dividiRiga(divisori, classi, righe.find(riga => {
                return riga.y == altezzaLineaDati.altezze[1];
            }))
        });
    });
    //5: Trasformo questi dati nel formato standard
    tabellaPerOre = classi.map(classe => {
        return {
            classe: classe.replace(/ /g, ''),
            tabella: []
        };
    });
    tabellaPerOre = tabellaPerOre.map(elemento => {
        const classe = elemento.classe;
        let ore = [];
        tabellaPerOreTemporanea.forEach(elementoTemporaneo => {
            if (ore.indexOf(elementoTemporaneo.ora) < 0) {
                ore.push(elementoTemporaneo.ora);
            }
        });
        let giorni = [];
        tabellaPerOreTemporanea.forEach(elementoTemporaneo => {
            if (giorni.indexOf(elementoTemporaneo.giorno) < 0) {
                giorni.push(elementoTemporaneo.giorno);
            }
        });
        let tabella = ore.map(ora => {
            const tabellaTemporanea = tabellaPerOreTemporanea.filter(elem => elem.ora == ora);
            let tab = {
                info: tabellaTemporanea.map(elem => {
                    return {
                        giorno: elem.giorno,
                        info1: elem.info1.find(info => info.classe === classe),
                        info2: elem.info2.find(info => info.classe === classe)
                    };
                }),
                ora
            };
            return tab;
        }).map(info => {
            let elemento = {
                ora: info.ora,
                info1: info.info.map(elem => {
                    if (elem.info1 !== undefined) {
                        return {
                            giorno: elem.giorno,
                            nome: elem.info1.nome
                        };
                    }
                    else {
                        return undefined;
                    }
                }).filter(elem => elem !== undefined),
                info2: info.info.map(elem => {
                    if (elem.info2 !== undefined) {
                        return {
                            giorno: elem.giorno,
                            nome: elem.info2.nome
                        };
                    }
                    else {
                        return undefined;
                    }
                }).filter(elem => elem !== undefined)
            };
            return elemento;
        });
        return {
            classe,
            tabella
        };
    });
    //6: Cambio il formato della tabella
    let tabellaPerGiorni = [];
    tabellaPerOre.forEach(tabella => {
        let tabellaXGiorni = [];
        //4: Trasformo i dati della divisione per ore a una divisione per giorni
        utils_1.giorni.forEach((giorno, i) => {
            tabellaXGiorni.push({
                giorno: utils_1.giorni.indexOf(giorno),
                info1: [],
                info2: []
            });
            tabella.tabella.forEach(ora => {
                let tmp = ora.info1.find(info => info.giorno == i);
                tabellaXGiorni[i].info1.push({
                    nome: (tmp != undefined ? tmp.nome : ''),
                    //nome: (ora.info1[i].nome != undefined ? ora.info1[i].nome : ''),
                    ora: ora.ora
                });
                tmp = ora.info2.find(info => info.giorno == i);
                tabellaXGiorni[i].info2.push({
                    nome: (tmp != undefined ? tmp.nome : ''),
                    //nome: (ora.info2[i].nome != undefined ? ora.info2[i].nome : ''),
                    ora: ora.ora
                });
            });
            tabellaXGiorni[i].info1 = tabellaXGiorni[i].info1.filter(info => info.nome != '');
            tabellaXGiorni[i].info2 = tabellaXGiorni[i].info2.filter(info => info.nome != '');
        });
        tabellaPerGiorni.push({
            classe: tabella.classe,
            tabella: tabellaXGiorni
        });
    });
    let datiFinali = tabellaPerOre.map(elem => {
        const tabellaXGiorni = tabellaPerGiorni.find(tab => tab.classe === elem.classe);
        return {
            nome: elem.classe,
            tabelleOrario: {
                tabellaPerOre: elem.tabella,
                tabellaPerGiorni: (tabellaXGiorni !== undefined ? tabellaXGiorni.tabella : [])
            },
            ultimoAggiornamento: new Date()
        };
    });
    return datiFinali;
}
function trasformaOra(ora) {
    switch (ora) {
        case '1':
            return 0;
        case '2':
            return 1;
        case '3':
            return 2;
        case '4':
            return 3;
        case '5':
            return 4;
        case '6':
            return 5;
        case '1p':
            return 6;
        case '2p':
            return 7;
        default:
            return NaN;
    }
}
function dividiRiga(divisori, classi, riga) {
    let divisioni = [];
    for (let i = 1; i <= classi.length; i++) {
        divisioni.push({
            classe: classi[i - 1].replace(/ /g, ''),
            nome: ''
        });
    }
    if (riga != undefined) {
        for (let i = -1; i < classi.length - 1; i++) {
            divisioni[i + 1].nome = riga.elementi.filter(elemento => {
                return (i != -1 ? elemento.x > divisori[i] : true) && (i != 14 ? elemento.x < divisori[i + 1] : true);
            }).map(elemento => elemento.testo.replace(/ /g, '')).join('');
            if (divisioni[i + 1].nome == undefined)
                divisioni[i + 1].nome = '';
        }
    }
    //TODO: rimuovere tutte le divisioni dove il nome è nullo
    return divisioni.filter(divisione => divisione.nome != '');
}
