import { Component, OnInit } from '@angular/core'
import { trigger, state, style, transition, animate, group, keyframes, query, animateChild, } from '@angular/animations'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { take, filter } from 'rxjs/operators'
import { StorageService } from '../core/storage.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import undefined = require('firebase/empty-import')

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
  loading: boolean = true
  filtriSelezionati: ('tutti' | 'Classi' | 'Aule' | 'Professori')[] = undefined
  filtroClassi: boolean = false
  filtroAule: boolean = false
  filtroProfessori: boolean = false
  valoreRicerca: string

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storage: StorageService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // Recupero tutti gli orari all'allvio dell'app
    this.storage.caricaOrariCompleti().then(() => {
      this.loading = false
      this.snackBar.open('Tutti gli orari sono stati sincronizzati', undefined, { duration: 1000 })
    })

    // All'avvio della navbar recupero i primi due valori dei parametri nell'url
    // (il primo sarà vuoto mentre il secondo conterrà eventuali informazioni sullo
    // stato dei filtri: aperti o chiusi)
    this.activatedRoute.queryParams.pipe(take(2)).subscribe(queryParams => {
      // Recupero il valore di ricerca
      this.valoreRicerca = queryParams.valore

      // Recupero e imposto i filtri
      this.impostaFiltri(queryParams.filtri)

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
        this.filtriSelezionati = undefined
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

  impostaFiltri(filtri: ('Classi' | 'Aule' | 'Professori')[]) {
    this.filtriSelezionati = filtri
    if(filtri !== undefined) {
      this.filtroClassi = filtri.includes('Classi')
      this.filtroAule = filtri.includes('Aule')
      this.filtroProfessori = filtri.includes('Professori')
    } else {
      this.filtroClassi = false
      this.filtroAule = false
      this.filtroProfessori = false
    }
  }

  public toggleFiltro(filtro?: 'Classi' | 'Aule' | 'Professori') {
    console.log(filtro)
    
    // Aggiorni i filtri
    if(filtro === undefined) {
      this.filtriSelezionati = undefined
      this.filtroClassi = false
      this.filtroAule = false
      this.filtroProfessori = false
    } else {
      if(filtro === 'Classi') this.filtroClassi = !this.filtroClassi
      if(filtro === 'Aule') this.filtroAule = !this.filtroAule
      if(filtro === 'Professori') this.filtroProfessori = !this.filtroProfessori
      
      this.filtriSelezionati = []
      
      if(this.filtroClassi) this.filtriSelezionati.push('Classi')
      if(this.filtroAule) this.filtriSelezionati.push('Aule')
      if(this.filtroProfessori) this.filtriSelezionati.push('Professori')
    }
    this.aggiornaValoriRicerca()

    console.log(this.filtroClassi, this.filtroAule, this.filtroProfessori)
    console.log(this.filtriSelezionati)
  }

  public tornaAllaHome() {
    this.valoreRicerca = undefined
    this.filtriSelezionati = undefined
    this.mostraFiltri(false)
    this.aggiornaValoriRicerca()
  }

  aggiornaValoriRicerca(event?: KeyboardEvent) {
    let valoreRicerca = this.valoreRicerca
    let filtriSelezionati = this.filtriSelezionati
    // Chiudo gli strumenti se viene premuto invio
    if(event !== undefined && event.key === 'Enter') this.stato = 'chiuso'
    else this.stato = 'aperto'

    let stato = this.stato

    if (stato === 'chiuso') stato = undefined

    if (valoreRicerca === '') valoreRicerca = undefined

    if (filtriSelezionati === undefined && valoreRicerca === undefined) {
      valoreRicerca = '.' // E' una regex
    }

    // Ogni volta che il valore di ricerca è valido mostro la pagina di ricerca
    if (valoreRicerca !== undefined || filtriSelezionati !== undefined) {
      // Se è valido mostro la pagina ricerca
      this.router.navigate(['/ricerca'], {
        queryParams: {
          valore: valoreRicerca,
          filtri: filtriSelezionati,
          strumenti: stato
        }
      })
    } else {
      // Altrimenti la pagina principale
      this.router.navigate(['/'])
    }
  }
}