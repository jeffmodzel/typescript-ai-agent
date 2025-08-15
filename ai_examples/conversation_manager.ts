import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// Define types for better TypeScript support
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

class ConversationManager {
  private messages: ConversationMessage[] = [];

  async addUserMessage(content: string): Promise<string> {
    // Add user message to conversation history
    this.messages.push({
      role: 'user',
      content: content
    });

    try {
      // Send entire conversation history to maintain context
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: this.messages // Send ALL previous messages
      });

      // Extract Claude's response
      const assistantResponse = response.content[0].text;
      
      // Add Claude's response to conversation history
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

  // Get the full conversation history
  getConversation(): ConversationMessage[] {
    return [...this.messages]; // Return copy to prevent external modification
  }

  // Clear conversation history
  clearConversation(): void {
    this.messages = [];
  }

  // Get conversation length for token management
  getMessageCount(): number {
    return this.messages.length;
  }
}

// Example usage
async function demonstrateConversation() {
  const conversation = new ConversationManager();

  try {
    // Turn 1
    console.log('User: Hello, I\'m learning TypeScript');
    let response = await conversation.addUserMessage("Hello, I'm learning TypeScript");
    console.log('Claude:', response);
    
    // Turn 2 - Claude remembers the context
    console.log('\nUser: What are some good practices for type definitions?');
    response = await conversation.addUserMessage("What are some good practices for type definitions?");
    console.log('Claude:', response);
    
    // Turn 3 - Building on previous context
    console.log('\nUser: Can you show me an example of the first practice you mentioned?');
    response = await conversation.addUserMessage("Can you show me an example of the first practice you mentioned?");
    console.log('Claude:', response);

    // Show full conversation
    console.log('\n--- Full Conversation History ---');
    conversation.getConversation().forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.role}: ${msg.content.substring(0, 100)}...`);
    });

  } catch (error) {
    console.error('Conversation failed:', error);
  }
}

// Advanced: Managing long conversations
class AdvancedConversationManager extends ConversationManager {
  private maxMessages: number;

  constructor(maxMessages: number = 20) {
    super();
    this.maxMessages = maxMessages;
  }

  async addUserMessage(content: string): Promise<string> {
    // Trim conversation if it gets too long
    if (this.getMessageCount() >= this.maxMessages) {
      this.trimConversation();
    }

    return super.addUserMessage(content);
  }

  private trimConversation(): void {
    // Keep system message (if any) and recent messages
    // Remove older messages but keep conversation flowing naturally
    const messagesToKeep = this.maxMessages - 2; // Leave room for new user + assistant message
    
    if (this.messages.length > messagesToKeep) {
      // Keep the most recent messages
      this.messages = this.messages.slice(-messagesToKeep);
    }
  }

  // Add a system message to set context/instructions
  setSystemContext(systemPrompt: string): void {
    // System messages help set behavior but aren't always necessary
    // Note: Anthropic doesn't use "system" role like OpenAI, but you can 
    // include instructions in the first user message
    this.messages.unshift({
      role: 'user',
      content: `Instructions: ${systemPrompt}\n\nNow, let's begin our conversation.`
    });
  }
}

// Run the demonstration
demonstrateConversation();