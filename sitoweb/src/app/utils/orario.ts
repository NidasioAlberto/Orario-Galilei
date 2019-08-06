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
    nome: string
    tabelleOrario: TabelleOrario
}

export interface ProssimoImpegno {
    ora: number
    oraLable: string
    giorno: number
    giornoLable: string
    info1: string
    info2: string
}