export interface GeneratedResult {
  code: string;
  error?: string;
}

export enum TabOption {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE',
  IMAGE = 'IMAGE'
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
}