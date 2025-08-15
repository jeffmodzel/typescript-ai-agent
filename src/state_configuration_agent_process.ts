import { StateConfig } from './sequential_state_machine.ts';
import { MachineContext, MachineStates } from './machine_configuration.ts';
import { getResponseText } from './anthropic_helpers.ts';

const debug = true;

export const AgentProcessStateConfig: StateConfig<MachineStates, MachineContext> = {
  onEnter: async (context) => {
    debug && console.log('%c\n[AgentProcess]', 'color: #0000FF;');

    try {
      if (!context.client) {
        throw new Error('Anthropic client is not initialized.');
      }
      if (!context.userInput) {
        throw new Error('context.userInput is undefined, cannot continue conversation');
      }

      context.messages.push({
        role: 'user',
        content: context.userInput,
      });

      const message = await context.client.messages.create({
        max_tokens: 1024,
        messages: context.messages,
        model: context.claudeModel, //claude-sonnet-4-20250514
      });
      context.lastResponse = message;

      //console.log(message.content);

      if (!message.content || message.content.length === 0) {
        throw new Error('Anthrpic API message.content is not defined or empty.');
      }

      const responseText = getResponseText(message);
      context.messages.push({
        role: 'assistant',
        content: responseText,
      });
      console.log('%c\nClaude: ', 'color: #00FFFF;', `${responseText}`);

      if (message.content.length > 1) {
        console.log(
          `%c\nWarning: message.content.length is ${message.content.length}.Displaying below:`,
          'color: #FFFF00;',
        );
        console.log(message.content);
      }

      if (debug) {
        return { transitionTo: 'DisplayCurrentState', context };
      }

      return { transitionTo: 'PromptUser', context };
    } catch (error) {
      context.error = error;
      return { transitionTo: 'Error', context };
    }
  },
  transitions: ['PromptUser', 'Complete', 'Error', 'DisplayCurrentState'],
};

export const DisplayCurrentStateStateConfig: StateConfig<MachineStates, MachineContext> = {
  onEnter: async (context) => {
    debug && console.log('%c\n[DisplayCurrentState]', 'color: #0000FF;');
    
    try {
      console.log(`%c\ncontext.messages.length is ${context.messages.length}`, 'color: #0000FF;');
      if (context.lastResponse) {
        console.log('%cResponse Message analysis:', 'color: #0000FF;');
        console.log(`%c- id: ${context.lastResponse.id}`, 'color: #0000FF;');
        console.log(`%c- model: ${context.lastResponse.model}`, 'color: #0000FF;');
        console.log(`%c- usage: ${JSON.stringify(context.lastResponse.usage)}`, 'color: #0000FF;');
        console.log(`%c- stop_reason: ${JSON.stringify(context.lastResponse.stop_reason)}`, 'color: #0000FF;');
        console.log(`%c- Total content blocks: ${context.lastResponse.content.length}`, 'color: #0000FF;');

        // Count the different types of Blocks
        const typeCounts = context.lastResponse.content.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`%c- Content types: ${JSON.stringify(typeCounts)}`, 'color: #0000FF;');
      } else {
        console.log(
          '%ccontext.lastResponse (Anthropic.Message) is undefined. This should not happen.',
          'color: #0000FF;',
        );
      }
    } catch (error) {
      context.error = error;
      return { transitionTo: 'Error', context };
    }

    return { transitionTo: 'PromptUser', context };
  },
  transitions: ['PromptUser', 'Error'],
};
