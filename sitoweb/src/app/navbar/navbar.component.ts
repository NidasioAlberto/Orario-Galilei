import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate, } from '@angular/animations';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [
    trigger('animazioneNavBar', [
      state('chiuso', style({
        height: '48px',
      })),
      state('aperto', style({
        height: '88px'
      })),
      transition('* => *', [
        animate('0.2s ease-in'),
      ])
    ]),
    trigger('animazioneStrumenti', [
      state('chiuso', style({
        display: 'none',
      })),
      state('aperto', style({
        display: 'flex'
      })),
      transition('* => *', [
        animate('0.2s ease-in'),
      ]),
    ])
  ]
})
export class NavbarComponent implements OnInit {

  stato: 'aperto' | 'chiuso' = 'chiuso'
  filtroSelezionato: 'tutti' | 'Classi' | 'Aule' | 'Professori' = 'tutti'
  valoreRicerca: string

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.pipe(take(2)).subscribe(queryParams => {
      this.valoreRicerca = queryParams.valore
      this.filtroSelezionato = queryParams.filtro

      if (queryParams.strumenti === 'aperto') this.mostraFiltri()

      if (this.valoreRicerca === '.') this.valoreRicerca = undefined
    })

    this.activatedRoute.queryParams.subscribe(queryParams => {
      if(queryParams.strumenti === 'aperto') this.stato = 'aperto'
      else this.stato = 'chiuso'
    })

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (!event.url.includes('ricerca')) {
        this.valoreRicerca = ''
      }
      if (!event.url.includes('filtro')) {
        this.filtroSelezionato = 'tutti'
      }
    })
  }

  mostraFiltri(apri?: boolean) {
    if (apri === undefined) {
      if (this.stato === 'aperto') this.stato = 'chiuso'
      else this.stato = 'aperto'
    } else {
      if (apri) this.stato = 'aperto'
      else this.stato = 'chiuso'
    }

    this.router.navigate([], {
      queryParams: { 
        strumenti: this.stato
      },
      queryParamsHandling: 'merge'
    })
  }

  cambiaFiltro(filtro: 'tutti' | 'Classi' | 'Aule' | 'Professori' = 'tutti') {
    this.filtroSelezionato = filtro
    this.aggiornaValoriRicerca(this.valoreRicerca, filtro)
  }

  tornaAllaHome() {
    this.valoreRicerca = undefined
    this.filtroSelezionato = undefined
    this.mostraFiltri(false)
    this.aggiornaValoriRicerca()
  }

  aggiornaValoriRicerca(valoreRicerca?: string, filtro?: string) {
    let stato = this.stato
    if(stato === 'chiuso') stato = undefined

    if (valoreRicerca === '') valoreRicerca = undefined

    if (filtro === 'tutti' && valoreRicerca === undefined) {
      valoreRicerca = '.' // E' una regex
    }

    // Se il filtro è impostato a tutti non lo inserisco
    if (filtro === 'tutti') {
      filtro = undefined
    }

    // Ogni volta che il valore di ricerca è valido mostro la pagina di ricerca
    if (valoreRicerca !== undefined || filtro !== undefined) {
      // Se è valido mostro la pagina ricerca
      this.router.navigate(['/ricerca'], {
        queryParams: { 
          valore: valoreRicerca,
          filtro: filtro,
          strumenti: stato
        }
      })
    } else {
      // Altrimenti la pagina principale
      this.router.navigate(['/'])
    }
  }
}