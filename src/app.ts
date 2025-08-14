import Anthropic from '@anthropic-ai/sdk';
import { SequentialStateMachine } from './sequential_state_machine.ts';
import { getInput, isString } from './console_helpers.ts';
import { MachineStates, MachineContext } from './machine_configuration.ts';
import { AgentProcessStateConfig } from './state_configurations.ts';

if (import.meta.main) {
  console.log(import.meta.filename);
  const debug = false;
  //
  // State machine configuration
  //
  // type MachineStates = 'Initialize' | 'PromptUser' | 'AgentProcess' | 'Error' | 'Complete';
  // type MachineContext = {
  //   error?: unknown;
  //   userInput: string;
  //   client?: Anthropic;
  // };

  const machine = new SequentialStateMachine<MachineStates, MachineContext>('Initialize');
  const initialContext: MachineContext = { userInput: '' };

  machine.addState('Initialize', {
    onEnter: async (context) => {
      debug && console.log('[Initialize]');

      try {
        const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

        if (apiKey === undefined) {
          throw new Error('The ANTHROPIC_API_KEY environment variable is not set.');
        }

        // anthropic client
        context.client = new Anthropic({ apiKey });
      } catch (error) {
        context.error = error;
        return { transitionTo: 'Error', context };
      }

      return { transitionTo: 'PromptUser', context };
    },
    transitions: ['Error', 'PromptUser'],
  });

  machine.addState('PromptUser', {
    onEnter: async (context) => {
      debug && console.log('[PromptUser]');

      let counter = 0;
      try {
        while (true) {
          // convoluted hack to get colored output and input all on one line in CLI (could just use prompt() but it's not as nice looking)
          const BRIGHT_GREEN = '\x1b[92m';
          const RESET = '\x1b[0m';
          const message = new TextEncoder().encode(`\n${BRIGHT_GREEN}You: ${RESET}`);
          await Deno.stdout.write(message);
          const input = await getInput();
          // end hack

          if (isString(input) && input.trim().length > 0) {
            if (['q','quit','exit'].includes(input.trim().toLowerCase())) {
              console.log('\nExiting...');
              return { transitionTo: 'Complete', context };
            }
            context.userInput = input;
            return { transitionTo: 'AgentProcess', context };
          }
          counter++;
          if (counter > 2) {
            console.log('\nExiting...');
            return { transitionTo: 'Complete', context };
          }
        }
      } catch (error) {
        context.error = error;
        return { transitionTo: 'Error', context };
      }
    },
    transitions: ['AgentProcess', 'Error', 'Complete'],
  });

  machine.addState('AgentProcess', AgentProcessStateConfig);

  machine.addState('Error', {
    onEnter: async (context) => {
      console.log('%cAn error occurred in the app', 'color: red;');
      if (context.error) {
        console.error(context.error);
      }
      return { context };
    },
    transitions: [],
  });

  machine.addState('Complete', {
    onEnter: async (context) => {
      debug && console.log('[Complete]');
      return { context };
    },
    transitions: [],
  });

  // do we need to check return
  await machine.start(initialContext);
}
