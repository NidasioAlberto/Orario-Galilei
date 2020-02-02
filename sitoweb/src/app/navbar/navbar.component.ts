import { Component, OnInit } from '@angular/core'
import { trigger, state, style, transition, animate, group, keyframes, query, animateChild, } from '@angular/animations'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router'
import { take, filter } from 'rxjs/operators'
import { StorageService } from '../core/storage.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatIconRegistry } from '@angular/material/icon'
import { DomSanitizer } from '@angular/platform-browser'
import { AngularFireAnalytics } from '@angular/fire/analytics'
import { firestore } from 'firebase'

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
          //query('@animazioneStrumenti', animateChild()),
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
          style({ display: 'block', opacity: '0', offset: 0.2 }),
          style({ display: 'block', opacity: '1', offset: 1 })
        ])),
      ]),
      transition('aperto => chiuso', [
        animate('.15s ease', keyframes([
          style({ display: 'block', opacity: '1', offset: 0 }),
          style({ display: 'block', opacity: '0', offset: 0.8 })
        ])),
      ]),
    ])
  ]
})
export class NavbarComponent implements OnInit {

  stato: 'aperto' | 'chiuso' = 'chiuso'
  loading: boolean = true
  filtriSelezionati: ('Classi' | 'Aule' | 'Professori')[]
  filtroClassi: boolean = false
  filtroAule: boolean = false
  filtroProfessori: boolean = false
  valoreRicerca: string

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storage: StorageService,
    private snackBar: MatSnackBar,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private analytics: AngularFireAnalytics
  ) {
    iconRegistry.addSvgIcon('menu', sanitizer.bypassSecurityTrustResourceUrl('assets/material-icons/menu-24px.svg'));
    iconRegistry.addSvgIcon('info', sanitizer.bypassSecurityTrustResourceUrl('assets/material-icons/info-24px.svg'));
  }

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

    // Controllo se aprire o chiudere gli strumenti in base ai parametri della navbar
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
    console.log(apri || this.stato === 'chiuso' ? 'Mostro i filtri' : 'Nascondo i filtri')
    this.analytics.logEvent(apri || this.stato === 'chiuso' ? 'apertura_filtri' : 'chiusura_filtri')

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

    if (this.stato == 'chiuso') queryParams.strumenti = undefined

    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge'
    })
  }

  impostaFiltri(filtri: ('Classi' | 'Aule' | 'Professori')[]) {
    this.filtriSelezionati = filtri
    if (filtri !== undefined) {
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
    console.log('Toggle filtro', filtro)
    this.analytics.logEvent('toggle_filtri', { filtro })

    // Aggiorni i filtri
    if (filtro === undefined) {
      this.filtriSelezionati = undefined
      this.filtroClassi = false
      this.filtroAule = false
      this.filtroProfessori = false
    } else {
      if (filtro === 'Classi') this.filtroClassi = !this.filtroClassi
      if (filtro === 'Aule') this.filtroAule = !this.filtroAule
      if (filtro === 'Professori') this.filtroProfessori = !this.filtroProfessori

      this.filtriSelezionati = []

      if (this.filtroClassi) this.filtriSelezionati.push('Classi')
      if (this.filtroAule) this.filtriSelezionati.push('Aule')
      if (this.filtroProfessori) this.filtriSelezionati.push('Professori')
    }
    this.aggiornaValoriRicerca()
  }

  public tornaAllaHome() {
    console.log('Torno alla home')
    this.analytics.logEvent('bottome_home')
    this.valoreRicerca = undefined
    this.filtriSelezionati = undefined
    this.impostaFiltri(this.filtriSelezionati)
    this.router.navigate(['/'])
  }

  aggiornaValoriRicerca(event?: KeyboardEvent) {
    let valoreRicerca = this.valoreRicerca
    let filtriSelezionati = this.filtriSelezionati
    // Chiudo gli strumenti se viene premuto invio
    if (event !== undefined && event.key === 'Enter') this.stato = 'chiuso'
    else this.stato = 'aperto'

    let stato = this.stato

    if (stato === 'chiuso') stato = undefined

    if (filtriSelezionati === undefined && (valoreRicerca === '' || valoreRicerca === undefined)) {
      valoreRicerca = '.' // E' una regex
    }

    // Mostro la pagina di ricerca
    this.router.navigate(['/ricerca'], {
      queryParams: {
        valore: valoreRicerca,
        filtri: filtriSelezionati,
        strumenti: stato
      }
    })
  }

  public apriInformazioni() {
    console.log('Apro la pagina informazioni')
    this.analytics.logEvent('bottone_informazioni')
    this.valoreRicerca = undefined
    this.filtriSelezionati = undefined
    this.impostaFiltri(this.filtriSelezionati)
    this.router.navigate(['/informazioni'])
  }
}