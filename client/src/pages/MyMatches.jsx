import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function MyMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get logged-in user's ID from JWT

  useEffect(() => {
    let cancelled = false;

    API.get("/matches/my")
      .then((response) => {
        if (!cancelled) {
          setMatches(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setError(
            error.response?.data?.message || "Failed to load your matches.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Accept or reject a possible match
  const updateMatchStatus = async (id, status) => {
    try {
      setError("");

      await API.put(`/matches/${id}/status`, {
        status,
      });

      // Fetch the match again so the newly available
      // contact details are received from the backend.
      const response = await API.get("/matches/my");

      setMatches(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update match.");
    }
  };

  // Confirm handover by the student who found the item
  const confirmHandover = async (id) => {
    try {
      const response = await API.put(`/matches/${id}/handover`);

      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match._id === id ? response.data.match : match,
        ),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to confirm handover.");
    }
  };

  // Confirm receipt by the student who lost the item
  const confirmReceipt = async (id) => {
    try {
      const response = await API.put(`/matches/${id}/receipt`);

      setMatches((currentMatches) =>
        currentMatches.map((match) =>
          match._id === id ? response.data.match : match,
        ),
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to confirm receipt.");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading your matches...</p>
      </div>
    );
  }

  return (
    <div className="page-container matches-page">
      <div className="page-header">
        <span className="page-label">POSSIBLE MATCHES</span>

        <h1>My Matches</h1>

        <p>
          Possible matches between your reported items and other campus reports.
        </p>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>

          <h2>No Matches Yet</h2>

          <p>We haven't found any possible matches for your reported items.</p>

          <Link to="/report-lost" className="btn btn-primary">
            Report an Item
          </Link>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => {
            return (
              <div className="match-card" key={match._id}>
                <div className="match-card-header">
                  <span className="match-label">🤝 Possible Match</span>

                  <span className="match-score">{match.score}%</span>
                </div>

                <div className="match-items">
                  {/* LOST ITEM */}
                  <div className="match-item">
                    <span className="match-item-label">📢 Lost Report</span>

                    {match.lostItem?.image ? (
                      <img
                        src={`http://localhost:5000${match.lostItem.image}`}
                        alt={match.lostItem.itemName}
                        className="match-item-image"
                      />
                    ) : (
                      <div className="match-item-icon">📢</div>
                    )}

                    <h3>{match.lostItem?.itemName}</h3>

                    <p>📍 {match.lostItem?.location}</p>

                    {match.lostItem?.itemDate && (
                      <p>
                        📅 Date Lost:{" "}
                        {new Date(match.lostItem.itemDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                    )}
                  </div>

                  <div className="match-arrow">↕</div>

                  {/* FOUND ITEM */}
                  <div className="match-item">
                    <span className="match-item-label found">
                      🤝 Found Report
                    </span>

                    {match.foundItem?.image ? (
                      <img
                        src={`http://localhost:5000${match.foundItem.image}`}
                        alt={match.foundItem.itemName}
                        className="match-item-image"
                      />
                    ) : (
                      <div className="match-item-icon">🤝</div>
                    )}

                    <h3>{match.foundItem?.itemName}</h3>

                    <p>📍 {match.foundItem?.location}</p>

                    {match.foundItem?.itemDate && (
                      <p>
                        📅 Date Found:{" "}
                        {new Date(match.foundItem.itemDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* STATUS */}
                <div className="match-status">
                  <span>Status</span>

                  <strong className={`status-${match.status.toLowerCase()}`}>
                    {match.status === "ReturnInProgress"
                      ? "Return In Progress"
                      : match.status}
                  </strong>
                </div>

                {/* PENDING */}
                {match.status === "Pending" && (
                  <div className="match-actions">
                    {match.isLostStudent ? (
                      <>
                        <button
                          className="match-reject-btn"
                          onClick={() =>
                            updateMatchStatus(match._id, "Rejected")
                          }
                        >
                          ✕ Not a Match
                        </button>

                        <button
                          className="match-accept-btn"
                          onClick={() =>
                            updateMatchStatus(match._id, "Accepted")
                          }
                        >
                          ✓ This is My Item
                        </button>
                      </>
                    ) : (
                      <p className="match-waiting">
                        ⏳ Waiting for the lost-item student to confirm this
                        match.
                      </p>
                    )}
                  </div>
                )}

                {/* RETURN PROCESS */}
                {match.status === "ReturnInProgress" && (
                  <div className="return-process">
                    <h3>🔄 Return Process</h3>

                    <p>
                      The match has been accepted. Complete the return
                      confirmation below.
                    </p>

                    <div className="contact-details">
                      <h4>
                        👤{" "}
                        {match.isLostStudent ? "Found Student" : "Item Owner"}
                      </h4>

                      <p>
                        <strong>Name:</strong>{" "}
                        {match.isLostStudent
                          ? match.foundItem?.reportedBy?.name
                          : match.lostItem?.reportedBy?.name}
                      </p>

                      <p>
                        <strong>College ID:</strong>{" "}
                        {match.isLostStudent
                          ? match.foundItem?.reportedBy?.collegeId
                          : match.lostItem?.reportedBy?.collegeId}
                      </p>

                      <p>
                        <strong>Contact:</strong>{" "}
                        {match.isLostStudent
                          ? match.foundItem?.reportedBy?.contact
                          : match.lostItem?.reportedBy?.contact}
                      </p>
                    </div>

                    {/* FOUND STUDENT */}
                    {match.isFoundStudent && (
                      <div className="return-action">
                        {match.handoverConfirmedBy ? (
                          <div className="confirmation-done">
                            ✓ Handover Confirmed
                          </div>
                        ) : (
                          <button
                            className="match-accept-btn"
                            onClick={() => confirmHandover(match._id)}
                          >
                            🤝 Confirm Handover
                          </button>
                        )}
                      </div>
                    )}

                    {/* LOST STUDENT */}
                    {match.isLostStudent && (
                      <div className="return-action">
                        {match.receiptConfirmedBy ? (
                          <div className="confirmation-done">
                            ✓ Receipt Confirmed
                          </div>
                        ) : (
                          <button
                            className="match-accept-btn"
                            onClick={() => confirmReceipt(match._id)}
                          >
                            📦 Confirm Receipt
                          </button>
                        )}
                      </div>
                    )}

                    {/* WAITING MESSAGE */}
                    {match.isFoundStudent &&
                      match.handoverConfirmedBy &&
                      !match.receiptConfirmedBy && (
                        <p className="return-waiting">
                          Waiting for the lost-item student to confirm receipt.
                        </p>
                      )}

                    {match.isLostStudent &&
                      match.receiptConfirmedBy &&
                      !match.handoverConfirmedBy && (
                        <p className="return-waiting">
                          Waiting for the found-item student to confirm
                          handover.
                        </p>
                      )}
                  </div>
                )}

                {/* RETURNED */}
                {match.status === "Returned" && (
                  <div className="return-completed">
                    <h3>✅ Item Returned Successfully</h3>

                    <p>Both students have confirmed the return.</p>
                  </div>
                )}

                {/* REJECTED */}
                {match.status === "Rejected" && (
                  <div className="return-rejected">
                    <p>❌ This match was rejected.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyMatches;
