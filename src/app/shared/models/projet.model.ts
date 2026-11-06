import { Utilisateur } from './user.model';
import { EscrowTransaction } from './escrow.model';

export type JalonStatus = 'A_FAIRE' | 'SOUMIS' | 'VALIDE' | 'REJETE' | 'LITIGE';

export interface Jalon {
  id: string;
  projetId?: string;
  libelle: string;
  ordre: number;
  statut: JalonStatus;
  montantFcfa: number;
  preuvePhotoUrls?: string;
  latitude?: number;
  longitude?: number;
  commentaireClient?: string;
  soumisLe?: string;
  valideLe?: string;
}

export interface Projet {
  id: string;
  titre: string;
  description?: string;
  typeProjet?: string;
  localisation?: string;
  budgetEstimeFcfa?: number;
  publie: boolean;
  client?: Utilisateur;
  jalons: Jalon[];
  createdAt?: string;
}

/** Projet + sequestre (null si aucun prestataire engage). */
export interface ProjetVue {
  projet: Projet;
  escrow: EscrowTransaction | null;
}

export interface PhaseEtude {
  id?: string;
  ordre?: number;
  libelle: string;
  description?: string;
  montantFcfa: number;
}

export interface PropositionEtude {
  id: string;
  titre: string;
  description?: string;
  montantTotalFcfa: number;
  statut: 'BROUILLON' | 'ENVOYEE' | 'ACCEPTEE' | 'REFUSEE';
  phases: PhaseEtude[];
  projet: Projet;
  expert: Utilisateur;
  envoyeeLe?: string;
}

export interface AppelOffre {
  id: string;
  titre: string;
  cahierDesChargesTexte: string;
  dateLimiteDepot: string;
  statut: 'BROUILLON' | 'PUBLIE' | 'EN_DEPOUILLEMENT' | 'ATTRIBUE' | 'CLOTURE' | 'ANNULE';
  institution?: Utilisateur;
}

export interface CandidatureAO {
  id: string;
  propositionTechnique: string;
  montantPropositionFcfa: number;
  statut: 'SOUMISE' | 'EN_EVALUATION' | 'RETENUE' | 'REJETEE';
  candidat: Utilisateur;
  appelOffre?: AppelOffre;
  createdAt?: string;
}

export interface Produit {
  id: string;
  nom: string;
  categorie?: string;
  unite?: string;
  prixUnitaireFcfa: number;
  stockDisponible: number;
  actif: boolean;
  fournisseur?: Utilisateur;
}
