import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CatalogueComponent } from './pages/catalogue.component';
import { FournisseurProfilComponent } from './pages/profil.component';

/** SupplierModule - Profil Fournisseur de materiaux, lazy-loaded. */
@NgModule({
  declarations: [CatalogueComponent, FournisseurProfilComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: CatalogueComponent },
      { path: 'profil', component: FournisseurProfilComponent }
    ])
  ]
})
export class SupplierModule {}
