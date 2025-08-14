import Anthropic from '@anthropic-ai/sdk';

export type MachineStates = 'Initialize' | 'PromptUser' | 'AgentProcess' | 'Error' | 'Complete';
export type MachineContext = {
  error?: unknown;
  userInput: string;
  client?: Anthropic;
};
