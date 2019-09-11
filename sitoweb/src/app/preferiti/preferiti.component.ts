import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Orario } from '../utils/orario.model';
import { LocalStorageService } from '../core/local-storage.service';

@Component({
  selector: 'app-preferiti',
  templateUrl: './preferiti.component.html',
  styleUrls: ['./preferiti.component.scss']
})
export class PreferitiComponent implements OnInit {

  preferiti: Observable<Orario[]>

  constructor(
    private localStorage: LocalStorageService
  ) { }

  ngOnInit() {
    // Recupero i preferiti
    this.preferiti = this.localStorage.ottieniOrariPreferiti() as Observable<Orario[]>

    // TODO: recuperare appena possibile i dati online aggiornati!
  }
}
