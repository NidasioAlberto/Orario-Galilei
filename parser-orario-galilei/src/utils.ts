/* Spiegazione:
In questo file sono presenti le insterfacce usate dalla libreria, assieme ad alcune costanti
*/

// Costanti

/**
 * [classi, aule, prof]
 */
export const altezzaGiorni = [117, 122, 136];

/**
 * Contiene i parametri a cui corrispondono i dati una volta elaborati dalla libreria pdfparser
 */
export const altezzeLineeDati = [
    [
        {
            ora: 0,
            altezze: [130, 144]
        }, {
            ora: 1,
            altezze: [157, 171]
        }, {
            ora: 2,
            altezze: [184, 198]
        }, {
            ora: 3,
            altezze: [211, 225]
        }, {
            ora: 4,
            altezze: [238, 252]
        }
    ], [
        {
            ora: 0,
            altezze: [135, 149]
        }, {
            ora: 1,
            altezze: [162, 176]
        }, {
            ora: 2,
            altezze: [189, 203]
        }, {
            ora: 3,
            altezze: [216, 230]
        }, {
            ora: 4,
            altezze: [243, 257]
        }
    ], [
        {
            ora: 0,
            altezze: [149, 163]
        }, {
            ora: 1,
            altezze: [176, 190]
        }, {
            ora: 2,
            altezze: [203, 217]
        }, {
            ora: 3,
            altezze: [230, 244]
        }, {
            ora: 4,
            altezze: [257, 271]
        }
    ]
]

/**
 * Lista dei giorni della settimana
 */
export const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

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

export interface ElementoTabellaPerOre {
    ora: number
    info1: InfoOre[]
    info2: InfoOre[]
}

export interface ElementoTabellaPerGiorni {
    giorno: number
    info1: InfoGiorni[]
    info2: InfoGiorni[]
}

export interface InfoOre {
    giorno: number
    nome: string
}

export interface InfoGiorni {
    ora: number
    nome: string
}

export interface TabelleOrario {
    tabellaPerOre: ElementoTabellaPerOre[];
    tabellaPerGiorni?: ElementoTabellaPerGiorni[];
}

export interface Orario {
    nome: string,
    tabelleOrario: TabelleOrario
}