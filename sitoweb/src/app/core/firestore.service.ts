import { Injectable } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentoIndice, ElementoIndice } from '../utils/indice';
import { EventEmitter, element } from 'protractor';
import { Orario } from '../utils/orario';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private db: AngularFirestore) { }

  ottieniIndici() {
    //Recupero gli indici di classi, aule e professori
    return combineLatest(
      this.db.collection('Aule').doc<DocumentoIndice>('Indici').valueChanges(),
      this.db.collection('Classi').doc<DocumentoIndice>('Indici').valueChanges(),
      this.db.collection('Professori').doc<DocumentoIndice>('Indici').valueChanges(),
    ).pipe(
      map(indici => {
        return [...indici[0].lista.map(nome => {
          return {
            nome,
            collection: 'Aule'
          }
        }), ...indici[1].lista.map(nome => {
          return {
            nome,
            collection: 'Classi'
          }
        }), ...indici[2].lista.map(nome => {
          return {
            nome,
            collection: 'Professori'
          }
        })]
      })
    )
  }

  ottieniOrario(indiceOrario: ElementoIndice): Observable<Orario> {
    return this.db.collection(indiceOrario.collection).doc<Orario>(indiceOrario.nome).valueChanges()
  }
}
