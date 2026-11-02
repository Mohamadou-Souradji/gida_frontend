import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { ProfileGuard } from './core/guards/profile.guard';
import { AdminGuard } from './core/guards/admin.guard';

/**
 * Routage racine - un module par profil, charge en lazy-loading, protege
 * par ProfileGuard (type de profil) et, au besoin, KycGuard (niveau KYC).
 * Voir Cahier des Charges Technique, section 3.2.
 */
const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    // Commun aux 6 profils : compte, solde, KYC, messagerie, notifications, portfolio.
    path: 'compte',
    canActivate: [AuthGuard],
    loadChildren: () => import('./compte/compte.module').then(m => m.CompteModule)
  },
  { path: 'kyc', redirectTo: 'compte/kyc', pathMatch: 'full' },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'client',
    canActivate: [AuthGuard, ProfileGuard],
    data: { profilsAutorises: ['CLIENT_PARTICULIER'] },
    loadChildren: () => import('./modules/client/client.module').then(m => m.ClientModule)
  },
  {
    path: 'artisan',
    canActivate: [AuthGuard, ProfileGuard],
    data: { profilsAutorises: ['ARTISAN'] },
    loadChildren: () => import('./modules/artisan/artisan.module').then(m => m.ArtisanModule)
  },
  {
    path: 'entreprise-btp',
    canActivate: [AuthGuard, ProfileGuard],
    data: { profilsAutorises: ['ENTREPRISE_BTP'] },
    loadChildren: () => import('./modules/btp/btp.module').then(m => m.BtpModule)
  },
  {
    path: 'ong',
    canActivate: [AuthGuard, ProfileGuard],
    data: { profilsAutorises: ['ONG_INSTITUTION'] },
    loadChildren: () => import('./modules/ong/ong.module').then(m => m.OngModule)
  },
  {
    path: 'expert',
    canActivate: [AuthGuard, ProfileGuard],
    data: { profilsAutorises: ['INGENIEUR_ARCHITECTE'] },
    loadChildren: () => import('./modules/expert/expert.module').then(m => m.ExpertModule)
  },
  {
    path: 'fournisseur',
    canActivate: [AuthGuard, ProfileGuard],
    data: { profilsAutorises: ['FOURNISSEUR_MATERIAUX'] },
    loadChildren: () => import('./modules/supplier/supplier.module').then(m => m.SupplierModule)
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
