import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MissionsComponent } from '../../shared/components/missions.component';
import { ProjetsOuvertsComponent } from '../../shared/components/projets-ouverts.component';
import { AppelsOffresComponent } from './pages/appels-offres.component';
import { BtpProfilComponent } from './pages/profil.component';

/** BtpModule - Profil Entreprise BTP, lazy-loaded. */
@NgModule({
  declarations: [AppelsOffresComponent, BtpProfilComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: AppelsOffresComponent },
      { path: 'missions', component: MissionsComponent },
      { path: 'projets', component: ProjetsOuvertsComponent },
      { path: 'profil', component: BtpProfilComponent }
    ])
  ]
})
export class BtpModule {}
