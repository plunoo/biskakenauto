const admin = require('firebase-admin');

let initialized = false;

const initFirebase = () => {
  if (initialized) return admin.app();

  try {
    let credential;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } else if (process.env.FIREBASE_PROJECT_ID) {
      credential = admin.credential.applicationDefault();
    } else {
      console.warn('[Firebase] Not configured - set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID');
      return null;
    }

    admin.initializeApp({ credential, projectId: process.env.FIREBASE_PROJECT_ID });
    initialized = true;
    console.log('[Firebase] Initialized');
    return admin.app();
  } catch (err) {
    if (err.code === 'app/duplicate-app') {
      initialized = true;
      return admin.app();
    }
    console.error('[Firebase] Init error:', err.message);
    return null;
  }
};

const getFirestore = () => {
  const app = initFirebase();
  if (!app) throw new Error('Firebase not configured');
  return admin.firestore();
};

const getFirebaseAuth = () => {
  const app = initFirebase();
  if (!app) throw new Error('Firebase not configured');
  return admin.auth();
};

module.exports = { initFirebase, getFirestore, getFirebaseAuth };
