import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ProjetDetail } from '../../shared/models/admin.model';

/** Fiche projet cote back-office : parties, jalons, sequestre et tranches. */
@Component({
  selector: 'gj-admin-projet-detail',
  template: `
    <a class="retour-lien" routerLink="/admin/projets"><gj-icone nom="arrow-left" [taille]="16"></gj-icone>{{ 'Tous les projets' | t }}</a>
    <ng-container *ngIf="d">
      <div class="page-entete">
        <div>
          <h2>{{ d.resume.titre }}</h2>
          <div class="chips">
            <span class="chip"><gj-icone nom="map-pin"></gj-icone>{{ d.resume.localisation || '-' }}</span>
            <span class="chip"><gj-icone nom="layers"></gj-icone>{{ d.resume.typeProjet || '-' }}</span>
            <span class="chip"><gj-icone nom="calendar"></gj-icone>{{ 'créé le' | t }} {{ d.resume.createdAt | date: 'dd/MM/yyyy' }}</span>
            <span class="chip"><gj-icone nom="wallet"></gj-icone>{{ 'budget estimé' | t }} {{ d.resume.budgetEstimeFcfa | fcfa }}</span>
          </div>
        </div>
        <span [class]="d.resume.etat | badge">{{ d.resume.etat | libelle }}</span>
      </div>

      <p class="description-projet pre" *ngIf="d.description">{{ d.description }}</p>

      <div class="bo-grille">
        <section class="carte">
          <h3 class="carte-titre"><gj-icone nom="user"></gj-icone>{{ 'Client' | t }}</h3>
          <div class="personne">
            <span class="personne__avatar"><gj-icone nom="user"></gj-icone></span>
            <div>
              <strong>{{ d.resume.client.nom }}</strong>
              <div class="sous-texte"><gj-icone nom="phone" [taille]="12"></gj-icone>{{ d.resume.client.phone }}</div>
              <div class="sous-texte">{{ d.resume.client.profileType | libelle }} · KYC {{ d.resume.client.kycLevel | libelle }}</div>
            </div>
          </div>
        </section>
        <section class="carte">
          <h3 class="carte-titre"><gj-icone nom="briefcase"></gj-icone>{{ 'Prestataire' | t }}</h3>
          <ng-container *ngIf="d.resume.prestataire as p; else aucun">
            <div class="personne">
              <span class="personne__avatar"><gj-icone nom="user"></gj-icone></span>
              <div>
                <strong>{{ p.nom }}</strong>
                <div class="sous-texte"><gj-icone nom="phone" [taille]="12"></gj-icone>{{ p.phone }}</div>
                <div class="sous-texte">{{ p.profileType | libelle }} · KYC {{ p.kycLevel | libelle }}</div>
              </div>
            </div>
          </ng-container>
          <ng-template #aucun><p class="vide">{{ 'Aucun prestataire engagé.' | t }}</p></ng-template>
        </section>
      </div>

      <section class="carte">
        <h3 class="carte-titre"><gj-icone nom="layers"></gj-icone>{{ 'Jalons' | t }}</h3>
        <p class="vide" *ngIf="!d.jalons.length">{{ 'Aucun jalon.' | t }}</p>
        <div class="tableau-carte" *ngIf="d.jalons.length">
          <table class="tableau-moderne">
            <thead>
              <tr><th>#</th><th>{{ 'Jalon' | t }}</th><th class="nombre">{{ 'Montant' | t }}</th><th>{{ 'Statut' | t }}</th><th>{{ 'Soumis' | t }}</th><th>{{ 'Validé' | t }}</th><th>{{ 'Preuve' | t }}</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let j of d.jalons">
                <td><span class="jalon-num">{{ j.ordre }}</span></td>
                <td>
                  <strong>{{ j.libelle }}</strong>
                  <div class="sous-texte texte-alerte" *ngIf="j.commentaireClient">{{ j.commentaireClient }}</div>
                </td>
                <td class="nombre">{{ j.montantFcfa | fcfa }}</td>
                <td><span [class]="j.statut | badge">{{ j.statut | libelle }}</span></td>
                <td class="sous-texte">{{ j.soumisLe ? (j.soumisLe | date: 'dd/MM HH:mm') : '-' }}</td>
                <td class="sous-texte">{{ j.valideLe ? (j.valideLe | date: 'dd/MM HH:mm') : '-' }}</td>
                <td>
                  <a *ngFor="let u of photos(j.preuvePhotoUrls); let i = index" class="bouton-action bouton-action--lien"
                     [href]="u | fichier" target="_blank" rel="noopener">
                    <gj-icone nom="image" [taille]="14"></gj-icone>{{ 'Photo' | t }} {{ i + 1 }}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="carte" *ngFor="let t of d.transactions">
        <div class="carte-section__entete">
          <h3 class="carte-titre"><gj-icone nom="lock"></gj-icone>{{ 'Séquestre' | t }} · {{ t.transaction.montantTotalFcfa | fcfa }}</h3>
          <span [class]="t.transaction.statut | badge">{{ t.transaction.statut | libelle }}</span>
        </div>
        <div class="chips">
          <span class="chip"><gj-icone nom="wallet"></gj-icone>{{ t.transaction.operateurMobileMoney | libelle }}</span>
          <span class="chip"><gj-icone nom="phone"></gj-icone>{{ t.transaction.numeroPayeur || '-' }}</span>
          <span class="chip"><gj-icone nom="file"></gj-icone>{{ 'réf.' | t }} {{ t.transaction.referencePaiement || '-' }}</span>
          <span class="chip"><gj-icone nom="activity"></gj-icone>{{ t.transaction.niveauCommission | libelle }}</span>
        </div>
        <div class="alerte" *ngIf="t.transaction.motifLitige" style="margin-top:12px">
          <gj-icone nom="alert" [taille]="16"></gj-icone>{{ 'Motif du litige' | t }} : {{ t.transaction.motifLitige }}
        </div>
        <div class="tableau-carte" style="margin-top:14px">
          <table class="tableau-moderne">
            <thead>
              <tr><th>{{ 'Tranche' | t }}</th><th class="nombre">{{ 'Montant' | t }}</th><th class="nombre">{{ 'Commission' | t }}</th><th class="nombre">{{ 'Net versé' | t }}</th><th>{{ 'Libérée' | t }}</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let tr of t.tranches">
                <td>{{ tr.jalonLibelle || '-' }}</td>
                <td class="nombre">{{ tr.montantFcfa | fcfa }}</td>
                <td class="nombre">{{ tr.commissionFcfa | fcfa }}</td>
                <td class="nombre">{{ tr.montantNetFcfa | fcfa }}</td>
                <td>
                  <span [class]="tr.libere ? 'badge badge-success' : 'badge'">
                    {{ tr.libere ? (tr.libereLe | date: 'dd/MM/yyyy HH:mm') : ('Non' | t) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </ng-container>
  `
})
export class ProjetDetailAdminComponent implements OnInit {
  d: ProjetDetail | null = null;

  constructor(private admin: AdminService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.admin.projet(this.route.snapshot.paramMap.get('id')!).subscribe(d => (this.d = d));
  }

  photos(urls: string | null): string[] {
    return urls ? urls.split(',').map(u => u.trim()).filter(Boolean) : [];
  }
}
