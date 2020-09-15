/// <reference types="node" />
import { RigaDati, Orario, RisultatoConfronto } from "./utils";
/**
 * Lo scopo di questa libreria è di recuperare gli orari del Galilei Crema dai pdf pubblicati sul sito.
 *
 * Le funzioni principali che il modulo offre sono:
 * - ottieniOrari(Classi|Aule|Professori): recuperano tutti gli orari dal sito
 * - ottieniOrario: dato un url di un pdf restituisce l'orario contenuto del documento
 * - ottieniLista(Classi|Aule|Professori): recupera la lista degli orari con o il loro nome o anche il link al pdf
 */
/**
 * Questa funzione permette di ottenere la lista delle classi o delle aule
 * @param {string} urlPaginaDati url per raggiungere la pagina con la lista degli orari
 */
export declare function ottieniListaClassiOAule(urlPaginaDati: string): Promise<string[]>;
/**
 * Questra funzione permette di ottenere la lista dei professori e i link ai loro orari
 * @param {string} urlProf url per raggiungere i dati dei professori
 */
export declare function ottieniListaProfessori(urlProf?: string): Promise<{
    percorsoOrario: string;
    nome: string;
}[]>;
/**
 * Questa funzione permette di ottenere l'orario di una classe, di un'aula o di un'insegnante dato un url
 * @param {string} urlPdf url per raggiungere l'orario da analizzare
 * @param {number} tipo 0 per classi, 1 per aule e 2 per prof
 * @param {boolean} debug per mostrare in nella console delle informazioni
 */
export declare function ottieniOrario(urlPdf: string, nome: string): Promise<Orario>;
/**
 * Questa funzione permette di ottenere la lista delle classi e tutti i loro orari
 * @param {number} anno anno da inserire nell'url
 * @param {string} tipo Tipo di orari da recuperare, Classi o Aule
 */
export declare function ottieniOrariClassiOAule(anno: string, tipo: 'Classi' | 'Aule'): Promise<{
    orari: Orario[];
    lista: string[];
    orariNonRecuperati: string[];
}>;
/**
 * Questa funzione permette di ottenere la lista delle aule e tutti i loro orari
 * @param {boolean} tabellaPerGiorni true per ottenere l'orario organizzato anche per giorni
 * @param {boolean} debug per mostrare in nella console delle informazioni
 */
export declare function ottieniOrariProfessori(): Promise<{
    orari: Orario[];
    lista: string[];
    orariNonRecuperati: string[];
}>;
/**
 * Questa funzione permette di confrontare due orari, nel caso siano identici ritorna undefined
 * altrimenti ritorna le coordinate degli elementi differenti (ora, giorno)
 * @param orario1 Primo orario da confrontare
 * @param orario2 Secondo orario da confrontare
 */
export declare function confrontaOrari(orario1: Orario, orario2: Orario): RisultatoConfronto[] | undefined;
/**
 * Permette di ottenere le informazioni presenti nel pdf, lascia le stringhe come le trova
 * @param {Buffer} buffer
 */
export declare function estraiInformazioni(buffer: Buffer): Promise<RigaDati[]>;
/**
 * Questa funzione permette di analizzare ed estrarre le informazioni e l'orario dai dati recuperati dal pdf
 * @param {RigaDati[]} righe Le righe del pdf
 * @param {string} nome Nome da inserire nell'orario
 */
export declare function analizzaDati(righe: RigaDati[], nome: string): Orario;
/**
 * Questa funzione permette di mostrare l'orario in un fomato comprensibile nella console
 * @param {*} tabellaPerOre l'orario diviso per ore
 */
export declare function mostraOrario(orario: Orario): void;
