// Runtime configuration for API URL
// This allows the API URL to be set via environment variable at build time
// or via window.API_URL at runtime (for Railway deployments)

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

