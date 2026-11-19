export interface Person {
  id: number; // Neo4j internal Node ID
  userId: number; // ConnectIn User ID
  name: string; // User's full name
}

export type ConnectionStatus = 'connected' | 'pending_sent' | 'pending_received' | 'not_connected' | 'self';

export type ConnectionTab = 'all' | 'connected' | 'received' | 'sent';
