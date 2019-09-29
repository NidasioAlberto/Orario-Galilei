import { inflate } from "zlib"

/* Spiegazione:
In questo file sono presenti le insterfacce usate dalla libreria, assieme ad alcune costanti
*/

// Costanti

/**
 * Lista dei giorni della settimana
 */
export const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

/**
 * Etichette delle ore
 */
export const etichetteOre = ['1', '2', '3', '4', '5', '6', '1p', '2p']

/**
 * Numero etichette minime
 * Il numero di etichette massime si può ricavare da etichetteOre
 */
export const numeroMinimoEtichette = 5

/**
 * Lettere dell'alfabeto
 */
export const lettereAlfabeto = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

/**
 * Url principale
 */
export const percorsoPrimario = 'http://www.galileicrema.it:8080'

/**
 * Percorso per raggingere i dati delle classi
 */
export const percorsoListaClassi = '/intraitis/Didattica/orario/OrarioQueryClasse.asp'

/**
 * Percorso per raggiungere i dati delle aule
 */
export const percorsoListaAule = '/intraitis/didattica/orario/orarioqueryaula.asp'

/**
 * Percorso per raggiungere i dati dei professori 
 */
export const percorsoListaProfessori = '/Intraitis/Lib/ListaInsegnanti.asp?prossima=/Intraitis/Didattica/Orario/OrarioCaricaDocente.asp&cosa=ORARIO%20SETTIMANALE&lettera='

// Tipi

export interface RigaDati {
    y: number
    elementi: {
        x: number
        testo: string
    }[]
}

export interface ElementoTabella {
    ora: number
    info: Info[]
}

export interface Info {
    giorno: number
    elementi: string[]
}

export interface Orario {
    nome: string
    tabella: ElementoTabella[]
    dataAggiornamento?: Date
    dataValidita?: Date
    versione?: number
}

export interface RisultatoConfronto {
    ora: number
    giorno: number
}