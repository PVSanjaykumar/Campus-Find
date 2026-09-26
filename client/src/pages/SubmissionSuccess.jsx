import { Link, useLocation } from "react-router-dom";

function SubmissionSuccess() {
  const location = useLocation();

  const itemType = location.state?.itemType || "Lost";

  return (
    <div className="success-page">

      <div className="success-card">

        <div className="success-icon">
          ✓
        </div>

        <h1>Item Submitted Successfully!</h1>

        <p className="success-main-text">
          Your {itemType.toLowerCase()} item has been submitted
          successfully.
        </p>

        <div className="review-box">
          <div className="review-icon">
            🕐
          </div>

          <div>
            <h3>Waiting for Admin Review</h3>

            <p>
              Your report will be reviewed by the campus
              administrator before it becomes visible to others.
            </p>
          </div>
        </div>

        <div className="success-actions">

          <Link
            to="/"
            className="btn btn-secondary"
          >
            🏠 Go Home
          </Link>

          <Link
            to="/browse"
            className="btn btn-primary"
          >
            🔎 Browse Items
          </Link>

        </div>

      </div>

    </div>
  );
}

export default SubmissionSuccess;