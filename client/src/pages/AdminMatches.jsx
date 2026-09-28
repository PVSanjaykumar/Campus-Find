import { useEffect, useState } from "react";
import API from "../services/api";

const SERVER_URL = "https://campus-find-api-l3ae.onrender.com";

const getImageUrl = (image) => {
  if (!image) return "";
  return image.startsWith("http") ? image : `${SERVER_URL}${image}`;
};

function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setError("");

        const response = await API.get("/admin/returns");

        setMatches(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load matches.");
      } finally {
        setLoading(false);
      }
    };

    // Load immediately
    fetchMatches();

    // Refresh every 10 seconds
    const interval = setInterval(() => {
      fetchMatches();
    }, 10000);

    // Stop refreshing when leaving the page
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="admin-page admin-matches-page">
      <div className="admin-header">
        <div>
          <span className="page-label">MATCH MANAGEMENT</span>

          <h1>Matches</h1>

          <p>
            View matched lost and found reports and monitor the return process.
          </p>
        </div>

        <div className="pending-count">
          <span>{matches.length}</span>
          <small>Total Matches</small>
        </div>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {matches.length === 0 ? (
        <div className="admin-empty">
          <div className="empty-icon">🤝</div>

          <h2>No Matches Found</h2>

          <p>
            Matches will appear here when approved lost and found reports match.
          </p>
        </div>
      ) : (
        <div className="admin-matches-list">
          {matches.map((match) => {
            const isReturnStarted =
              match.status === "ReturnInProgress" ||
              match.status === "Returned";

            return (
              <div className="admin-match-card" key={match._id}>
                {/* MATCH HEADER */}
                <div className="admin-match-header">
                  <div>
                    <span className="match-label">🤝 MATCH FOUND</span>

                    <h2>{match.lostItem?.itemName || "Unknown Item"}</h2>
                  </div>

                  <div className="admin-match-score">{match.score}%</div>
                </div>

                {/* LOST AND FOUND ITEMS */}
                <div className="admin-match-items">
                  {/* LOST ITEM */}
                  <div className="admin-match-item">
                    <span className="admin-match-item-label lost">
                      📢 Lost Report
                    </span>

                    {match.lostItem?.image ? (
                      <img
                        src={getImageUrl(match.lostItem.image)}
                        alt={match.lostItem.itemName}
                        className="admin-match-image"
                      />
                    ) : (
                      <div className="admin-match-icon">📢</div>
                    )}

                    <h3>{match.lostItem?.itemName || "N/A"}</h3>

                    <p>📍 {match.lostItem?.location || "N/A"}</p>

                    {match.lostItem?.itemDate && (
                      <p>
                        📅 Date Lost:{" "}
                        {new Date(match.lostItem.itemDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                    )}

                    <div className="admin-match-student">
                      <strong>👤 Lost Person</strong>

                      <span>
                        {match.lostItem?.reportedBy?.name || "Unknown"}
                      </span>

                      <span>
                        ID: {match.lostItem?.reportedBy?.collegeId || "N/A"}
                      </span>

                      <span>
                        📱 {match.lostItem?.reportedBy?.contact || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-match-arrow">↕</div>

                  {/* FOUND ITEM */}
                  <div className="admin-match-item">
                    <span className="admin-match-item-label found">
                      🤝 Found Report
                    </span>

                    {match.foundItem?.image ? (
                      <img
                        src={getImageUrl(match.foundItem.image)}
                        alt={match.foundItem.itemName}
                        className="admin-match-image"
                      />
                    ) : (
                      <div className="admin-match-icon">🤝</div>
                    )}

                    <h3>{match.foundItem?.itemName || "N/A"}</h3>

                    <p>📍 {match.foundItem?.location || "N/A"}</p>

                    {match.foundItem?.itemDate && (
                      <p>
                        📅 Date Found:{" "}
                        {new Date(match.foundItem.itemDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                    )}

                    <div className="admin-match-student">
                      <strong>👤 Found Person</strong>

                      <span>
                        {match.foundItem?.reportedBy?.name || "Unknown"}
                      </span>

                      <span>
                        ID: {match.foundItem?.reportedBy?.collegeId || "N/A"}
                      </span>

                      <span>
                        📱 {match.foundItem?.reportedBy?.contact || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RETURN PROCESS */}
                <div className="admin-return-process">
                  <h3>🔄 Return Process</h3>

                  <div className="return-timeline">
                    {/* MATCH FOUND */}
                    <div className="return-step completed">
                      <div className="return-step-icon">✓</div>

                      <div>
                        <strong>Match Found</strong>

                        <span>Lost and found reports matched</span>
                      </div>
                    </div>

                    {/* LOST PERSON CONFIRMATION */}
                    <div
                      className={
                        isReturnStarted
                          ? "return-step completed"
                          : "return-step pending"
                      }
                    >
                      <div className="return-step-icon">
                        {isReturnStarted ? "✓" : "2"}
                      </div>

                      <div>
                        <strong>Lost Person Confirmed</strong>

                        <span>
                          {isReturnStarted
                            ? "The lost student accepted the match"
                            : "Waiting for the lost student"}
                        </span>
                      </div>
                    </div>

                    {/* HANDOVER */}
                    <div
                      className={
                        match.handoverConfirmedBy
                          ? "return-step completed"
                          : "return-step pending"
                      }
                    >
                      <div className="return-step-icon">
                        {match.handoverConfirmedBy ? "✓" : "3"}
                      </div>

                      <div>
                        <strong>Found Person Handover</strong>

                        <span>
                          {match.handoverConfirmedBy
                            ? `Confirmed by ${
                                match.handoverConfirmedBy?.name ||
                                "found student"
                              }`
                            : "Waiting for handover"}
                        </span>

                        {match.handoverConfirmedAt && (
                          <small>
                            {new Date(match.handoverConfirmedAt).toLocaleString(
                              "en-IN",
                            )}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* RECEIPT */}
                    <div
                      className={
                        match.receiptConfirmedBy
                          ? "return-step completed"
                          : "return-step pending"
                      }
                    >
                      <div className="return-step-icon">
                        {match.receiptConfirmedBy ? "✓" : "4"}
                      </div>

                      <div>
                        <strong>Lost Person Receipt</strong>

                        <span>
                          {match.receiptConfirmedBy
                            ? `Confirmed by ${
                                match.receiptConfirmedBy?.name || "lost student"
                              }`
                            : "Waiting for receipt confirmation"}
                        </span>

                        {match.receiptConfirmedAt && (
                          <small>
                            {new Date(match.receiptConfirmedAt).toLocaleString(
                              "en-IN",
                            )}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FINAL STATUS */}
                  <div
                    className={
                      match.status === "Returned"
                        ? "admin-final-status returned"
                        : "admin-final-status progress"
                    }
                  >
                    {match.status === "Returned" ? (
                      <>
                        <strong>🎉 Item Returned Successfully</strong>

                        <span>Both students have confirmed the return.</span>
                      </>
                    ) : match.status === "ReturnInProgress" ? (
                      <>
                        <strong>🔄 Return In Progress</strong>

                        <span>
                          The return process is currently being completed.
                        </span>
                      </>
                    ) : match.status === "Rejected" ? (
                      <>
                        <strong>❌ Match Rejected</strong>

                        <span>This possible match was rejected.</span>
                      </>
                    ) : (
                      <>
                        <strong>⏳ Waiting for Lost Person</strong>

                        <span>
                          The lost student has not accepted this match yet.
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminMatches;
