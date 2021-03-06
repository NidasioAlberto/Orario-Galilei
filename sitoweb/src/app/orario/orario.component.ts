import { Component, OnInit } from '@angular/core'
import { trigger, state, style, transition, animate } from '@angular/animations'
import { Observable, from, combineLatest, BehaviorSubject } from 'rxjs'
import { StorageService } from '../core/storage.service'
import { ActivatedRoute } from '@angular/router'
import { mergeMap, distinctUntilChanged, map } from 'rxjs/operators'
import { Orario } from '../utils/orario.model'
import { NgNavigatorShareService } from 'ng-navigator-share'
import { Title } from '@angular/platform-browser'
import { AngularFireAnalytics } from '@angular/fire/analytics'

@Component({
  selector: 'app-orario',
  templateUrl: './orario.component.html',
  styleUrls: ['./orario.component.scss'],
  animations: [
    trigger('animazioneContenitoreLista', [
      state('strumentiChiusi', style({
        'padding-top': '72px'
      })),
      state('strumentiAperti', style({
        'padding-top': '112px'
      })),
      transition('* => *', [
        animate('0.15s ease'),
      ])
    ])
  ]
})
export class OrarioComponent implements OnInit {

  loading: boolean = true
  orario = new BehaviorSubject<Orario>(undefined);
  orarioVisualizzato = new BehaviorSubject<Orario>(undefined);
  orarioDaVisualizzare: 'attuale' | 'storico' = 'attuale'
  impegni: Observable<string[]>
  storico: Orario[] = undefined
  statoPannelloStorico: boolean = false

  statoContenitoreLista: 'strumentiAperti' | 'strumentiChiusi' = 'strumentiChiusi'

  constructor(
    private storage: StorageService,
    private activatedRoute: ActivatedRoute,
    public ngNavigatorShareService: NgNavigatorShareService,
    private title: Title,
    private analytics: AngularFireAnalytics
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.strumenti === 'aperto') this.cambiaStato('strumentiAperti')
      else this.cambiaStato('strumentiChiusi')
    })

    // Recupero l'orario in base ai parametri url
    this.activatedRoute.queryParams.pipe(
      distinctUntilChanged((x, y) => x.collection === y.collection && x.nome === y.nome),
      mergeMap(params => from(this.storage.ottieniOrario(params.collection, params.nome))),
    ).subscribe(orario => {
      this.loading = false
      this.orario.next(orario)
      this.orarioVisualizzato.next(orario)
      if (orario !== null) this.title.setTitle(orario.nome)
    })

    this.impegni = combineLatest([this.storage.tempo, this.orario]).pipe(
      map(([tempo, orario]) => {
        return this.storage.trovaProssimiImpegni(tempo.ora, tempo.giorno, orario, 2)
      }),
      map(impegni => impegni.map(impegno =>
        impegno.giornoLable + ' ' +
        impegno.oraLable + ': ' +
        (impegno.elementi[0] !== undefined ? impegno.elementi[0] : '') +
        (impegno.elementi[0] !== undefined && impegno.elementi[1] !== undefined ? ' ' : '') +
        (impegno.elementi[1] !== undefined ? impegno.elementi[1] : '')
      ))
    )
  }

  cambiaStato(stato: 'strumentiAperti' | 'strumentiChiusi') {
    this.statoContenitoreLista = stato
  }

  async toogglePrefetiti() {
    const orarioAggiornato = this.orario.value as Orario

    console.log('Aggiorno la preferenza dell\'orario')
    this.analytics.logEvent(!orarioAggiornato.preferito ? 'aggiunta_preferito' : 'rimuovi_preferito', {
      nome: orarioAggiornato.nome,
      collection: orarioAggiornato.collection,
    })

    orarioAggiornato.preferito = !orarioAggiornato.preferito
    this.storage.aggiornaOrario(orarioAggiornato)
    this.orario.next(orarioAggiornato)
  }

  condividiOrario() {
    const datiOrario = this.orario.value as Orario
    this.ngNavigatorShareService.share({
      title: 'Orario ' + datiOrario.nome,
      text: 'Orario ' + datiOrario.nome + ':',
      url: window.location.href
    })
  }

  async caricaStoricoOrario() {
    console.log('Visualizzo la lista delle versioni dell\'orario')
    this.analytics.logEvent('lista_orario_storico', {
      nome: this.orario.value.nome,
      collection: this.orario.value.collection
    })
    if (this.storico === undefined) {
      this.storico = await this.storage.recuperaStoricoOrario(this.orario.value.collection, this.orario.value.nome)
    }
  }

  visualizzaOrarioStorico(orario: Orario) {
    console.log('Visualizzo l\'orario di', orario.nome, 'versione', orario.versione)
    this.analytics.logEvent('orario_storico', {
      nome: orario.nome,
      collection: orario.collection,
      dataValidita: orario.dataValidita,
      versione: orario.versione
    })

    if (orario.versione !== this.orario.value.versione) {
      this.orarioDaVisualizzare = 'storico'
      orario.tipo = this.orario.value.tipo
    } else {
      this.orarioDaVisualizzare = 'attuale'
    }
    this.orarioVisualizzato.next(orario)
  }

  tornaAllaVersioneCorrente() {
    console.log('Torno a visualizzare l\'orario corrente')
    this.analytics.logEvent('torna_a_orario_corrente', {
      nome: this.orario.value.nome,
      collection: this.orario.value.collection
    })
    
    this.statoPannelloStorico = false
    this.orarioDaVisualizzare = 'attuale'
    this.orarioVisualizzato.next(this.orario.value)
  }
}
