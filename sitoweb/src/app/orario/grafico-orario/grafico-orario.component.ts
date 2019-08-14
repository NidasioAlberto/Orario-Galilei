import { Component, Input, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { Orario, InfoOre, ProssimoImpegno } from 'src/app/utils/orario';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-grafico-orario',
  templateUrl: './grafico-orario.component.html',
  styleUrls: ['./grafico-orario.component.scss']
})
export class GraficoOrarioComponent implements OnInit {

  @Input() orario: Observable<Orario>
  @Input() impegni: Observable<ProssimoImpegno[]>

  dati: Observable<{
    orario: Orario,
    impegni: ProssimoImpegno[]
  }>

  constructor() { }

  ngOnInit() {
    this.dati = combineLatest(this.orario, this.impegni).pipe(map(dati => { 
      return { orario: dati[0], impegni: dati[1] }
    }))
  }

  trovaInfo(orario: Orario, ora: number, giorno: number, info: number): string {
    if(ora == -1) {
      switch(giorno) {
        case -1: return ''
        case 0: return 'Lunedì'
        case 1: return 'Martedì'
        case 2: return 'Mercoledì'
        case 3: return 'Giovedì'
        case 4: return 'Venerdì'
        case 5: return 'Sabato'
      }
    }

    if(giorno == -1) {
      switch(ora) {
        case -1: return ''
        case 0: return '1a'
        case 1: return '2a'
        case 2: return '3a'
        case 3: return '4a'
        case 4: return '5a'
        case 5: return '6a'
        case 6: return '1p'
        case 7: return '2p'
      }
    }

    //Controllo se i dati dell'orario sono presenti
    if(orario == undefined || !(info  == 1 || info == 2)) return ''

    //Cerco i dati dell'ora e li controllo
    let datiOra = orario.tabelleOrario.tabellaPerOre.find(datiOra => datiOra.ora == ora)
    if(datiOra == undefined) return ''

    //Cerco i dati del giorno
    let datiInfo: InfoOre[]
    if(info == 1) datiInfo = datiOra.info1
    else datiInfo = datiOra.info2
    let datiGiorno = datiInfo.find(infoOra => infoOra.giorno == giorno)
    if(datiGiorno == undefined) return ''

    return datiGiorno.nome
  }

  preparaStileCella(ora: number, giorno: number) {

    return {
      'border-top': (ora != -1 ? '1px solid black' : '1px solid transparent'),
      'border-bottom': (ora != 7 ? '1px solid black' : '1px solid transparent'),
      'border-left': (giorno != -1 ? '1px solid black' : '1px solid transparent'),
      'border-right': (giorno != 5 ? '1px solid black' : '1px solid transparent'),
      'width': (giorno == -1 ? '30px' : '97px'),
      'height': (ora == -1 ? '20px' : '47px'),
      'min-width': (giorno == -1 ? '30px' : '97px'),
      'min-height': (ora == -1 ? '20px' : '47px')
    }
  }
}
