import { Component } from '@angular/core';
import { ChampProfil } from '../../../shared/components/profil-form.component';

/** Configuration de la boutique et des zones / frais de livraison (roadmap 50% Fournisseur). */
@Component({
  selector: 'gj-fournisseur-profil',
  template: `<gj-profil-form ressource="fournisseurs" [champs]="champs"></gj-profil-form>`
})
export class FournisseurProfilComponent {
  champs: ChampProfil[] = [
    { cle: 'nomBoutique', libelle: 'Nom de la boutique', requis: true },
    { cle: 'nif', libelle: 'NIF' },
    { cle: 'categories', libelle: 'Catégories vendues', aide: 'Séparées par des virgules : ciment, fer, bois...' },
    { cle: 'zonesLivraison', libelle: 'Zones de livraison', aide: 'Ex : Niamey, Kollo, Dosso' },
    { cle: 'fraisLivraisonFcfa', libelle: 'Frais de livraison (FCFA)', type: 'number' }
  ];
}
