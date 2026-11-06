import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Jalon, Projet, ProjetVue, PropositionEtude } from '../../shared/models/projet.model';
import { EscrowTransaction } from '../../shared/models/escrow.model';
import { Utilisateur } from '../../shared/models/user.model';

export interface NouveauProjet {
  titre: string;
  description: string;
  typeProjet: string;
  localisation: string;
  budgetEstimeFcfa: number | null;
  jalons: { libelle: string; montantFcfa: number }[];
}

/** Consomme /api/clients (voir ClientController backend). */
@Injectable({ providedIn: 'root' })
export class ClientService {
  private base = `${environment.apiBaseUrl}/clients`;

  constructor(private http: HttpClient) {}

  getProfil(id: string): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.base}/${id}`);
  }

  mettreAJourProfil(id: string, profil: Partial<Utilisateur>): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.base}/${id}`, profil);
  }

  mesProjets(): Observable<ProjetVue[]> {
    return this.http.get<ProjetVue[]>(`${this.base}/projets`);
  }

  creerProjet(projet: NouveauProjet): Observable<Projet> {
    return this.http.post<Projet>(`${this.base}/projets`, projet);
  }

  publierProjet(projetId: string): Observable<Projet> {
    return this.http.post<Projet>(`${this.base}/projets/${projetId}/publier`, {});
  }

  ajouterJalons(projetId: string, jalons: { libelle: string; montantFcfa: number }[]): Observable<Jalon[]> {
    return this.http.post<Jalon[]>(`${this.base}/projets/${projetId}/jalons`, jalons);
  }

  supprimerJalon(jalonId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/jalons/${jalonId}`);
  }

  engager(projetId: string, beneficiaireId: string): Observable<EscrowTransaction> {
    return this.http.post<EscrowTransaction>(`${this.base}/projets/${projetId}/engager`, { beneficiaireId });
  }

  payer(transactionId: string, operateur: string, numero: string): Observable<EscrowTransaction> {
    return this.http.post<EscrowTransaction>(`${this.base}/escrow/${transactionId}/payer`, { operateur, numero });
  }

  validerJalon(jalonId: string): Observable<Jalon> {
    return this.http.post<Jalon>(`${this.base}/jalons/${jalonId}/valider`, {});
  }

  rejeterJalon(jalonId: string, motif: string): Observable<Jalon> {
    return this.http.post<Jalon>(`${this.base}/jalons/${jalonId}/rejeter`, { motif });
  }

  propositions(): Observable<PropositionEtude[]> {
    return this.http.get<PropositionEtude[]>(`${this.base}/propositions`);
  }

  deciderProposition(id: string, decision: 'accepter' | 'refuser'): Observable<PropositionEtude> {
    return this.http.patch<PropositionEtude>(`${this.base}/propositions/${id}/${decision}`, {});
  }
}
