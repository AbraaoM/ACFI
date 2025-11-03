import { Chat } from "@/models/chat";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

interface CreateChatRequest {
  session_id: string;
  question: string;
  k?: number;
}

export function ChatService() {
  const createChat = async (request: CreateChatRequest) => {
    const { session_id, question, k = 50 } = request;
    const response = await fetch(`${API_BASE_URL}/chats?session_id=${session_id}&question=${encodeURIComponent(question)}&k=${k}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  };

  const getChatsBySession = async (
    sessionId: string, 
    skip: number = 0, 
    limit: number = 100
  ): Promise<Chat[]> => {
    const response = await fetch(`${API_BASE_URL}/chats/session/${sessionId}?skip=${skip}&limit=${limit}`);
    return response.json();
  };

  const getChat = async (chatId: string): Promise<Chat> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`);
    return response.json();
  };

  const updateChat = async (chatId: string, content?: string): Promise<Chat> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return response.json();
  };

  const deleteChat = async (chatId: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/chats/${chatId}`, { method: 'DELETE' });
  };

  return { createChat, getChatsBySession, getChat, updateChat, deleteChat };
}