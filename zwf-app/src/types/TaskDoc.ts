export class TaskDoc {
  
  type: 'doc-template' | 'client-upload' | 'org-upload';
  
  createdAt?: Date;
  
  lastReadAt?: Date;
  
  signedAt?: Date;
  
  id: string;
  
  fileId: string;
  
  name?: string;
  
  requiresSign?: boolean;
  /**
   * singedHash = hash(`${file.md5}.${userId}.${signedAt_UTC}`)
   */
  signedHash?: string;

  status: 'error' | 'proceeding' | 'done' | 'read' | 'signed';
}

