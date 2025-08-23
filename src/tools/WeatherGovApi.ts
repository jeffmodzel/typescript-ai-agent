export class WeatherGovApi {
  constructor(private debug: boolean = false) {
  }

  public async getForecast(latitude: number, longitude: number) {
    this.debug && console.log(`getForecast(latitude: ${latitude}, longitude: ${longitude})`);
    let forecast = `No forecast was available for latitude ${latitude} and longitude ${longitude}.`;

    try {
      const response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);
      const data = await response.json();

      if (data && data.properties && 'forecast' in data.properties) {
        const response = await fetch(data.properties.forecast);
        const forecastObj = await response.json();
        //console.log(forecastObj);
        if (
          forecastObj && forecastObj.properties && forecastObj.properties.periods &&
          Array.isArray(forecastObj.properties.periods) && forecastObj.properties.periods.length > 0
        ) {
          forecast = '';
          for (const period of forecastObj.properties.periods) {
            //console.log(period);
            forecast += `Period ${period.number}, ${period.name}, periodStart: ${period.startTime}, periodEnd: ${period.endTime}`;
            forecast += `, Forecast: ${period.detailedForecast}`;
            
          }
        }
      }
    } catch (error) {
      console.error(error);
      forecast = `An error occurred while fetching the forecast for latitude ${latitude} and longitude ${longitude}.`;
    }

    return forecast;
  }
}
