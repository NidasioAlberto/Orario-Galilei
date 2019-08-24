import { Injectable } from '@angular/core';
import { Observable, interval, observable, of } from 'rxjs';
import { startWith, distinctUntilChanged, map } from 'rxjs/operators';

const intervalloAggiornamento = 5 * 1000

@Injectable({
  providedIn: 'root'
})
export class TempoService {

  giorno: Observable<number>
  ora: Observable<number>

  constructor() {
    // Recupero il giorno e l'ora da passere ai risultati
    /*this.giorno = interval(intervalloAggiornamento).pipe(map(() => (new Date().getDay() - 1))).pipe(
      startWith((new Date().getDay() - 1)),
      distinctUntilChanged()
    )*/
    /*this.ora = interval(intervalloAggiornamento).pipe(map(() => (new Date().getHours() - 8))).pipe(
      startWith((new Date().getHours() - 8)),
      distinctUntilChanged()
    )*/

    this.giorno = of(new Date().getDay() - 1)
    this.ora = of(new Date().getHours() - 8)

    /*this.giorno = new Observable(subscriber => {
      let giorno = new Date().getDay() - 1

      subscriber.next(giorno)

      setInterval(() => {
        let tmp = new Date().getDay() - 1

        if(tmp != giorno) {
          subscriber.next(tmp)
          giorno = tmp
        }
      }, intervalloAggiornamento)
    })

    this.ora = new Observable(subscriber => {
      let ora = new Date().getHours() - 8

      subscriber.next(ora)

      setInterval(() => {
        let tmp = new Date().getHours() - 8

        if(tmp != ora) {
          subscriber.next(tmp)
          ora = tmp
        }
      }, intervalloAggiornamento)
    })*/
  }
}
