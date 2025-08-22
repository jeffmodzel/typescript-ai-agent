import Anthropic from '@anthropic-ai/sdk';

// Instead of: response.content[0].text
// Use this safe helper:
export function getResponseText(response: Anthropic.Message): string {
  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n') || '[No text content]';
}

// Claude 4 Models
export const CLAUDE_OPUS_4_1_20250805 = 'claude-opus-4-1-20250805';
export const CLAUDE_OPUS_4_1 = 'claude-opus-4-1';
export const CLAUDE_OPUS_4_20250514 = 'claude-opus-4-20250514';
export const CLAUDE_OPUS_4_0 = 'claude-opus-4-0';
export const CLAUDE_SONNET_4_20250514 = 'claude-sonnet-4-20250514';
export const CLAUDE_SONNET_4_0 = 'claude-sonnet-4-0';

// Claude 3.7 Models
export const CLAUDE_3_7_SONNET_20250219 = 'claude-3-7-sonnet-20250219';
export const CLAUDE_3_7_SONNET_LATEST = 'claude-3-7-sonnet-latest';

// Claude 3.5 Models
export const CLAUDE_3_5_HAIKU_20241022 = 'claude-3-5-haiku-20241022';
export const CLAUDE_3_5_HAIKU_LATEST = 'claude-3-5-haiku-latest';
export const CLAUDE_3_5_SONNET_20241022 = 'claude-3-5-sonnet-20241022';
export const CLAUDE_3_5_SONNET_LATEST = 'claude-3-5-sonnet-latest';
export const CLAUDE_3_5_SONNET_20240620 = 'claude-3-5-sonnet-20240620';

// Claude 3 Models
export const CLAUDE_3_OPUS_20240229 = 'claude-3-opus-20240229';
export const CLAUDE_3_OPUS_LATEST = 'claude-3-opus-latest';
export const CLAUDE_3_SONNET_20240229 = 'claude-3-sonnet-20240229';
export const CLAUDE_3_HAIKU_20240307 = 'claude-3-haiku-20240307';
