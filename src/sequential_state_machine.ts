/**
 * The object that is returned when a state has completed executing the onEnter() function.
 */
export type StateTransition<TState, TContext> = {
  transitionTo?: TState; // The next state the state machine should transition to (if any, null means the state machine should stop execution).
  context: TContext; // The context that should be passed to the next state.
};

/**
 * Represents the definition of a single state in the state machine.
 */
export interface StateConfig<TState extends string, TContext> {
  onEnter: (context: TContext) => Promise<StateTransition<TState, TContext>>; // The main function for the state, executes when state transitions to state TState.
  transitions: TState[]; // The states that TState is allowed to transition to.
}

export class SequentialStateMachine<TState extends string, TContext> {
  private currentState: TState;
  private states: Map<TState, StateConfig<TState, TContext>> = new Map();

  constructor(initialState: TState, private debug: boolean = false) {
    this.printDebug('constructor', `initialState=${initialState}, debug=${debug}`);
    this.currentState = initialState;
  }

  private printDebug(functionName: string, message: string) {
    this.debug && console.log(`[StateMachine]:[${functionName}] ${message}`);
  }

  addState(state: TState, config: StateConfig<TState, TContext>): void {
    this.printDebug('addState', `state=${state}`);
    if (this.states.has(state)) {
      throw new Error(`State '${state}' already exists`);
    }
    this.states.set(state, config);
  }

  /**
   * This is the starting point for the state machine execution.
   *
   * @param context The initial state machine context.
   * @returns The last context when the machine completes.
   */
  async start(context: TContext): Promise<TContext> {
    this.printDebug('start', `context=${context ? 'EXISTS' : 'null'}`);
    const currentStateConfig = this.states.get(this.currentState);
    if (currentStateConfig) {
      return await this.transition(this.currentState, context, true);
    } else {
      throw new Error(`Initial state '${this.currentState}' is not defined.`);
    }
  }

  /**
   * The transition function for the state machine - how the machine moves from one state to another.
   * This method is recursive and is initially called from the start() method. Only the start() method
   * should call this method with initialization=true.
   *
   * @param nextState The next state to transition to.
   * @param context The current state machine context.
   * @param initialization A flag to indicate if this is the first transition.
   * @returns The context returned from the last state.
   */
  private async transition(nextState: TState, context: TContext, initialization: boolean = false): Promise<TContext> {
    this.printDebug(
      'transition',
      `newState=${nextState}, context=${
        context ? 'EXISTS' : 'null'
      }, initialization=${initialization}, currentState=${this.currentState}`,
    );

    if (initialization === false) {
      const currentStateConfig = this.states.get(this.currentState);
      if (!currentStateConfig) {
        throw new Error(`Current state '${this.currentState}' is not defined.`);
      }

      if (!currentStateConfig.transitions.includes(nextState) && initialization === false) {
        throw new Error(`Transition from '${this.currentState}' to '${nextState}' is not allowed`);
      }
    }

    const nextStateConfig = this.states.get(nextState);
    if (!nextStateConfig) {
      throw new Error(`Next state '${nextState}' is not defined.`);
    }

    this.currentState = nextState;
    const stateTransition = await nextStateConfig.onEnter(context);
    if (stateTransition.transitionTo) {
      nextState = stateTransition.transitionTo;
      context = stateTransition.context;
      return await this.transition(nextState, { ...stateTransition.context });
    }
    return stateTransition.context;
  }
}
