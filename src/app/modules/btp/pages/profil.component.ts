import { Component } from '@angular/core';
import { ChampProfil } from '../../../shared/components/profil-form.component';

/** Profil Entreprise BTP : identite legale (NIF, RCCM). Les pieces se televersent dans KYC. */
@Component({
  selector: 'gj-btp-profil',
  template: `
    <gj-profil-form ressource="entreprises-btp" [champs]="champs"></gj-profil-form>
    <p class="aide">Téléversez les copies du NIF et du RCCM dans <a routerLink="/compte/kyc">Vérification KYC</a>
      (niveau 3 requis pour candidater et être engagé).</p>
  `
})
export class BtpProfilComponent {
  champs: ChampProfil[] = [
    { cle: 'nomCommercial', libelle: 'Nom commercial', requis: true },
    { cle: 'nif', libelle: 'NIF', requis: true },
    { cle: 'rccm', libelle: 'RCCM', requis: true },
    { cle: 'domaineActivite', libelle: 'Domaine d\'activité' },
    { cle: 'effectif', libelle: 'Effectif', type: 'number' }
  ];
}
