import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { map, take } from 'rxjs/operators';
import { Orario } from '../utils/orario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(
    private localStorage: LocalStorage
  ) { }

  async controllaPaginaVisualizzata() {
    return this.localStorage.getItem('paginaVisualizzata').pipe(
      map(valore => valore === true),
      take(1)
    ).toPromise()
  }

  async impostaPaginaVisualizzata(valore: boolean = true) {
    return this.localStorage.setItem('paginaVisualizzata', valore).toPromise()
  }

  /**
   * Questa funzione permette di aggiungere un dato orario ai preferiti, quindi di salvarlo nella memoria locale e di poterci accedere
   * anche offline
   * @param orarioPreferito Orario da aggiungere ai preferiti
   */
  async aggiungiOrarioAiPreferiti(orarioPreferito: Orario) {
    try {
      const preferitiInMemoria = (await this.localStorage.getItem('preferiti').toPromise()) as Orario[]

      let preferiti: Orario[] = []

      // Recupero se possibile il vecchio orario
      if (preferitiInMemoria) {
        preferiti = preferitiInMemoria
      }

      // Controlo se è già presente
      if (!preferiti.find(preferito => preferito.nome === orarioPreferito.nome)) {
        // Aggiungo il nuovo orario alla lista
        preferiti.push(orarioPreferito)

        // Salvo i preferiti
        await this.localStorage.setItem('preferiti', preferiti).toPromise()

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
      await this.localStorage.setItem('preferiti', preferiti).toPromise()

      return true
    } catch (err) {
      return false
    }
  }

  ottieniOrariPreferiti() {
    return this.localStorage.getItem('preferiti') as Observable<Orario[]>
  }

  ottieniOrarioDaiPreferiti(document: string) {
    return this.ottieniOrariPreferiti().pipe(
      map((preferiti: Orario[] | undefined) => {
        if (preferiti) {
          return preferiti.find(elemento => elemento.nome === document)
        } else {
          return undefined
        }
      }),
    )
  }
}
