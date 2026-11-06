import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PropositionEtude } from '../../shared/models/projet.model';

/** Consomme /api/experts (voir ExpertController backend). */
@Injectable({ providedIn: 'root' })
export class ExpertService {
  private base = `${environment.apiBaseUrl}/experts`;

  constructor(private http: HttpClient) {}

  getProfil(id: string): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`${this.base}/${id}`);
  }

  configurerGrilleTarifaire(grille: { tarifHoraireFcfa: number | null; tarifForfaitaireFcfa: number | null }): Observable<unknown> {
    return this.http.patch(`${this.base}/grille-tarifaire`, JSON.stringify(grille), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  creerProposition(proposition: {
    projetId: string; titre: string; description: string;
    phases: { libelle: string; description: string; montantFcfa: number }[];
  }): Observable<PropositionEtude> {
    return this.http.post<PropositionEtude>(`${this.base}/propositions`, proposition);
  }

  envoyerProposition(id: string): Observable<PropositionEtude> {
    return this.http.post<PropositionEtude>(`${this.base}/propositions/${id}/envoyer`, {});
  }

  mesPropositions(): Observable<PropositionEtude[]> {
    return this.http.get<PropositionEtude[]>(`${this.base}/propositions/mes-propositions`);
  }
}
