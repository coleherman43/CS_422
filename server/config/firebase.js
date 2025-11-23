const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// For production, use a service account key file
// For development, you can use environment variables or a service account JSON
let firebaseApp;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // If service account key is provided as JSON string in env
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // For development/testing, can use project ID only (requires GOOGLE_APPLICATION_CREDENTIALS env var)
    firebaseApp = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } else {
    // Fallback: try to initialize with default credentials (for local development)
    firebaseApp = admin.initializeApp();
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

module.exports = admin;

