import { Component, OnInit, Input } from '@angular/core'
import { Observable } from 'rxjs'
import { Orario } from '../utils/orario.model'
import { trigger, state, style, transition, animate } from '@angular/animations'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-lista-orari',
  templateUrl: './lista-orari.component.html',
  styleUrls: ['./lista-orari.component.scss'],
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
export class ListaOrariComponent implements OnInit {

  @Input() orari: Observable<Orario[]>
  statoContenitoreLista: 'strumentiAperti' | 'strumentiChiusi' = 'strumentiChiusi'

  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if(queryParams.strumenti === 'aperto') this.cambiaStato('strumentiAperti')
      else this.cambiaStato('strumentiChiusi')
    })
  }

  cambiaStato(stato: 'strumentiAperti' | 'strumentiChiusi') {
    this.statoContenitoreLista = stato
  }
}
