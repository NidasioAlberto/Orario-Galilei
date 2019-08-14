import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { Orario, ProssimoImpegno } from '../utils/orario';
import { FirestoreService } from '../core/firestore.service';
import { ThrowStmt } from '@angular/compiler';
import { TempoService } from '../core/tempo.service';

@Component({
  selector: 'app-orario',
  templateUrl: './orario.component.html',
  styleUrls: ['./orario.component.scss']
})
export class OrarioComponent implements OnInit {

  orario: Observable<Orario>
  impegni: Observable<ProssimoImpegno[]>
  impegniLable: Observable<string[]>

  constructor(private router: ActivatedRoute, private firestore: FirestoreService, private tempo: TempoService) { }

  ngOnInit() {
    this.orario = this.router.queryParams.pipe(mergeMap(params => this.firestore.ottieniOrario({collection: params['collection'], nome: params['document']})))

    this.impegni = combineLatest(this.orario, this.tempo.ottieniOra(), this.tempo.ottieniGiorno()).pipe(
      map(dati => this.firestore.trovaProssimiImpegni(dati[1], dati[2], dati[0], 2)),
    )

    this.impegniLable = this.impegni.pipe(
      map(impegni => impegni.map(impegno =>
        impegno.giornoLable +
        ' ' +
        impegno.oraLable +
        ': ' +
        (impegno.info1 != undefined ? impegno.info1 : '') +
        (impegno.info1 != undefined && impegno.info2 != undefined ? ' ' : '') +
        (impegno.info2 != undefined ? impegno.info2 : '')
      ))
    )
  }
}