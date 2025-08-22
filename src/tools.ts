import Anthropic from 'npm:@anthropic-ai/sdk';

export const weatherTool: Anthropic.Messages.Tool = {
  name: 'get_weather_forecast',
  description: 'Get weather forecast for a specific location using ZIP code',
  input_schema: {
    type: 'object',
    properties: {
      zipcode: {
        type: 'string',
        description: "5-digit US ZIP code for the location (e.g., '10001')",
        pattern: '^\\d{5}$',
      },
      days: {
        type: 'number',
        description: 'Number of forecast days to return (1-7, default: 3)',
        minimum: 1,
        maximum: 7,
        default: 3,
      },
    },
    required: ['zipcode'],
  },
};

export const getWeatherForecast = async (params: { zipcode: string; days?: number }): Promise<string> => {
  const { zipcode, days = 3 } = params;

  try {
    // TODO: Implement your actual weather API call here
    // Example structure:
    // const response = await fetch(`https://api.weather.com/forecast?zip=${zipcode}&days=${days}`);
    // const data = await response.json();
    // return formatWeatherData(data);

    // Placeholder implementation - replace with your actual logic
//     return `Weather forecast for ZIP ${zipcode} (${days} days):
//   Day 1: Sunny, 75°F high, 55°F low
//   Day 2: Partly cloudy, 72°F high, 58°F low  
//   Day 3: Rain likely, 68°F high, 52°F low`;

    return `Weather forecast for ZIP ${zipcode} is sunny at 70 degress with a low of 50 degrees. Expect clear skies for the next 3 days.`;
  } catch (error) {
    return `Error getting weather forecast: ${error}`;
  }
};
