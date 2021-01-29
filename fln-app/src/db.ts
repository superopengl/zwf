import { createConnection, getConnectionManager } from 'typeorm';

export async function connectDatabase() {
   await createConnection();
}
