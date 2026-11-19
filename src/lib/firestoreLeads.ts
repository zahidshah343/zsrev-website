import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Stores a minimal lead record in Firestore (`leads` collection) strictly
 * containing timestamp, email, and report_id. Never stores PHI or diagnostic answers.
 */
export async function saveLeadToFirestore(
  email: string,
  reportId: string
): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase().slice(0, 254);
  const cleanReportId = reportId
    .trim()
    .replace(/[^#a-zA-Z0-9_-]/g, '')
    .slice(0, 64);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('A valid email address is required to save the lead.');
  }
  if (cleanReportId.length < 3) {
    throw new Error('A valid report ID is required to save the lead.');
  }

  const leadsCollection = collection(db, 'leads');
  const leadDocRef = doc(leadsCollection);

  try {
    await setDoc(leadDocRef, {
      email: normalizedEmail,
      report_id: cleanReportId,
      timestamp: serverTimestamp(),
    });
    return leadDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `leads/${leadDocRef.id}`);
  }
}
