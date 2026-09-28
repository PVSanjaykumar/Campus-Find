import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const SERVER_URL = "https://campus-find-api-l3ae.onrender.com";

const getImageUrl = (image) => {
  if (!image) return "";
  return image.startsWith("http") ? image : `${SERVER_URL}${image}`;
};

function BrowseItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await API.get("/items");
        setItems(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load items. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.itemName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType = typeFilter === "All" || item.itemType === typeFilter;

    const matchesLocation =
      locationFilter === "All" || item.location === locationFilter;

    const matchesDate =
      !dateFilter ||
      new Date(item.itemDate).toISOString().split("T")[0] === dateFilter;

    return matchesSearch && matchesType && matchesLocation && matchesDate;
  });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container browse-page">
      <div className="page-header">
        <span className="page-label">CAMPUS LOST & FOUND</span>
        <h1>Browse Items</h1>
        <p>Explore approved lost and found reports from around the campus.</p>
      </div>

      <div className="browse-filters">
        <div className="filter-group">
          <label>🔎 Search Item</label>

          <input
            type="text"
            placeholder="Search by item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>📦 Item Type</label>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📍 Location</label>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="All">All Locations</option>
            <option value="Library">Library</option>
            <option value="Canteen">Canteen</option>
            <option value="Academic Block 1">Academic Block 1</option>
            <option value="Academic Block 2">Academic Block 2</option>
            <option value="Boys Hostel 2">Boys Hostel 2</option>
            <option value="Girls Hostel 2">Girls Hostel 2</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📅 Date</label>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <button
          className="clear-filters-btn"
          onClick={() => {
            setSearch("");
            setTypeFilter("All");
            setLocationFilter("All");
            setDateFilter("");
          }}
        >
          Clear Filters
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h2>No Items Available</h2>
          <p>There are currently no approved lost or found items.</p>

          <Link to="/report-lost" className="btn btn-primary">
            Report a Lost Item
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>

          <h2>No Matching Items</h2>

          <p>No items match your current search and filters.</p>

          <button
            className="btn btn-primary"
            onClick={() => {
              setSearch("");
              setTypeFilter("All");
              setLocationFilter("All");
              setDateFilter("");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <div className="item-card" key={item._id}>
              <div className="item-card-top">
                <span
                  className={
                    item.itemType === "Lost"
                      ? "item-badge lost-badge"
                      : "item-badge found-badge"
                  }
                >
                  {item.itemType === "Lost" ? "📢 Lost" : "🤝 Found"}
                </span>

                <span className="item-location">📍 {item.location}</span>
              </div>
              <div className="item-date">
                📅 {item.itemType === "Lost" ? "Lost" : "Found"}:{" "}
                {new Date(item.itemDate).toLocaleDateString("en-IN")}
              </div>

              {item.image ? (
                <img
                  src={getImageUrl(item.image)}
                  alt={item.itemName}
                  className="item-image"
                />
              ) : (
                <div className="item-icon">{getItemIcon(item.itemName)}</div>
              )}

              <h2>{item.itemName}</h2>

              <p className="item-description">
                {item.description || "No description provided."}
              </p>

              {item.details && (
                <div className="item-details">
                  {item.details.company && (
                    <span>🏷️ {item.details.company}</span>
                  )}

                  {item.details.color && <span>🎨 {item.details.color}</span>}

                  {item.details.cash !== null &&
                    item.details.cash !== undefined && (
                      <span>💰 ₹{item.details.cash}</span>
                    )}

                  {item.details.idName && <span>🪪 {item.details.idName}</span>}

                  {item.details.keyType && (
                    <span>🔑 {item.details.keyType}</span>
                  )}
                </div>
              )}

              <div className="item-card-footer">
                <div>
                  <small>Reported by</small>
                  <strong>{item.reportedBy?.name || "Campus User"}</strong>
                </div>

                <Link to={`/items/${item._id}`} className="view-item-btn">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getItemIcon(itemName) {
  const name = itemName.toLowerCase();

  if (name.includes("phone") || name.includes("mobile")) {
    return "📱";
  }

  if (name.includes("laptop")) {
    return "💻";
  }

  if (name.includes("earbud")) {
    return "🎧";
  }

  if (name.includes("purse") || name.includes("wallet")) {
    return "👛";
  }

  if (name.includes("id")) {
    return "🪪";
  }

  if (name.includes("key")) {
    return "🔑";
  }

  return "📦";
}

export default BrowseItems;
