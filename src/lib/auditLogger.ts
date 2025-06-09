
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserProfile } from '@/context/AuthContext';

export interface AuditLogData {
  userId: string;
  userName: string;
  action: string; 
  entityType: string; 
  entityId: string;
  entityName?: string;
  details?: Record<string, any> | string;
  timestamp: any; 
}

export async function logAuditEvent(
  currentUser: FirebaseUser | null,
  currentUserProfile: UserProfile | null,
  action: string,
  entityType: string,
  entityId: string,
  entityName?: string,
  details?: Record<string, any> | string
): Promise<void> {
  if (!currentUser) {
    console.error("Audit log attempted without authenticated user for action:", action);
    // Optionally, you could throw an error or handle this more gracefully
    // For now, we'll just prevent logging if no user is found.
    return;
  }

  const logEntry: Omit<AuditLogData, 'timestamp'> & { timestamp: any } = {
    userId: currentUser.uid,
    userName: currentUserProfile?.name || currentUser.email || 'Unknown User',
    action,
    entityType,
    entityId,
    entityName: entityName || entityId, // Fallback to entityId if name is not provided
    details: details || {},
    timestamp: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'auditLogs'), logEntry);
  } catch (error) {
    console.error("Failed to write audit log:", error, "Log Entry:", logEntry);
  }
}
