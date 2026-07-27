function CurrentWeather({
  weather,
  isFavorite,
  onFavorite,
}) {
  if (!weather) return null;

  const iconURL =
    `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;

  return (
    <section className="current-weather">
      <div className="weather-location-row">
        <div>
          <span className="location-label">
            CURRENT WEATHER
          </span>

          <h1>
            {weather.city},{" "}
            <span>{weather.country}</span>
          </h1>

          <p>
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <button
          className={`favorite-button ${
            isFavorite ? "active" : ""
          }`}
          onClick={onFavorite}
        >
          {isFavorite ? "★ Saved" : "☆ Favorite"}
        </button>
      </div>

      <div className="temperature-section">
        <img
          src={iconURL}
          alt={weather.description}
        />

        <div className="temperature">
          <strong>{weather.temperature}°</strong>

          <div>
            <h2>{weather.condition}</h2>

            <p>{weather.description}</p>

            <span>
              Feels like {weather.feelsLike}°C
            </span>
          </div>
        </div>

        <div className="min-max">
          <div>
            <span>HIGH</span>
            <strong>{weather.tempMax}°</strong>
          </div>

          <div>
            <span>LOW</span>
            <strong>{weather.tempMin}°</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CurrentWeather;