interface Log {
    cloudFunction: string // Nome della cloud function che salva il log
    stato: 'ok' | 'err' | 'warning'
}

export interface LogOrari extends Log {
    
}