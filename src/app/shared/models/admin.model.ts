/** Types du back-office, alignes sur com.gidajari.dto.AdminVues. */

export type RoleAdmin = 'SUPER_ADMIN' | 'OPERATEUR_KYC' | 'GESTIONNAIRE_FINANCES' | 'LECTEUR';
export type PermissionAdmin = 'KYC_DECIDER' | 'LITIGES_TRANCHER' | 'FINANCES_EXPORTER' | 'EQUIPE_GERER';
export type EtatProjet = 'BROUILLON' | 'PUBLIE' | 'ATTENTE_PAIEMENT' | 'EN_COURS' | 'LITIGE' | 'TERMINE';

export const ROLES_ADMIN: RoleAdmin[] = ['SUPER_ADMIN', 'OPERATEUR_KYC', 'GESTIONNAIRE_FINANCES', 'LECTEUR'];
export const ETATS_PROJET: EtatProjet[] = ['BROUILLON', 'PUBLIE', 'ATTENTE_PAIEMENT', 'EN_COURS', 'LITIGE', 'TERMINE'];
export const STATUTS_SEQUESTRE = ['DRAFT', 'PENDING_PAYMENT', 'FUNDED', 'PARTIAL_RELEASE', 'COMPLETED',
  'DISPUTED', 'RESOLVED_CLIENT', 'RESOLVED_PROVIDER', 'REFUNDED'];

export interface MoiAdmin {
  role: RoleAdmin | null;
  permissions: PermissionAdmin[];
}

export interface Personne {
  id: string;
  nom: string;
  phone: string;
  profileType: string;
  kycLevel: string;
  actif: boolean;
}

export interface PointMensuel {
  mois: string;
  inscriptions: number;
  volumeFcfa: number;
  commissionsFcfa: number;
  retraitsFcfa: number;
}

export interface Alerte {
  niveau: 'danger' | 'warning' | 'info';
  message: string;
  lien: string;
}

export interface TableauDeBord {
  utilisateurs: number;
  nouveaux30j: number;
  comptesSuspendus: number;
  utilisateursParProfil: Record<string, number>;
  utilisateursParKyc: Record<string, number>;
  projets: number;
  projetsPublies: number;
  projetsAvecPrestataire: number;
  appelsOffres: number;
  produitsCatalogue: number;
  volumeSecuriseFcfa: number;
  enSequestreFcfa: number;
  libereFcfa: number;
  commissionsFcfa: number;
  retraitsFcfa: number;
  litigesOuverts: number;
  kycEnAttente: number;
  jalonsEnAttente: number;
  sequestreParStatut: { statut: string; nombre: number; montantFcfa: number }[];
  serieMensuelle: PointMensuel[];
  alertes: Alerte[];
  genereLe: string;
}

export interface ProjetLigne {
  id: string;
  titre: string;
  localisation: string;
  typeProjet: string;
  budgetEstimeFcfa: number | null;
  createdAt: string;
  etat: EtatProjet;
  client: Personne;
  prestataire: Personne | null;
  jalons: number;
  jalonsValides: number;
  montantSequestreFcfa: number | null;
  montantLibereFcfa: number | null;
  transactionId: string | null;
  statutSequestre: string | null;
}

export interface TransactionLigne {
  id: string;
  projetId: string;
  projetTitre: string;
  payeur: Personne;
  beneficiaire: Personne;
  montantTotalFcfa: number;
  montantLibereFcfa: number;
  commissionsFcfa: number;
  niveauCommission: string;
  statut: string;
  operateurMobileMoney: string | null;
  numeroPayeur: string | null;
  referencePaiement: string | null;
  motifLitige: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface TrancheLigne {
  id: string;
  jalonId: string | null;
  jalonLibelle: string | null;
  montantFcfa: number;
  commissionFcfa: number | null;
  montantNetFcfa: number | null;
  libere: boolean;
  libereLe: string | null;
}

export interface TransactionDetail {
  transaction: TransactionLigne;
  tranches: TrancheLigne[];
}

export interface ProjetDetail {
  resume: ProjetLigne;
  description: string | null;
  jalons: { id: string; libelle: string; ordre: number; statut: string; montantFcfa: number;
    preuvePhotoUrls: string | null; soumisLe: string | null; valideLe: string | null; commentaireClient: string | null }[];
  transactions: TransactionDetail[];
}

export interface RetraitLigne {
  id: string;
  utilisateur: Personne;
  operateur: string;
  numero: string;
  montantFcfa: number;
  reference: string | null;
  createdAt: string;
}

export interface PageAdmin<T> {
  elements: T[];
  total: number;
  page: number;
  taille: number;
}

export interface MembreEquipe {
  id: string | null;
  phone: string;
  nom: string | null;
  role: RoleAdmin;
  actif: boolean;
  amorcage: boolean;
  aUnCompte: boolean;
  createdAt: string | null;
}
