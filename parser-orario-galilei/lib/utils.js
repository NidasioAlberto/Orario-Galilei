"use strict";
/**
 * Spiegazione:
 * In questo file sono presenti le interfacce e le costanti usate dalla libreria
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Costanti
/**
 * Lista dei giorni della settimana
 */
exports.giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
/**
 * Etichette delle ore
 */
exports.etichetteOre = ['1', '2', '3', '4', '5', '6', '1p', '2p'];
/**
 * Numero etichette minime
 * Il numero di etichette massime si può ricavare da etichetteOre
 */
exports.numeroMinimoEtichette = 5;
/**
 * Lettere dell'alfabeto
 */
exports.lettereAlfabeto = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
/**
 * Url principale
 */
exports.percorsoPrimario = 'http://www.galileicrema.it:8080';
/**
 * Percorso per raggingere i dati delle classi
 */
exports.percorsoListaClassi = '/intraitis/Didattica/orario/OrarioQueryClasse.asp';
/**
 * Percorso per raggiungere i dati delle aule
 */
exports.percorsoListaAule = '/intraitis/didattica/orario/orarioqueryaula.asp';
/**
 * Percorso per raggiungere i dati dei professori
 */
exports.percorsoListaProfessori = '/Intraitis/Lib/ListaInsegnanti.asp?prossima=/Intraitis/Didattica/Orario/OrarioCaricaDocente.asp&cosa=ORARIO%20SETTIMANALE&lettera=';
/**
 * Regex utilizzata per estrarre le informazioni (date e versione)
 */
exports.regexInformazioni = /Aggiornamento.+(\d\d)[\/\.](\d\d)[\/\.](\d+).+v. ?((?:\d+\.)+\d+).+Valido.+dal.+(\d\d)[\/\.](\d\d)[\/\.](\d+)/;
