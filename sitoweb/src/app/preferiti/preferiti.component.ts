import { Component, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
import { ElementoIndice } from '../utils/indice.model';
import { LocalStorageService } from '../core/local-storage.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-preferiti',
  templateUrl: './preferiti.component.html',
  styleUrls: ['./preferiti.component.scss']
})
export class PreferitiComponent implements OnInit {
  indicePreferiti: Observable<ElementoIndice[]>

  constructor(
    private localStorage: LocalStorageService
  ) { }

  ngOnInit() {
    // Recupero i preferiti
    this.indicePreferiti = from(this.localStorage.ottieniOrariPreferiti().then(preferiti => {
      return preferiti.map(preferito => {
        return {
          nome: preferito.nome,
          collection: preferito.collection
        } as ElementoIndice
      })
    }))
  }
}
