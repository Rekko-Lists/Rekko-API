import { firebaseAuth } from '../../infraestructure/database/firebase.admin';
import { InvalidTokenError } from '../../domain/errors/auth.errors';
import { FirebaseUser } from '../../domain/schemas/user/oauth.schemas';

export async function verifyFirebaseTokenId(
    idToken: string
): Promise<FirebaseUser> {
    try {
        const decodedToken =
            await firebaseAuth.verifyIdToken(idToken);

        return {
            uid: decodedToken.uid || decodedToken.sub || '',
            email: decodedToken.email || ''
        };
    } catch (error) {
        throw new InvalidTokenError(
            `Google idToken verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

export async function getFirebaseUser(uid: string) {
    try {
        return await firebaseAuth.getUser(uid);
    } catch (error) {
        throw new InvalidTokenError(
            `Firebase user lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}
