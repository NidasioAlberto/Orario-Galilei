import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { map, take } from 'rxjs/operators';

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
}
