function WeatherDetails({ weather }) {
  if (!weather) return null;

  const formatTime = (unix) => {
    return new Date(
      (unix + weather.timezone) * 1000
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const visibility = weather.visibility
    ? (weather.visibility / 1000).toFixed(1)
    : 0;

  return (
    <div className="weather-details">
      <div className="detail-card">
        <span>💧</span>
        <p>Humidity</p>
        <strong>{weather.humidity}%</strong>
      </div>

      <div className="detail-card">
        <span>💨</span>
        <p>Wind Speed</p>
        <strong>
          {weather.windSpeed} m/s
        </strong>
      </div>

      <div className="detail-card">
        <span>◉</span>
        <p>Pressure</p>
        <strong>
          {weather.pressure} hPa
        </strong>
      </div>

      <div className="detail-card">
        <span>👁</span>
        <p>Visibility</p>
        <strong>{visibility} km</strong>
      </div>

      <div className="detail-card">
        <span>☁</span>
        <p>Cloud Cover</p>
        <strong>{weather.clouds}%</strong>
      </div>

      <div className="detail-card">
        <span>☀</span>
        <p>Sunrise</p>
        <strong>
          {formatTime(weather.sunrise)}
        </strong>
      </div>

      <div className="detail-card">
        <span>◐</span>
        <p>Sunset</p>
        <strong>
          {formatTime(weather.sunset)}
        </strong>
      </div>
    </div>
  );
}

export default WeatherDetails;