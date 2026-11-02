import { Component } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../client.service';
import { ToastService } from '../../../core/services/toast.service';

/** Creation + publication d'un projet (chantier) avec ses jalons - roadmap 50% profil Client. */
@Component({
  selector: 'gj-projet-form',
  template: `
    <a class="retour-lien" routerLink="/client"><gj-icone nom="arrow-left" [taille]="16"></gj-icone>{{ 'Retour' | t }}</a>
    <div class="page-entete">
      <div>
        <h2>{{ 'Nouveau projet' | t }}</h2>
        <p>{{ 'Décrivez votre chantier et découpez-le en jalons, payés à mesure de leur validation.' | t }}</p>
      </div>
    </div>

    <form [formGroup]="form" (ngSubmit)="soumettre()" class="form-page">
      <section class="carte-section">
        <div class="carte-section__entete">
          <h3><gj-icone nom="file"></gj-icone>{{ 'Informations' | t }}</h3>
        </div>
        <div class="grille-form">
          <div class="champ-groupe">
            <label>{{ 'Titre' | t }}</label>
            <input formControlName="titre" placeholder="Maison F3 à Niamey" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Type de projet' | t }}</label>
            <select formControlName="typeProjet">
              <option *ngFor="let t of types" [value]="t">{{ t }}</option>
            </select>
          </div>
          <div class="champ-groupe">
            <label>{{ 'Localisation' | t }}</label>
            <input formControlName="localisation" placeholder="Quartier, ville" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Budget estimé (FCFA)' | t }}</label>
            <input type="number" formControlName="budgetEstimeFcfa" />
          </div>
          <div class="champ-groupe champ-large">
            <label>{{ 'Description' | t }}</label>
            <textarea formControlName="description"></textarea>
          </div>
        </div>
      </section>

      <section class="carte-section">
        <div class="carte-section__entete">
          <h3><gj-icone nom="layers"></gj-icone>{{ 'Jalons' | t }}</h3>
          <button type="button" class="btn-secondaire bouton-action" (click)="ajouterJalon()">
            <gj-icone nom="plus" [taille]="15"></gj-icone>{{ 'Ajouter un jalon' | t }}
          </button>
        </div>
        <p class="aide-champ">{{ 'Chaque jalon est payé au prestataire quand vous le validez, photo GPS à l’appui.' | t }}</p>

        <div formArrayName="jalons" class="jalons-liste">
          <div class="jalon-ligne" *ngFor="let j of jalons.controls; let i = index" [formGroupName]="i">
            <span class="jalon-num">{{ i + 1 }}</span>
            <input formControlName="libelle" [placeholder]="'Ex : Fondations' | t" />
            <input type="number" formControlName="montantFcfa" [placeholder]="'Montant FCFA' | t" />
            <button type="button" class="bouton-action bouton-action--discret" (click)="jalons.removeAt(i)"
                    [disabled]="jalons.length === 1" [attr.aria-label]="'Supprimer le jalon' | t" [title]="'Supprimer le jalon' | t">
              <gj-icone nom="trash" [taille]="15"></gj-icone>
            </button>
          </div>
        </div>
      </section>

      <section class="carte-section">
        <label class="case">
          <input type="checkbox" formControlName="publier" />
          <gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Publier tout de suite (identité déclarée requise)' | t }}
        </label>
      </section>

      <div class="recap">
        <div>
          <div class="kpi__libelle">{{ 'Total des jalons' | t }}</div>
          <div class="kpi__valeur">{{ total() | fcfa }}</div>
        </div>
        <button type="submit" [disabled]="form.invalid || envoi">
          <gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Créer le projet' | t }}
        </button>
      </div>
    </form>
    `
})
export class ProjetFormComponent {
  types = ['construction', 'extension', 'réfection', 'aménagement', 'forage', 'clôture'];
  envoi = false;

  form = this.fb.nonNullable.group({
    titre: ['', Validators.required],
    description: [''],
    typeProjet: ['construction', Validators.required],
    localisation: ['', Validators.required],
    budgetEstimeFcfa: [null as number | null],
    publier: [true],
    jalons: this.fb.array([this.nouveauJalon('Fondations')])
  });

  constructor(private fb: FormBuilder, private clientService: ClientService, private router: Router,
              private toast: ToastService) {}

  get jalons(): FormArray {
    return this.form.controls.jalons;
  }

  nouveauJalon(libelle = '') {
    return this.fb.nonNullable.group({
      libelle: [libelle, Validators.required],
      montantFcfa: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ajouterJalon(): void {
    this.jalons.push(this.nouveauJalon());
  }

  total(): number {
    return this.form.getRawValue().jalons.reduce((s, j) => s + (Number(j.montantFcfa) || 0), 0);
  }

  soumettre(): void {
    const { publier, ...projet } = this.form.getRawValue();
    this.envoi = true;
    this.clientService.creerProjet(projet).subscribe({
      next: p => {
        const voir = () => this.router.navigate(['/client/projets', p.id]);
        if (!publier) {
          this.toast.succes('Projet enregistré en brouillon.');
          voir();
          return;
        }
        // Si la publication est refusee (KYC), le projet reste en brouillon : on l'affiche quand meme.
        this.clientService.publierProjet(p.id).subscribe({
          next: () => {
            this.toast.succes('Projet créé et publié.');
            voir();
          },
          error: voir
        });
      },
      error: () => (this.envoi = false)
    });
  }
}
