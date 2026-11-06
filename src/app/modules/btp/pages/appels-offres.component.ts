import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BtpService } from '../btp.service';
import { ToastService } from '../../../core/services/toast.service';
import { AppelOffre, CandidatureAO } from '../../../shared/models/projet.model';

/**
 * Moteur de recherche d'Appels d'Offres + soumission de candidature
 * technique/commerciale (roadmap 50% profil Entreprise BTP).
 */
@Component({
  selector: 'gj-appels-offres',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Appels d’offres' | t }}</h2>
        <p>{{ 'Recherchez les appels d’offres et suivez vos candidatures.' | t }}</p>
      </div>
      <div class="page-entete__actions">
        <a class="btn btn-secondaire" routerLink="/entreprise-btp/missions"><gj-icone nom="briefcase" [taille]="16"></gj-icone>{{ 'Mes missions' | t }}</a>
        <a class="btn btn-secondaire" routerLink="/entreprise-btp/projets"><gj-icone nom="layers" [taille]="16"></gj-icone>{{ 'Projets ouverts' | t }}</a>
        <a class="btn btn-secondaire" routerLink="/entreprise-btp/profil"><gj-icone nom="user" [taille]="16"></gj-icone>{{ 'Mon profil' | t }}</a>
      </div>
    </div>

    <form class="recherche recherche--simple" (ngSubmit)="rechercher()">
      <div class="champ-recherche">
        <gj-icone nom="search" [taille]="16"></gj-icone>
        <input [(ngModel)]="q" name="q" [placeholder]="'Mot-clé : forage, école, route…' | t" />
      </div>
      <button type="submit"><gj-icone nom="search" [taille]="16"></gj-icone>{{ 'Rechercher' | t }}</button>
    </form>

    <div class="squelette" *ngIf="!charge"></div>

    <div class="etat-vide" *ngIf="charge && !appelsOffres.length">
      <div class="etat-vide__icone"><gj-icone nom="file" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun élément' | t }}</h3>
      <p>{{ 'Aucun appel d’offres ne correspond à votre recherche.' | t }}</p>
    </div>

    <article class="carte-section" *ngFor="let ao of appelsOffres">
      <header class="carte-section__entete">
        <div>
          <h3 class="mission__titre">{{ ao.titre }}</h3>
          <div class="chips">
            <span class="chip"><gj-icone nom="user"></gj-icone>{{ ao.institution | nom }}</span>
            <span class="chip"><gj-icone nom="calendar"></gj-icone>{{ 'Date limite de dépôt' | t }} : {{ ao.dateLimiteDepot | date: 'dd/MM/yyyy' }}</span>
          </div>
        </div>
        <span *ngIf="dejaCandidat(ao)" class="badge badge-success"><gj-icone nom="check" [taille]="14"></gj-icone>{{ 'Candidature envoyée' | t }}</span>
      </header>
      <p class="pre proposition__description">{{ ao.cahierDesChargesTexte }}</p>

      <div class="actions actions--fin" *ngIf="!dejaCandidat(ao) && aoSelectionne?.id !== ao.id">
        <button type="button" (click)="aoSelectionne = ao"><gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Candidater' | t }}</button>
      </div>

      <form *ngIf="aoSelectionne?.id === ao.id" [formGroup]="form" (ngSubmit)="soumettre()" class="preuve">
        <div class="grille-form">
          <div class="champ-groupe champ-large">
            <label>{{ 'Proposition technique et commerciale' | t }}</label>
            <textarea formControlName="propositionTechnique" rows="5" [placeholder]="'Moyens humains et matériels, planning, références…' | t"></textarea>
          </div>
          <div class="champ-groupe">
            <label>{{ 'Montant proposé (FCFA)' | t }}</label>
            <input type="number" formControlName="montantPropositionFcfa" />
          </div>
        </div>
        <div class="actions actions--fin">
          <button type="button" class="btn-secondaire" (click)="aoSelectionne = null">{{ 'Annuler' | t }}</button>
          <button type="submit" [disabled]="form.invalid || envoi"><gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Envoyer' | t }}</button>
        </div>
      </form>
    </article>

    <div class="carte-section__entete titre-section">
      <h2>{{ 'Mes candidatures' | t }}</h2>
    </div>
    <div class="etat-vide" *ngIf="!candidatures.length">
      <p>{{ 'Aucune candidature pour le moment.' | t }}</p>
    </div>
    <ul class="liste-moderne" *ngIf="candidatures.length">
      <li *ngFor="let c of candidatures">
        <div class="liste-moderne__corps">
          <strong>{{ c.appelOffre?.titre }}</strong>
          <span class="aide-champ">{{ c.montantPropositionFcfa | fcfa }}</span>
        </div>
        <span [class]="c.statut | badge">{{ c.statut | libelle }}</span>
      </li>
    </ul>
  `
})
export class AppelsOffresComponent implements OnInit {
  appelsOffres: AppelOffre[] = [];
  candidatures: CandidatureAO[] = [];
  aoSelectionne: AppelOffre | null = null;
  q = '';
  charge = false;
  envoi = false;

  form = this.fb.nonNullable.group({
    propositionTechnique: ['', Validators.required],
    montantPropositionFcfa: [0, [Validators.required, Validators.min(1)]]
  });

  constructor(private fb: FormBuilder, private btpService: BtpService, private toast: ToastService) {}

  ngOnInit(): void {
    this.rechercher();
    this.chargerCandidatures();
  }

  rechercher(): void {
    this.btpService.rechercherAppelsOffres(this.q).subscribe(res => {
      this.appelsOffres = res;
      this.charge = true;
    });
  }

  chargerCandidatures(): void {
    this.btpService.mesCandidatures().subscribe(res => (this.candidatures = res));
  }

  dejaCandidat(ao: AppelOffre): boolean {
    return this.candidatures.some(c => c.appelOffre?.id === ao.id);
  }

  soumettre(): void {
    if (!this.aoSelectionne) {
      return;
    }
    const { propositionTechnique, montantPropositionFcfa } = this.form.getRawValue();
    this.envoi = true;
    this.btpService.soumettreCandidature(this.aoSelectionne.id, propositionTechnique, montantPropositionFcfa).subscribe({
      next: () => {
        this.toast.succes('Candidature envoyée.');
        this.aoSelectionne = null;
        this.form.reset({ propositionTechnique: '', montantPropositionFcfa: 0 });
        this.envoi = false;
        this.chargerCandidatures();
      },
      error: () => (this.envoi = false)
    });
  }
}
