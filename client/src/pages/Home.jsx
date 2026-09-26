import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎓 Your Campus Community</div>

          <h1>
            Lost something?
            <span> Let's find it.</span>
          </h1>

          <p className="hero-description">
            A simple and smart way to report lost items, report found items, and
            help reunite belongings with their owners on campus.
          </p>

          <div className="hero-buttons">
            <Link to="/report-lost" className="btn btn-primary hero-btn">
              📢 Report Lost Item
            </Link>

            <Link to="/report-found" className="btn btn-outline hero-btn">
              🤝 Report Found Item
            </Link>
          </div>

          <Link to="/browse" className="browse-link">
            🔎 Browse recently reported items →
          </Link>
        </div>

        <div className="hero-visual">
          <div className="visual-circle"></div>

          <div className="floating-card card-one">
            📱
            <div>
              <strong>Lost Phone</strong>
              <small>Library</small>
            </div>
          </div>

          <div className="floating-card card-two">
            🎒
            <div>
              <strong>Found Bag</strong>
              <small>Academic Block</small>
            </div>
          </div>

          <div className="main-illustration">🔍</div>
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>Finding lost belongings made simple</h2>
          <p>Three simple steps to help items find their way back home.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📢</div>
            <h3>Report</h3>
            <p>Tell the campus community about an item you've lost or found.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔎</div>
            <h3>Discover</h3>
            <p>Browse approved lost and found reports from around campus.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Reconnect</h3>
            <p>Help return belongings to their rightful owners.</p>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span>💙 CAMPUS COMMUNITY</span>
          <h2>Found something that isn't yours?</h2>
          <p>Your small action could make someone's day.</p>
        </div>

        <Link to="/report-found" className="btn btn-white">
          Report a Found Item →
        </Link>
      </section>
    </div>
  );
}

export default Home;
