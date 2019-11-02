import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { ServiceWorkerModule } from '@angular/service-worker'
import { environment } from '../environments/environment'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NavbarComponent } from './navbar/navbar.component'
import { FormsModule } from '@angular/forms'

// Moduli firebase e storage
import { StorageModule } from '@ngx-pwa/local-storage'
import { AngularFireModule } from '@angular/fire'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { AngularFirePerformanceModule } from '@angular/fire/performance'

// Componenti angular material
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatIconModule } from '@angular/material/icon'
import { MatChipsModule } from '@angular/material/chips'

// Componenti app
import { OrarioComponent } from './orario/orario.component'
import { GraficoOrarioComponent } from './orario/grafico-orario/grafico-orario.component'
import { PreferitiComponent } from './preferiti/preferiti.component'
import { RicercaComponent } from './ricerca/ricerca.component'
import { ListaImpegniComponent } from './lista-impegni/lista-impegni.component'
import { ListaOrariComponent } from './lista-orari/lista-orari.component'
import { ElementoListaOrariComponent } from './lista-orari/elemento-lista-orari/elemento-lista-orari.component'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { InformazioniComponent } from './informazioni/informazioni.component'

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    OrarioComponent,
    GraficoOrarioComponent,
    PreferitiComponent,
    RicercaComponent,
    ListaImpegniComponent,
    ListaOrariComponent,
    ElementoListaOrariComponent,
    InformazioniComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFirePerformanceModule,
    BrowserAnimationsModule,
    FormsModule,
    ScrollingModule,

    // Angular material components
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatChipsModule,

    StorageModule.forRoot({ IDBNoWrap: true }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
