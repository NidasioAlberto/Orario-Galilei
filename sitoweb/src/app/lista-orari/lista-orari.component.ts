import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ElementoIndice } from '../utils/indice.model';

@Component({
  selector: 'app-lista-orari',
  templateUrl: './lista-orari.component.html',
  styleUrls: ['./lista-orari.component.scss']
})
export class ListaOrariComponent  {

  @Input() indici: Observable<ElementoIndice[]>

  constructor() { }
}
