import { SequentialStateMachine } from './sequential_state_machine.ts';

if (import.meta.main) {
  console.log(import.meta.filename);
  //
  // State machine configuration
  //
  type MachineStates = 'Initialize' | 'PromptUser' | 'AgentProcess' | 'Error' | 'Complete';
  type MachineContext = Record<PropertyKey, never>; // explicitly always empty because traffic light has no context

  const machine = new SequentialStateMachine<MachineStates, MachineContext>('Initialize');
  const initialContext: MachineContext = {};

  machine.addState('Initialize', {
    onEnter: async (context) => {
      console.log('Initialize method');
      //await sleep(interval * 1000);

      // check for env var
      const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

      if (apiKey === undefined) {
        console.error('The ANTHROPIC_API_KEY environment variable is not set.');
        return { transitionTo: 'Error', context };
      }

      //new up anthropic client

      return { transitionTo: 'Complete', context };
    },
    transitions: ['Complete', 'Error'],
  });

  //
  // need to add the workhorse states
  //

  machine.addState('Error', {
    onEnter: async (context) => {
      console.log('An error occurred run the app, please check the console.');

      return { context };
    },
    transitions: [],
  });

  machine.addState('Complete', {
    onEnter: async (context) => {
      console.log('AI Agent complete');

      return { context };
    },
    transitions: [],
  });

  // do we need to check return
  await machine.start(initialContext);

}
