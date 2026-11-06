import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationGj } from '../../shared/models/user.model';

/** Notifications (egalement envoyees par SMS) : jalons, paiements, litiges, candidatures... */
@Component({
  selector: 'gj-notifications',
  template: `
    <div class="page-entete">
      <div>
        <h2>{{ 'Notifications' | t }}</h2>
        <p>{{ 'Les dernières activités de vos projets et de votre compte.' | t }}</p>
      </div>
    </div>

    <div class="squelette" *ngIf="!charge"></div>

    <div class="etat-vide" *ngIf="charge && !notifications.length">
      <div class="etat-vide__icone"><gj-icone nom="bell" [taille]="24"></gj-icone></div>
      <h3>{{ 'Aucun élément' | t }}</h3>
      <p>{{ 'Vous êtes à jour.' | t }}</p>
    </div>

    <ul class="liste-notifs" *ngIf="notifications.length">
      <li *ngFor="let n of notifications" [class.non-lue]="!n.lu" class="notif">
        <span class="notif__icone"><gj-icone nom="bell" [taille]="18"></gj-icone></span>
        <div class="notif__corps">
          <strong>{{ n.titre }}</strong>
          <span>{{ n.contenu }}</span>
        </div>
        <time class="notif__date">{{ n.createdAt | date: 'dd/MM/yyyy HH:mm' }}</time>
      </li>
    </ul>
  `
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationGj[] = [];
  charge = false;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.api.notifications().subscribe(res => {
      this.notifications = res;
      this.charge = true;
      if (res.some(n => !n.lu)) {
        this.api.marquerNotificationsLues().subscribe(() => this.auth.rafraichirCompte().subscribe());
      }
    });
  }
}
