import { Component } from '@angular/core'
import { AngularFirestore } from '@angular/fire/firestore'
import { Classe, Aula, Professore, OrarioPerOra } from './tipi'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    classi: Observable<Classe[]>
    aule: Observable<Aula[]>
    professori: Observable<Professore[]>
    
    constructor(firestore: AngularFirestore) {
        //1: Recupero le classi
        this.classi = firestore.collection<Classe>('Classi').valueChanges()
        
        //2: Recupero le aule
        this.aule = firestore.collection<Aula>('Aule').valueChanges()

        //3: Recupero i professori
        this.professori = firestore.collection<Professore>('Professori').valueChanges()

        //Test
        firestore.collection<Classe>('Classi').get().pipe(
            map(querySnapshot => {
                return querySnapshot.docs
            })
        ).subscribe(console.log)
    }
}