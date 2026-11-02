import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppelOffre, CandidatureAO } from '../../shared/models/projet.model';

/** Consomme /api/ong-institutions (voir OngController backend). */
@Injectable({ providedIn: 'root' })
export class OngService {
  private base = `${environment.apiBaseUrl}/ong-institutions`;

  constructor(private http: HttpClient) {}

  publierAppelOffre(titre: string, cahierDesChargesTexte: string, dateLimiteDepot: string): Observable<AppelOffre> {
    return this.http.post<AppelOffre>(`${this.base}/appels-offres`, { titre, cahierDesChargesTexte, dateLimiteDepot });
  }

  mesAppelsOffres(): Observable<AppelOffre[]> {
    return this.http.get<AppelOffre[]>(`${this.base}/appels-offres`);
  }

  cloturer(id: string): Observable<AppelOffre> {
    return this.http.patch<AppelOffre>(`${this.base}/appels-offres/${id}/cloturer`, {});
  }

  consulterCandidatures(appelOffreId: string): Observable<CandidatureAO[]> {
    return this.http.get<CandidatureAO[]>(`${this.base}/appels-offres/${appelOffreId}/candidatures`);
  }

  statuerSurCandidature(candidatureId: string, statut: string): Observable<CandidatureAO> {
    return this.http.patch<CandidatureAO>(`${this.base}/candidatures/${candidatureId}/statut`, {}, { params: { statut } });
  }
}
