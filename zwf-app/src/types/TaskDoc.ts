export class TaskDoc {
  
  type: 'auto-gen' | 'client-upload' | 'org-upload';
  
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
}

