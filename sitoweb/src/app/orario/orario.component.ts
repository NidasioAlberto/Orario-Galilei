import { Component, OnInit } from '@angular/core'
import { trigger, state, style, transition, animate } from '@angular/animations'
import { Observable, from, combineLatest } from 'rxjs'
import { Orario } from '../utils/orario.model'
import { StorageService } from '../core/storage.service'
import { ActivatedRoute } from '@angular/router'
import { mergeMap, filter, distinctUntilChanged, share, map } from 'rxjs/operators'

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

  orario: Observable<Orario>
  impegni: Observable<string[]>

  statoContenitoreLista: 'strumentiAperti' | 'strumentiChiusi' = 'strumentiChiusi'

  constructor(
    private storage: StorageService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.strumenti === 'aperto') this.cambiaStato('strumentiAperti')
      else this.cambiaStato('strumentiChiusi')
    })

    // Recupero l'orario in base ai parametri url
    this.orario = this.activatedRoute.queryParams.pipe(
      distinctUntilChanged((x, y) => x.collection === y.collection && x.nome === y.nome),
      mergeMap(params => from(this.storage.ottieniOrario(params.collection, params.nome))),
      filter(orario => orario !== undefined),
      share()
    )

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
}
