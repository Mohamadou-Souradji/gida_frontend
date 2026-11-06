import { Component } from '@angular/core';
import { ChampProfil } from '../../../shared/components/profil-form.component';

/** Profil Artisan : inscription, corps de metier et zone d'intervention (roadmap 50%). */
@Component({
  selector: 'gj-artisan-profil',
  template: `<gj-profil-form ressource="artisans" [champs]="champs"></gj-profil-form>`
})
export class ArtisanProfilComponent {
  champs: ChampProfil[] = [
    { cle: 'nom', libelle: 'Nom', requis: true },
    { cle: 'prenom', libelle: 'Prénom', requis: true },
    { cle: 'corpsDeMetier', libelle: 'Corps de métier', type: 'select', requis: true,
      options: ['maçon', 'plombier', 'électricien', 'menuisier', 'carreleur', 'peintre', 'ferrailleur', 'soudeur', 'staffeur'] },
    { cle: 'zoneIntervention', libelle: 'Zone d\'intervention', requis: true, aide: 'Ex : Niamey, Maradi, Zinder...' },
    { cle: 'tarifJournalierFcfa', libelle: 'Tarif journalier (FCFA)', type: 'number' }
  ];
}
