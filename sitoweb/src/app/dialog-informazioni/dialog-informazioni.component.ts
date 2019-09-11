import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Aggiornamento } from '../utils/aggiornamento.model';
import { FirestoreService } from '../core/firestore.service';

@Component({
  selector: 'app-dialog-informazioni',
  templateUrl: './dialog-informazioni.component.html',
  styleUrls: ['./dialog-informazioni.component.scss']
})
export class DialogInformazioniComponent implements OnInit {

  versione = '0.2'
  aggiornamentiApp: Aggiornamento[] = [
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

  constructor(
    public dialogRef: MatDialogRef<DialogInformazioniComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private firestore: FirestoreService
  ) {}

  ngOnInit() {
    this.hideToggle = window.innerWidth < 600
  }

  @HostListener('window:resize')
  onResize() {
    this.hideToggle = window.innerWidth < 600
  }
}