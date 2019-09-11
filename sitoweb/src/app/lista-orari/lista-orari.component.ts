import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ElementoIndice } from '../utils/indice.model';
import { Orario } from '../utils/orario.model';

@Component({
  selector: 'app-lista-orari',
  templateUrl: './lista-orari.component.html',
  styleUrls: ['./lista-orari.component.scss']
})
export class ListaOrariComponent  {

  @Input() indiciFiltrati: Observable<ElementoIndice[]>
  @Input() orari: Orario[] = []

  constructor() { }
}
