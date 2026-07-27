function Forecast({ forecast }) {
  if (!forecast?.length) return null;

  return (
    <section className="forecast-section">
      <div className="section-heading">
        <div>
          <span>FORECAST</span>
          <h2>Next 5 Days</h2>
        </div>
      </div>

      <div className="forecast-grid">
        {forecast.map((item, index) => {
          const date = new Date(item.date * 1000);

          return (
            <div
              className="forecast-card"
              key={`${item.date}-${index}`}
            >
              <p>
                {index === 0
                  ? "Today"
                  : date.toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                      }
                    )}
              </p>

              <span className="forecast-date">
                {date.toLocaleDateString(
                  undefined,
                  {
                    day: "numeric",
                    month: "short",
                  }
                )}
              </span>

              <img
                src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                alt={item.description}
              />

              <strong>
                {item.temperature}°C
              </strong>

              <span className="condition">
                {item.condition}
              </span>

              <div className="forecast-extra">
                <span>
                  💧 {item.humidity}%
                </span>

                <span>
                  ☂ {item.rainProbability}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Forecast;