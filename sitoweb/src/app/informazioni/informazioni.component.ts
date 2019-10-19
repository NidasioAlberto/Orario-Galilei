import { Component, OnInit, HostListener } from '@angular/core';
import { Aggiornamento } from '../utils/aggiornamento.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { FirestoreService } from '../core/firestore.service';

@Component({
  selector: 'app-informazioni',
  templateUrl: './informazioni.component.html',
  styleUrls: ['./informazioni.component.scss']
})
export class InformazioniComponent implements OnInit {

  versione = '0.7'
  aggiornamentiApp: Aggiornamento[] = [
    {
      dataPubblicazione: '19/10/19',
      descrizioneBreve: 'Dialog informazioni',
      descrizione: 'Il messaggio iniziale viene ora mostrato nella home sotto i preferiti '
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

  messaggio: string
  mittente: string

  updateAvailable = false

  constructor(
    private snackBar: MatSnackBar,
    public swUpdate: SwUpdate,
    private firestore: FirestoreService
  ) {}

  ngOnInit() {
    this.hideToggle = window.innerWidth < 600

    // Notifico l'utente quando una nuova versione dell'app è disponibile
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe((event) => {
        this.updateAvailable = true
      })
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.hideToggle = window.innerWidth < 600
  }

  aggiornaPagina() {
    window.location.reload()
  }

  inviaMessaggio() {
    if (this.messaggio !== undefined && this.messaggio !== '') {
      this.firestore.inviaMessaggio(this.messaggio, this.mittente).then(() => {
        this.snackBar.open('Messaggio inviato', undefined, { duration: 2000 })

        // Pulisco gli input
        this.messaggio = ''
        this.mittente = ''
      }).catch(err => {
        this.snackBar.open('Errore durante l\'invio', undefined, { duration: 2000 })
        console.log(err)
      })
    }
  }
}
