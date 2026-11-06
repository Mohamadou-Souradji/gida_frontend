import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { KycGuard } from '../../core/guards/kyc.guard';
import { DashboardComponent } from './pages/dashboard.component';
import { ProjetFormComponent } from './pages/projet-form.component';
import { ProjetDetailComponent } from './pages/projet-detail.component';
import { ProfilComponent } from './pages/profil.component';
import { PropositionsComponent } from './pages/propositions.component';

/** ClientModule - Profil 1 (Client / Maitre d'ouvrage), lazy-loaded. */
@NgModule({
  declarations: [DashboardComponent, ProjetFormComponent, ProjetDetailComponent, ProfilComponent, PropositionsComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: DashboardComponent },
      { path: 'profil', component: ProfilComponent },
      {
        // Creer un chantier suppose une identite declaree (regle n4).
        path: 'projets/nouveau',
        component: ProjetFormComponent,
        canActivate: [KycGuard],
        data: { kycMinimum: 'NIVEAU_2_IDENTITE_DECLAREE' }
      },
      { path: 'projets/:id', component: ProjetDetailComponent },
      { path: 'propositions', component: PropositionsComponent }
    ])
  ]
})
export class ClientModule {}
