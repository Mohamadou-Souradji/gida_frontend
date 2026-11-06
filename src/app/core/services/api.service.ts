import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Compte, NotificationGj, Utilisateur } from '../../shared/models/user.model';
import { EscrowTransaction } from '../../shared/models/escrow.model';
import { Projet, ProjetVue } from '../../shared/models/projet.model';

/**
 * Services HTTP transverses (communs aux 6 profils) : compte, fichiers, KYC,
 * projets publies, sequestre, notation, messagerie, portfolio.
 * Les appels propres a un profil sont dans le service de son module.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // --- Compte ---
  changerLangue(langue: string): Observable<Compte> {
    return this.http.patch<Compte>(`${this.api}/compte/langue`, { langue });
  }

  retirer(operateur: string, numero: string, montantFcfa: number): Observable<Compte> {
    return this.http.post<Compte>(`${this.api}/compte/retrait`, { operateur, numero, montantFcfa });
  }

  notifications(): Observable<NotificationGj[]> {
    return this.http.get<NotificationGj[]>(`${this.api}/compte/notifications`);
  }

  marquerNotificationsLues(): Observable<void> {
    return this.http.post<void>(`${this.api}/compte/notifications/lues`, {});
  }

  // --- Fichiers ---
  /** Uploade un fichier (photo de jalon, document KYC, portfolio...) et retourne son URL. */
  uploader(fichier: File): Observable<string> {
    const formData = new FormData();
    formData.append('fichier', fichier);
    return this.http.post<{ url: string }>(`${this.api}/files`, formData).pipe(map(res => res.url));
  }

  // --- KYC ---
  soumettreKyc(niveauVise: string, typeDocument: string, documentUrl: string): Observable<unknown> {
    return this.http.post(`${this.api}/kyc/soumissions`, { niveauVise, typeDocument, documentUrl });
  }

  mesSoumissionsKyc(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/kyc/mes-soumissions`);
  }

  // --- Projets / sequestre ---
  projetsOuverts(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.api}/projets/ouverts`);
  }

  projet(id: string): Observable<ProjetVue> {
    return this.http.get<ProjetVue>(`${this.api}/projets/${id}`);
  }

  missions(): Observable<ProjetVue[]> {
    return this.http.get<ProjetVue[]>(`${this.api}/missions`);
  }

  soumettrePreuve(jalonId: string, photoUrl: string, latitude: number, longitude: number): Observable<unknown> {
    return this.http.post(`${this.api}/missions/jalons/preuve`, { jalonId, photoUrl, latitude, longitude });
  }

  ouvrirLitige(transactionId: string, motif: string): Observable<EscrowTransaction> {
    return this.http.post<EscrowTransaction>(`${this.api}/escrow/${transactionId}/litige`, { motif });
  }

  // --- Notation ---
  noter(notation: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.api}/notations`, notation);
  }

  notationsDe(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/notations/utilisateur/${userId}`);
  }

  // --- Messagerie ---
  conversations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/messagerie/conversations`);
  }

  messages(conversationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/messagerie/conversations/${conversationId}/messages`);
  }

  ecrire(destinataireId: string, contenu: string, projetId?: string): Observable<unknown> {
    return this.http.post(`${this.api}/messagerie/messages`, { destinataireId, contenu, projetId });
  }

  repondre(conversationId: string, contenu: string): Observable<unknown> {
    return this.http.post(`${this.api}/messagerie/conversations/${conversationId}/messages`, { contenu });
  }

  // --- Portfolio ---
  monPortfolio(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/portfolio`);
  }

  ajouterPortfolio(titre: string, description: string, photoUrl: string): Observable<unknown> {
    return this.http.post(`${this.api}/portfolio`, { titre, description, photoUrl });
  }

  supprimerPortfolio(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/portfolio/${id}`);
  }

  // --- Annuaire des prestataires (engagement par un client) ---
  rechercherArtisans(corpsDeMetier: string, zoneIntervention: string): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.api}/artisans/recherche`, {
      params: { corpsDeMetier, zoneIntervention }
    });
  }

  entreprisesBtp(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.api}/entreprises-btp`);
  }
}
