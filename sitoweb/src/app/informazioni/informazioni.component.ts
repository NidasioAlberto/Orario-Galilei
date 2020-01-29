import { Component, OnInit } from '@angular/core'
import { Aggiornamento } from '../utils/aggiornamento.model'
import { trigger, state, style, transition, animate } from '@angular/animations'
import { ActivatedRoute } from '@angular/router'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-informazioni',
  templateUrl: './informazioni.component.html',
  styleUrls: ['./informazioni.component.scss'],
  animations: [
    trigger('animazioneContenitore', [
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
export class InformazioniComponent implements OnInit {

  statoContenitore: 'strumentiAperti' | 'strumentiChiusi' = 'strumentiChiusi'

  versione = '0.9'
  aggiornamentiApp: Aggiornamento[] = [
    {
      dataPubblicazione: '6/12/19',
      descrizioneBreve: 'Condivisione e dati offline',
      descrizione: 'È stata aggiunta la possibilità di condividere un orario. Tutti gli orari vengono ora salvati sul dispositivo così da consultare anche senza connessione. Sono state rimosse le informazioni dalla pagina principale a una pagina separata accessibile tramite il bottone apposito negli strumenti. Si può poi selezionare più filtri nel caso si voglia fare una ricerca specifica (si possono usare anche le regex nella barra di ricerca!).'
    },
    {
      dataPubblicazione: '30/10/19',
      descrizioneBreve: 'Filtri',
      descrizione: 'Aggiunto un menù per filtrare la ricerca'
    },
    {
      dataPubblicazione: '19/10/19',
      descrizioneBreve: 'Dialog informazioni',
      descrizione: 'Il messaggio iniziale viene ora mostrato nella home sotto i preferiti'
    },
    {
      dataPubblicazione: '29/9/19',
      descrizioneBreve: 'Info complete',
      descrizione:
        'La pagina degll\'orario ora mostra anche la versione dell\'orario, la data di aggiornamento, valido dal e mostra l\'ultima ' +
        'volta che l\'orario è stato sincronizzato'
    },
    {
      dataPubblicazione: '11/9/19',
      descrizioneBreve: 'Invio messaggio',
      descrizione: 'Ora è possibile inviare un messaggio allo sviluppatore in caso di problemi o per eventuali suggerimenti'
    },
    {
      dataPubblicazione: '9/9/19',
      descrizioneBreve: 'Informazioni',
      descrizione:
        'Se premuto il logo viene mostrato un dialog con un messaggio di benvenuto e una breve spiegazione dell\'app. Inoltre ' +
        'si visualizzerà la lista di tutti gli aggiornamenti che verranno pubblicati insieme alla versione dell\'app'
    },
    {
      dataPubblicazione: '10/8/19',
      descrizioneBreve: 'Preferiti e home',
      descrizione:
        'Ora è possibile segnare un orario come preferito e visualizzarlo nella pagina principale. Schiacciando sul logo è possibile ' +
        'tornare alla pagina principale'
    }
  ]
  hideToggle = false

  constructor(
    private activatedRoute: ActivatedRoute,
    private title: Title
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.strumenti === 'aperto') this.cambiaStato('strumentiAperti')
      else this.cambiaStato('strumentiChiusi')
    })
    
    this.title.setTitle('Orario Galilei - informazioni')
  }

  cambiaStato(stato: 'strumentiAperti' | 'strumentiChiusi') {
    this.statoContenitore = stato
  }

}
