import { StateConfig } from './sequential_state_machine.ts';
import { MachineContext, MachineStates } from './machine_configuration.ts';
import { getResponseText } from './anthropic_helpers.ts';
import { weatherTool, getWeatherForecast } from './tools.ts';

const debug = true;

export const AgentProcessStateConfig: StateConfig<MachineStates, MachineContext> = {
  onEnter: async (context) => {
    debug && console.log('%c\n[AgentProcess]', 'color: #0000FF;');
    //debug && console.log(`%ccontext.userInput=${context.userInput}`, 'color: #0000FF;');
    
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
        tools: [weatherTool],
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

      // Loop thrugh all content blocks and deal with any that aren't text
      // Text was handled above with getResponseText()

      for (const block of message.content) {
        if (block.type === 'tool_use') {
          //console.log('%c\nTool use detected:', 'color: #FF00FF;');
          //console.log(block);
          const toolName = block.name;
          const toolInput = block.input;
          const toolId = block.id;

          if (toolName === 'get_weather_forecast') {
            console.log('%c\nClaude: ', 'color: #00FFFF;', 'Please wait while I retrieve the weather forecast...');
            //console.log('%c\nWeather tool detected:', 'color: #FF00FF;');
            //console.log(toolInput);
            const input = toolInput as { latitude: number, longitude: number };
            const weatherForecast = await getWeatherForecast(input);
            //console.log('%c\nWeather forecast:', 'color: #FF00FF;');
            //console.log(weatherForecast);
            
            // make better prompt instructiuons
            context.userInput = `Please summarize this weather forecast: ${weatherForecast}`; // Update userInput with the weather forecast response
            return { transitionTo: 'AgentProcess', context };
          } else {
            console.log(`%c\nUnknown tool detected: ${toolName}`, 'color: #FFFF00;');
          }

        } else if (block.type === 'text') {
          continue; // Already handled by getResponseText()
        } else {
          console.log(`%c\nWarning: Unhandled block.type: ${block.type}`, 'color: #FFFF00;');
        }
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
  transitions: ['PromptUser', 'Complete', 'Error', 'DisplayCurrentState','AgentProcess'],
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
