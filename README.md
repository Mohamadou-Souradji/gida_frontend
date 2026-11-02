# Gida Jari — Frontend (Angular 18)

Architecture modulaire par profil (Cahier des Charges, section 3.2) : modules chargés à la demande, guards par profil et par niveau KYC, formulaires réactifs, services HTTP par module.

## Démarrage

```
npm install
npm start          # http://localhost:4200, consomme l'API http://localhost:8080/api
npm run build      # build de production (dist/)
```

Pour la production, renseignez `src/environments/environment.prod.ts` : `apiBaseUrl` et `fichiersBaseUrl`.

## Arborescence

```
src/app/
  core/
    services/      AuthService (OTP, session), ApiService (appels communs), AdminService,
                   I18nService + i18n.haoussa.ts (francais / haoussa), ToastService
    guards/        AuthGuard, ProfileGuard (profil), KycGuard (niveau KYC, relu sur le serveur), AdminGuard
    interceptors/  JwtInterceptor (Bearer + affichage des erreurs API + 401 -> connexion)
  shared/
    models/        types TS alignes sur l'API (User/profils, Projet, Jalon, Escrow, AO...)
    pipes/         t (traduction), fcfa, fichier, nom, libelle, badge
    components/    gj-profil-form (profil generique des 6 profils), gj-missions (artisan/BTP),
                   gj-notation-form (5 criteres), gj-projets-ouverts
  auth/            connexion / inscription OTP (choix du profil a la 1re connexion)
  compte/          mon compte (solde, retrait Mobile Money), KYC, messagerie, notifications, portfolio
  admin/           back-office (menu lateral) : tableau de bord (indicateurs + graphiques SVG), projets,
                   transactions (sequestre, retraits, export CSV), KYC, litiges, equipe a roles, journal
  modules/
    client/        tableau de bord des chantiers, creation de projet + jalons, detail du projet
                   (engagement d'un prestataire, paiement sequestre, validation / rejet des jalons,
                   litige, notation), propositions d'etudes recues, profil
    artisan/       disponibilite AVAILABLE_NOW / UNAVAILABLE, missions + preuve photo GPS, projets ouverts, profil
    btp/           recherche d'AO + candidature, mes candidatures, missions, projets ouverts, profil
    ong/           publication d'AO, depouillement des candidatures, profil institutionnel (logo)
    expert/        propositions d'etudes par phases, grille tarifaire, profil
    supplier/      CRUD catalogue (prix, stock, visibilite), boutique et livraison
```

## Parcours testés de bout en bout (Playwright, mobile 390 px)

1. Un artisan s'inscrit, complète son profil (KYC 2), envoie sa CNI ; l'admin valide (KYC 3).
2. Un client crée un chantier avec ses jalons, le publie, trouve l'artisan, l'engage et paie par Mobile Money (simulé) : statut « Fonds sécurisés ».
3. L'artisan envoie une photo géolocalisée ; le client valide ; l'artisan est crédité de 490 000 FCFA (500 000 moins 2 %).
4. Une ONG publie un AO ; une entreprise BTP (KYC 3) candidate ; l'ONG la retient et l'AO passe « Attribué ».
5. Un expert envoie une proposition d'étude en 2 phases ; le client l'accepte.
6. Un fournisseur ajoute puis modifie un produit.
7. Un litige est ouvert, l'admin tranche en faveur du client, et le client est remboursé sur son solde.
8. L'interface bascule en haoussa (bouton HA), et la langue est mémorisée sur le compte.

## Bilinguisme français / haoussa

Les textes de l'interface sont écrits en français et passent par le pipe `t`.
Le dictionnaire `core/services/i18n.haoussa.ts` fournit leur traduction ; un texte non traduit reste en français.
**À faire relire par un locuteur natif** avant le pilote terrain, et à compléter au fil des écrans.

## Limites connues

- **Mode hors-ligne 2G/3G** (saisie et synchronisation différées) : non couvert. Le bundle initial est léger (environ 107 Ko compressés) et les modules sont chargés à la demande, mais il n'y a ni service worker ni file de synchronisation. Ce serait le chantier V2 (PWA).
- Traductions haoussa partielles (voir ci-dessus).
