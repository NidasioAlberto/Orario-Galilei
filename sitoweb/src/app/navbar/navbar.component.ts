import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Output() cambiaTema = new EventEmitter();
  valoreRicerca: string

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(take(2)).subscribe(queryParams => {
      this.valoreRicerca = queryParams.valore
    })

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (!event.url.includes('ricerca')) {
        this.valoreRicerca = ''
      }
    })
  }

  tornaAllaHome() {
    this.aggiornaValoreRicerca('')
  }

  aggiornaValoreRicerca(valoreRicerca: string) {
    // Ogni volta che il valore di ricerca è valido mostro la pagina di ricerca
    if (valoreRicerca !== '') {
      // Se è valido mostro la pagina ricerca
      this.router.navigate(['/ricerca'], {
        queryParams: { valore: valoreRicerca }
      })
    } else {
      // Altrimenti la pagina principale
      this.router.navigate(['/'])
    }
  }
}
