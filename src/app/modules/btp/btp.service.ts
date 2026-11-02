import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppelOffre, CandidatureAO } from '../../shared/models/projet.model';

/** Consomme /api/entreprises-btp (voir BtpController backend). */
@Injectable({ providedIn: 'root' })
export class BtpService {
  private base = `${environment.apiBaseUrl}/entreprises-btp`;

  constructor(private http: HttpClient) {}

  rechercherAppelsOffres(q: string): Observable<AppelOffre[]> {
    return this.http.get<AppelOffre[]>(`${this.base}/appels-offres`, { params: { q } });
  }

  soumettreCandidature(appelOffreId: string, propositionTechnique: string, montantPropositionFcfa: number): Observable<CandidatureAO> {
    return this.http.post<CandidatureAO>(`${this.base}/appels-offres/${appelOffreId}/candidatures`, {
      propositionTechnique,
      montantPropositionFcfa
    });
  }

  mesCandidatures(): Observable<CandidatureAO[]> {
    return this.http.get<CandidatureAO[]>(`${this.base}/candidatures`);
  }
}
