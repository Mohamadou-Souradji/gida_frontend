import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ExpertService } from '../expert.service';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Projet, PropositionEtude } from '../../../shared/models/projet.model';

/** Creation et envoi de propositions d'etudes decoupees en phases (roadmap 50% Ingenieur/Architecte). */
@Component({
  selector: 'gj-propositions',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Propositions d’études' | t }}</h2>
        <p>{{ 'Créez vos propositions par phases, puis envoyez-les au client.' | t }}</p>
      </div>
      <div class="page-entete__actions">
        <a class="btn btn-secondaire" routerLink="/expert/projets"><gj-icone nom="layers" [taille]="16"></gj-icone>{{ 'Projets ouverts' | t }}</a>
        <a class="btn btn-secondaire" routerLink="/expert/profil"><gj-icone nom="user" [taille]="16"></gj-icone>{{ 'Mon profil' | t }}</a>
      </div>
    </div>

    <form [formGroup]="form" (ngSubmit)="creer()" class="form-page">
      <section class="carte-section">
        <div class="carte-section__entete">
          <h3><gj-icone nom="plus"></gj-icone>{{ 'Nouvelle proposition' | t }}</h3>
        </div>
        <div class="grille-form">
          <div class="champ-groupe">
            <label>{{ 'Projet' | t }}</label>
            <select formControlName="projetId">
              <option value="" disabled>{{ 'Choisir un projet publié' | t }}</option>
              <option *ngFor="let p of projets" [value]="p.id">{{ p.titre }} · {{ p.localisation }} ({{ p.client | nom }})</option>
            </select>
          </div>
          <div class="champ-groupe">
            <label>{{ 'Titre' | t }}</label>
            <input formControlName="titre" placeholder="Étude structure R+2" />
          </div>
          <div class="champ-groupe champ-large">
            <label>{{ 'Description' | t }}</label>
            <textarea formControlName="description"></textarea>
          </div>
        </div>
      </section>

      <section class="carte-section">
        <div class="carte-section__entete">
          <h3><gj-icone nom="layers"></gj-icone>{{ 'Phases' | t }}</h3>
          <button type="button" class="btn-secondaire bouton-action" (click)="ajouterPhase()">
            <gj-icone nom="plus" [taille]="15"></gj-icone>{{ 'Ajouter une phase' | t }}
          </button>
        </div>
        <div formArrayName="phases" class="jalons-liste">
          <div class="jalon-ligne" *ngFor="let ph of phases.controls; let i = index" [formGroupName]="i">
            <span class="jalon-num">{{ i + 1 }}</span>
            <input formControlName="libelle" placeholder="Esquisse, APS, APD, DCE…" />
            <input type="number" formControlName="montantFcfa" [placeholder]="'Montant FCFA' | t" />
            <button type="button" class="bouton-action bouton-action--discret" (click)="phases.removeAt(i)"
                    [disabled]="phases.length === 1" [attr.aria-label]="'Supprimer la phase' | t" [title]="'Supprimer la phase' | t">
              <gj-icone nom="trash" [taille]="15"></gj-icone>
            </button>
          </div>
        </div>
      </section>

      <div class="recap">
        <div>
          <div class="kpi__libelle">{{ 'Total' | t }}</div>
          <div class="kpi__valeur">{{ total() | fcfa }}</div>
        </div>
        <button type="submit" [disabled]="form.invalid || envoi">
          <gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Créer (brouillon)' | t }}
        </button>
      </div>
    </form>

    <div class="carte-section__entete titre-section">
      <h2>{{ 'Mes propositions' | t }}</h2>
    </div>
    <div class="etat-vide" *ngIf="!propositions.length">
      <div class="etat-vide__icone"><gj-icone nom="file" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun élément' | t }}</h3>
    </div>
    <article class="carte-section" *ngFor="let p of propositions">
      <header class="carte-section__entete">
        <div>
          <h3 class="proposition__titre">{{ p.titre }}</h3>
          <div class="chips">
            <span class="chip"><gj-icone nom="briefcase"></gj-icone>{{ p.projet.titre }}</span>
            <span class="chip"><gj-icone nom="layers"></gj-icone>{{ p.phases.length }} {{ 'phases' | t }}</span>
            <span class="chip"><gj-icone nom="wallet"></gj-icone>{{ p.montantTotalFcfa | fcfa }}</span>
          </div>
        </div>
        <div class="actions">
          <span [class]="p.statut | badge">{{ p.statut | libelle }}</span>
          <button type="button" *ngIf="p.statut === 'BROUILLON'" (click)="envoyer(p.id)">
            <gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Envoyer au client' | t }}
          </button>
        </div>
      </header>
    </article>
  `
})
export class PropositionsComponent implements OnInit {
  propositions: PropositionEtude[] = [];
  projets: Projet[] = [];
  envoi = false;

  form = this.fb.nonNullable.group({
    projetId: ['', Validators.required],
    titre: ['', Validators.required],
    description: [''],
    phases: this.fb.array([this.nouvellePhase('Esquisse')])
  });

  constructor(private fb: FormBuilder, private expertService: ExpertService, private api: ApiService,
              private toast: ToastService) {}

  get phases(): FormArray {
    return this.form.controls.phases;
  }

  ngOnInit(): void {
    this.charger();
    this.api.projetsOuverts().subscribe(r => (this.projets = r));
  }

  nouvellePhase(libelle = '') {
    return this.fb.nonNullable.group({
      libelle: [libelle, Validators.required],
      description: [''],
      montantFcfa: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ajouterPhase(): void {
    this.phases.push(this.nouvellePhase());
  }

  total(): number {
    return this.form.getRawValue().phases.reduce((s, p) => s + (Number(p.montantFcfa) || 0), 0);
  }

  charger(): void {
    this.expertService.mesPropositions().subscribe(res => (this.propositions = res));
  }

  creer(): void {
    this.envoi = true;
    this.expertService.creerProposition(this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.succes('Proposition créée en brouillon.');
        this.form.reset();
        this.phases.clear();
        this.ajouterPhase();
        this.envoi = false;
        this.charger();
      },
      error: () => (this.envoi = false)
    });
  }

  envoyer(id: string): void {
    this.expertService.envoyerProposition(id).subscribe(() => {
      this.toast.succes('Proposition envoyée au client.');
      this.charger();
    });
  }
}
