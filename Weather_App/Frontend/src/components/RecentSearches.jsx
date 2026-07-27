function RecentSearches({
  searches,
  onSelect,
  onClear,
}) {
  return (
    <section className="side-section">
      <div className="side-heading">
        <div>
          <span>HISTORY</span>
          <h3>Recent Searches</h3>
        </div>

        {searches.length > 0 && (
          <button onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      {searches.length === 0 ? (
        <p className="empty-text">
          No recent searches.
        </p>
      ) : (
        <div className="recent-list">
          {searches.map((item, index) => (
            <button
              key={`${item.city}-${index}`}
              className="recent-item"
              onClick={() => onSelect(item.city)}
            >
              <div>
                <strong>{item.city}</strong>
                <span>{item.country}</span>
              </div>

              <div>
                <strong>
                  {item.temperature}°
                </strong>

                <span>{item.condition}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentSearches;