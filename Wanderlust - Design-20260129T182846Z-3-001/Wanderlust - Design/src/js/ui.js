class DashboardUI {
  constructor() {
    this.countrySelect = document.getElementById("global-country");
    this.citySelect = document.getElementById("global-city");
    this.searchBtn = document.getElementById("global-search-btn");
    this.loadingOverlay = document.getElementById("loading-overlay");

    // day na mic search
    this.selectedCountryName = document.getElementById("selected-country-name");
    this.selectedCountryFlag = document.getElementById("selected-country-flag");
    this.selectedCityName = document.getElementById("selected-city-name");

    this.mainFlag = document.querySelector(".dashboard-country-flag");
    this.titleName = document.querySelector(".dashboard-country-title h3");
    this.officialName = document.querySelector(".official-name");
    this.regionDisplay = document.querySelector(".region");
    this.detailsValues = document.querySelectorAll(
      ".dashboard-country-detail .value",
    );
    this.extraTags = document.querySelectorAll(".extra-tags");

    this.countryPlaceholder = document.getElementById("country-placeholder");
    this.countryDetailsContainer = document.getElementById(
      "country-details-container",
    );
  }

  updateCountryTimeAndOffset(country) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const timezoneStr = country.timezones[0];
    const extractOffset = (str) => {
      const match = str.match(/([+-]\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    const countryOffset = extractOffset(timezoneStr);
    const egyptOffset = 2;
    const diff = countryOffset - egyptOffset;
    let diffDisplay =
      diff === 0 ? "Same as Egypt" : diff > 0 ? `+${diff}` : `${diff}`;

    const zoneElement = document.querySelector(".local-time-zone");
    if (zoneElement) {
      zoneElement.textContent = `${timezoneStr} (${diffDisplay})`;
    }

    const updateTick = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const countryTime = new Date(utc + 3600000 * countryOffset);

      const timeValueElement = document.getElementById("country-local-time");

      if (timeValueElement) {
        timeValueElement.textContent = countryTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      } else {
        //law feh mo4ke la ntp3
        console.log("Waiting for #country-local-time to appear...");
      }
    };

    updateTick();
    this.timerInterval = setInterval(updateTick, 1000);
  }

  populateCountryList(countries) {
    if (!countries) return;
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    this.countrySelect.innerHTML = '<option value="">Select Country</option>';
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.cca2;
      option.textContent = country.name.common;
      this.countrySelect.appendChild(option);
    });
  }

  updateCityInSelect(capital) {
    if (!this.citySelect) return;
    this.citySelect.innerHTML = "";
    const option = document.createElement("option");
    option.value = capital || "";
    option.textContent = capital || "No Capital";
    option.selected = true;
    this.citySelect.appendChild(option);
  }

  updateUI(data) {
    const country = data[0];
    const capital = country.capital?.[0] || "N/A";
    const countrySections = document.getElementById("dashboard-country-info");
    if (countrySections) {
      if (this.countryPlaceholder)
        this.countryPlaceholder.style.display = "none";
      if (this.countryDetailsContainer)
        this.countryDetailsContainer.style.display = "block";
      //
      countrySections.classList.remove("hidden");
      this.selectedCountryName.textContent = country.name.common;
      this.selectedCountryFlag.src = country.flags.png;
      this.selectedCityName.textContent = ` • ${capital}`;
      this.localTimeZoneText = document.querySelector(".local-time-zone");
      this.mainFlag.src = country.flags.png;
      this.titleName.textContent = country.name.common;
      this.officialName.textContent = country.name.official;
      this.regionDisplay.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${country.region} • ${country.subregion}`;
      this.detailsValues[0].textContent = capital;
      this.detailsValues[1].textContent = country.population.toLocaleString();
      this.detailsValues[2].textContent =
        country.area.toLocaleString() + " km²";
      this.detailsValues[3].textContent =
        country.continents?.[0] || country.region;
      this.detailsValues[4].textContent =
        (country.idd.root || "") + (country.idd.suffixes?.[0] || "");
      this.detailsValues[5].textContent = country.car?.side || "Right";
      this.detailsValues[6].textContent = country.startOfWeek || "Monday";

      const currencyKey = Object.keys(country.currencies || {})[0];
      const currency = country.currencies?.[currencyKey];
      const languages = Object.values(country.languages || {}).join(", ");

      this.extraTags[0].innerHTML = `<span class="extra-tag">${currency ? `${currency.name} (${currency.symbol || currencyKey})` : "N/A"}</span>`;
      this.extraTags[1].innerHTML = `<span class="extra-tag">${languages || "N/A"}</span>`;

      this.extraTags[2].innerHTML = "";
      if (country.borders) {
        country.borders.forEach((border) => {
          const span = document.createElement("span");
          span.className = "extra-tag border-tag clickable-neighbor";
          span.style.cursor = "pointer";
          span.textContent = border;
          span.dataset.code = border;
          this.extraTags[2].appendChild(span);
        });
      }

      this.updateCityInSelect(capital);
      this.updateCountryTimeAndOffset(country);
    }
  }

  // hol idy
  RenderHolidays(holidays, countryName, year, countryCode) {
    // ben7dd el mk an el hn3rd feh el data w ns fro
    const container = document.getElementById("holidays-content");
    if (!container) return;
    container.innerHTML = "";

    // bn3rd  res alt law  mfe sh el holidays
    if (!holidays || holidays.length === 0) {
      container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-calendar"></i></div>
                <h3>No holidays found</h3>
                <p>We couldn't find public holidays for ${countryName} in ${year}.</p>
            </div>`;
      return;
    }

    // loop  3la kol  (aga za)  (hn3 rd ha)
    holidays.forEach((h) => {
      const dateObj = new Date(h.date);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString("en-US", { month: "short" });
      const dayName = dateObj.toLocaleString("en-US", { weekday: "long" });

      //(bn bny) el structure el html(da yna mice)
      const holidayCard = `
<div class="holiday-card">
    <div class="holiday-card-header">
        <div class="holiday-date-box">
            <span class="day">${day}</span>
            <span class="month">${month}</span>
        </div>
        <button class="holiday-action-btn" 
            onclick="app.toggleFavorite({
                id: '${h.date}-${h.name.replace(/'/g, "\\'")}', 
                name: '${h.name.replace(/'/g, "\\'")}', 
                day: '${day}', 
                month: '${month}', 
                type: 'holiday'
            })">
            <i class="fa-regular fa-heart"></i>
        </button>
    </div>
    <h3>${h.name}</h3>
    <p class="holiday-name">${h.localName}</p>
    <div class="holiday-card-footer">
        <span class="holiday-day-badge"><i class="fa-regular fa-calendar"></i> ${dayName}</span>
        <span class="holiday-type-badge">${h.types[0]}</span>
    </div>
</div>`;

      //add el card
      container.insertAdjacentHTML("beforeend", holidayCard);
    });
  }

  renderEvents(events) {
    const container = document.getElementById("events-content");
    if (!container) return;
    // delete(Cairo Static Data)
    container.innerHTML = "";
    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-calendar"></i></div>
          <h3>No events found for this country</h3>
        </div>`;
      return;
    }

    events.forEach((event) => {
      const date = new Date(event.dates.start.localDate);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const venue = event._embedded?.venues?.[0]?.name || "TBA";
      const category = event.classifications?.[0]?.segment?.name || "Event";
      const image =
        event.images.find((img) => img.width > 400)?.url || event.images[0].url;

      const eventCard = `
        <div class="event-card">
          <div class="event-card-image">
            <img src="${image}" alt="${event.name}">
            <span class="event-card-category">${category}</span>
            <button class="event-card-save"><i class="fa-regular fa-heart"></i></button>
          </div>
          <div class="event-card-body">
            <h3>${event.name}</h3>
            <div class="event-card-info">
              <div><i class="fa-regular fa-calendar"></i> ${formattedDate}</div>
              <div><i class="fa-solid fa-location-dot"></i> ${venue}</div>
            </div>
            <div class="event-card-footer">
              <button class="btn-event" onclick="saveEvent('${event.id}')">
                <i class="fa-regular fa-heart"></i> Save
              </button>
              <a href="${event.url}" target="_blank" class="btn-buy-ticket">
                <i class="fa-solid fa-ticket"></i> Buy Tickets
              </a>
            </div>
          </div>
        </div>`;
      container.insertAdjacentHTML("beforeend", eventCard);
    });
  }

  renderWeather(weatherData, cityName) {
    const container = document.getElementById("weather-content");
    if (!container || !weatherData) return;

    const current = weatherData.current_weather;
    const daily = weatherData.daily;
    const hourly = weatherData.hourly;

    const humidity = hourly.relativehumidity_2m
      ? hourly.relativehumidity_2m[0]
      : "--";
    const uvIndex = daily.uv_index_max ? daily.uv_index_max[0] : "--";
    const precisProb = daily.precipitation_probability_max
      ? daily.precipitation_probability_max[0]
      : "0";

    const weatherClass = this.getWeatherClass(current.weathercode);

    container.innerHTML = `
        <div class="weather-hero-card ${weatherClass}">
            <div class="weather-hero-bg"></div>
            <div class="weather-hero-content">
                <div class="weather-location">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${cityName}</span>
                    <span class="weather-time">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
                </div>
                <div class="weather-hero-main">
                    <div class="weather-hero-left">
                        <div class="weather-hero-icon">${this.getWeatherIcon(current.weathercode)}</div>
                        <div class="weather-hero-temp">
                            <span class="temp-value">${Math.round(current.temperature)}</span>
                            <span class="temp-unit">°C</span>
                        </div>
                    </div>
                    <div class="weather-hero-right">
                        <div class="weather-condition">${this.getWeatherDesc(current.weathercode)}</div>
                        <div class="weather-feels">Feels like ${Math.round(current.temperature - 1)}°C</div>
                        <div class="weather-high-low">
                            <span class="high"><i class="fa-solid fa-arrow-up"></i> ${Math.round(daily.temperature_2m_max[0])}°</span>
                            <span class="low"><i class="fa-solid fa-arrow-down"></i> ${Math.round(daily.temperature_2m_min[0])}°</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="weather-details-grid">
            <div class="weather-detail-card">
                <div class="detail-icon humidity"><i class="fa-solid fa-droplet"></i></div>
                <div class="detail-info">
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">${humidity}%</span>
                </div>
                <div class="detail-bar"><div class="detail-bar-fill" style="width: ${humidity}%"></div></div>
            </div>
            <div class="weather-detail-card">
                <div class="detail-icon wind"><i class="fa-solid fa-wind"></i></div>
                <div class="detail-info">
                    <span class="detail-label">Wind</span>
                    <span class="detail-value">${current.winded} <small>km/h</small></span>
                </div>
            </div>
            <div class="weather-detail-card">
                <div class="detail-icon uv"><i class="fa-solid fa-sun"></i></div>
                <div class="detail-info">
                    <span class="detail-label">UV Index</span>
                    <span class="detail-value">${uvIndex}</span>
                </div>
                <span class="uv-level ${uvIndex < 3 ? "low" : "moderate"}">${uvIndex < 3 ? "Low" : "Moderate"}</span>
            </div>
            <div class="weather-detail-card">
                <div class="detail-icon precis"><i class="fa-solid fa-cloud-rain"></i></div>
                <div class="detail-info">
                    <span class="detail-label">Precipitation</span>
                    <span class="detail-value">${precisProb}%</span>
                </div>
            </div>
      <div class="weather-detail-card sunrise-sunset">
    <div class="sun-times-visual">
        <div class="sun-time sunrise">
            <i class="fa-solid fa-sun"></i>
            <span class="sun-label">Sunrise</span>
            <span class="sun-value">${daily.sunrise[0].split("T")[1].substring(0, 5)}</span>
        </div>
        
        <div class="sun-arc">
            <div class="sun-arc-path"></div>
            <div class="sun-position" style="--sun-progress: ${this.calculateSunProgress(daily.sunrise[0], daily.sunset[0])}"></div>
        </div>

        <div class="sun-time sunset">
            <i class="fa-solid fa-moon"></i>
            <span class="sun-label">Sunset</span>
            <span class="sun-value">${daily.sunset[0].split("T")[1].substring(0, 5)}</span>
        </div>
    </div>
</div>
        </div>

        <div class="weather-section">
            <h3 class="weather-section-title"><i class="fa-solid fa-clock"></i> Hourly Forecast</h3>
            <div class="hourly-scroll">
                ${this.generateHourlyItems(hourly)}
            </div>
        </div>
        <div class="weather-section" style="margin-top: 24px;">
            <h3 class="weather-section-title"><i class="fa-solid fa-calendar-days"></i> 7-Day Forecast</h3>
            <div class="forecast-list">
                ${this.generateDailyItems(daily)}
            </div>
        </div>
    `;
  }
  getWeatherClass(code) {
    if (code === 0) return "weather-sunny";
    if (code >= 1 && code <= 3) return "weather-cloudy";
    if (code >= 51 && code <= 67) return "weather-rainy";
    return "weather-default";
  }

  getWeatherIcon(code) {
    if (code === 0) return '<i class="fa-solid fa-sun"></i>';
    if (code >= 1 && code <= 3) return '<i class="fa-solid fa-cloud-sun"></i>';
    return '<i class="fa-solid fa-cloud"></i>';
  }

  getWeatherDesc(code) {
    return code === 0 ? "Clear Sky" : code <= 3 ? "Partly Cloudy" : "Cloudy";
  }

  generateHourlyItems(hourly) {
    let html = "";
    for (let i = 0; i < 24; i++) {
      const timeDate = new Date(hourly.time[i]);
      const hour = timeDate.getHours();
      const displayTime =
        hour === 0 ? "12 AM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      html += `
      <div class="hourly-item ${i === 0 ? "now" : ""}">
        <span class="hourly-time">${i === 0 ? "Now" : displayTime}</span>
        <div class="hourly-icon" style="font-size:20px">${this.getWeatherIcon(hourly.weathercode[i])}</div>
        <span class="hourly-temp">${Math.round(hourly.temperature_2m[i])}°</span>
      </div>`;
    }
    return html;
  }
  generateDailyItems(daily) {
    if (!daily || !daily.time) return "";

    let html = "";
    for (let i = 0; i < 7; i++) {
      const date = new Date(daily.time[i]);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayNumber = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
      const isToday = i === 0 ? "today" : "";

      const maxTemp = daily.temperature_2m_max
        ? Math.round(daily.temperature_2m_max[i])
        : "--";
      const minTemp = daily.temperature_2m_min
        ? Math.round(daily.temperature_2m_min[i])
        : "--";
      const rainChance = daily.precipitation_probability_max
        ? daily.precipitation_probability_max[i]
        : 0;
      const iconCode = daily.weathercode ? daily.weathercode[i] : 0;

      html += `
      <div class="forecast-day ${isToday}">
          <div class="forecast-day-name">
              <span class="day-label">${i === 0 ? "Today" : dayName}</span>
              <span class="day-date">${dayNumber}</span>
          </div>
          <div class="forecast-icon">
              ${this.getWeatherIcon(iconCode)}
          </div>
          <div class="forecast-temps">
              <span class="temp-max">${maxTemp}°</span>
              <span class="temp-min">${minTemp}°</span>
          </div>
          <div class="forecast-rain">
              <i class="fa-solid fa-droplet"></i> ${rainChance}%
          </div>
      </div>`;
    }
    return html;
  }
  calculateSunProgress(sunriseStr, sunsetStr) {
    const now = new Date();
    const sunrise = new Date(sunriseStr);
    const sunset = new Date(sunsetStr);

    if (now < sunrise) return 0;
    if (now > sunset) return 100;

    const totalDaylight = sunset - sunrise;
    const elapsedDaylight = now - sunrise;
    return Math.round((elapsedDaylight / totalDaylight) * 100);
  }

  RenderLongWeekends(weekends, countryName, countryCode, year) {
    const container = document.getElementById("lw-content");
    if (!container) return;

    container.innerHTML = weekends
      .map((weekend, index) => {
        const start = new Date(weekend.startDate);
        const end = new Date(weekend.endDate);
        const dateRange = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

        const infoClass = weekend.needBridgeDay ? "warning" : "success";
        const infoIcon = weekend.needBridgeDay
          ? "fa-info-circle"
          : "fa-check-circle";
        const infoText = weekend.needBridgeDay
          ? "Bridge day needed"
          : "No extra days off!";

        return `
        <div class="lw-card">
            <div class="lw-card-header">
                <span class="lw-badge">
                    <i class="fa-solid fa-calendar-days"></i> ${weekend.dayCount} Days
                </span>
                <button class="holiday-action-btn"><i class="fa-regular fa-heart"></i></button>
            </div>
            <h3>Long Weekend #${index + 1}</h3>
            <div class="lw-dates"><i class="fa-regular fa-calendar"></i> ${dateRange}</div>
            <div class="lw-info-box ${infoClass}">
                <i class="fa-solid ${infoIcon}"></i> ${infoText}
            </div>
            <div class="lw-days-visual">
                ${this.generateVisualDays(weekend.startDate, weekend.dayCount)}
            </div>
        </div>`;
      })
      .join("");
  }

  generateVisualDays(startDate, count) {
    let html = "";
    const start = new Date(startDate);

    for (let i = 0; i < count; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);

      const dayName = current.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = current.getDate();
      const isWeekend =
        current.getDay() === 0 ||
        current.getDay() === 6 ||
        current.getDay() === 5;

      html += `
        <div class="lw-day ${isWeekend ? "weekend" : ""}">
            <span class="name">${dayName}</span>
            <span class="num">${dayNum}</span>
        </div>`;
    }
    return html;
  }
  renderCurrency(rates, countryCurrency) {
    const container = document.getElementById("popular-currencies");
    if (!container || !rates) return;

    const majorCurrencies = [
      { code: "USD", name: "US Dollar", flag: "us" },
      { code: "EUR", name: "Euro", flag: "eu" },
      { code: "GBP", name: "British Pound", flag: "gb" },
    ];

    container.innerHTML = "";

    const cardsHtml = majorCurrencies
      .map((currency) => {
        if (currency.code === countryCurrency) return "";

        const rawRate = rates[currency.code];
        let displayRate = "--";

        if (rawRate && rawRate !== 0) {
          displayRate = (1 / rawRate).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          });
        }

        return `
        <div class="popular-currency-card">
            <img src="https://flagcdn.com/w40/${currency.flag}.png" alt="${currency.code}" class="flag">
            <div class="info">
                <div class="code">1 ${currency.code}</div>
                <div class="name">${currency.name}</div>
            </div>
            <div class="rate-container" style="text-align: right;">
                <div class="rate" style="font-weight: bold; color: var(--primary-600);">${displayRate}</div>
                <small class="currency-label" style="font-size: 0.75rem; color: #666;">${countryCurrency}</small>
            </div>
        </div>`;
      })
      .join("");

    container.innerHTML = cardsHtml;
  }
  renderSunTimes(data, cityName) {
    const container = document.getElementById("sun-times-content");
    if (!container || !data) return;

    const formatTime = (isoString) => {
      return new Date(isoString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const dayLengthSeconds = data.day_length;
    const dayPercentage = ((dayLengthSeconds / 86400) * 100).toFixed(1);

    const hours = Math.floor(dayLengthSeconds / 3600);
    const minutes = Math.floor((dayLengthSeconds % 3600) / 60);

    container.innerHTML = `
        <div class="sun-main-card">
            <div class="sun-main-header">
                <div class="sun-location">
                    <h2><i class="fa-solid fa-location-dot"></i> ${cityName}</h2>
                    <p>Sun times for your selected location</p>
                </div>
                <div class="sun-date-display">
                    <div class="date">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                    <div class="day">${new Date().toLocaleDateString("en-US", { weekday: "long" })}</div>
                </div>
            </div>
            
            <div class="sun-times-grid">
                <div class="sun-time-card dawn">
                    <div class="icon"><i class="fa-solid fa-moon"></i></div>
                    <div class="label">Dawn</div>
                    <div class="time">${formatTime(data.civil_twilight_begin)}</div>
                    <div class="sub-label">Civil Twilight</div>
                </div>
                <div class="sun-time-card sunrise">
                    <div class="icon"><i class="fa-solid fa-sun"></i></div>
                    <div class="label">Sunrise</div>
                    <div class="time">${formatTime(data.sunrise)}</div>
                    <div class="sub-label">Golden Hour Start</div>
                </div>
                <div class="sun-time-card noon">
                    <div class="icon"><i class="fa-solid fa-sun"></i></div>
                    <div class="label">Solar Noon</div>
                    <div class="time">${formatTime(data.solar_noon)}</div>
                    <div class="sub-label">Sun at Highest</div>
                </div>
                <div class="sun-time-card sunset">
                    <div class="icon"><i class="fa-solid fa-sun"></i></div>
                    <div class="label">Sunset</div>
                    <div class="time">${formatTime(data.sunset)}</div>
                    <div class="sub-label">Golden Hour End</div>
                </div>
                <div class="sun-time-card dusk">
                    <div class="icon"><i class="fa-solid fa-moon"></i></div>
                    <div class="label">Dusk</div>
                    <div class="time">${formatTime(data.civil_twilight_end)}</div>
                    <div class="sub-label">Civil Twilight</div>
                </div>
                <div class="sun-time-card daylight">
                    <div class="icon"><i class="fa-solid fa-hourglass-half"></i></div>
                    <div class="label">Day Length</div>
                    <div class="time">${hours}h ${minutes}m</div>
                    <div class="sub-label">Total Daylight</div>
                </div>
            </div>
        </div>
        
        <div class="day-length-card">
            <h3><i class="fa-solid fa-chart-pie"></i> Daylight Distribution</h3>
            <div class="day-progress">
                <div class="day-progress-bar">
                    <div class="day-progress-fill" style="width: ${dayPercentage}%"></div>
                </div>
            </div>
            <div class="day-length-stats">
                <div class="day-stat">
                    <div class="value">${hours}h ${minutes}m</div>
                    <div class="label">Daylight</div>
                </div>
                <div class="day-stat">
                    <div class="value">${dayPercentage}%</div>
                    <div class="label">of 24 Hours</div>
                </div>
                <div class="day-stat">
                    <div class="value">${Math.floor((86400 - dayLengthSeconds) / 3600)}h ${Math.floor(((86400 - dayLengthSeconds) % 3600) / 60)}m</div>
                    <div class="label">Darkness</div>
                </div>
            </div>
        </div>
    `;
  }

  // UI.js
  renderMyPlans(plans) {
    const container = document.getElementById("plans-content");
    if (!container) return;

    container.innerHTML = "";

    if (plans.length === 0) {
      container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon"><i class="fas fa-heart-crack"></i></div>
                <h3>Your journey is empty</h3>
                <p>Save items from the dashboard to see them here.</p>
                <button class="btn btn-primary" id="go-to-plans-view">
               <i class="fa-solid fa-compass"></i>Start Exbloring</button>
            </div>`;

      return;
    }

    plans.forEach((plan) => {
      const planCard = `
            <div class="holiday-card plan-item" data-type="${plan.type}">
                <div class="holiday-card-header">
                    <div class="holiday-date-box">
                        <span class="day">${plan.day}</span>
                        <span class="month">${plan.month}</span>
                    </div>
                    <button class="holiday-action-btn active"  >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <h3>${plan.name}</h3>
                <p class="holiday-name">${plan.localName}</p>
                <div class="holiday-card-footer">
                    <span class="holiday-type-badge">${plan.type.toUpperCase()}</span>
                </div>
            </div>`;
      container.insertAdjacentHTML("beforeend", planCard);
    });
  }

  updatePlansCount(count) {
    const badge = document.getElementById("plans-count");
    const statSaved = document.getElementById("stat-saved");
    if (badge) {
      badge.innerText = count;
      count > 0
        ? badge.classList.remove("hidden")
        : badge.classList.add("hidden");
    }
    if (statSaved) statSaved.innerText = count;
  }
}

document.addEventListener("click", function (e) {
  if (e.target.closest(".dashboard-btn")) {
    window.location.href = "index.html";
  }
});
