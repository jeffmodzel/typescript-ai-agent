import Anthropic from 'npm:@anthropic-ai/sdk';

import { WeatherGovApi } from './tools/WeatherGovApi.ts'
// https://www.latlong.net/place/rochester-ny-usa-4055.html

export const weatherTool: Anthropic.Messages.Tool = {
  name: 'get_weather_forecast',
  description: 'Get weather forecast for a specific location using latitude and longitude coordinates',
  input_schema: {
    type: 'object',
    properties: {
      latitude: {
        type: 'number',
        description:
          'Numeric value the specifies a north-south position on surface of the Earth. North values are positive numbers, South values are negative numbers.',
        minimum: -90,
        maximum: 90,
      },
      longitude: {
        type: 'number',
        description:
          'Numeric value the specifies a east-west position on surface of the Earth.  East values are positive numbers, West values are negative numbers.',
        minimum: -180,
        maximum: 180,
      },
    },
    required: ['latitude','longitude'],
  },
};

export const getWeatherForecast = async (params: { latitude: number; longitude: number }): Promise<string> => {
  false && console.log(`getWeatherForecast(params: ${JSON.stringify(params)})`);
 
  try {
    // TODO: Implement your actual weather API call here
    // Example structure:
    // const response = await fetch(`https://api.weather.com/forecast?zip=${zipcode}&days=${days}`);
    // const data = await response.json();
    // return formatWeatherData(data);
    const service = new WeatherGovApi();
    return await service.getForecast(params.latitude, params.longitude);
  } catch (error) {
    return `Error getting weather forecast: ${error}`;
  }
};
