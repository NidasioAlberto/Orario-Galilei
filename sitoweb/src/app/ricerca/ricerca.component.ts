import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../core/firestore.service';
import { Observable, combineLatest, interval } from 'rxjs';
import { map, distinctUntilChanged, startWith } from 'rxjs/operators';
import { ElementoIndice } from '../utils/indice';
import { TempoService } from '../core/tempo.service';

@Component({
  selector: 'app-ricerca',
  templateUrl: './ricerca.component.html',
  styleUrls: ['./ricerca.component.scss']
})
export class RicercaComponent implements OnInit {
  //TODO: valutere un miglioramento, se cambia uno dei tra indici l'intera lista viene ricaricata!
  indici: Observable<ElementoIndice[]>
  valoreRicerca: Observable<string>
  indiciFiltrati: Observable<ElementoIndice[]>
  giorno: Observable<number>
  ora: Observable<number>

  constructor(private router: ActivatedRoute, private firestore: FirestoreService, private tempo: TempoService) { }

  ngOnInit() {
    //Debug
    console.log('ngOnInit')

    //Recupero gli indici da database
    this.indici = this.firestore.ottieniIndici()

    //Ottengo il valore di ricerca dai parametri url
    this.valoreRicerca = this.router.queryParams.pipe(map(params => params['valore']), map(valore => (valore === '*' || valore === 'Tutti' ? '.' : valore)))

    //Combino il valore di ricerca con gli indici degli orari, in questo modo creo la lista di risultati da presentare all'utente
    this.indiciFiltrati = combineLatest(this.valoreRicerca, this.indici).pipe(
      map(elementiRicerca => elementiRicerca[1].filter(elemento => RegExp(elementiRicerca[0], 'i').test(elemento.nome)))
    )

    //Debug
    this.indiciFiltrati.subscribe(risultati => {
      console.log('dati filtrati: ', risultati.length)
    })

    //Recupero l'ora e il giorno dal TempoService
    this.giorno = this.tempo.ottieniGiorno()
    this.ora = this.tempo.ottieniOra()
  }

}
