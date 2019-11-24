import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-ricerca',
  templateUrl: './ricerca.component.html',
  styleUrls: ['./ricerca.component.scss']
})
export class RicercaComponent implements OnInit {

  valoreRicerca: Observable<string>
  filtroRicerca: Observable<'Classi' | 'Aule' | 'Professori'>

  constructor(
    private router: ActivatedRoute,
  ) { }

  ngOnInit() {
    // Ottengo il valore di ricerca e il filtro dai parametri url
    this.valoreRicerca = this.router.queryParams.pipe(
      map(params => params.valore),
      map(valore => (valore === '*' || valore === 'Tutti' ? '.' : valore)),
      distinctUntilChanged()
    )
    this.filtroRicerca = this.router.queryParams.pipe(
      map(params => params.filtro),
      distinctUntilChanged()
    )

    // Debug
    this.valoreRicerca.subscribe(valore => {
      console.log('Valore ricerca', valore)
    })
    this.filtroRicerca.subscribe(valore => {
      console.log('Filtro ricerca', valore)
    })
  }

}
