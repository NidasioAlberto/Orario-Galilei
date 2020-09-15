import { firestore } from "firebase-admin";

interface Log {
    cloudFunction: string // Nome della cloud function che salva il log
    stato: 'ok' | 'err' | 'warning'
    messaggioErrore?: string
    data: Date | firestore.Timestamp
}

export interface LogOrari extends Log {
    orariModificati?: string[]
    orariNonModificati?: string[]
    orariNonRecuperati?: string[]
}