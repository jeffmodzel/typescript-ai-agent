import { StateConfig } from './sequential_state_machine.ts';
import { MachineContext, MachineStates } from './machine_configuration.ts';

/**
 * State configurations for simple states
 */

const debug = true;

export const ErrorStateConfig: StateConfig<MachineStates, MachineContext> = {
  onEnter: async (context) => {
    console.log('%c\nAn error occurred in the app:', 'color: red;');
    if (context.error) {
      console.error(context.error);
    }
    return { context };
  },
  transitions: [],
};

export const CompleteStateConfig: StateConfig<MachineStates, MachineContext> = {
  onEnter: async (context) => {
    debug && console.log('[Complete]');
    return { context };
  },
  transitions: [],
};
