import { WeatherGovApi } from '../tools/WeatherGovApi.ts';

if (import.meta.main) {
  console.log(import.meta.filename);

  console.log('do some weather stuff');

  const latitude = 43.1566
  const longitude = -77.61

  //https://api.weather.gov/points/39.7456,-97.0892

  //https://api.weather.gov/gridpoints/TOP/32,81/forecast

  const service = new WeatherGovApi();
  const data = await service.getForecast(latitude, longitude);
  console.log(data);
}
