import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Utilisateur } from '../../shared/models/user.model';

/** Messagerie interne : les echanges restent sur la plateforme (anti-contournement, preuve en cas de litige). */
@Component({
  selector: 'gj-messagerie',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Messagerie' | t }}</h2>
        <p>{{ 'Échangez avec vos clients et prestataires.' | t }}</p>
      </div>
    </div>

    <div class="msg">
      <aside class="msg__liste">
        <div class="msg__entete"><gj-icone nom="message" [taille]="16"></gj-icone>{{ 'Conversations' | t }}</div>
        <p class="vide" *ngIf="!conversations.length && !nouveauDestinataire">{{ 'Aucun élément' | t }}</p>
        <button type="button" *ngFor="let c of conversations" class="msg__conv"
                [class.actif]="c.id === conversationId" (click)="ouvrir(c.id)">
          <span class="msg__avatar"><gj-icone nom="user" [taille]="16"></gj-icone></span>
          <span class="msg__conv-texte">
            <strong>{{ autre(c) | nom }}</strong>
            <small *ngIf="c.projet">{{ c.projet.titre }}</small>
          </span>
        </button>
      </aside>

      <section class="msg__zone">
        <div class="msg__vide etat-vide" *ngIf="!conversationId && !nouveauDestinataire">
          <div class="etat-vide__icone"><gj-icone nom="message" [taille]="24"></gj-icone></div>
          <h3>{{ 'Choisissez une conversation' | t }}</h3>
        </div>

        <ng-container *ngIf="conversationId || nouveauDestinataire">
          <div class="msg__fil">
            <p class="vide msg__debut" *ngIf="nouveauDestinataire && !messages.length">{{ 'Nouveau message' | t }}</p>
            <div *ngFor="let m of messages" class="msg__bulle" [class.moi]="m.expediteur?.id === moi">
              <span class="msg__texte">{{ m.contenu }}</span>
              <small>{{ m.createdAt | date: 'dd/MM HH:mm' }}</small>
            </div>
          </div>
          <form (ngSubmit)="envoyer()" class="msg__saisie">
            <textarea [(ngModel)]="texte" name="texte" rows="2" [placeholder]="'Votre message' | t"></textarea>
            <button type="submit" [disabled]="!texte.trim()"><gj-icone nom="send" [taille]="16"></gj-icone>{{ 'Envoyer' | t }}</button>
          </form>
        </ng-container>
      </section>
    </div>
  `
})
export class MessagerieComponent implements OnInit {
  conversations: any[] = [];
  messages: any[] = [];
  conversationId = '';
  nouveauDestinataire = '';
  projetId = '';
  texte = '';
  moi = this.auth.getUserId();

  constructor(private api: ApiService, private auth: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.projetId = params.get('projet') ?? '';
    this.api.conversations().subscribe(res => {
      this.conversations = res;
      const destinataire = params.get('a');
      if (destinataire) {
        const existante = res.find(c => this.autre(c)?.id === destinataire);
        if (existante) {
          this.ouvrir(existante.id);
        } else {
          this.nouveauDestinataire = destinataire;
        }
      }
    });
  }

  autre(c: any): Utilisateur {
    return c.participantA?.id === this.moi ? c.participantB : c.participantA;
  }

  ouvrir(id: string): void {
    this.conversationId = id;
    this.nouveauDestinataire = '';
    this.api.messages(id).subscribe(res => (this.messages = res));
  }

  envoyer(): void {
    const contenu = this.texte.trim();
    const envoi = this.conversationId
      ? this.api.repondre(this.conversationId, contenu)
      : this.api.ecrire(this.nouveauDestinataire, contenu, this.projetId || undefined);
    envoi.subscribe(() => {
      this.texte = '';
      if (this.conversationId) {
        this.ouvrir(this.conversationId);
      } else {
        this.api.conversations().subscribe(res => {
          this.conversations = res;
          const c = res.find(x => this.autre(x)?.id === this.nouveauDestinataire);
          if (c) {
            this.ouvrir(c.id);
          }
        });
      }
    });
  }
}
