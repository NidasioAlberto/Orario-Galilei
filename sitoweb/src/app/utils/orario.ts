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