import { Component, OnInit, Input } from '@angular/core';
import { ProssimoImpegno } from '../orario';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lista-impegni',
  templateUrl: './lista-impegni.component.html',
  styleUrls: ['./lista-impegni.component.scss']
})
export class ListaImpegniComponent {

  @Input() impegni: Observable<ProssimoImpegno[]>

  constructor() { }
}
