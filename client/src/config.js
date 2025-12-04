// Runtime configuration for API URL and Firebase
// This allows config to be set via environment variable at build time
// or via window variables at runtime (for Railway deployments)

export const getApiUrl = () => {
  // Check runtime config first (set via window variable or envsubst in Dockerfile)
  if (typeof window !== 'undefined' && window.API_URL) {
    return window.API_URL;
  }
  
  // Fall back to build-time env var
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default fallback
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

// Firebase configuration
export const getFirebaseConfig = () => {
  // Check runtime config first
  if (typeof window !== 'undefined' && window.FIREBASE_CONFIG) {
    return window.FIREBASE_CONFIG;
  }
  
  // Fall back to build-time env vars
  if (process.env.REACT_APP_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    };
  }
  
  // Return null if not configured
  return null;
};

export const FIREBASE_CONFIG = getFirebaseConfig();

