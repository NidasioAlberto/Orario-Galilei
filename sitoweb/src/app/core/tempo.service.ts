import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

const intervalloAggiornamento = 5 * 1000

@Injectable({
  providedIn: 'root'
})
export class TempoService {

  giorno: Observable<number>
  ora: Observable<number>

  constructor() {
    this.giorno = of(new Date().getDay() - 1)
    this.ora = of(new Date().getHours() - 8)
  }
}
