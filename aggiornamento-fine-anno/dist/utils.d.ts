import admin = require("firebase-admin");
/**
 * [classi, aule, prof]
 */
export declare const altezzaNomi = 3.093;
/**
 * Contiene i parametri a cui corrispondono i dati una volta elaborati dalla libreria pdfparser
 */
export declare const altezzeLineeDati: {
    ora: string;
    altezze: number[];
    giorno: number;
}[];
/**
 * Lista dei giorni della settimana
 */
export declare const giorni: string[];
/**
 * Lettere dell'alfabeto
 */
export declare const lettereAlfabeto: string[];
/**
 * Url principale
 */
export declare const percorsoPrimario = "http://www.galileicrema.it:8080";
/**
 * Percorso per raggingere i dati delle classi
 */
export declare const percorsoListaClassi = "/intraitis/Didattica/orario/OrarioQueryClasse.asp";
/**
 * Percorso per raggiungere i dati delle aule
 */
export declare const percorsoListaAule = "/intraitis/didattica/orario/orarioqueryaula.asp";
/**
 * Percorso per raggiungere i dati dei professori
 */
export declare const percorsoListaProfessori = "/Intraitis/Lib/ListaInsegnanti.asp?prossima=/Intraitis/Didattica/Orario/OrarioCaricaDocente.asp&cosa=ORARIO%20SETTIMANALE&lettera=";
export interface RigaDati {
    y: number;
    elementi: {
        x: number;
        testo: string;
    }[];
}
export interface ElementoTabellaPerOre {
    ora: number;
    info1: InfoOre[];
    info2: InfoOre[];
}
export interface ElementoTabellaPerGiorni {
    giorno: number;
    info1: InfoGiorni[];
    info2: InfoGiorni[];
}
export interface InfoOre {
    giorno: number;
    nome: string;
}
export interface InfoGiorni {
    ora: number;
    nome: string;
}
export interface TabelleOrario {
    tabellaPerOre: ElementoTabellaPerOre[];
    tabellaPerGiorni?: ElementoTabellaPerGiorni[];
}
export interface Orario {
    nome: string;
    tabelleOrario: TabelleOrario;
    ultimoAggiornamento?: Date | admin.firestore.Timestamp;
}
