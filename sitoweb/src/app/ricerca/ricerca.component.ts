import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../core/firestore.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ElementoIndice } from '../utils/indice.model';

@Component({
  selector: 'app-ricerca',
  templateUrl: './ricerca.component.html',
  styleUrls: ['./ricerca.component.scss']
})
export class RicercaComponent implements OnInit {
  // TODO: valutere un miglioramento, se cambia uno dei tre indici l'intera lista viene ricaricata!
  // o per lo meno i documenti visualizzati e viene rieseguita laricerca del valore
  indici: Observable<ElementoIndice[]>
  valoreRicerca: Observable<string>
  indiciFiltrati: Observable<ElementoIndice[]>

  constructor(
    private router: ActivatedRoute,
    private firestore: FirestoreService
  ) { }

  ngOnInit() {
    // Recupero gli indici da database
    this.indici = this.firestore.ottieniIndici()

    // Ottengo il valore di ricerca dai parametri url
    this.valoreRicerca = this.router.queryParams.pipe(
      map(params => params.valore),
      map(valore => (valore === '*' || valore === 'Tutti' ? '.' : valore))
    )

    // TODO: Aggiungere nelle opzioni di ricerca la possibilità di visualizzare soltanto una delle tre tipologie di orari
    // probabilmente bisogna modificare il contenuto degli indici, da valutare prima della release

    // Combino il valore di ricerca con gli indici degli orari, in questo modo creo la lista di risultati da presentare all'utente
    this.indiciFiltrati = combineLatest(this.valoreRicerca, this.indici).pipe(
      map(elementiRicerca => elementiRicerca[1].filter(elemento => RegExp(elementiRicerca[0], 'i').test(elemento.nome)))
    )
  }
}
