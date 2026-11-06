import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AdminShellComponent } from './admin-shell.component';
import { BarresComponent } from './composants/barres.component';
import { PaginationComponent } from './composants/pagination.component';
import { EquipeAdminComponent } from './pages/equipe.component';
import { JournalAdminComponent } from './pages/journal.component';
import { KycAdminComponent } from './pages/kyc.component';
import { LitigesAdminComponent } from './pages/litiges.component';
import { ProjetDetailAdminComponent } from './pages/projet-detail.component';
import { ProjetsAdminComponent } from './pages/projets.component';
import { TableauDeBordComponent } from './pages/tableau-de-bord.component';
import { TransactionsAdminComponent } from './pages/transactions.component';

const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', component: TableauDeBordComponent, title: 'Administration - Gida Jari' },
      { path: 'projets', component: ProjetsAdminComponent },
      { path: 'projets/:id', component: ProjetDetailAdminComponent },
      { path: 'transactions', component: TransactionsAdminComponent },
      { path: 'kyc', component: KycAdminComponent },
      { path: 'litiges', component: LitigesAdminComponent },
      { path: 'equipe', component: EquipeAdminComponent },
      { path: 'journal', component: JournalAdminComponent }
    ]
  }
];

/**
 * Back-office Gida Jari : tableau de bord, projets, transactions (sequestre et retraits),
 * validation KYC, arbitrage des litiges, equipe a roles distincts, journal d'audit.
 */
@NgModule({
  declarations: [
    AdminShellComponent, BarresComponent, PaginationComponent,
    TableauDeBordComponent, ProjetsAdminComponent, ProjetDetailAdminComponent, TransactionsAdminComponent,
    KycAdminComponent, LitigesAdminComponent, EquipeAdminComponent, JournalAdminComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class AdminModule {}
