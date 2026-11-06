import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { OPERATEURS_MOBILE_MONEY } from '../../shared/models/escrow.model';

/** Mon compte : profil, niveau KYC, solde Gida Jari et retrait vers Mobile Money. */
@Component({
  selector: 'gj-compte',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Mon compte' | t }}</h2>
        <p>{{ 'Votre solde, votre niveau de vérification et vos retraits.' | t }}</p>
      </div>
    </div>

    <ng-container *ngIf="auth.compte as c">
      <div class="kpi-grille">
        <div class="kpi kpi--or">
          <span class="kpi__icone"><gj-icone nom="wallet"></gj-icone></span>
          <div><div class="kpi__valeur">{{ c.walletBalance | fcfa }}</div><div class="kpi__libelle">{{ 'Solde' | t }}</div></div>
        </div>
        <div class="kpi">
          <span class="kpi__icone"><gj-icone nom="shield"></gj-icone></span>
          <div><div class="kpi__valeur">{{ c.kycLevel | libelle }}</div><div class="kpi__libelle">{{ 'Niveau KYC' | t }}</div></div>
        </div>
        <div class="kpi kpi--vert">
          <span class="kpi__icone"><gj-icone nom="star"></gj-icone></span>
          <div><div class="kpi__valeur">{{ c.profileScore | number: '1.1-2' }} / 5</div><div class="kpi__libelle">{{ 'Score' | t }}</div></div>
        </div>
      </div>

      <section class="carte-section compte-identite">
        <div class="compte-identite__avatar"><gj-icone nom="user" [taille]="28"></gj-icone></div>
        <div class="compte-identite__infos">
          <strong>{{ c.profileType | libelle }}</strong>
          <div class="chips">
            <span class="chip"><gj-icone nom="phone"></gj-icone>{{ c.phone }}</span>
            <span class="chip" *ngIf="c.email"><gj-icone nom="mail"></gj-icone>{{ c.email }}</span>
          </div>
        </div>
        <div class="actions">
          <a class="btn btn-secondaire" [routerLink]="auth.accueil() + '/profil'"><gj-icone nom="user" [taille]="16"></gj-icone>{{ 'Mon profil' | t }}</a>
          <a class="btn btn-secondaire" routerLink="/compte/kyc"><gj-icone nom="shield" [taille]="16"></gj-icone>{{ 'Vérification KYC' | t }}</a>
          <a class="btn btn-secondaire" routerLink="/compte/portfolio"><gj-icone nom="image" [taille]="16"></gj-icone>{{ 'Portfolio' | t }}</a>
        </div>
      </section>
    </ng-container>

    <section class="carte-section" *ngIf="(auth.compte?.walletBalance ?? 0) > 0">
      <div class="carte-section__entete">
        <h3><gj-icone nom="wallet"></gj-icone>{{ 'Retirer vers Mobile Money' | t }}</h3>
      </div>
      <form class="form-page" [formGroup]="form" (ngSubmit)="retirer()">
        <div class="grille-form">
          <div class="champ-groupe">
            <label>{{ 'Opérateur' | t }}</label>
            <select formControlName="operateur">
              <option *ngFor="let o of operateurs" [value]="o">{{ o | libelle }}</option>
            </select>
          </div>
          <div class="champ-groupe">
            <label>{{ 'Numéro Mobile Money' | t }}</label>
            <input formControlName="numero" type="tel" />
          </div>
          <div class="champ-groupe">
            <label>{{ 'Montant (FCFA)' | t }}</label>
            <input formControlName="montantFcfa" type="number" min="1" />
          </div>
        </div>
        <div class="actions-droite">
          <button type="submit" [disabled]="form.invalid || envoi"><gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Retirer' | t }}</button>
        </div>
      </form>
    </section>
  `
})
export class CompteComponent implements OnInit {
  operateurs = OPERATEURS_MOBILE_MONEY;
  envoi = false;
  form = this.fb.nonNullable.group({
    operateur: ['AMANA', Validators.required],
    numero: ['', Validators.required],
    montantFcfa: [0, [Validators.required, Validators.min(1)]]
  });

  constructor(public auth: AuthService, private api: ApiService, private toast: ToastService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.auth.rafraichirCompte().subscribe(c => this.form.patchValue({ numero: c.phone }));
  }

  retirer(): void {
    const { operateur, numero, montantFcfa } = this.form.getRawValue();
    this.envoi = true;
    this.api.retirer(operateur, numero, montantFcfa).subscribe({
      next: c => {
        this.auth.compte = c;
        this.toast.succes('Retrait envoyé vers votre Mobile Money.');
        this.envoi = false;
      },
      error: () => (this.envoi = false)
    });
  }
}
