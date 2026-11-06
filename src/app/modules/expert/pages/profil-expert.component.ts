import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ExpertService } from '../expert.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ChampProfil } from '../../../shared/components/profil-form.component';

/** Profil expert (numero d'ordre, diplome, agrement) + grille tarifaire horaire et forfaitaire (roadmap 50%). */
@Component({
  selector: 'gj-profil-expert',
  template: `
    <gj-profil-form ressource="experts" [champs]="champs"></gj-profil-form>

    <section class="carte-section tarifs">
      <div class="carte-section__entete">
        <h3><gj-icone nom="wallet"></gj-icone>{{ 'Grille tarifaire' | t }}</h3>
      </div>
      <form class="form-page" [formGroup]="grille" (ngSubmit)="enregistrerGrille()">
        <div class="grille-form">
          <div class="champ-groupe">
            <label>{{ 'Tarif horaire (FCFA)' | t }}</label>
            <input type="number" formControlName="tarifHoraireFcfa" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Tarif forfaitaire (FCFA)' | t }}</label>
            <input type="number" formControlName="tarifForfaitaireFcfa" />
          </div>
        </div>
        <div class="actions-droite">
          <button type="submit"><gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Enregistrer' | t }}</button>
        </div>
      </form>
    </section>

    <p class="aide info-documents">
      <gj-icone nom="info" [taille]="16"></gj-icone>
      {{ 'Diplôme et agrément ministériel : à téléverser dans' | t }}
      <a routerLink="/compte/kyc">{{ 'Vérification KYC' | t }}</a>
      ({{ 'documents professionnels' | t }}).
    </p>
  `
})
export class ProfilExpertComponent implements OnInit {
  champs: ChampProfil[] = [
    { cle: 'nom', libelle: 'Nom', requis: true },
    { cle: 'prenom', libelle: 'Prénom', requis: true },
    { cle: 'specialite', libelle: 'Spécialité', type: 'select',
      options: ['architecture', 'structure / génie civil', 'topographie', 'contrôle de conformité', 'conduite de travaux'] },
    { cle: 'numeroOrdre', libelle: 'Numéro d\'ordre', requis: true },
    { cle: 'agrementMinisteriel', libelle: 'Agrément ministériel' }
  ];

  grille = this.fb.group({
    tarifHoraireFcfa: [null as number | null],
    tarifForfaitaireFcfa: [null as number | null]
  });

  constructor(private fb: FormBuilder, private expertService: ExpertService, private auth: AuthService,
              private toast: ToastService) {}

  ngOnInit(): void {
    this.expertService.getProfil(this.auth.getUserId()).subscribe(p => {
      if (p['grilleTarifaireJson']) {
        try {
          this.grille.patchValue(JSON.parse(p['grilleTarifaireJson']));
        } catch {
          // grille non JSON : ignoree
        }
      }
    });
  }

  enregistrerGrille(): void {
    const { tarifHoraireFcfa, tarifForfaitaireFcfa } = this.grille.getRawValue();
    this.expertService.configurerGrilleTarifaire({ tarifHoraireFcfa, tarifForfaitaireFcfa })
      .subscribe(() => this.toast.succes('Grille tarifaire enregistrée.'));
  }
}
