import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { RicercaComponent } from './ricerca/ricerca.component'
import { OrarioComponent } from './orario/orario.component'

const routes: Routes = [
  { path: 'ricerca', component: RicercaComponent },
  { path: 'orario', component: OrarioComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
