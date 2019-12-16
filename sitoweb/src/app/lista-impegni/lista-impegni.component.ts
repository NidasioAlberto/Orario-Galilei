import { Component, Input } from '@angular/core'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-lista-impegni',
  templateUrl: './lista-impegni.component.html',
  styleUrls: ['./lista-impegni.component.scss']
})
export class ListaImpegniComponent {
  @Input() impegni: Observable<string[]>
}
