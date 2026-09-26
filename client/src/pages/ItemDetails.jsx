import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";

function ItemDetails() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await API.get(`/items/${id}`);
        setItem(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load item details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>

        <Link to="/browse" className="btn btn-primary">
          ← Back to Browse
        </Link>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="page-container item-details-page">
      <Link to="/browse" className="back-link">
        ← Back to Browse
      </Link>

      <div className="details-card">
        <div className="details-header">
          <span
            className={
              item.itemType === "Lost"
                ? "item-badge lost-badge"
                : "item-badge found-badge"
            }
          >
            {item.itemType === "Lost" ? "📢 Lost Item" : "🤝 Found Item"}
          </span>

          <span className="details-status">✓ Approved</span>
        </div>

        <div className="details-content">
          {item.image ? (
            <img
              src={`http://localhost:5000${item.image}`}
              alt={item.itemName}
              className="details-image"
            />
          ) : (
            <div className="details-icon">{getItemIcon(item.itemName)}</div>
          )}

          <div className="details-main">
            <h1>{item.itemName}</h1>

            <div className="details-location">📍 {item.location}</div>
            <div className="details-date">
              📅 {item.itemType === "Lost" ? "Date Lost" : "Date Found"}:{" "}
              {new Date(item.itemDate).toLocaleDateString("en-IN")}
            </div>

            <div className="details-section">
              <h3>Description</h3>
              <p>{item.description || "No description provided."}</p>
            </div>

            {hasDetails(item.details) && (
              <div className="details-section">
                <h3>Item Details</h3>

                <div className="details-grid">
                  {item.details.company && (
                    <div className="detail-box">
                      <span>Company</span>
                      <strong>{item.details.company}</strong>
                    </div>
                  )}

                  {item.details.color && (
                    <div className="detail-box">
                      <span>Color</span>
                      <strong>{item.details.color}</strong>
                    </div>
                  )}

                  {item.details.cash !== null &&
                    item.details.cash !== undefined && (
                      <div className="detail-box">
                        <span>Amount</span>
                        <strong>₹{item.details.cash}</strong>
                      </div>
                    )}

                  {item.details.idName && (
                    <div className="detail-box">
                      <span>ID Name</span>
                      <strong>{item.details.idName}</strong>
                    </div>
                  )}

                  {item.details.keyType && (
                    <div className="detail-box">
                      <span>Key Type</span>
                      <strong>{item.details.keyType}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="details-section reporter-section">
              <h3>Reported By</h3>

              <div className="reporter-card">
                <div className="reporter-avatar">
                  {item.reportedBy?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <strong>{item.reportedBy?.name || "Campus User"}</strong>

                  {item.reportedBy?.collegeId && (
                    <span>College ID: {item.reportedBy.collegeId}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="details-notice">
              <span>🔒</span>
              <p>
                For privacy and security, personal contact information is not
                displayed publicly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function hasDetails(details) {
  if (!details) {
    return false;
  }

  return (
    details.company ||
    details.color ||
    (details.cash !== null && details.cash !== undefined) ||
    details.idName ||
    details.keyType
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

export default ItemDetails;
