import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SupplierService } from '../supplier.service';
import { Produit } from '../../../shared/models/projet.model';

/** CRUD du catalogue de produits : articles, prix, stocks (roadmap 50% Fournisseur de materiaux). */
@Component({
  selector: 'gj-catalogue',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Mon catalogue' | t }}</h2>
        <p>{{ 'Gérez vos produits, vos prix et vos stocks.' | t }}</p>
      </div>
      <div class="page-entete__actions">
        <a class="btn btn-secondaire" routerLink="/fournisseur/profil"><gj-icone nom="home" [taille]="16"></gj-icone>{{ 'Ma boutique' | t }}</a>
      </div>
    </div>

    <form [formGroup]="form" (ngSubmit)="enregistrer()" class="form-page">
      <section class="carte-section">
        <div class="carte-section__entete">
          <h3><gj-icone nom="plus"></gj-icone>{{ enEdition ? ('Modifier' | t) : ('Ajouter' | t) }}</h3>
          <span *ngIf="enEdition" class="badge badge-info">{{ 'Édition' | t }}</span>
        </div>
        <div class="grille-form">
          <div class="champ-groupe champ-large">
            <label>{{ 'Nom' | t }}</label>
            <input formControlName="nom" placeholder="Ciment CPJ 45" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Catégorie' | t }}</label>
            <input formControlName="categorie" placeholder="ciment, fer, bois…" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Unité' | t }}</label>
            <input formControlName="unite" placeholder="sac, m3, barre…" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Prix (FCFA)' | t }}</label>
            <input type="number" formControlName="prixUnitaireFcfa" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Stock' | t }}</label>
            <input type="number" formControlName="stockDisponible" />
          </div>
        </div>
        <div class="actions-droite actions-droite--double">
          <label class="case">
            <input type="checkbox" formControlName="actif" />{{ 'Visible des acheteurs' | t }}
          </label>
          <div class="actions">
            <button type="button" class="btn-secondaire" *ngIf="enEdition" (click)="annuler()">{{ 'Annuler' | t }}</button>
            <button type="submit" [disabled]="form.invalid"><gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Enregistrer' | t }}</button>
          </div>
        </div>
      </section>
    </form>

    <div class="tableau-carte">
      <table class="tableau-moderne">
        <thead>
          <tr>
            <th>{{ 'Nom' | t }}</th>
            <th class="nombre">{{ 'Prix (FCFA)' | t }}</th>
            <th class="nombre">{{ 'Stock' | t }}</th>
            <th>{{ 'Visibilité' | t }}</th>
            <th class="nombre">{{ 'Actions' | t }}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of produits" [class.inactif]="!p.actif">
            <td>
              <strong>{{ p.nom }}</strong>
              <div><small>{{ p.categorie }}</small></div>
            </td>
            <td class="nombre">{{ p.prixUnitaireFcfa | fcfa }} <small>/ {{ p.unite }}</small></td>
            <td class="nombre">
              <span class="stock" [class.stock--bas]="p.stockDisponible < 10">
                <gj-icone *ngIf="p.stockDisponible < 10" nom="alert" [taille]="14"></gj-icone>{{ p.stockDisponible }}
              </span>
            </td>
            <td><span [class]="p.actif ? 'badge badge-success' : 'badge'">{{ (p.actif ? 'Visible' : 'Masqué') | t }}</span></td>
            <td class="nombre">
              <div class="actions">
                <button type="button" class="bouton-action bouton-action--lien" (click)="editer(p)">
                  <gj-icone nom="edit" [taille]="15"></gj-icone>{{ 'Modifier' | t }}
                </button>
                <button type="button" class="bouton-action bouton-action--discret" (click)="supprimer(p)"
                        [attr.aria-label]="'Supprimer' | t" [title]="'Supprimer' | t">
                  <gj-icone nom="trash" [taille]="15"></gj-icone>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class CatalogueComponent implements OnInit {
  produits: Produit[] = [];
  enEdition: Produit | null = null;

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    categorie: [''],
    unite: ['sac'],
    prixUnitaireFcfa: [0, [Validators.required, Validators.min(1)]],
    stockDisponible: [0, Validators.min(0)],
    actif: [true]
  });

  constructor(private fb: FormBuilder, private supplierService: SupplierService, private auth: AuthService,
              private toast: ToastService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.supplierService.listerCatalogue(this.auth.getUserId()).subscribe(res => (this.produits = res));
  }

  editer(p: Produit): void {
    this.enEdition = p;
    this.form.patchValue(p);
  }

  annuler(): void {
    this.enEdition = null;
    this.form.reset();
  }

  enregistrer(): void {
    const valeur = this.form.getRawValue();
    const requete = this.enEdition
      ? this.supplierService.modifierProduit(this.enEdition.id, valeur)
      : this.supplierService.ajouterProduit(valeur);
    requete.subscribe(() => {
      this.toast.succes('Catalogue mis à jour.');
      this.annuler();
      this.charger();
    });
  }

  supprimer(p: Produit): void {
    if (confirm(`Supprimer « ${p.nom} » ?`)) {
      this.supplierService.supprimerProduit(p.id).subscribe(() => this.charger());
    }
  }
}
