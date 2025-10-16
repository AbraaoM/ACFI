export interface Chat {
  id: string;
  sessionId: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  created_at: Date;
}