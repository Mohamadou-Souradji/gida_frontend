import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MembreEquipe, ROLES_ADMIN, RoleAdmin } from '../../shared/models/admin.model';

/** Equipe d'administration : roles distincts, geres par les super-admins. */
@Component({
  selector: 'gj-admin-equipe',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Équipe d’administration' | t }}</h2>
        <p>{{ 'Gérez les membres de l’équipe et leurs droits d’accès.' | t }}</p>
      </div>
    </div>

    <section class="roles-grille">
      <article class="carte role">
        <span class="role__icone role__icone--or"><gj-icone nom="shield"></gj-icone></span>
        <span class="badge badge-gold">{{ 'SUPER_ADMIN' | libelle }}</span>
        <p>{{ 'Tout, y compris la gestion de l’équipe.' | t }}</p>
      </article>
      <article class="carte role">
        <span class="role__icone"><gj-icone nom="user-check"></gj-icone></span>
        <span class="badge badge-info">{{ 'OPERATEUR_KYC' | libelle }}</span>
        <p>{{ 'Valide ou refuse les documents d’identité et professionnels.' | t }}</p>
      </article>
      <article class="carte role">
        <span class="role__icone role__icone--vert"><gj-icone nom="wallet"></gj-icone></span>
        <span class="badge badge-success">{{ 'GESTIONNAIRE_FINANCES' | libelle }}</span>
        <p>{{ 'Tranche les litiges, suit le séquestre, exporte les transactions.' | t }}</p>
      </article>
      <article class="carte role">
        <span class="role__icone"><gj-icone nom="eye"></gj-icone></span>
        <span class="badge">{{ 'LECTEUR' | libelle }}</span>
        <p>{{ 'Consulte le tableau de bord, les projets, les transactions et le journal.' | t }}</p>
      </article>
    </section>

    <section class="carte-section" *ngIf="admin.peut('EQUIPE_GERER')">
      <div class="carte-section__entete">
        <h3><gj-icone nom="plus"></gj-icone>{{ 'Ajouter un membre' | t }}</h3>
      </div>
      <form class="filtres-bar filtres-bar--sans-fond" (ngSubmit)="ajouter()">
        <div class="champ-groupe">
          <label for="phone-membre">{{ 'Téléphone' | t }}</label>
          <input id="phone-membre" name="phone" [(ngModel)]="nouveau.phone" placeholder="90 00 00 00" required />
        </div>
        <div class="champ-groupe">
          <label for="nom-membre">{{ 'Nom' | t }}</label>
          <input id="nom-membre" name="nom" [(ngModel)]="nouveau.nom" [placeholder]="'Prénom Nom' | t" />
        </div>
        <div class="champ-groupe">
          <label for="role-membre">{{ 'Rôle' | t }}</label>
          <select id="role-membre" name="role" [(ngModel)]="nouveau.role">
            <option *ngFor="let r of roles" [value]="r">{{ r | libelle }}</option>
          </select>
        </div>
        <button type="submit" [disabled]="!nouveau.phone"><gj-icone nom="plus" [taille]="16"></gj-icone>{{ 'Ajouter' | t }}</button>
      </form>
    </section>

    <div class="tableau-carte">
      <table class="tableau-moderne">
        <thead>
          <tr><th>{{ 'Membre' | t }}</th><th>{{ 'Rôle' | t }}</th><th>{{ 'Statut' | t }}</th><th>{{ 'Ajouté le' | t }}</th><th class="nombre"></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of membres" [class.inactif]="!m.actif">
            <td>
              <div class="personne">
                <span class="personne__avatar"><gj-icone nom="user"></gj-icone></span>
                <div>
                  <strong>{{ m.nom || '-' }}</strong>
                  <div class="sous-texte"><gj-icone nom="phone" [taille]="12"></gj-icone>{{ m.phone }}</div>
                  <div class="sous-texte texte-alerte" *ngIf="!m.aUnCompte">{{ 'pas encore connecté' | t }}</div>
                </div>
              </div>
            </td>
            <td>
              <select *ngIf="peutModifier(m); else roleFixe" [ngModel]="m.role" (ngModelChange)="changerRole(m, $event)"
                      [attr.aria-label]="'Rôle de ' + m.phone">
                <option *ngFor="let r of roles" [value]="r">{{ r | libelle }}</option>
              </select>
              <ng-template #roleFixe><span [class]="m.role | badge">{{ m.role | libelle }}</span></ng-template>
            </td>
            <td>
              <span *ngIf="m.amorcage" class="chip"><gj-icone nom="lock"></gj-icone>{{ 'Configuration serveur' | t }}</span>
              <span *ngIf="!m.amorcage" [class]="m.actif ? 'badge badge-success' : 'badge'">{{ (m.actif ? 'Actif' : 'Désactivé') | t }}</span>
            </td>
            <td class="sous-texte">{{ m.createdAt ? (m.createdAt | date: 'dd/MM/yyyy') : '-' }}</td>
            <td class="nombre">
              <div class="actions actions--fin" *ngIf="peutModifier(m)">
                <button type="button" class="bouton-action bouton-action--lien" (click)="basculer(m)">
                  <gj-icone [nom]="m.actif ? 'ban' : 'check'" [taille]="14"></gj-icone>{{ (m.actif ? 'Désactiver' : 'Réactiver') | t }}
                </button>
                <button type="button" class="bouton-action bouton-action--discret" (click)="retirer(m)"
                        [attr.aria-label]="'Retirer' | t" [title]="'Retirer' | t">
                  <gj-icone nom="trash" [taille]="15"></gj-icone>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="aide note-serveur">
      <gj-icone nom="info" [taille]="14"></gj-icone>
      {{ 'Les super-admins « configuration serveur » sont définis par ADMIN_PHONES dans le fichier .env du serveur.' | t }}
    </p>
  `
})
export class EquipeAdminComponent implements OnInit {
  roles = ROLES_ADMIN;
  membres: MembreEquipe[] = [];
  nouveau: { phone: string; nom: string; role: RoleAdmin } = { phone: '', nom: '', role: 'OPERATEUR_KYC' };

  constructor(public admin: AdminService, private toast: ToastService, private auth: AuthService) {}

  ngOnInit(): void {
    this.admin.equipe().subscribe(m => (this.membres = m));
  }

  peutModifier(m: MembreEquipe): boolean {
    return this.admin.peut('EQUIPE_GERER') && !m.amorcage && !!m.id && m.phone !== this.auth.compte?.phone;
  }

  ajouter(): void {
    this.admin.ajouterMembre(this.nouveau.phone, this.nouveau.nom, this.nouveau.role).subscribe(m => {
      this.membres = m;
      this.toast.succes('Membre ajouté.');
      this.nouveau = { phone: '', nom: '', role: 'OPERATEUR_KYC' };
    });
  }

  changerRole(m: MembreEquipe, role: RoleAdmin): void {
    this.admin.modifierMembre(m.id!, { role }).subscribe(liste => {
      this.membres = liste;
      this.toast.succes('Rôle modifié.');
    });
  }

  basculer(m: MembreEquipe): void {
    this.admin.modifierMembre(m.id!, { actif: !m.actif }).subscribe(liste => {
      this.membres = liste;
      this.toast.info(m.actif ? 'Accès suspendu.' : 'Accès rétabli.');
    });
  }

  retirer(m: MembreEquipe): void {
    if (!confirm(`Retirer ${m.nom || m.phone} de l'équipe ?`)) {
      return;
    }
    this.admin.retirerMembre(m.id!).subscribe(() => {
      this.membres = this.membres.filter(x => x.id !== m.id);
      this.toast.info('Membre retiré.');
    });
  }
}
