import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Aggiornamento } from '../utils/aggiornamento.model';
import { FirestoreService } from '../core/firestore.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-dialog-informazioni',
  templateUrl: './dialog-informazioni.component.html',
  styleUrls: ['./dialog-informazioni.component.scss']
})
export class DialogInformazioniComponent implements OnInit {

  versione = '0.6'
  aggiornamentiApp: Aggiornamento[] = [
    {
      dataPubblicazione: '29/9/19',
      descrizioneBreve: 'Info complete',
      descrizione: 'La pagina degll\'orario ora mostra anche la versione dell\'orario, la data di aggiornamento, valido dal e mostra l\'ultima volta che l\'orario è stato sincronizzato'
    },
    {
      dataPubblicazione: '11/9/19',
      descrizioneBreve: 'Invio messaggio',
      descrizione: 'Ora è possibile inviare un messaggio allo sviluppatore in caso di problemi o per eventuali suggerimenti'
    },
    {
      dataPubblicazione: '9/9/19',
      descrizioneBreve: 'Istruzioni e benvenuto',
      descrizione:
        'Se premuto il logo viene mostrato un dialog con un messaggio di benvenuto e una breve spiegazione dell\'app. Inoltre ' +
        'si visualizzerà la lista di tutti gli aggiornamenti che verranno pubblicati insieme alla versione dell\'app'
    },
    {
      dataPubblicazione: '10/8/19',
      descrizioneBreve: 'Preferiti e logo che riporta alla home',
      descrizione:
        'Ora è possibile segnare un orario come preferito e visualizzarlo nella pagina principale. Schiacciando sul logo è possibile ' +
        'tornare alla pagina principale'
    }
  ]
  hideToggle = false

  messaggio: string
  mittente: string

  constructor(
    public dialogRef: MatDialogRef<DialogInformazioniComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestore: FirestoreService,
    private snackBar: MatSnackBar,
    public swUpdate: SwUpdate
  ) {}

  ngOnInit() {
    this.hideToggle = window.innerWidth < 600
  }

  @HostListener('window:resize')
  onResize() {
    this.hideToggle = window.innerWidth < 600
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

  aggiornaPagina() {
    window.location.reload()
  }
}
