import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

/** Portfolio des realisations (entite PortfolioItem) - visible sur le profil public. */
@Component({
  selector: 'gj-portfolio',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Portfolio' | t }}</h2>
        <p>{{ 'Vos réalisations, visibles par les clients qui vous consultent.' | t }}</p>
      </div>
    </div>

    <section class="carte-section">
      <div class="carte-section__entete">
        <h3><gj-icone nom="plus"></gj-icone>{{ 'Ajouter une réalisation' | t }}</h3>
      </div>
      <form class="form-page" [formGroup]="form" (ngSubmit)="ajouter()">
        <div class="grille-form">
          <div class="champ-groupe">
            <label>{{ 'Titre' | t }}</label>
            <input formControlName="titre" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Photo' | t }}</label>
            <input class="champ-fichier" type="file" accept="image/*" (change)="choisir($event)" />
          </div>
          <div class="champ-groupe champ-large">
            <label>{{ 'Description' | t }}</label>
            <textarea formControlName="description" rows="2"></textarea>
          </div>
        </div>
        <div class="actions-droite">
          <button type="submit" [disabled]="form.invalid || !photoUrl"><gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Ajouter' | t }}</button>
        </div>
      </form>
    </section>

    <div class="etat-vide" *ngIf="!items.length">
      <div class="etat-vide__icone"><gj-icone nom="image" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucune réalisation' | t }}</h3>
      <p>{{ 'Ajoutez vos premières photos de chantiers.' | t }}</p>
    </div>

    <div class="galerie galerie--moderne" *ngIf="items.length">
      <figure *ngFor="let p of items">
        <img [src]="p.photoUrl | fichier" [alt]="p.titre" loading="lazy" />
        <figcaption>
          <span class="galerie__titre">{{ p.titre }}</span>
          <button type="button" class="bouton-action bouton-action--discret" (click)="supprimer(p.id)"
                  [attr.aria-label]="'Supprimer' | t" [title]="'Supprimer' | t">
            <gj-icone nom="trash" [taille]="15"></gj-icone>
          </button>
        </figcaption>
      </figure>
    </div>
  `
})
export class PortfolioComponent implements OnInit {
  items: any[] = [];
  photoUrl = '';
  form = this.fb.nonNullable.group({ titre: ['', Validators.required], description: [''] });

  constructor(private api: ApiService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.api.monPortfolio().subscribe(res => (this.items = res));
  }

  choisir(event: Event): void {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (fichier) {
      this.api.uploader(fichier).subscribe(url => (this.photoUrl = url));
    }
  }

  ajouter(): void {
    const { titre, description } = this.form.getRawValue();
    this.api.ajouterPortfolio(titre, description, this.photoUrl).subscribe(() => {
      this.toast.succes('Réalisation ajoutée.');
      this.form.reset();
      this.photoUrl = '';
      this.charger();
    });
  }

  supprimer(id: string): void {
    this.api.supprimerPortfolio(id).subscribe(() => this.charger());
  }
}
