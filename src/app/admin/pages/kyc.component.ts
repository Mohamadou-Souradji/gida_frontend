import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';

/** File des documents KYC a valider (niveaux 3 a 6). */
@Component({
  selector: 'gj-admin-kyc',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Validation KYC' | t }}</h2>
        <p>{{ 'Documents d’identité et professionnels en attente de décision.' | t }}</p>
      </div>
    </div>

    <div class="info" *ngIf="!admin.peut('KYC_DECIDER')">
      <gj-icone nom="info" [taille]="16"></gj-icone>{{ 'Votre rôle permet de consulter la file, pas de décider.' | t }}
    </div>

    <div class="squelette" *ngIf="!charge"></div>

    <div class="etat-vide" *ngIf="charge && !kyc.length">
      <div class="etat-vide__icone"><gj-icone nom="check" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun document en attente.' | t }}</h3>
    </div>

    <article class="carte kyc-carte" *ngFor="let s of kyc">
      <div class="carte-section__entete">
        <div class="personne">
          <span class="personne__avatar"><gj-icone nom="user"></gj-icone></span>
          <div>
            <strong>{{ s.user | nom }}</strong>
            <div class="sous-texte">{{ s.user?.profileType | libelle }} · {{ 'niveau actuel' | t }} {{ s.user?.kycLevel | libelle }}</div>
            <div class="sous-texte"><gj-icone nom="clock" [taille]="12"></gj-icone>{{ 'envoyé le' | t }} {{ s.createdAt | date: 'dd/MM/yyyy HH:mm' }}</div>
          </div>
        </div>
        <span class="badge badge-warning">{{ s.niveauVise | libelle }}</span>
      </div>

      <div class="chips">
        <span class="chip"><gj-icone nom="file"></gj-icone>{{ s.typeDocument }}</span>
        <a class="bouton-action bouton-action--lien" [href]="s.documentUrl | fichier" target="_blank" rel="noopener">
          <gj-icone nom="external" [taille]="14"></gj-icone>{{ 'voir le document' | t }}
        </a>
      </div>

      <div class="decision" *ngIf="admin.peut('KYC_DECIDER')">
        <div class="champ-groupe champ-grow">
          <label [for]="'motif-' + s.id">{{ 'Motif en cas de refus' | t }}</label>
          <input [id]="'motif-' + s.id" [(ngModel)]="commentaires[s.id]" [placeholder]="'Motif en cas de refus' | t" />
        </div>
        <div class="actions">
          <button type="button" class="btn-danger" (click)="rejeter(s.id)"><gj-icone nom="x" [taille]="16"></gj-icone>{{ 'Refuser' | t }}</button>
          <button type="button" class="btn-success" (click)="approuver(s.id)"><gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Approuver' | t }}</button>
        </div>
      </div>
    </article>
  `
})
export class KycAdminComponent implements OnInit {
  kyc: any[] = [];
  charge = false;
  commentaires: Record<string, string> = {};

  constructor(public admin: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.admin.kycEnAttente().subscribe(r => {
      this.kyc = r;
      this.charge = true;
    });
  }

  approuver(id: string): void {
    this.admin.approuverKyc(id).subscribe(() => {
      this.toast.succes('Niveau KYC accordé.');
      this.charger();
    });
  }

  rejeter(id: string): void {
    this.admin.rejeterKyc(id, this.commentaires[id] ?? '').subscribe(() => {
      this.toast.info('Document refusé.');
      this.charger();
    });
  }
}
