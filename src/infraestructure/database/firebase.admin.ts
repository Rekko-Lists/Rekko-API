import * as admin from 'firebase-admin';
import path from 'path';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(
            require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './serviceAccountKey.json'))
        ),
        projectId: process.env.FIREBASE_PROJECT_ID
    });
}

export const firebaseAuth = admin.auth();
