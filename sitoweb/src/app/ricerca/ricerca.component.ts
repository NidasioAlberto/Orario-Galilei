import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Observable, combineLatest, from } from 'rxjs'
import { map, distinctUntilChanged, concatMap } from 'rxjs/operators'
import { StorageService } from '../core/storage.service'
import { Orario } from '../utils/orario.model'

@Component({
  selector: 'app-ricerca',
  templateUrl: './ricerca.component.html',
  styleUrls: ['./ricerca.component.scss']
})
export class RicercaComponent implements OnInit {

  valoreRicerca: Observable<string>
  filtriRicerca: Observable<('Classi' | 'Aule' | 'Professori')[]>
  orariFiltrati: Observable<Orario[]>

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
    this.orariFiltrati = combineLatest([this.valoreRicerca, this.filtriRicerca]).pipe(
      concatMap(([valoreRicerca, filtriRicerca]) => from(this.storage.cercaOrari(valoreRicerca, filtriRicerca)))
    )
  }

}
