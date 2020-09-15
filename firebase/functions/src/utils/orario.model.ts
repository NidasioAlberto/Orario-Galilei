import { firestore } from "firebase-admin";

export interface OrarioFirestore {
    nome: string;
    tabella: ElementoTabella[];
    dataAggiornamento?: Date | firestore.Timestamp;
    dataValidita?: Date | firestore.Timestamp;
    versione?: string;
    ultimoAggiornamento?: Date | firestore.Timestamp;
}

export interface ElementoTabella {
    ora: number;
    info: Info[];
}

export interface Info {
    giorno: number;
    elementi: string[];
}