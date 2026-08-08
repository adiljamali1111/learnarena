export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Module {
  id: string;
  filename: string;
  title: string;
  content: string;
  type: 'pdf' | 'docx' | 'image' | 'text';
  timestamp: number;
  tutorHistory: Message[];
}

export type View = 'dashboard' | 'module';