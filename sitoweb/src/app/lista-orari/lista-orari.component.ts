import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ElementoIndice } from '../utils/indice.model';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
        animate('0.2s ease-in'),
      ])
    ])
  ]
})
export class ListaOrariComponent implements OnInit  {

  @Input() indici: Observable<ElementoIndice[]>
  @Input() informazioni: boolean = false
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
