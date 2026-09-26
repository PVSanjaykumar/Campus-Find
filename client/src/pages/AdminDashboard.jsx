import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        setError("");

        const response = await API.get("/admin/items");

        setItems(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load pending items.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPendingItems();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      setError("");

      await API.put(`/admin/items/${id}/approve`);

      setItems((currentItems) =>
        currentItems.filter((item) => item._id !== id),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to approve item.");
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      setError("");

      await API.put(`/admin/items/${id}/reject`);

      setItems((currentItems) =>
        currentItems.filter((item) => item._id !== id),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reject item.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="page-label">ADMIN PANEL</span>

          <h1>Admin Dashboard</h1>

          <p>Review and manage campus lost & found reports.</p>
        </div>

        <div className="pending-count">
          <span>{items.length}</span>
          <small>Pending Reports</small>
        </div>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {items.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">🎉</div>

          <h2>No Pending Reports</h2>

          <p>All submitted reports have been reviewed.</p>
        </div>
      ) : (
        <div className="admin-items">
          {items.map((item) => (
            <div className="admin-item-card" key={item._id}>
              <div className="admin-item-header">
                <div>
                  <span
                    className={
                      item.itemType === "Lost"
                        ? "item-badge lost-badge"
                        : "item-badge found-badge"
                    }
                  >
                    {item.itemType === "Lost" ? "📢 Lost" : "🤝 Found"}
                  </span>

                  <h2>{item.itemName}</h2>
                </div>

                <span className="pending-badge">Pending</span>
              </div>

              <div className="admin-item-body">
                <div className="admin-item-info">
                  <div className="admin-info-row">
                    <span>📍 Location</span>

                    <strong>{item.location}</strong>
                  </div>

                  <div className="admin-info-row">
                    <span>📝 Description</span>

                    <strong>
                      {item.description || "No description provided"}
                    </strong>
                  </div>

                  {item.details?.company && (
                    <div className="admin-info-row">
                      <span>🏷️ Company</span>

                      <strong>{item.details.company}</strong>
                    </div>
                  )}

                  {item.details?.color && (
                    <div className="admin-info-row">
                      <span>🎨 Color</span>

                      <strong>{item.details.color}</strong>
                    </div>
                  )}

                  {item.details?.cash !== null &&
                    item.details?.cash !== undefined && (
                      <div className="admin-info-row">
                        <span>💰 Cash</span>

                        <strong>₹{item.details.cash}</strong>
                      </div>
                    )}

                  {item.details?.idName && (
                    <div className="admin-info-row">
                      <span>🪪 ID Name</span>

                      <strong>{item.details.idName}</strong>
                    </div>
                  )}

                  {item.details?.keyType && (
                    <div className="admin-info-row">
                      <span>🔑 Key Type</span>

                      <strong>{item.details.keyType}</strong>
                    </div>
                  )}
                </div>

                <div className="admin-reporter">
                  <h3>Reporter Information</h3>

                  <div className="reporter-card">
                    <div className="reporter-avatar">
                      {item.reportedBy?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <strong>{item.reportedBy?.name || "Unknown User"}</strong>

                      <span>ID: {item.reportedBy?.collegeId || "N/A"}</span>

                      <span>📧 {item.reportedBy?.email || "N/A"}</span>

                      <span>📱 {item.reportedBy?.contact || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-actions">
                <button
                  className="admin-reject-btn"
                  disabled={actionLoading === item._id}
                  onClick={() => handleReject(item._id)}
                >
                  {actionLoading === item._id ? "Processing..." : "✕ Reject"}
                </button>

                <button
                  className="admin-approve-btn"
                  disabled={actionLoading === item._id}
                  onClick={() => handleApprove(item._id)}
                >
                  {actionLoading === item._id ? "Processing..." : "✓ Approve"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
