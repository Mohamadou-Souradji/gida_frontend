import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OngService } from '../ong.service';
import { ToastService } from '../../../core/services/toast.service';
import { AppelOffre } from '../../../shared/models/projet.model';

/** Publication d'Appels d'Offres et suivi (roadmap 50% profil ONG / Institution). */
@Component({
  selector: 'gj-ong-appels-offres',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Appels d’offres' | t }}</h2>
        <p>{{ 'Publiez vos appels d’offres et suivez les candidatures reçues.' | t }}</p>
      </div>
      <div class="page-entete__actions">
        <a class="btn btn-secondaire" routerLink="/ong/profil"><gj-icone nom="user" [taille]="16"></gj-icone>{{ 'Mon profil' | t }}</a>
      </div>
    </div>

    <form [formGroup]="form" (ngSubmit)="publier()" class="form-page">
      <section class="carte-section">
        <div class="carte-section__entete">
          <h3><gj-icone nom="send"></gj-icone>{{ 'Publier un appel d’offres' | t }}</h3>
        </div>
        <div class="grille-form">
          <div class="champ-groupe champ-large">
            <label>{{ 'Titre' | t }}</label>
            <input formControlName="titre" placeholder="Construction d’une école de 3 classes" />
          </div>
          <div class="champ-groupe champ-large">
            <label>{{ 'Cahier des charges' | t }}</label>
            <textarea formControlName="cahierDesChargesTexte" rows="6" [placeholder]="'Objet, lieu, délais, critères de sélection, pièces exigées…' | t"></textarea>
          </div>
          <div class="champ-groupe">
            <label>{{ 'Date limite de dépôt' | t }}</label>
            <input type="date" formControlName="dateLimiteDepot" [min]="aujourdhui" />
          </div>
        </div>
        <div class="actions-droite">
          <button type="submit" [disabled]="form.invalid || envoi"><gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Publier' | t }}</button>
        </div>
      </section>
    </form>

    <div class="carte-section__entete titre-section">
      <h2>{{ 'Mes appels d’offres' | t }}</h2>
    </div>
    <div class="etat-vide" *ngIf="!appelsOffres.length">
      <div class="etat-vide__icone"><gj-icone nom="file" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun élément' | t }}</h3>
    </div>
    <ul class="liste-moderne" *ngIf="appelsOffres.length">
      <li *ngFor="let ao of appelsOffres">
        <div class="liste-moderne__corps">
          <strong>{{ ao.titre }}</strong>
          <div class="chips">
            <span class="chip"><gj-icone nom="calendar"></gj-icone>{{ 'Limite' | t }} {{ ao.dateLimiteDepot | date: 'dd/MM/yyyy' }}</span>
            <span [class]="ao.statut | badge">{{ ao.statut | libelle }}</span>
          </div>
        </div>
        <div class="actions">
          <a class="btn" [routerLink]="['/ong/appels-offres', ao.id, 'candidatures']"><gj-icone nom="users" [taille]="16"></gj-icone>{{ 'Candidatures reçues' | t }}</a>
          <button type="button" class="btn-secondaire" *ngIf="ao.statut === 'PUBLIE'" (click)="cloturer(ao)">
            <gj-icone nom="x" [taille]="16"></gj-icone>{{ 'Clôturer' | t }}
          </button>
        </div>
      </li>
    </ul>
  `
})
export class OngAppelsOffresComponent implements OnInit {
  appelsOffres: AppelOffre[] = [];
  envoi = false;
  aujourdhui = new Date().toISOString().substring(0, 10);

  form = this.fb.nonNullable.group({
    titre: ['', Validators.required],
    cahierDesChargesTexte: ['', Validators.required],
    dateLimiteDepot: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private ongService: OngService, private toast: ToastService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.ongService.mesAppelsOffres().subscribe(r => (this.appelsOffres = r));
  }

  publier(): void {
    const { titre, cahierDesChargesTexte, dateLimiteDepot } = this.form.getRawValue();
    this.envoi = true;
    this.ongService.publierAppelOffre(titre, cahierDesChargesTexte, dateLimiteDepot).subscribe({
      next: () => {
        this.toast.succes('Appel d\'offres publié.');
        this.form.reset();
        this.envoi = false;
        this.charger();
      },
      error: () => (this.envoi = false)
    });
  }

  cloturer(ao: AppelOffre): void {
    this.ongService.cloturer(ao.id).subscribe(() => this.charger());
  }
}
