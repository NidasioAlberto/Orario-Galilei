"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Spiegazione:
In questo file sono presenti le insterfacce usate dalla libreria, assieme ad alcune costanti
*/
// Costanti
/**
 * [classi, aule, prof]
 */
exports.altezzaNomi = 3.093;
/**
 * Contiene i parametri a cui corrispondono i dati una volta elaborati dalla libreria pdfparser
 */
exports.altezzeLineeDati = [
    {
        ora: '1',
        altezze: [4.72, 5.32],
        giorno: 3
    }, {
        ora: '2',
        altezze: [6.048, 6.633],
        giorno: 3
    }, {
        ora: '3',
        altezze: [7.375, 7.960000000000001],
        giorno: 3
    }, {
        ora: '4',
        altezze: [8.71, 9.295],
        giorno: 3
    }, {
        ora: '1',
        altezze: [16.705, 17.298],
        giorno: 4
    }, {
        ora: '2',
        altezze: [18.025, 18.61],
        giorno: 4
    }, {
        ora: '3',
        altezze: [19.353, 19.945],
        giorno: 4
    }, {
        ora: '4',
        altezze: [20.688, 21.273],
        giorno: 4
    }, {
        ora: '5',
        altezze: [21.993, 22.593],
        giorno: 4
    }, {
        ora: '1',
        altezze: [28.668, 29.253],
        giorno: 5
    }, {
        ora: '2',
        altezze: [29.98, 30.565],
        giorno: 5
    }, {
        ora: '3',
        altezze: [31.308, 31.893],
        giorno: 5
    }, {
        ora: '4',
        altezze: [32.635, 33.228],
        giorno: 5
    }
];
/**
 * Lista dei giorni della settimana
 */
exports.giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
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
