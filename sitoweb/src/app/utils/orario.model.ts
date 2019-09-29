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
    dataAggiornamento?: Date | firebase.firestore.Timestamp
    dataValidita?: Date | firebase.firestore.Timestamp
    versione?: number

    collection?: string
    tipo?: string
    ultimoAggiornamento: Date | firebase.firestore.Timestamp
}

export interface RisultatoConfronto {
    ora: number
    giorno: number
}

export interface ProssimoImpegno {
    ora: number
    oraLable: string
    giorno: number
    giornoLable: string
    elementi: string[]
}
