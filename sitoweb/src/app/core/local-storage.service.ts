import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { map, take, filter } from 'rxjs/operators';
import { Orario, RisultatoConfronto } from '../utils/orario.model';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { ElementoIndice } from '../utils/indice.model';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(
    private localStorage: LocalStorage
  ) { }

  /**
   * Permette di controllare se l'utente ha visualizzato già altre volte la pagina
   */
  async controllaPaginaVisualizzata() {
    return this.localStorage.getItem('paginaVisualizzata').pipe(
      map(valore => valore === true),
      take(1)
    ).toPromise()
  }

  /**
   * Imposta la pagina visualizzata o no in base al valore
   * @param valore
   */
  async impostaPaginaVisualizzata(valore: boolean = true) {
    return this.localStorage.setItem('paginaVisualizzata', valore).toPromise()
  }

  /**
   * Contorolla se ci sono aggiornamenti negli orario salvati come preferiti
   */
  /*async aggiornaPreferiti() {
    // Recupero i preferiti
    let preferiti = await (this.localStorage.getItem('preferiti') as Observable<Orario[]>).pipe(take(1)).toPromise()

    // Controllo se gli orari preferiti sono definiti
    if (preferiti && preferiti.length > 0) {
      console.log('Provo ad aggiornare')

      // Recupero ciascun orario dal database e lo aggiorno
      const preferitiAggiornati = await this.ottieniPreferitiAggiornati(preferiti)
  
      // Per ogni preferito confronto il nuovo corrispettivo
      const orariDaAggiornare = preferiti.map(preferito => {
        const corrispettivoAggiornato = preferitiAggiornati.find(pref => pref.nome === preferito.nome)
  
        if (corrispettivoAggiornato !== undefined) {
          // Confronto gli orari
          const risultatoConfronto = this.confrontaOrari(preferito, corrispettivoAggiornato)
  
          console.log('Risultato confronto', risultatoConfronto)
  
          if (risultatoConfronto !== undefined) {
            return corrispettivoAggiornato
          }
        }
  
        return undefined
      }).filter(orario => orario !== undefined)
  
      // Se gli orari sono diversi sovrascrivo quello vecchio con quello nuovo
      // e' più efficiente salvarli tutti, tanto sono stati già letti dal database
      console.log('Preferiti', await this.localStorage.setItem('preferiti', preferitiAggiornati).toPromise())
  
      return orariDaAggiornare.length // Ritorno il numero di orari effettivamente cambiati
    } else {
      return 0
    }
  }*/

  /**
   * Permette di recuperare gli orari da firestore
   * @param preferiti 
   */
  /*ottieniPreferitiAggiornati(preferiti: Orario[]) {
    return Promise.all(preferiti.map(preferito => {
      if (preferito.collection !== undefined && preferito.nome !== undefined) {
        return this.firebase.ottieniOrario({
          nome: preferito.nome,
          collection: preferito.collection
        }).pipe(take(1)).toPromise()
      } else {
        return undefined
      }
    }).filter(preferito => preferito !== undefined))
  }*/

  /**
   * Questa funzione permette di confrontare due orari, nel caso siano identici ritorna undefined
   * altrimenti ritorna le coordinate degli elementi differenti (ora, giorno)
   * @param orario1 Primo orario da confrontare
   * @param orario2 Secondo orario da confrontare
   */
  confrontaOrari(orario1: Orario, orario2: Orario): RisultatoConfronto[] | undefined {
    const differenze: RisultatoConfronto[] = []
    // All'interno dell'orario potrebbe esserci salvata anche la tebella per giorni, noi utilizzeremo solamente la tabella per ore

    // Confronto ora per ora
    for (let i = 0; i < 8; i++) {
        // Controllo se per quest'ora sono presenti degli impegni per i due orari
        const impegniOra1 = orario1.tabella.find(elemento => elemento.ora === i);
        const impegniOra2 = orario2.tabella.find(elemento => elemento.ora === i);

        // Controllo se entrambi gli impegni dell'ora corrente sono mancanti
        if (impegniOra1 !== undefined && impegniOra2 !== undefined) { // Sono entrambi validi
            // 1: Controllo ciascun giorno
            for (let j = 0; j < 6; j++) {
                // 2: Recupero se è presente l'impegno per questo giorno
                const orario1InfoGiorno = impegniOra1.info.find(elemento => elemento.giorno === j)
                const orario2InfoGiorno = impegniOra2.info.find(elemento => elemento.giorno === j)

                if (orario1InfoGiorno !== undefined && orario2InfoGiorno !== undefined) { //5.1 L'imegno è da controllare
                    //6: Confronto gli impegni
                    if (orario1InfoGiorno.elementi.length !== orario2InfoGiorno.elementi.length) { // Impegni diversi
                        differenze.push({
                            ora: i,
                            giorno: j
                        })
                    } else {
                        // Controllo il contetnuto degli elementi
                        const diversi = orario1InfoGiorno.elementi.reduce((acc, elemento1, k) => {
                            if (elemento1 !== orario2InfoGiorno.elementi[k]) {
                                return true
                            } else {
                                return acc
                            }
                        }, false) // Parto supponendo che non siano diversi

                        if (diversi) {
                            differenze.push({
                                ora: i,
                                giorno: j
                            })
                        }
                    }
                } else if (orario1InfoGiorno !== undefined) {
                    differenze.push({
                        ora: i,
                        giorno: j
                    })
                } else if (orario2InfoGiorno !== undefined) {
                    differenze.push({
                        ora: i,
                        giorno: j
                    })
                } else {
                    // Se sono entrambi undefined allora sono identici
                }
            }
        } else if (impegniOra1 !== undefined) { // Solo gli impegni del primo orario sono validi
            differenze.concat(impegniOra1.info.map(inf => {
                return {
                    ora: i,
                    giorno: inf.giorno
                } as RisultatoConfronto
            }))
        } else if (impegniOra2 !== undefined) { // Solo gli impegni del secondo orario sono validi
            differenze.concat(impegniOra2.info.map(inf => {
                return {
                    ora: i,
                    giorno: inf.giorno
                } as RisultatoConfronto
            }))
        } // Gli impegni di entrambi gli orari sono mancanti, quindi sono uguali
    }

    if (differenze.length > 0) {
        return differenze
    } else {
        return undefined
    }
  }

  /**
   * Questa funzione permette di aggiungere un dato orario ai preferiti, quindi di salvarlo nella memoria locale e di poterci accedere
   * anche offline
   * @param orarioPreferito Orario da aggiungere ai preferiti
   */
  async aggiungiOrarioAiPreferiti(orarioPreferito: Orario) {
    try {
      let preferiti = await this.ottieniOrariPreferiti()

      // Controlo se è già presente
      if (!preferiti.find(preferito => preferito.nome === orarioPreferito.nome)) {
        // Aggiungo il nuovo orario alla lista
        preferiti.push(orarioPreferito)

        // Salvo i preferiti
        await this.salvaPreferiti(preferiti)

        return true
      }
    } catch (err) {
      return false
    }
  }

  /**
   * Questa funzione permette di rimuovere un dato orario dai preferiti, quindi rimuoverlo dalla memoria locale
   * @param orarioDaRimuovere Orario da rimuovere
   */
  async rimuoviOrarioDaiPreferiti(orarioDaRimuovere: Orario) {
    try {
      // Recupero i preferiti
      let preferiti = (await this.localStorage.getItem('preferiti').toPromise()) as Orario[]

      // Rimuovo l'orario corrente
      preferiti = preferiti.filter(preferito => preferito.nome !== orarioDaRimuovere.nome)

      // Salvo i preferiti
      await this.salvaPreferiti(preferiti)

      return true
    } catch (err) {
      return false
    }
  }

  /**
   * Permette di salvare in indexdDB i preferiti speficicati sovrascrivendo qualinque dato già presente
   * @param preferiti 
   */
  async salvaPreferiti(preferiti: Orario[]) {
    return this.localStorage.setItem('preferiti', preferiti).toPromise()
  }

  ottieniOrariPreferiti() {
    return (this.localStorage.getItem('preferiti') as Observable<Orario[]>).pipe(
      map(preferiti => {
        if (!!preferiti) {
          return preferiti
        } else {
          return []
        }
      })
    ).pipe(take(1)).toPromise()
  }

  ottieniOrarioDaiPreferiti(document: string) {
    return this.ottieniOrariPreferiti().then((preferiti: Orario[] | undefined) => {
      if (preferiti) {
        return preferiti.find(elemento => elemento.nome === document)
      } else {
        return undefined
      }
    })
  }
}
