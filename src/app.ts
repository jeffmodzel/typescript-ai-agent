import { SequentialStateMachine } from './sequential_state_machine.ts';
import { getInput, isString } from './console_helpers.ts';

if (import.meta.main) {
  console.log(import.meta.filename);
  const debug = false;
  //
  // State machine configuration
  //
  type MachineStates = 'Initialize' | 'PromptUser' | 'AgentProcess' | 'Error' | 'Complete';
  type MachineContext = {
    error?: unknown;
    userInput: string;
  };

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

        //new up anthropic client
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

          if (isString(input) && input.trim().length > 0) {
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
    transitions: ['AgentProcess', 'Error','Complete'],
  });

  machine.addState('AgentProcess', {
    onEnter: async (context) => {
      debug && console.log('[AgentProcess]');

      console.log(`%cAgent - Send this text to Anthropic: ${context.userInput}`, 'color: #00FFFF;');
      // wait for response, dump to screen, transition back to PromptUser

      return { transitionTo: 'Complete', context };
    },
    transitions: ['Complete'],
  });

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
