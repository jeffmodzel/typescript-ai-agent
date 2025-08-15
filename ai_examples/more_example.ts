import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// Content types that can be returned
type ContentBlock = 
  | Anthropic.TextBlock 
  | Anthropic.ToolUseBlock;

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

class SafeConversationManager {
  private messages: ConversationMessage[] = [];

  async addUserMessage(content: string): Promise<string> {
    this.messages.push({
      role: 'user',
      content: content
    });

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: this.messages
      });

      // SAFE: Handle different content types properly
      const assistantResponse = this.extractTextFromResponse(response);
      
      this.messages.push({
        role: 'assistant',
        content: assistantResponse
      });

      return assistantResponse;

    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Safely extract text from the response, handling different content types
   */
  private extractTextFromResponse(response: Anthropic.Message): string {
    const textParts: string[] = [];
    
    for (const contentBlock of response.content) {
      if (contentBlock.type === 'text') {
        // This is a text block
        textParts.push(contentBlock.text);
      } else if (contentBlock.type === 'tool_use') {
        // This is a tool use block (for function calling)
        textParts.push(`[Tool: ${contentBlock.name} called with ${JSON.stringify(contentBlock.input)}]`);
      } else {
        // Handle any unknown content types
        console.warn('Unknown content type:', contentBlock);
        textParts.push('[Unknown content type]');
      }
    }

    return textParts.join('\n');
  }

  /**
   * More detailed content analysis
   */
  private analyzeResponse(response: Anthropic.Message) {
    console.log('Response analysis:');
    console.log(`- Total content blocks: ${response.content.length}`);
    
    response.content.forEach((block, index) => {
      console.log(`Block ${index}: type=${block.type}`);
      
      if (block.type === 'text') {
        console.log(`  Text length: ${block.text.length} characters`);
        console.log(`  Preview: ${block.text.substring(0, 100)}...`);
      } else if (block.type === 'tool_use') {
        console.log(`  Tool: ${block.name}`);
        console.log(`  Input: ${JSON.stringify(block.input)}`);
      }
    });
    
    console.log(`- Usage: ${JSON.stringify(response.usage)}`);
  }

  /**
   * Type-safe content extraction with detailed error handling
   */
  private extractTextSafely(response: Anthropic.Message): {
    text: string;
    hasToolUse: boolean;
    contentTypes: string[];
  } {
    const textParts: string[] = [];
    const contentTypes: string[] = [];
    let hasToolUse = false;

    // Check if content exists and is an array
    if (!response.content || !Array.isArray(response.content)) {
      throw new Error('Invalid response format: content is missing or not an array');
    }

    // Handle empty content array
    if (response.content.length === 0) {
      return {
        text: '[Empty response]',
        hasToolUse: false,
        contentTypes: []
      };
    }

    for (const [index, contentBlock] of response.content.entries()) {
      contentTypes.push(contentBlock.type);

      switch (contentBlock.type) {
        case 'text':
          textParts.push(contentBlock.text);
          break;
          
        case 'tool_use':
          hasToolUse = true;
          textParts.push(`[Function called: ${contentBlock.name}]`);
          break;
          
        default:
          console.warn(`Unknown content type at index ${index}:`, contentBlock);
          textParts.push(`[Unknown content: ${(contentBlock as any).type || 'undefined'}]`);
      }
    }

    return {
      text: textParts.join('\n'),
      hasToolUse,
      contentTypes
    };
  }
}

// Example of UNSAFE code (what NOT to do)
class UnsafeExample {
  async badExample() {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: 'Hello' }]
      });

      // UNSAFE: This could throw an error!
      // What if content[0] doesn't exist?
      // What if content[0] is not a text block?
      const text = response.content[0].text; // ❌ Dangerous!
      
      return text;
    } catch (error) {
      console.error('This might fail due to content type assumptions');
      throw error;
    }
  }
}

// Example of SAFE code patterns
async function safePatterns() {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: 'Hello!' }]
    });

    // Pattern 1: Check if content exists and has elements
    if (!response.content || response.content.length === 0) {
      throw new Error('No content in response');
    }

    // Pattern 2: Check the type before accessing properties
    const firstBlock = response.content[0];
    if (firstBlock.type === 'text') {
      console.log('Safe text access:', firstBlock.text);
    } else {
      console.log('First block is not text, it is:', firstBlock.type);
    }

    // Pattern 3: Extract all text blocks safely
    const allText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    console.log('All text content:', allText);

    // Pattern 4: Handle mixed content types
    const processedContent = response.content.map(block => {
      switch (block.type) {
        case 'text':
          return block.text;
        case 'tool_use':
          return `[Tool: ${block.name}]`;
        default:
          return '[Unknown content]';
      }
    }).join('\n');

    return processedContent;

  } catch (error) {
    console.error('Safe handling caught error:', error);
    throw error;
  }
}

// Utility function for common use case
function getResponseText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('\n') || '[No text content]';
}

// Usage example
async function demonstrateSafeUsage() {
  const manager = new SafeConversationManager();
  
  try {
    const response = await manager.addUserMessage("Hello, can you help me with TypeScript?");
    console.log('Response:', response);
  } catch (error) {
    console.error('Conversation failed:', error);
  }
}

// Type guard for checking text blocks
function isTextBlock(block: any): block is Anthropic.TextBlock {
  return block && typeof block === 'object' && block.type === 'text' && typeof block.text === 'string';
}

// Example with type guards
async function typeGuardExample() {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [{ role: 'user', content: 'Hello' }]
  });

  for (const block of response.content) {
    if (isTextBlock(block)) {
      console.log('Text content:', block.text);
    } else {
      console.log('Non-text content:', block.type);
    }
  }
}

export { SafeConversationManager, getResponseText, isTextBlock };