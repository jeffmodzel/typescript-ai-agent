import Anthropic from '@anthropic-ai/sdk';
import { SequentialStateMachine } from './sequential_state_machine.ts';
import { getInput, isString } from './console_helpers.ts';
import { MachineStates, MachineContext } from './machine_configuration.ts';
import { AgentProcessStateConfig, DisplayCurrentStateStateConfig } from './state_configuration_agent_process.ts';
import { CompleteStateConfig, ErrorStateConfig } from './state_configurations.ts';
import { CLAUDE_3_5_HAIKU_LATEST } from './anthropic_helpers.ts';

if (import.meta.main) {
  console.log(import.meta.filename);
  const debug = true;
  const machine = new SequentialStateMachine<MachineStates, MachineContext>('Initialize');
  const initialContext: MachineContext = { userInput: '', messages: [], claudeModel: CLAUDE_3_5_HAIKU_LATEST };

  machine.addState('Initialize', {
    onEnter: async (context) => {
      debug && console.log('%c\n[Initialize]','color: #0000FF;');

      try {
        const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

        if (apiKey === undefined) {
          throw new Error('The ANTHROPIC_API_KEY environment variable is not set.');
        }

        // anthropic client
        context.client = new Anthropic({ apiKey });
        console.log(`\nUsing Anthropic model: ${context.claudeModel}`);
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
      debug && console.log('%c\n[PromptUser]','color: #0000FF;');
      debug && console.log('%cType "q" to quit','color: #0000FF;');

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
  machine.addState('DisplayCurrentState', DisplayCurrentStateStateConfig);
  machine.addState('Error', ErrorStateConfig);
  machine.addState('Complete', CompleteStateConfig);

  // do we need to check return
  await machine.start(initialContext);
}
