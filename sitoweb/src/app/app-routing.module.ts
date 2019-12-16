import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { RicercaComponent } from './ricerca/ricerca.component'
import { OrarioComponent } from './orario/orario.component'
import { PreferitiComponent } from './preferiti/preferiti.component'
import { InformazioniComponent } from './informazioni/informazioni.component'

const routes: Routes = [
  { path: '', component: PreferitiComponent },
  { path: 'ricerca', component: RicercaComponent },
  { path: 'orario', component: OrarioComponent },
  { path: 'informazioni', component: InformazioniComponent },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
