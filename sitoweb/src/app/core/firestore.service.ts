import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { map, take, startWith, tap } from 'rxjs/operators';
import { DocumentoIndice, ElementoIndice } from '../utils/indice.model';
import { Orario, ProssimoImpegno, Info } from '../utils/orario.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private db: AngularFirestore,
    private localStorage: LocalStorageService
  ) { }

  /**
   * Permette di ottenere gli indici di tutti: classi, aule e professori
   */
  ottieniIndici() {
    // Recupero gli indici di classi, aule e professori
    return combineLatest([
      this.db.collection('Aule').doc<DocumentoIndice>('Indici').valueChanges().pipe(startWith({
        lista: []
      } as DocumentoIndice)),
      this.db.collection('Classi').doc<DocumentoIndice>('Indici').valueChanges().pipe(startWith({
        lista: []
      } as DocumentoIndice)),
      this.db.collection('Professori').doc<DocumentoIndice>('Indici').valueChanges().pipe(startWith({
        lista: []
      } as DocumentoIndice))
    ]).pipe(
      map(indici => {
        indici = indici.map(indice => {
          if (indice !== undefined) {
            return indice
          } else {
            return {
              lista: []
            } as DocumentoIndice
          }
        }) as [DocumentoIndice, DocumentoIndice, DocumentoIndice]
        return [
          ...indici[0].lista.map(nome => {
            return {
              nome,
              collection: 'Aule'
            } as ElementoIndice
          }),
          ...indici[1].lista.map(nome => {
            return {
              nome,
              collection: 'Classi'
            } as ElementoIndice
          }),
          ...indici[2].lista.map(nome => {
            return {
              nome,
              collection: 'Professori'
            } as ElementoIndice
          })
        ]
      })
    )
  }

  /**
   * Permette di ottenere l'orario di uno specifico elemento
   * @param indiceOrario l'elemento del quale recuperare l'orario
   */
  ottieniOrario(indiceOrario: ElementoIndice): Observable<Orario> {
    return this.db.collection(indiceOrario.collection).doc<Orario>(indiceOrario.nome).snapshotChanges().pipe(
      map(snapshot => { // Converto alcuni valori
        let dati = snapshot.payload.data()
        if (dati !== undefined) {
          dati.collection = snapshot.payload.ref.parent.id
          switch (dati.collection) {
            case 'Classi':
              dati.tipo = 'Classe'
              break
            case 'Aule':
              dati.tipo = 'Aula'
              break
            case 'Professori':
              dati.tipo = 'Professore'
              break
          }

          if (dati.dataAggiornamento !== undefined) {
            dati.dataAggiornamento = (dati.dataAggiornamento as firebase.firestore.Timestamp).toDate()
          }
          if (dati.dataValidita !== undefined) {
            dati.dataValidita = (dati.dataValidita as firebase.firestore.Timestamp).toDate()
          }
          if (dati.ultimoAggiornamento !== undefined) {
            dati.ultimoAggiornamento = (dati.ultimoAggiornamento as firebase.firestore.Timestamp).toDate()
          }

          return dati
        } else {
          return undefined
        }
      }),
      tap(orario => { // Provo ad aggiornare i preferiti
        // Controllo se l'orario è nei preferiti, se si lo aggiorno
        this.localStorage.ottieniOrariPreferiti().then((preferiti: Orario[]) => {
          // Sostituisco l'orario con quello nuovo se presente
          if (preferiti.find(pref => pref.nome === orario.nome)) {
            return this.localStorage.salvaPreferiti(preferiti.map(preferito => {
              if (preferito.nome === orario.nome) {
                return orario
              } else {
                return preferito
              }
            }))
          } else {
            return false
          }
        })
        //TODO: Controllare se è cambiato?
      })
    )
  }

  /**
   * Trovo n impegni all'interno dell'orario specificato a partire dall'ora e dal giorno indicati
   * @param ora ora da cui partire
   * @param giorno giorno da cui partire
   * @param orario orario da controllare
   * @param numeroImpegni numero di impegni da estrarre, è possibile impostarlo ad Infinity, verranno recuperati tutti gli impegni!
   */
  trovaProssimiImpegni(ora: number, giorno: number, orario: Orario, numeroImpegni: number) {
    let oraPartenza = ora
    let giornoPartenza = giorno
    let oraFine = ora
    let giornoFine = giorno

    const impegni: ProssimoImpegno[] = []

    for (let i = 0; i < numeroImpegni; i++) {
      const impegno = this.trovaProssimoImpegno(oraPartenza, giornoPartenza, oraFine, giornoFine, orario)

      if (impegno !== undefined) {
        oraPartenza = impegno.ora + 1
        giornoPartenza = impegno.giorno

        if (impegni.length === 0) {
          oraFine = impegno.ora
          giornoFine = impegno.giorno
        }

        impegni.push(impegno)
      } else {
        break
      }
    }
    return impegni
  }

  /**
   * Permette di trovare un impegno successivo a uno dato all'interno di un orario
   * @param oraPartenza Ora dalla quale cercare
   * @param giornoPartenza Giorno dal quale cercare
   * @param oraFine Ora fino alla quale cercare
   * @param giornoFine Giorno fino al quale cercare
   * @param orario L'orario da utilizzare per cercare l'impegno
   */
  trovaProssimoImpegno(oraPartenza: number, giornoPartenza: number, oraFine: number, giornoFine: number, orario: Orario): ProssimoImpegno {
    // Nei commenti di questa funzione per ora e giorno corrente si intendono quelli del ciclo for

    // Se l'ora e il giorno di partenza coincidono, diminuisco la dine di un'ora
    if (oraPartenza === oraFine && giornoPartenza === giornoFine) {
      oraFine--
    }

    if (orario === undefined || orario.tabella === undefined) {
      return undefined
    } else {
      let giornoControllo = giornoPartenza
      let oraPartenzaControllo = (oraPartenza < 0 ? 0 : oraPartenza)

      for (let i = 0; i < 6; i++) { // Per ogni giorno
        // Cerco i dati del giorno corrente
        const datiGiornoCorrente = orario.tabella.map(ora => {
          const info: Info | undefined = ora.info.find(info => info.giorno === giornoControllo)

          if (info !== undefined) { // Controllo che sia diverso da undefined perchè assumo che se le info sono definite allora contengono anche dei dati
            return {
              ora: ora.ora,
              elementi: info.elementi
            } 
          } else {
            return undefined
          }
        }).filter(giorno => giorno !== undefined)
        
        //orario.tabelleOrario.tabellaPerGiorni.find(orarioGiorno => orarioGiorno.giorno === giornoControllo)

        if (datiGiornoCorrente !== undefined) {
          for (let k = oraPartenzaControllo; k < 8; k++) { // Per ogni ora
            // Controllo se siamo arrivata alla fine
            if (k === oraFine && giornoControllo === giornoFine) {
              return undefined
            }

            // Cerco i dati dell'ora corrente
            const datiOraCorrenteInfo = datiGiornoCorrente.find(orarioOra => orarioOra.ora === k)

            if (datiOraCorrenteInfo !== undefined) {
              // In questo caso abbiamo trovato il prossimo impegno!
              return {
                ora: k,
                oraLable: this.ottieniLableOra(k),
                giorno: giornoControllo,
                giornoLable: this.ottieniLableGiorno(giornoControllo),
                elementi: (datiOraCorrenteInfo !== undefined ? datiOraCorrenteInfo.elementi : []),
              }
            }
            // Altrimenti se i dati dell'ora corrente sono undefined vuol dire che non c'è alcuna attvitià in quest'ora,
            // passo alla prosssima
          }
        }
        // Se i dati del giorno corrente sono undefined vuol dire che nel giorno corrente non sono previste attvitià,
        // controllo il prossimo giorno

        // Resetto il giorno se passiamo alla settimana successiva
        giornoControllo++
        if (giornoControllo >= 6) {
          giornoControllo = 0
        }

        // Imposto il prossimo orario di partenza come 1 ora
        oraPartenzaControllo = 0
      }
    }
    return undefined
  }

  ottieniLableOra(ora: number) {
    switch (ora) {
      case 0: return '1a'
      case 1: return '2a'
      case 2: return '3a'
      case 3: return '4a'
      case 4: return '5a'
      case 5: return '6a'
      case 6: return '1p'
      case 7: return '2p'
      default: return 'hey'
    }
  }

  ottieniLableGiorno(giorno: number) {
    switch (giorno) {
      case 0: return 'Lun'
      case 1: return 'Mar'
      case 2: return 'Mer'
      case 3: return 'Gio'
      case 4: return 'Ven'
      case 5: return 'Sab'
      default: return 'Err'
    }
  }

  /**
   * Permette di salvare in firestore un messaggio che l'utente vuole inviare allo sviluppatore
   * @param messaggio Messaggio da inviare allo sviluppatore
   * @param mittente Mittente
   */
  async inviaMessaggio(contenuto: string, mittente?: string) {
    if (contenuto !== undefined) {
      const preferiti = await this.localStorage.ottieniOrariPreferiti()

      const messaggio = {
        contenuto,
        mittente,
        preferiti: preferiti.map(preferito => preferito.nome),
        data: new Date()
      }

      if (mittente === undefined || mittente === '') {
        delete messaggio.mittente
      }
      if (preferiti.length === 0) {
        delete messaggio.preferiti
      }

      return this.db.collection('Messaggi').add(messaggio)
    } else {
      throw new Error('Contenuto mancante')
    }
  }
}
