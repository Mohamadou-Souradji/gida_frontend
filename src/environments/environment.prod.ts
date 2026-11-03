/**
 * Production / preproduction : le frontend et l'API sont servis par le meme
 * domaine (Caddy renvoie /api et /files vers le backend), d'ou des URL relatives.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://gida-backend-lav2.onrender.com/api',
  fichiersBaseUrl: 'https://gida-backend-lav2.onrender.com'
};