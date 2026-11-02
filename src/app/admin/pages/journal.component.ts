import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';

/** Journal d'audit : les 100 dernieres decisions de l'equipe d'administration. */
@Component({
  selector: 'gj-admin-journal',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Journal des actions' | t }}</h2>
        <p>{{ 'Historique des décisions prises par l’équipe.' | t }}</p>
      </div>
    </div>

    <form class="filtres-bar" (ngSubmit)="0">
      <div class="champ-groupe champ-grow">
        <label for="filtre-journal">{{ 'Filtrer' | t }}</label>
        <div class="champ-recherche">
          <gj-icone nom="filter" [taille]="16"></gj-icone>
          <input id="filtre-journal" name="filtre" [(ngModel)]="filtre" [placeholder]="'Action, auteur ou détail' | t" />
        </div>
      </div>
    </form>

    <div class="tableau-carte">
      <table class="tableau-moderne">
        <thead>
          <tr><th>{{ 'Date' | t }}</th><th>{{ 'Auteur' | t }}</th><th>{{ 'Action' | t }}</th><th>{{ 'Détail' | t }}</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of filtrees()">
            <td class="sous-texte">{{ a.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
            <td>{{ a.admin | nom }}</td>
            <td><span class="code-action"><gj-icone nom="code" [taille]="12"></gj-icone>{{ a.action }}</span></td>
            <td>{{ a.detail }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="etat-vide" *ngIf="!filtrees().length">
      <p>{{ 'Aucune action.' | t }}</p>
    </div>
  `
})
export class JournalAdminComponent implements OnInit {
  journal: any[] = [];
  filtre = '';
  private cache: { filtre: string; source: any[]; lignes: any[] } = { filtre: '', source: [], lignes: [] };

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.journal().subscribe(r => (this.journal = r));
  }

  filtrees(): any[] {
    if (this.cache.filtre !== this.filtre || this.cache.source !== this.journal) {
      const f = this.filtre.trim().toLowerCase();
      const lignes = !f ? this.journal : this.journal.filter(a =>
        [a.action, a.detail, a.admin?.nom, a.admin?.prenom, a.admin?.raisonSociale, a.admin?.nomCommercial]
          .some(v => (v ?? '').toLowerCase().includes(f)));
      this.cache = { filtre: this.filtre, source: this.journal, lignes };
    }
    return this.cache.lignes;
  }
}
