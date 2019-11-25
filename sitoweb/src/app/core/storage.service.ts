import { Injectable } from '@angular/core'
import { AngularFireStorage } from '@angular/fire/storage'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private storage: AngularFireStorage,
    private http: HttpClient
  ) { }

  public caricaOrariCompleti() {
    // Recupero tutti gli orari dal backup
    console.log('Recupero il file')
    this.storage.ref('backup-orari/test.json').getDownloadURL().toPromise().then(backupUrl => {
      this.http.get(backupUrl, {
        responseType: 'json'
      }).toPromise().then(console.log)
    })
  }
}
