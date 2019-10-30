import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap, take, tap, filter } from 'rxjs/operators';
import { Observable, combineLatest, concat, from } from 'rxjs';
import { Orario, ProssimoImpegno } from '../utils/orario.model';
import { FirestoreService } from '../core/firestore.service';
import { TempoService } from '../core/tempo.service';
import { LocalStorageService } from '../core/local-storage.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
        animate('0.2s ease-in'),
      ])
    ])
  ]
})
export class OrarioComponent implements OnInit {

  orario: Observable<Orario>
  impegni: Observable<ProssimoImpegno[]>
  impegniLable: Observable<string[]>
  inPreferiti = false

  test = new Date()

  statoContenitoreLista: 'strumentiAperti' | 'strumentiChiusi' = 'strumentiChiusi'

  constructor(
    private router: ActivatedRoute,
    private firestore: FirestoreService,
    private tempo: TempoService,
    private localStorage: LocalStorageService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if(queryParams.strumenti === 'aperto') this.cambiaStato('strumentiAperti')
      else this.cambiaStato('strumentiChiusi')
    })

    // Recupero l'orario prima dal database offline e poi da firestore
    this.orario = this.router.queryParams.pipe(
      mergeMap(params => {
        return concat(
          from(this.localStorage.ottieniOrarioDaiPreferiti(params.document)).pipe(
            tap(orario => {
              // Se lorario che ottengo dai preferiti è valido imposto questo orario come preferito
              // (così mostro lo stato del bottone in modo appropriato)
              if (orario) {
                this.inPreferiti = true
              }
            })
          ),
          this.firestore.ottieniOrario({ collection: params.collection, nome: params.document })
        )
      }),
      filter(orario => orario !== undefined)
    )

    this.impegni = combineLatest([this.orario, this.tempo.ora, this.tempo.giorno]).pipe(
      map(dati => this.firestore.trovaProssimiImpegni(dati[1], dati[2], dati[0], 2)),
    )

    this.impegniLable = this.impegni.pipe(
      map(impegni => impegni.map(impegno =>
        impegno.giornoLable +
        ' ' +
        impegno.oraLable +
        ': ' +
        (impegno.elementi[0] !== undefined ? impegno.elementi[0] : '') +
        (impegno.elementi[0] !== undefined && impegno.elementi[1] !== undefined ? ' ' : '') +
        (impegno.elementi[1] !== undefined ? impegno.elementi[1] : '')
      ))
    )
  }

  async aggiungiAiPreferiti() {
    const orarioPreferito = await this.orario.pipe(take(1)).toPromise()

    //Agggiorni in firestore il numero di preferiti dell'orario selezionato
    this.firestore.incrementaPreferito(orarioPreferito)

    this.inPreferiti = await this.localStorage.aggiungiOrarioAiPreferiti(orarioPreferito)
  }

  async rimuoviDaiPreferiti() {
    // Recupero l'orario da rimuovere
    const orarioDaRimuovere = await this.orario.pipe(take(1)).toPromise()

    //Agggiorni in firestore il numero di preferiti dell'orario selezionato
    this.firestore.decrementaPreferito(orarioDaRimuovere)

    this.inPreferiti = !(await this.localStorage.rimuoviOrarioDaiPreferiti(orarioDaRimuovere))
  }

  cambiaStato(stato: 'strumentiAperti' | 'strumentiChiusi') {
    this.statoContenitoreLista = stato
  }
}
