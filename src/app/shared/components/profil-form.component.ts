import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

export interface ChampProfil {
  cle: string;
  libelle: string;
  type?: 'text' | 'number' | 'select' | 'image';
  options?: string[];
  /** Champ exige pour le niveau KYC 2 (identite declaree). */
  requis?: boolean;
  aide?: string;
}

/**
 * Formulaire de profil generique (6 profils) : GET/PUT /api/{ressource}/{monId}.
 * Completer les champs obligatoires accorde automatiquement le niveau KYC 2.
 */
@Component({
  selector: 'gj-profil-form',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Mon profil' | t }}</h2>
        <p>Les champs marqués * constituent votre identité déclarée (KYC niveau 2) : ils débloquent la publication et la mise en relation.</p>
      </div>
    </div>

    <div class="squelette" *ngIf="!charge"></div>

    <div class="profil-disposition" *ngIf="charge">
      <section class="carte-section">
        <form class="form-page" [formGroup]="form" (ngSubmit)="enregistrer()">
          <div class="grille-form">
            <ng-container *ngFor="let c of champs">
              <div class="champ-groupe" [class.champ-large]="c.type === 'image'">
                <label [for]="c.cle">{{ c.libelle | t }}<span *ngIf="c.requis" class="requis"> *</span></label>

                <select *ngIf="c.type === 'select'" [id]="c.cle" [formControlName]="c.cle">
                  <option *ngFor="let o of c.options" [value]="o">{{ o }}</option>
                </select>

                <ng-container *ngIf="c.type === 'image'">
                  <img *ngIf="form.get(c.cle)?.value" [src]="form.get(c.cle)?.value | fichier" class="vignette" alt="" />
                  <input class="champ-fichier" type="file" accept="image/*" (change)="televerser($event, c.cle)" />
                </ng-container>

                <input *ngIf="c.type !== 'select' && c.type !== 'image'" [id]="c.cle" [type]="c.type ?? 'text'" [formControlName]="c.cle" />
                <small *ngIf="c.aide" class="aide-champ">{{ c.aide }}</small>
              </div>
            </ng-container>
          </div>

          <div class="actions-droite">
            <button type="submit" [disabled]="envoi">
              <gj-icone nom="check" [taille]="16"></gj-icone>{{ 'Enregistrer' | t }}
            </button>
          </div>
        </form>
      </section>

      <aside class="carte-section">
        <div class="carte-section__entete">
          <h3><gj-icone nom="shield"></gj-icone>{{ 'Niveau KYC' | t }}</h3>
          <span class="badge badge-info">{{ auth.getKycLevel() | libelle }}</span>
        </div>
        <div class="kyc-niveaux" [attr.aria-label]="'Niveau ' + niveau + ' sur 6'">
          <span *ngFor="let i of niveaux" class="kyc-niveaux__segment" [class.atteint]="i <= niveau"></span>
        </div>
        <p class="aide-champ">{{ niveau }} / 6</p>
        <div class="liens-rapides">
          <a routerLink="/compte/kyc"><gj-icone nom="user-check"></gj-icone>{{ 'Vérification KYC' | t }}<gj-icone nom="arrow-right" [taille]="16"></gj-icone></a>
          <a routerLink="/compte/portfolio"><gj-icone nom="briefcase"></gj-icone>{{ 'Portfolio' | t }}<gj-icone nom="arrow-right" [taille]="16"></gj-icone></a>
        </div>
      </aside>
    </div>
  `
})
export class ProfilFormComponent implements OnInit {
  @Input({ required: true }) ressource!: string;
  @Input({ required: true }) champs!: ChampProfil[];

  form = new FormGroup<Record<string, FormControl>>({});
  niveaux = [1, 2, 3, 4, 5, 6];
  charge = false;
  envoi = false;

  constructor(private http: HttpClient, public auth: AuthService, private toast: ToastService) {}

  /** Niveau KYC numerique (0 a 6) extrait du code, pour la barre de progression. */
  get niveau(): number {
    const m = /NIVEAU_(\d)/.exec(String(this.auth.getKycLevel() ?? ''));
    return m ? Number(m[1]) : 0;
  }

  private get url(): string {
    return `${environment.apiBaseUrl}/${this.ressource}/${this.auth.getUserId()}`;
  }

  ngOnInit(): void {
    this.champs.forEach(c => this.form.addControl(c.cle, new FormControl(null)));
    this.http.get<Record<string, unknown>>(this.url).subscribe(p => {
      this.form.patchValue(p);
      this.charge = true;
    });
  }

  televerser(event: Event, cle: string): void {
    const fichier = (event.target as HTMLInputElement).files?.[0];
    if (!fichier) {
      return;
    }
    const data = new FormData();
    data.append('fichier', fichier);
    this.http.post<{ url: string }>(`${environment.apiBaseUrl}/files`, data)
      .subscribe(res => this.form.get(cle)?.setValue(res.url));
  }

  enregistrer(): void {
    const manquants = this.champs.filter(c => c.requis && !this.form.get(c.cle)?.value);
    this.envoi = true;
    this.http.patch(`${environment.apiBaseUrl}/${this.ressource}/complete-profile`, this.form.value).subscribe({
      next: () => {
        this.envoi = false;
        this.auth.rafraichirCompte().subscribe();
        this.toast.succes(manquants.length
          ? 'Profil enregistré. Complétez les champs * pour atteindre le niveau KYC 2.'
          : 'Profil enregistré.');
      },
      error: () => (this.envoi = false)
    });
  }
}
