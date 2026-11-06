import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { EscrowTransaction } from '../../shared/models/escrow.model';

/** Arbitrage des litiges de sequestre (les fonds restent geles jusqu'a la decision). */
@Component({
  selector: 'gj-admin-litiges',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Litiges' | t }}</h2>
        <p>{{ 'Arbitrez les désaccords entre clients et prestataires.' | t }}</p>
      </div>
    </div>

    <div class="info" *ngIf="!admin.peut('LITIGES_TRANCHER')">
      <gj-icone nom="info" [taille]="16"></gj-icone>{{ 'Votre rôle permet de consulter les litiges, pas de trancher.' | t }}
    </div>

    <div class="squelette" *ngIf="!charge"></div>

    <div class="etat-vide" *ngIf="charge && !litiges.length">
      <div class="etat-vide__icone"><gj-icone nom="check" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun litige ouvert.' | t }}</h3>
    </div>

    <article class="carte litige" *ngFor="let t of litiges">
      <div class="carte-section__entete">
        <div>
          <h3 class="mission__titre">{{ t.projet?.titre }}</h3>
          <div class="chips">
            <span class="chip"><gj-icone nom="user"></gj-icone>{{ 'client' | t }} : {{ t.payeur | nom }}</span>
            <span class="chip"><gj-icone nom="briefcase"></gj-icone>{{ 'prestataire' | t }} : {{ t.beneficiaire | nom }}</span>
          </div>
        </div>
        <a class="bouton-action bouton-action--lien" [routerLink]="['/admin/projets', t.projet?.id]">
          <gj-icone nom="external" [taille]="14"></gj-icone>{{ 'Fiche projet' | t }}
        </a>
      </div>

      <div class="kpi-grille kpi-grille--compacte">
        <div class="kpi">
          <span class="kpi__icone"><gj-icone nom="lock"></gj-icone></span>
          <div><div class="kpi__valeur">{{ t.montantTotalFcfa | fcfa }}</div><div class="kpi__libelle">{{ 'Séquestre' | t }}</div></div>
        </div>
        <div class="kpi kpi--vert">
          <span class="kpi__icone"><gj-icone nom="check"></gj-icone></span>
          <div><div class="kpi__valeur">{{ t.montantLibereFcfa | fcfa }}</div><div class="kpi__libelle">{{ 'déjà libéré' | t }}</div></div>
        </div>
        <div class="kpi kpi--orange">
          <span class="kpi__icone"><gj-icone nom="alert"></gj-icone></span>
          <div><div class="kpi__valeur">{{ (t.montantTotalFcfa - t.montantLibereFcfa) | fcfa }}</div><div class="kpi__libelle">{{ 'en jeu' | t }}</div></div>
        </div>
      </div>

      <div class="alerte"><gj-icone nom="alert" [taille]="16"></gj-icone>{{ 'Motif' | t }} : {{ t.motifLitige }}</div>

      <div class="decision" *ngIf="admin.peut('LITIGES_TRANCHER')">
        <div class="grille-form litige__form">
          <div class="champ-groupe">
            <label [for]="'decision-' + t.id">{{ 'Décision' | t }}</label>
            <select [id]="'decision-' + t.id" [(ngModel)]="decisions[t.id]">
              <option value="RESOLVED_PROVIDER">{{ 'En faveur du prestataire (libère le reste)' | t }}</option>
              <option value="RESOLVED_CLIENT">{{ 'En faveur du client (rembourse le reste)' | t }}</option>
              <option value="REFUNDED">{{ 'Remboursement (annulation d’un commun accord)' | t }}</option>
            </select>
          </div>
          <div class="champ-groupe">
            <label [for]="'justif-' + t.id">{{ 'Justification' | t }}</label>
            <input [id]="'justif-' + t.id" [(ngModel)]="commentaires[t.id]" [placeholder]="'Justification de la décision' | t" />
          </div>
        </div>
        <div class="actions actions--fin">
          <button type="button" [disabled]="!decisions[t.id]" (click)="resoudre(t)"><gj-icone nom="scale" [taille]="16"></gj-icone>{{ 'Trancher' | t }}</button>
        </div>
      </div>
    </article>
  `
})
export class LitigesAdminComponent implements OnInit {
  litiges: EscrowTransaction[] = [];
  charge = false;
  commentaires: Record<string, string> = {};
  decisions: Record<string, string> = {};

  constructor(public admin: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.admin.litiges().subscribe(r => {
      this.litiges = r;
      this.charge = true;
    });
  }

  resoudre(t: EscrowTransaction): void {
    this.admin.resoudre(t.id, this.decisions[t.id], this.commentaires[t.id] ?? '').subscribe(() => {
      this.toast.succes('Litige tranché.');
      this.charger();
    });
  }
}
