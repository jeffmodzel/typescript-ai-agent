import Anthropic from '@anthropic-ai/sdk';

export type MachineStates = 'Initialize' | 'PromptUser' | 'AgentProcess' | 'Error' | 'Complete' | 'DisplayCurrentState';

export type MachineContext = {
  error?: unknown;
  userInput: string;
  client?: Anthropic;
  messages: ConversationMessage[];
  claudeModel: string;
  lastResponse?: Anthropic.Message;
};

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}
