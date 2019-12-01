import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable, combineLatest, from } from 'rxjs'
import { map, distinctUntilChanged, concatMap } from 'rxjs/operators'
import { StorageService } from '../core/storage.service'

@Component({
  selector: 'app-ricerca',
  templateUrl: './ricerca.component.html',
  styleUrls: ['./ricerca.component.scss']
})
export class RicercaComponent implements OnInit {

  valoreRicerca: Observable<string>
  filtriRicerca: Observable<('tutti' | 'Classi' | 'Aule' | 'Professori')[]>


  constructor(
    private router: ActivatedRoute,
    private storage: StorageService
  ) { }

  ngOnInit() {
    // Ottengo il valore di ricerca e il filtro dai parametri url
    this.valoreRicerca = this.router.queryParams.pipe(
      map(params => params.valore),
      map(valore => (valore === '*' || valore === 'Tutti' ? '.' : valore)),
      distinctUntilChanged()
    )
    this.filtriRicerca = this.router.queryParams.pipe(
      map(params => params.filtri),
      distinctUntilChanged()
    )

    // Combino il valore di ricerca con i filtri da applicare per ottenere i risultati da mostrare
    combineLatest([this.valoreRicerca, this.filtriRicerca]).pipe(
      concatMap(([valoreRicerca, filtriRicerca]) => from(this.storage.cercaOrari(valoreRicerca, filtriRicerca)))
    ).subscribe(risultatiRicerca => console.log('Risultati ricerca:', risultatiRicerca))

    // Combino il valore di ricerca con gli indici degli orari, in questo modo creo la lista di risultati da presentare all'utente
    /*this.indiciFiltrati = combineLatest([this.valoreRicerca, this.indici]).pipe(
      map(elementiRicerca => elementiRicerca[1].filter(elemento => RegExp(elementiRicerca[0], 'i').test(elemento.nome)))
    )*/

    // Debug
    this.valoreRicerca.subscribe(valore => {
      console.log('Valore ricerca', valore)
    })
    this.filtriRicerca.subscribe(valore => {
      console.log('Filtri ricerca', valore)
    })
  }

}
