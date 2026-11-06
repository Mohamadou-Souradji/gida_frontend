import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProjetsOuvertsComponent } from '../../shared/components/projets-ouverts.component';
import { ProfilExpertComponent } from './pages/profil-expert.component';
import { PropositionsComponent } from './pages/propositions.component';

/** ExpertModule - Profil Ingenieur / Architecte, lazy-loaded. */
@NgModule({
  declarations: [ProfilExpertComponent, PropositionsComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: PropositionsComponent },
      { path: 'profil', component: ProfilExpertComponent },
      { path: 'projets', component: ProjetsOuvertsComponent }
    ])
  ]
})
export class ExpertModule {}
