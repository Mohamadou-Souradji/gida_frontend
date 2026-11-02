import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProjetsOuvertsComponent } from '../../shared/components/projets-ouverts.component';
import { ArtisanDashboardComponent } from './pages/dashboard.component';
import { ArtisanProfilComponent } from './pages/profil.component';

/** ArtisanModule - Profil 2 (Artisan), lazy-loaded. */
@NgModule({
  declarations: [ArtisanDashboardComponent, ArtisanProfilComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: ArtisanDashboardComponent },
      { path: 'profil', component: ArtisanProfilComponent },
      { path: 'projets', component: ProjetsOuvertsComponent }
    ])
  ]
})
export class ArtisanModule {}
