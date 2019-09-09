import { Component, OnInit } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';
import { Orario } from '../utils/orario.model';

@Component({
  selector: 'app-preferiti',
  templateUrl: './preferiti.component.html',
  styleUrls: ['./preferiti.component.scss']
})
export class PreferitiComponent implements OnInit {

  preferiti: Observable<Orario[]>

  constructor(
    private localStorage: LocalStorage
  ) { }

  ngOnInit() {
    // Recupero i preferiti
    this.preferiti = this.localStorage.getItem('preferiti') as Observable<Orario[]>

    // TODO: recuperare appena possibile i dati online aggiornati!
  }
}
