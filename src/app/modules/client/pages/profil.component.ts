import { Component } from '@angular/core';
import { ChampProfil } from '../../../shared/components/profil-form.component';

/** Gestion du profil client (roadmap 50% profil Client). */
@Component({
  selector: 'gj-client-profil',
  template: `<gj-profil-form ressource="clients" [champs]="champs"></gj-profil-form>`
})
export class ProfilComponent {
  champs: ChampProfil[] = [
    { cle: 'nom', libelle: 'Nom', requis: true },
    { cle: 'prenom', libelle: 'Prénom', requis: true },
    { cle: 'adresse', libelle: 'Adresse' },
    { cle: 'typeClient', libelle: 'Type de client', type: 'select',
      options: ['particulier', 'promoteur', 'institutionnel léger'] }
  ];
}
