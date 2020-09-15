/**
 * Spiegazione:
 * In questo file sono presenti le interfacce e le costanti usate dalla libreria
 */
/**
 * Lista dei giorni della settimana
 */
export declare const giorni: string[];
/**
 * Etichette delle ore
 */
export declare const etichetteOre: string[];
/**
 * Numero etichette minime
 * Il numero di etichette massime si può ricavare da etichetteOre
 */
export declare const numeroMinimoEtichette = 5;
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
/**
 * Regex utilizzata per estrarre le informazioni (date e versione)
 */
export declare const regexInformazioni: RegExp;
export interface RigaDati {
    y: number;
    elementi: {
        x: number;
        testo: string;
    }[];
}
export interface ElementoTabella {
    ora: number;
    info: Info[];
}
export interface Info {
    giorno: number;
    elementi: string[];
}
export interface Orario {
    nome: string;
    tabella: ElementoTabella[];
    dataAggiornamento?: Date;
    dataValidita?: Date;
    versione?: string;
}
export interface RisultatoConfronto {
    ora: number;
    giorno: number;
}
