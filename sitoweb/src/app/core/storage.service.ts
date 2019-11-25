import { Injectable } from '@angular/core'
import { AngularFireStorage } from '@angular/fire/storage'
import { HttpClient } from '@angular/common/http'
import { Orario } from '../utils/orario.model'
import { LocalStorage } from '@ngx-pwa/local-storage'
import { firestore } from 'firebase/app'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: AngularFireStorage,
    private http: HttpClient,
    private localStorage: LocalStorage
  ) { }

  public async caricaOrariCompleti() {
    // Recupero tutti gli orari dal backup
    console.log('Recupero il file')
    return this.storage.ref('backup-orari/test.json').getDownloadURL().toPromise().then(backupUrl => {
      return this.http.get(backupUrl, {
        responseType: 'json'
      }).toPromise().then((orari: {
        orariClassi: Orario[],
        orariAule: Orario[],
        orariProfessori: Orario[]
      }) => {
        console.log(orari)

        // Salvo tutti gli orari in IndexedDB
        return Promise.all([
          this.localStorage.setItem('classi', orari.orariClassi).toPromise(),
          this.localStorage.setItem('aule', orari.orariAule).toPromise(),
          this.localStorage.setItem('professori', orari.orariProfessori).toPromise()
        ])
      })
    })
  }
}
