const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// For production, use a service account key file
// For development, you can use environment variables or a service account JSON
let firebaseApp;
let firebaseInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // If service account key is provided as JSON string in env
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase initialized with service account key');
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // For development/testing, can use project ID only (requires GOOGLE_APPLICATION_CREDENTIALS env var)
    firebaseApp = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    firebaseInitialized = true;
    console.log('✅ Firebase initialized with project ID');
  } else {
    // Fallback: try to initialize with default credentials (for local development)
    try {
      firebaseApp = admin.initializeApp();
      firebaseInitialized = true;
      console.log('✅ Firebase initialized with default credentials');
    } catch (defaultError) {
      // If default initialization fails, that's okay for development
      console.warn('⚠️  Firebase not configured - will use development mode');
      console.warn('   Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_PROJECT_ID to enable Firebase');
    }
  }
} catch (error) {
  console.warn('⚠️  Firebase initialization error (using development mode):', error.message);
  // Don't throw - allow server to run in development mode without Firebase
}

// Export admin and initialization status
admin.isInitialized = () => firebaseInitialized;

module.exports = admin;

