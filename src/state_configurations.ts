import { StateConfig } from './sequential_state_machine.ts';
import { MachineContext, MachineStates } from './machine_configuration.ts';

const debug = false;

export const AgentProcessStateConfig: StateConfig<MachineStates, MachineContext> = {
  onEnter: async (context) => {
    debug && console.log('[AgentProcess]');

    try {
      if (!context.client) {
        throw new Error('Anthropic client is not initialized.');
      }
      const message = await context.client.messages.create({
        max_tokens: 1024,
        messages: [{ role: 'user', content: context?.userInput }],
        model: 'claude-sonnet-4-20250514',
      });

      //console.log(message.content);

      if (!message.content || message.content.length === 0) {
        throw new Error('Anthrpic API message.content is not defined or empty.');
      }

      if (message.content[0].type === 'text') {
        console.log('%c\nClaude: ', 'color: #00FFFF;', `${message.content[0].text}`);
        // what do we do if content[] has multiple values?
      } else {
        console.log(`%c\nWarning: message.content[0] was not 'text', don't know what to do:`, 'color: #FFFF00;');
        console.log(message.content);
      }

      if (message.content.length > 1) {
        console.log(
          `%c\nWarning: message.content.length is ${message.content.length}.Displaying below:`,
          'color: #FFFF00;',
        );
        console.log(message.content);
      }

      /// I think we need to save everything back to one long running convo and store it in context

      return { transitionTo: 'PromptUser', context };
    } catch (error) {
      context.error = error;
      return { transitionTo: 'Error', context };
    }
  },
  transitions: ['PromptUser', 'Complete'],
};
