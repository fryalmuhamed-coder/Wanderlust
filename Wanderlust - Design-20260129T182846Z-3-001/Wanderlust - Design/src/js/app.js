class App {
  constructor() {
    this.api = new APIService();
    this.ui = new DashboardUI();
    // el data el t save 2pl keda
    this.myPlans = JSON.parse(localStorage.getItem("wanderlust_plans")) || [];

    this.init();
  }

  async init() {
    try {
      console.log("App Initializing...");

      //clear ay data static
      const holidaysContent = document.getElementById("holidays-content");
      const eventsContent = document.getElementById("events-content");
      const lwContent = document.getElementById("lw-content");
      const weatherContent = document.getElementById("weather-content");
      const sunTimesContent = document.getElementById("sun-times-content");
      const emptyStateHtml = `     <div class="empty-state">
                  <div class="empty-icon">
                    <i class="fas fa-calendar-xmark"></i>
                  </div>
                  <h3>No Country Selected</h3>
                  <p>
                    Select a country from the dashboard to explore public
                    holidays
                  </p>
                  <button
                    class="btn btn-primary dashboard-btn"
                
                  >
                    <i class="fas fa-globe"></i>
                    Go to Dashboard
                  </button>
                </div>`;
      const eventEmptyHtml = `
    <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-ticket"></i></div>
        <h3>No City Selected</h3>
        <p>Select a country and city from the dashboard to discover events</p>
        <button class="btn btn-primary dashboard-btn" >
            <i class="fas fa-globe"></i> Go to Dashboard
        </button>
    </div>`;
      const weatherEmptyHtml = `
    <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-cloud-sun"></i></div>
        <h3>No City Selected</h3>
        <p>Select a country and city from the dashboard to see the weather forecast</p>
        <button class="btn btn-primary dashboard-btn" >
            <i class="fas fa-globe"></i> Go to Dashboard
        </button>
    </div>`;
      const sunTimesEmptyHtml = `
    <div class="empty-state">
        <div class="empty-icon">
            <i class="fas fa-sun"></i>
        </div>
        <h3>No City Selected</h3>
        <p>Select a country and city from the dashboard to see sunrise and sunset times</p>
        <button class="btn btn-primary dashboard-btn" >
            <i class="fas fa-globe"></i> Go to Dashboard
        </button>
    </div>`;
      const lwEmptyHtml = `
    <div class="empty-state">
        <div class="empty-icon">
            <i class="fas fa-umbrella-beach"></i>
        </div>
        <h3>No Country Selected</h3>
        <p>Select a country from the dashboard to discover long weekend opportunities</p>
        <button class="btn btn-primary dashboard-btn" >
            <i class="fas fa-globe"></i> Go to Dashboard
        </button>
    </div>`;
      if (holidaysContent) holidaysContent.innerHTML = emptyStateHtml;
      if (eventsContent) eventsContent.innerHTML = eventEmptyHtml;
      if (lwContent) lwContent.innerHTML = lwEmptyHtml;
      if (weatherContent) weatherContent.innerHTML = weatherEmptyHtml;
      if (sunTimesContent) sunTimesContent.innerHTML = sunTimesEmptyHtml;

      // hide sections information old
      const countrySections = document.getElementById("dashboard-country-info");
      const selectedDest = document.getElementById("selected-destination");
      if (countrySections) countrySections.classList.add("hidden");
      if (selectedDest) selectedDest.classList.add("hidden");

      // tn2l event f nav
      this.setupNavigation();
      this.setupMyPlansEventListeners();

      // local storage eta7des 3dad f side bar
      if (this.ui.updatePlansCount) {
        this.ui.updatePlansCount(this.myPlans.length);
      }

      //ta7mel el bald  w ml2 el 2aym a
      this.ui.loadingOverlay.classList.remove("hidden");
      const countries = await this.api.getAllCountries();
      this.ui.populateCountryList(countries);
      this.ui.loadingOverlay.classList.add("hidden");

      // 6. rab t el explore btn
      const exploreBtn = document.getElementById("global-search-btn");
      if (exploreBtn) {
        exploreBtn.addEventListener("click", async () => {
          const countryCode = document.getElementById("global-country").value;
          if (!countryCode) return;

          this.ui.loadingOverlay.classList.remove("hidden");

          // turn on fetch
          await this.fetchAndRender(countryCode);

          // get ui de at ails   country
          const details = await this.api.getCountryDetails(countryCode);
          if (details) {
            this.ui.updateCityInSelect(details[0].capital?.[0]);
            this.ui.updateUI(details);
          }

          this.ui.loadingOverlay.classList.add("hidden");
        });
      }

      // 7. rab t el neg ah bor s
      document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("clickable-neighbor")) {
          const countryCode = e.target.dataset.code;
          this.fetchAndRender(countryCode);
          if (this.ui.countrySelect) {
            this.ui.countrySelect.value = countryCode;
          }
        }
      });
    } catch (error) {
      console.error("Initialization error:", error);
      if (this.ui.loadingOverlay)
        this.ui.loadingOverlay.classList.add("hidden");
    }
  }

  setupMyPlansEventListeners() {
    // clear +sweet alert
    const clearAllBtn = document.getElementById("clear-all-plans-btn");
    if (clearAllBtn) {
      clearAllBtn.onclick = () => {
        // law hea fa dya msh ant l3 del et
        if (this.myPlans.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Nothing to clear",
            text: "Your saved plans list is already empty.",
            confirmButtonColor: "#3085d6",
          });
          return;
        }

        Swal.fire({
          title: "Are you sure?",
          text: "This will remove all your saved plans permanently!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Yes, clear all",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            //  done delete
            this.myPlans = [];
            localStorage.removeItem("wanderlust_plans");

            // update all ui
            this.updateAllCounters(); // el ada d  fe sai de
            this.ui.renderMyPlans(this.myPlans); //empty state

            Swal.fire("Cleared!", "Your plans have been deleted.", "success");
          }
        });
      };
    }

    document.addEventListener("click", (e) => {
      const loveBtn = e.target.closest(
        ".holiday-action-btn, .event-card-save, .btn-event",
      );
      if (loveBtn) {
        const card = loveBtn.closest(".holiday-card, .event-card, .lw-card");
        if (!card) return;

        let itemType = "holiday";
        if (card.closest("section").id.includes("events")) itemType = "event";
        if (card.closest("section").id.includes("long-weekends"))
          itemType = "longweekend";

        const itemData = {
          id: (
            card.querySelector("h3").textContent +
            (card.querySelector(".day, .num")?.textContent || "")
          )
            .replace(/\s+/g, "-")
            .toLowerCase(),
          name: card.querySelector("h3").textContent,
          type: itemType,
          day: card.querySelector(".day, .num")?.textContent || "Plan",
          month: card.querySelector(".month, .name")?.textContent || "Date",
          localName:
            card.querySelector(".holiday-name")?.textContent || "Saved Plan",
        };
        this.toggleFavorite(itemData);
      }
    });
  }
  toggleFavorite(item) {
    // hal el 3o nsr ma wg wd
    const index = this.myPlans.findIndex((p) => p.id === item.id);

    if (index > -1) {
      this.myPlans.splice(index, 1);
    } else {
      this.myPlans.push(item);
    }

    localStorage.setItem("wanderlust_plans", JSON.stringify(this.myPlans));
    this.updateAllCounters();

    this.ui.updatePlansCount(this.myPlans.length);

    if (document.getElementById("my-plans-view").classList.contains("active")) {
      this.ui.renderMyPlans(this.myPlans);
    }
  }

  updateAllCounters() {
    const total = this.myPlans.length;

    const sidebarBadge = document.getElementById("plans-count");
    if (sidebarBadge) {
      sidebarBadge.textContent = total;

      sidebarBadge.classList.toggle("hidden", total === 0);
    }

    const dashStat = document.getElementById("stat-saved");
    if (dashStat) dashStat.textContent = total;

    // update filter counters
    if (document.getElementById("filter-all-count")) {
      document.getElementById("filter-all-count").textContent = total;
      document.getElementById("filter-holiday-count").textContent =
        this.myPlans.filter((p) => p.type === "holiday").length;
      document.getElementById("filter-event-count").textContent =
        this.myPlans.filter((p) => p.type === "event").length;
      document.getElementById("filter-lw-count").textContent =
        this.myPlans.filter((p) => p.type === "longweekend").length;
    }
  }
  //  (اBo nus)
  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const viewId = item.getAttribute("data-view");

        // hia show
        document
          .querySelectorAll(".view")
          .forEach((v) => v.classList.remove("active"));
        document.getElementById(`${viewId}-view`).classList.add("active");

        navItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        if (viewId === "my-plans") this.ui.renderMyPlans(this.myPlans);
      });
    });
  }

  //  not tk rar
  async fetchAndRender(countryCode) {
    if (!countryCode) return;
    this.ui.loadingOverlay.classList.remove("hidden");

    try {
      const year = document.getElementById("global-year")?.value || 2026;

      // el asa sy  first
      const [details, holidays, events, longWeekends] = await Promise.all([
        this.api.getCountryDetails(countryCode),
        this.api.getHolidays(countryCode, year),
        this.api.getEvents(countryCode),
        this.api.getLongWeekends(countryCode, year),
      ]);

      if (details && details.length > 0) {
        const country = details[0];
        const {
          latlng: [lat, lng],
        } = country;
        const cityName = country.capital?.[0] || country.name.common;
        // CURRENCY
        const currencyCode = Object.keys(country.currencies)[0];
        const rates = await this.api.getExchangeRates(currencyCode);

        const weather = await this.api.getWeather(lat, lng);
        const sunData = await this.api.getSunTimes(lat, lng);

        if (weather) {
          this.ui.renderWeather(weather, cityName);
        }

        const countrySections = document.getElementById(
          "dashboard-country-info",
        );
        const selectedDest = document.getElementById("selected-destination");

        if (countrySections) countrySections.classList.remove("hidden");
        if (selectedDest) selectedDest.classList.remove("hidden");

        this.ui.countrySelect.value = country.cca2;
        this.ui.updateCityInSelect(country.capital?.[0]);
        this.ui.RenderLongWeekends(
          longWeekends,
          country.name.common,
          country.cca2,
          year,
        );
        this.ui.updateUI(details);
        this.ui.renderEvents(events);
        this.ui.renderCurrency(rates, currencyCode);
        this.ui.renderSunTimes(sunData, cityName);
        this.ui.renderHolidays(
          holidays,
          country.name.common,
          year,
          country.cca2,
        );
      }
    } catch (error) {
      console.error("Error in fetchAndRender:", error);
    } finally {
      this.ui.loadingOverlay.classList.add("hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new App();
});

function updateHeaderDateTime() {
  const dateTimeElement = document.getElementById("current-datetime");
  if (!dateTimeElement) return;

  const now = new Date();

  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  dateTimeElement.textContent = now.toLocaleString("en-US", options);
}

updateHeaderDateTime();
