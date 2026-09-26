import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function StudentDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadItems = async () => {
      try {
        const response = await API.get("/items/my");

        if (!cancelled) {
          setItems(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.response?.data?.message || "Failed to load your reports.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const lostItems = items.filter((item) => item.itemType === "Lost");

  const foundItems = items.filter((item) => item.itemType === "Found");

  const pendingItems = items.filter((item) => item.status === "Pending");

  const approvedItems = items.filter((item) => item.status === "Approved");

  const getStatusClass = (status) => {
    return `dashboard-status status-${status.toLowerCase()}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="page-label">STUDENT DASHBOARD</span>

          <h1>My Dashboard</h1>

          <p>Track your lost and found reports in one place.</p>
        </div>

        <div className="dashboard-actions">
          <Link to="/report-lost" className="btn btn-primary">
            📢 Report Lost
          </Link>

          <Link to="/report-found" className="btn btn-secondary">
            🤝 Report Found
          </Link>
        </div>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {/* Statistics */}

      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <span className="dashboard-stat-icon">📦</span>

          <div>
            <strong>{items.length}</strong>
            <small>Total Reports</small>
          </div>
        </div>

        <div className="dashboard-stat">
          <span className="dashboard-stat-icon">📢</span>

          <div>
            <strong>{lostItems.length}</strong>
            <small>Lost Items</small>
          </div>
        </div>

        <div className="dashboard-stat">
          <span className="dashboard-stat-icon">🤝</span>

          <div>
            <strong>{foundItems.length}</strong>
            <small>Found Items</small>
          </div>
        </div>

        <div className="dashboard-stat">
          <span className="dashboard-stat-icon">🕐</span>

          <div>
            <strong>{pendingItems.length}</strong>
            <small>Pending</small>
          </div>
        </div>

        <div className="dashboard-stat">
          <span className="dashboard-stat-icon">✓</span>

          <div>
            <strong>{approvedItems.length}</strong>
            <small>Approved</small>
          </div>
        </div>
      </div>

      {/* My Reports */}

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <span className="page-label">YOUR REPORTS</span>

            <h2>My Lost & Found Reports</h2>
          </div>

          <Link to="/my-matches">View My Matches →</Link>
        </div>

        {items.length === 0 ? (
          <div className="dashboard-empty">
            <div>📦</div>

            <h3>No Reports Yet</h3>

            <p>You haven't reported any lost or found items yet.</p>

            <div className="dashboard-empty-actions">
              <Link to="/report-lost" className="btn btn-primary">
                Report Lost Item
              </Link>

              <Link to="/report-found" className="btn btn-secondary">
                Report Found Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="dashboard-items">
            {items.map((item) => (
              <div className="dashboard-item-card" key={item._id}>
                {item.image ? (
                  <img
                    src={`http://localhost:5000${item.image}`}
                    alt={item.itemName}
                    className="dashboard-item-image"
                  />
                ) : (
                  <div className="dashboard-item-icon">
                    {item.itemType === "Lost" ? "📢" : "🤝"}
                  </div>
                )}

                <div className="dashboard-item-main">
                  <div className="dashboard-item-title">
                    <div>
                      <span
                        className={
                          item.itemType === "Lost"
                            ? "item-badge lost-badge"
                            : "item-badge found-badge"
                        }
                      >
                        {item.itemType}
                      </span>

                      <h3>{item.itemName}</h3>
                    </div>

                    <span className={getStatusClass(item.status)}>
                      {item.status}
                    </span>
                  </div>

                  <div className="dashboard-item-info">
                    <span>📍 {item.location}</span>

                    <span>
                      📅 {item.itemType === "Lost" ? "Lost" : "Found"}:{" "}
                      {new Date(item.itemDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <p>{item.description || "No description provided."}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentDashboard;
