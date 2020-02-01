import { Component, Input } from '@angular/core'
import { Info, Orario } from 'src/app/utils/orario.model'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grafico-orario',
  templateUrl: './grafico-orario.component.html',
  styleUrls: ['./grafico-orario.component.scss']
})
export class GraficoOrarioComponent {

  @Input() orario: Observable<Orario>

  constructor() { }

  trovaInfo(orario: Orario, ora: number, giorno: number, info: number): string {
    if (ora === -1) {
      switch (giorno) {
        case -1: return ''
        case 0: return 'Lunedì'
        case 1: return 'Martedì'
        case 2: return 'Mercoledì'
        case 3: return 'Giovedì'
        case 4: return 'Venerdì'
        case 5: return 'Sabato'
      }
    }

    if (giorno === -1) {
      switch (ora) {
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

    // Controllo se i dati dell'orario sono presenti
    if (orario === undefined) {
      return ''
    }

    // Cerco i dati dell'ora e li controllo
    const datiOra = orario.tabella.find(datoOra => datoOra.ora === ora)
    if (datiOra === undefined) {
      return ''
    }

    // Cerco i dati del giorno
    let datiInfo: Info[] = datiOra.info

    const datiGiorno = datiInfo.find(infoOra => infoOra.giorno === giorno)
    if (datiGiorno === undefined || datiGiorno.elementi[info] === undefined) {
      return ''
    }

    return datiGiorno.elementi[info]
  }

  preparaStileCella(ora: number, giorno: number) {
    return {
      'border-top': (ora !== -1 ? '1px solid black' : '1px solid transparent'),
      'border-bottom': (ora !== 7 ? '1px solid black' : '1px solid transparent'),
      'border-left': (giorno !== -1 ? '1px solid black' : '1px solid transparent'),
      'border-right': (giorno !== 5 ? '1px solid black' : '1px solid transparent'),
      width: (giorno === -1 ? '30px' : '97px'),
      height: (ora === -1 ? '20px' : '47px'),
      'min-width': (giorno === -1 ? '30px' : '97px'),
      'min-height': (ora === -1 ? '20px' : '47px')
    }
  }
}
