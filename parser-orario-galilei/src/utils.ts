/* Spiegazione:
In questo file sono presenti le insterfacce usate dalla libreria, assieme ad alcune costanti
*/

// Costanti

/**
 * [classi, aule, prof]
 */
export const altezzaGiorni = [6.615, 6.885, 6.105]

/**
 * Contiene i parametri a cui corrispondono i dati una volta elaborati dalla libreria pdfparser
 */
export const altezzeLineeDati = [
    [
        {
            ora: '1',
            altezze: [7.432, 8.302]
        }, {
            ora: '2',
            altezze: [9.12, 9.99]
        }, {
            ora: '3',
            altezze: [10.8, 11.67]
        }, {
            ora: '4',
            altezze: [12.487, 13.357]
        }, {
            ora: '5',
            altezze: [14.175, 15.045]
        }, {
            ora: '6',
            altezze: [15.855, 16.725]
        }, {
            ora: '1p',
            altezze: [17.625, 18.495]
        }, {
            ora: '2p',
            altezze: [19.312, 20.182]
        }
    ], [
        {
            ora: '1',
            altezze: [7.710000000000001, 8.58]
        }, {
            ora: '2',
            altezze: [9.39, 10.26]
        }, {
            ora: '3',
            altezze: [11.077, 11.947]
        }, {
            ora: '4',
            altezze: [12.765, 13.635]
        }, {
            ora: '5',
            altezze: [14.445, 15.315000000000001]
        }, {
            ora: '6',
            altezze: [0, 0]
        }, {
            ora: '1p',
            altezze: [17.812, 18.682]
        }, {
            ora: '2p',
            altezze: [19.5, 20.37]
        }
    ], [
        {
            ora: '1',
            altezze: [6.922, 7.792]
        }, {
            ora: '2',
            altezze: [8.61, 9.48]
        }, {
            ora: '3',
            altezze: [10.297, 11.16]
        }, {
            ora: '4',
            altezze: [11.977, 12.847]
        }, {
            ora: '5',
            altezze: [13.665, 14.535]
        }, {
            ora: '6',
            altezze: [15.344999999999999, 16.215]
        }, {
            ora: '1p',
            altezze: [17.122, 17.985]
        }, {
            ora: '2p',
            altezze: [18.802, 19.672]
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
    ora: string
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
    ora: string
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