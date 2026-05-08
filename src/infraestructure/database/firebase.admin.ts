import * as admin from 'firebase-admin';
import path from 'path';

if (!admin.apps.length) {
    let credential: admin.credential.Credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // Production: full service account JSON stored as an env var string
        credential = admin.credential.cert(
            JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as admin.ServiceAccount
        );
    } else {
        // Local development: load from a JSON file on disk
        credential = admin.credential.cert(
            require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './serviceAccountKey.json'))
        );
    }

    admin.initializeApp({ credential, projectId: process.env.FIREBASE_PROJECT_ID });
}

export const firebaseAuth = admin.auth();
