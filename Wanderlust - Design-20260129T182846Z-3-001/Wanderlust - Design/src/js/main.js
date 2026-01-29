class APIService {
  async getAllCountries() {
    try {
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,cca2,flags,idd,capital",
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching countries:", error);
      return null;
    }
  }

  async getCountryDetails(countryCode) {
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}`,
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching country details:", error);
      return null;
    }
  }

  // ====
  async getHolidays(countryCode, year = 2025) {
    try {
      const cleanCode = countryCode.slice(0, 2).toUpperCase();
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${cleanCode}`,
      );
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }
  async getEvents(countryCode) {
    const apiKey = "7el39BuaS8S953P1900p0K9o2S93qfK8";
    try {
      const cleanCode = countryCode.slice(0, 2).toUpperCase();
      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=${cleanCode}&apikey=${apiKey}`,
      );
      const data = await response.json();
      return data._embedded ? data._embedded.events : [];
    } catch (error) {
      console.error("Ticketmaster API Error:", error);
      return [];
    }
  }
  async getWeather(lat, lng) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,weathercode,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`,
      );
      return await response.json();
    } catch (error) {
      console.error("Weather API Error:", error);
      return null;
    }
  }

  async getLongWeekends(countryCode, year) {
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`,
      );
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Long Weekends API Error:", error);
      return [];
    }
  }
  async getExchangeRates(baseCurrency) {
    try {
      const response = await fetch(
        `https://open.er-api.com/v6/latest/${baseCurrency}`,
      );
      const data = await response.json();
      return data.rates;
    } catch (error) {
      console.error("Currency API Error:", error);
      return null;
    }
  }

  async getSunTimes(lat, lng) {
    try {
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`,
      );
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error("Sun Times API Error:", error);
      return null;
    }
  }
  //
}
