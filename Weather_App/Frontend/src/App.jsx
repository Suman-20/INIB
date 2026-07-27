import { useCallback, useEffect, useState } from "react";

import api from "./services/api";

import SearchBar from "./components/SearchBar";
import CurrentWeather from "./components/CurrentWeather";
import WeatherDetails from "./components/WeatherDetails";
import Forecast from "./components/Forecast";
import RecentSearches from "./components/RecentSearches";
import Favorites from "./components/Favorites";

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  const [recentSearches, setRecentSearches] =
    useState([]);

  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecentSearches = useCallback(async () => {
    try {
      const { data } = await api.get(
        "/weather/recent"
      );

      setRecentSearches(data.searches || []);
    } catch (error) {
      console.error(
        "Recent searches error:",
        error
      );
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await api.get(
        "/weather/favorites"
      );

      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Favorites error:", error);
    }
  }, []);

  const searchWeather = useCallback(
    async (city) => {
      if (!city) return;

      try {
        setLoading(true);
        setError("");

        const [
          weatherResponse,
          forecastResponse,
        ] = await Promise.all([
          api.get("/weather", {
            params: { city },
          }),

          api.get("/weather/forecast", {
            params: { city },
          }),
        ]);

        setWeather(
          weatherResponse.data.weather
        );

        setForecast(
          forecastResponse.data.forecast || []
        );

        fetchRecentSearches();
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to fetch weather data."
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchRecentSearches]
  );

  useEffect(() => {
    fetchRecentSearches();
    fetchFavorites();

    searchWeather("Kolkata");
  }, [
    fetchFavorites,
    fetchRecentSearches,
    searchWeather,
  ]);

  const handleFavorite = async () => {
    if (!weather) return;

    const existing = favorites.find(
      (item) =>
        item.city.toLowerCase() ===
          weather.city.toLowerCase() &&
        item.country === weather.country
    );

    try {
      if (existing) {
        await api.delete(
          `/weather/favorites/${existing._id}`
        );
      } else {
        await api.post("/weather/favorites", {
          city: weather.city,
          country: weather.country,
        });
      }

      fetchFavorites();
    } catch (error) {
      console.error(
        "Favorite update failed:",
        error
      );
    }
  };

  const removeFavorite = async (id) => {
    try {
      await api.delete(
        `/weather/favorites/${id}`
      );

      fetchFavorites();
    } catch (error) {
      console.error(
        "Remove favorite failed:",
        error
      );
    }
  };

  const clearHistory = async () => {
    try {
      await api.delete("/weather/recent");

      setRecentSearches([]);
    } catch (error) {
      console.error(
        "Clear history failed:",
        error
      );
    }
  };

  const isFavorite =
    weather &&
    favorites.some(
      (item) =>
        item.city.toLowerCase() ===
          weather.city.toLowerCase() &&
        item.country === weather.country
    );

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <div className="logo-icon">
            ☁
          </div>

          <div>
            <strong>WeatherNow</strong>
            <span>LIVE WEATHER</span>
          </div>
        </div>

        <p>
          {new Date().toLocaleDateString(
            undefined,
            {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          )}
        </p>
      </header>

      <main className="page">
        <section className="hero">
          <div>
            <span className="hero-label">
              REAL-TIME WEATHER
            </span>

            <h1>
              Weather at your
              <br />
              fingertips.
            </h1>

            <p>
              Search any city and get current
              weather conditions and forecast.
            </p>
          </div>

          <SearchBar
            onSearch={searchWeather}
            loading={loading}
          />
        </section>

        {error && (
          <div className="weather-error">
            <strong>!</strong>
            {error}
          </div>
        )}

        {loading && !weather ? (
          <div className="weather-loading">
            <div className="loader"></div>
            <p>Fetching weather...</p>
          </div>
        ) : (
          weather && (
            <div className="dashboard">
              <div className="main-content">
                <CurrentWeather
                  weather={weather}
                  isFavorite={isFavorite}
                  onFavorite={handleFavorite}
                />

                <WeatherDetails
                  weather={weather}
                />

                <Forecast
                  forecast={forecast}
                />
              </div>

              <aside className="sidebar">
                <Favorites
                  favorites={favorites}
                  onSelect={searchWeather}
                  onRemove={removeFavorite}
                />

                <RecentSearches
                  searches={recentSearches}
                  onSelect={searchWeather}
                  onClear={clearHistory}
                />
              </aside>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;