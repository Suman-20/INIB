function Favorites({
  favorites,
  onSelect,
  onRemove,
}) {
  return (
    <section className="side-section">
      <div className="side-heading">
        <div>
          <span>SAVED</span>
          <h3>Favorite Cities</h3>
        </div>
      </div>

      {favorites.length === 0 ? (
        <p className="empty-text">
          Save your favorite cities for quick access.
        </p>
      ) : (
        <div className="favorite-list">
          {favorites.map((item) => (
            <div
              className="favorite-item"
              key={item._id}
            >
              <button
                className="favorite-city"
                onClick={() =>
                  onSelect(item.city)
                }
              >
                <span>★</span>

                <div>
                  <strong>{item.city}</strong>
                  <p>{item.country}</p>
                </div>
              </button>

              <button
                className="remove-favorite"
                onClick={() =>
                  onRemove(item._id)
                }
                title="Remove favorite"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Favorites;