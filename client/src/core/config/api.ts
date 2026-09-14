import axios from 'axios';

// Configuración global de axios para permitir cookies seguras y sesiones
axios.defaults.withCredentials = true;

/**
 * Normaliza las URLs de la API eliminando barras inclinadas al final si existen
 * y aplicando un valor por defecto si la variable no está definida.
 */
const getApiUrl = (envVar: string | undefined, defaultValue: string): string => {
  const url = envVar || defaultValue;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const authApi = {
  baseUrl: getApiUrl(import.meta.env.VITE_AUTH_API_URL, 'http://localhost:3000/api'),
};

export const cataloguesApi = {
  baseUrl: getApiUrl(import.meta.env.VITE_CATALOGUES_API_URL, 'http://localhost:3001/api/v1/catalogues'),
};

export const adminBoutiqueApi = {
  baseUrl: getApiUrl(import.meta.env.VITE_ADMIN_BOUTIQUE_API_URL, 'http://localhost:3000/api/v1/admin-boutique'),
};

// export const professionalsApi = {
//   baseUrl: getApiUrl(import.meta.env.VITE_PROFESSIONALS_API_URL, 'http://localhost:3000/api/v1'),
// };

export const patientsApi = {
  baseUrl: getApiUrl(import.meta.env.VITE_PATIENTS_API_URL, 'http://localhost:3000/api/v1'),
};

export const rendezBoutiqueApi = {
  baseUrl: getApiUrl(import.meta.env.VITE_RENDEZ_BOUTIQUE_API_URL, 'http://localhost:3000/api/v1/rendez-boutique'),
};

export const surgiBoutiqueApi = {
  baseUrl: getApiUrl(import.meta.env.VITE_SURGI_BOUTIQUE_API_URL, 'http://localhost:3000/api/v1/surgi-boutique'),
};

export const serviceOrdersApi = {
  baseUrl: getApiUrl(import.meta.env.VITE_SERVICE_ORDERS_API_URL, 'http://localhost:3000/api/v1'),
};

export const assistantRecordsApi = {
  baseUrl: getApiUrl(import.meta.env.VITE_ASSISTANT_RECORDS_API_URL, 'http://localhost:3000/api/v1/assitant-records'),
};