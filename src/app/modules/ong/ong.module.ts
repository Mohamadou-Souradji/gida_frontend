import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { OngAppelsOffresComponent } from './pages/appels-offres.component';
import { CandidaturesComponent } from './pages/candidatures.component';
import { OngProfilComponent } from './pages/profil.component';

/** OngModule - Profil ONG / Institution, lazy-loaded. */
@NgModule({
  declarations: [OngAppelsOffresComponent, CandidaturesComponent, OngProfilComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: OngAppelsOffresComponent },
      { path: 'appels-offres/:appelOffreId/candidatures', component: CandidaturesComponent },
      { path: 'profil', component: OngProfilComponent }
    ])
  ]
})
export class OngModule {}
