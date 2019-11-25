import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate, group, keyframes, query, animateChild, } from '@angular/animations';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { take, filter } from 'rxjs/operators';

/**
 * Questo componente è responsibile della navbar visualizzata in ogni pagina.
 * 
 * I componenti principali della navbar sono:
 * - Bottone home: Questo bottone riporta l'icona della scuola e quando schiacciato
 *    reindirizza l'utente alla schermata principale dei preferiti
 * - Input ricerca: Questo input di testo permette di ricercare un orario nel database.
 *    Se cliccato (quando prende focus e la tastiera di apre sui dispositivi mobili)
 *    renderà visibili i filtri e nel momento in cui viene inserito un qualsiasi valore
 *    viene mostrata la pagina con i risultati della ricerca
 * - Bottone filtri: Apre e chiude i filtri
 * - Filtri: Sono 4 bottoni che permettono di visualizzare tutti gli orari o filtrare
 *    la ricerca per classi, aule o professori
 */

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  animations: [
    trigger('animazioneNavBar', [
      state('chiuso', style({
        height: '48px'
      })),
      state('aperto', style({
        height: '88px'
      })),
      transition('* => *', [
        group([
          query('@animazioneStrumenti', animateChild()),
          animate('.15s ease'),
        ]),
      ])
    ]),
    trigger('animazioneStrumenti', [
      state('chiuso', style({
        display: 'none'
      })),
      state('aperto', style({
        display: 'block',
        opacity: '1'
      })),
      transition('chiuso => aperto', [
        animate('.15s ease', keyframes([
          style({ display: 'block', opacity: '0', offset: 0 }),
          style({ display: 'block', opacity: '1', offset: 1 })
        ])),
      ]),
      transition('aperto => chiuso', [
        animate('.15s ease', keyframes([
          style({ display: 'block', opacity: '1', offset: 0 }),
          style({ display: 'block', opacity: '0', offset: 1 })
        ])),
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
    // All'avvio della navbar recupero i primi due valori dei parametri nell'url
    // (il primo sarà vuoto mentre il secondo conterrà eventuali informazioni sullo
    // stato dei filtri: aperti o chiusi)
    this.activatedRoute.queryParams.pipe(take(2)).subscribe(queryParams => {
      // Recupero il valore di ricerca e il filtro selezionato
      this.valoreRicerca = queryParams.valore
      this.filtroSelezionato = queryParams.filtro

      // Se è selezionato un filtro tra quelli possibili lo imposto
      if (queryParams.filtro !== undefined && queryParams.filtro in ['tutti', 'Classi', 'Aule', 'Professori'])
        this.filtroSelezionato = queryParams.filtro

      // Se gli strumenti dovrebbero essere aperti li apro
      if (queryParams.strumenti === 'aperto') this.stato = 'aperto'

      // Se il valore ricerca è definito lo imposto
      if (queryParams.valore)
        if (this.valoreRicerca === '.') {
          this.valoreRicerca = undefined
        }
    })

    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.strumenti === 'aperto') this.stato = 'aperto'
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

    let queryParams = {
      strumenti: this.stato
    }

    if(this.stato == 'chiuso') queryParams.strumenti = undefined

    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge'
    })
  }

  cambiaFiltro(filtro: 'tutti' | 'Classi' | 'Aule' | 'Professori' = 'tutti') {
    this.filtroSelezionato = filtro
    this.aggiornaValoriRicerca(this.valoreRicerca, filtro)
  }

  public tornaAllaHome() {
    this.valoreRicerca = undefined
    this.filtroSelezionato = undefined
    this.mostraFiltri(false)
    this.aggiornaValoriRicerca()
  }

  aggiornaValoriRicerca(valoreRicerca?: string, filtro?: string) {
    let stato = this.stato
    if (stato === 'chiuso') stato = undefined

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