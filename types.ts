export interface GeneratedResult {
  code: string;
  error?: string;
}

export enum TabOption {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE'
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}