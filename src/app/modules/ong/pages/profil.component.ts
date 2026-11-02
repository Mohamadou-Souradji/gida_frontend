import { Component } from '@angular/core';
import { ChampProfil } from '../../../shared/components/profil-form.component';

/** Profil institutionnel (raison sociale, NIF/RCCM, logo) - roadmap 50% ONG. */
@Component({
  selector: 'gj-ong-profil',
  template: `<gj-profil-form ressource="ong-institutions" [champs]="champs"></gj-profil-form>`
})
export class OngProfilComponent {
  champs: ChampProfil[] = [
    { cle: 'raisonSociale', libelle: 'Raison sociale', requis: true },
    { cle: 'nifOuRccm', libelle: 'NIF / RCCM', requis: true },
    { cle: 'typeOrganisation', libelle: 'Type d\'organisation', type: 'select',
      options: ['ONG', 'Institution publique', 'Collectivité', 'Bailleur', 'Association'] },
    { cle: 'statutLegal', libelle: 'Statut légal' },
    { cle: 'oddCible', libelle: 'ODD ciblé', aide: 'Ex : ODD 6 - Eau propre et assainissement' },
    { cle: 'logoUrl', libelle: 'Logo', type: 'image' }
  ];
}
