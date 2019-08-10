import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { startWith, distinctUntilChanged, map } from 'rxjs/operators';

const intervalloAggiornamento = 5 * 1000

@Injectable({
  providedIn: 'root'
})
export class TempoService {

  giorno: Observable<number>
  ora: Observable<number>

  constructor() {
    //Recupero il giorno e l'ora da passere ai risultati
    this.giorno = interval(intervalloAggiornamento).pipe(map((index) => (new Date().getDay() - 1))).pipe(
      startWith((new Date().getDay() - 1)),
      distinctUntilChanged()
    )
    this.ora = interval(intervalloAggiornamento).pipe(map((index) => (new Date().getHours() - 8))).pipe(
      startWith((new Date().getHours() - 8)),
      distinctUntilChanged()
    )
  }

  ottieniOra = () => this.ora
  ottieniGiorno = () => this.giorno
}
