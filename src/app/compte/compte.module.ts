import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CompteComponent } from './pages/compte.component';
import { KycComponent } from './pages/kyc.component';
import { MessagerieComponent } from './pages/messagerie.component';
import { NotificationsComponent } from './pages/notifications.component';
import { PortfolioComponent } from './pages/portfolio.component';

/** Espace commun aux 6 profils : compte et solde, KYC, messagerie, notifications, portfolio. */
@NgModule({
  declarations: [CompteComponent, KycComponent, MessagerieComponent, NotificationsComponent, PortfolioComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: CompteComponent },
      { path: 'kyc', component: KycComponent },
      { path: 'messagerie', component: MessagerieComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'portfolio', component: PortfolioComponent }
    ])
  ]
})
export class CompteModule {}
