export interface Classe {
    classe: string
    tabellaPerGiorni: OrarioPerGiorno[]
    tabellaPerOre: OrarioPerOra[]
}

export interface Aula {
    aula: string
    tabellaPerGiorni: OrarioPerGiorno[]
    tabellaPerOre: OrarioPerOra[]
}

export interface Professore {
    professore: string
    tabellaPerGiorni: OrarioPerGiorno[]
    tabellaPerOre: OrarioPerOra[]
}

export interface InfoGiorno {
    nome: string,
    ora: string
}

export interface InfoOra {
    nome: string,
    giorno: string
}

export interface OrarioPerGiorno {
    giorno: string,
    info1: InfoGiorno[],
    info2: InfoGiorno[],
}

export interface OrarioPerOra {
    ora: string,
    info1: InfoOra[],
    info2: InfoOra[],
}