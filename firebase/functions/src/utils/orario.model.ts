import { Timestamp } from "@google-cloud/firestore";

export interface OrarioFirestore {
    nome: string;
    tabella: ElementoTabella[];
    dataAggiornamento?: Date | Timestamp;
    dataValidita?: Date | Timestamp;
    versione?: string;
    ultimoAggiornamento?: Date | Timestamp;
}

export interface ElementoTabella {
    ora: number;
    info: Info[];
}

export interface Info {
    giorno: number;
    elementi: string[];
}