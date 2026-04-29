export default function HomepageMockupPage() {
  return (
    <div className="riq-page">
      <style>{`
        :root,
        .riq-page {
          --riq-blue: #1664e8;
          --riq-text: #0b1830;
          --riq-muted: #65758b;
          --riq-border: #dce5f2;
          --riq-soft-blue: #edf5ff;
          --riq-shadow: 0 18px 50px rgba(18, 45, 82, 0.12);
        }

        .riq-page {
          color: var(--riq-text);
          background: #ffffff;
          line-height: 1.45;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        .riq-container {
          width: min(1160px, calc(100% - 40px));
          margin: 0 auto;
        }

        .riq-navbar {
          height: 78px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e7edf6;
          background: #fff;
        }

        .riq-nav-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 28px;
        }

        .riq-logo {
          font-size: 28px;
          font-weight: 800;
          color: var(--riq-text);
          text-decoration: none;
          white-space: nowrap;
        }

        .riq-logo-img {
          width: 210px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .riq-sidebar-logo-img {
          width: 100px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .riq-footer-logo-img {
          width: 190px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .riq-logo span {
          color: var(--riq-blue);
        }

        .riq-menu {
          display: flex;
          gap: 32px;
          font-size: 14px;
          font-weight: 700;
          flex-wrap: wrap;
        }

        .riq-menu a,
        .riq-learn,
        .riq-source {
          color: var(--riq-text);
          text-decoration: none;
        }

        .riq-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          min-height: 48px;
          padding: 0 26px;
          border-radius: 8px;
          font-weight: 800;
          text-decoration: none;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .riq-btn-primary {
          background: var(--riq-blue);
          color: #fff;
          box-shadow: 0 12px 26px rgba(22, 100, 232, 0.22);
        }

        .riq-btn-outline {
          background: #fff;
          color: var(--riq-text);
          border-color: #8ea2be;
        }

        .riq-btn-dark-outline {
          background: transparent;
          color: #eef4fd;
          border-color: rgba(255, 255, 255, 0.48);
        }

        .riq-hero {
          padding: 56px 0 0;
          background: #fff;
        }

        .riq-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 70px;
          align-items: center;
        }

        .riq-hero h1 {
          font-size: 62px;
          line-height: 1.02;
          letter-spacing: -0.06em;
          margin: 0 0 26px;
        }

        .riq-hero h1 span {
          color: var(--riq-blue);
          display: block;
        }

        .riq-hero p {
          max-width: 560px;
          color: #334155;
          font-size: 21px;
          margin: 0 0 32px;
        }

        .riq-hero-actions {
          display: flex;
          gap: 18px;
          margin-bottom: 34px;
          flex-wrap: wrap;
        }

        .riq-trust-row {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
          color: #1f2f46;
          font-size: 14px;
          font-weight: 700;
        }

        .riq-app-card {
          background: #fff;
          border: 1px solid #dce6f3;
          border-radius: 18px;
          box-shadow: var(--riq-shadow);
          overflow: hidden;
          display: grid;
          grid-template-columns: 155px 1fr;
          min-height: 475px;
        }

        .riq-sidebar {
          background: linear-gradient(180deg, #f8fbff, #f1f6fd);
          border-right: 1px solid #e2eaf5;
          padding: 25px 18px;
        }

        .riq-sidebar-logo {
          margin-bottom: 28px;
        }

        .riq-side-link {
          height: 38px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 750;
          color: #23324a;
          margin-bottom: 8px;
        }

        .riq-side-link.active {
          color: var(--riq-blue);
          background: #e9f2ff;
        }

        .riq-main-preview {
          padding: 26px 30px;
        }

        .riq-preview-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          border-bottom: 1px solid #e3ebf5;
          padding-bottom: 18px;
          margin-bottom: 20px;
        }

        .riq-preview-top h3 {
          margin: 0;
          font-size: 22px;
        }

        .riq-preview-sub {
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .riq-mini-btn {
          border: 1px solid #d5dfed;
          background: #fff;
          border-radius: 7px;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 800;
          margin-left: 8px;
        }

        .riq-timeline-date {
          color: #243449;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .riq-event {
          display: grid;
          grid-template-columns: 20px 1fr;
          gap: 16px;
          position: relative;
          padding-bottom: 24px;
        }

        .riq-event:before {
          content: "";
          position: absolute;
          left: 9px;
          top: 20px;
          bottom: 0;
          width: 2px;
          background: #cfe0f6;
        }

        .riq-event:last-child:before {
          display: none;
        }

        .riq-dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: var(--riq-blue);
          margin-top: 4px;
          box-shadow: 0 0 0 4px #e8f1ff;
          z-index: 2;
        }

        .riq-event h4,
        .riq-section-head h2,
        .riq-feature-card h3,
        .riq-audience-card h3,
        .riq-cta h2,
        .riq-footer h4 {
          margin: 0;
        }

        .riq-event h4 {
          margin-bottom: 4px;
          font-size: 14px;
        }

        .riq-event p {
          margin: 0 0 5px;
          color: #30445f;
          font-size: 12px;
        }

        .riq-source {
          color: var(--riq-blue);
          font-size: 12px;
          font-weight: 800;
        }

        .riq-security-strip {
          background: linear-gradient(90deg, #f2f7ff, #f8fbff, #f2f7ff);
          border-top: 1px solid #e3edf8;
          border-bottom: 1px solid #e3edf8;
          padding: 26px 0;
        }

        .riq-security-grid {
          display: grid;
          grid-template-columns: 1.55fr 1fr 1fr 1fr 1.45fr;
          align-items: center;
          gap: 24px;
        }

        .riq-security-item {
          display: flex;
          align-items: center;
          gap: 14px;
          color: #0b1830;
        }

        .riq-icon-shell {
          display: grid;
          place-items: center;
          color: var(--riq-blue);
          flex: 0 0 auto;
        }

        .riq-icon-shell svg {
          width: 100%;
          height: 100%;
          stroke: currentColor;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2;
        }

        .riq-security-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 10px 24px rgba(17, 44, 81, 0.08);
        }

        .riq-security-copy strong {
          display: block;
          color: #071831;
          font-size: 15px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -0.01em;
        }

        .riq-security-copy span {
          display: block;
          color: #0b1830;
          font-size: 13px;
          line-height: 1.2;
          font-weight: 700;
          margin-top: 2px;
        }

        .riq-security-note {
          color: #0b1830;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 700;
        }

        .riq-section {
          padding: 76px 0;
        }

        .riq-section-head {
          text-align: center;
          max-width: 840px;
          margin: 0 auto 34px;
        }

        .riq-section-head h2 {
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.05;
          letter-spacing: -0.05em;
        }

        .riq-section-head p {
          margin: 14px auto 0;
          max-width: 740px;
          color: #334155;
          font-size: 18px;
        }

        .riq-feature-grid,
        .riq-steps,
        .riq-audience-grid,
        .riq-footer-grid {
          display: grid;
          gap: 20px;
        }

        .riq-feature-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .riq-feature-card,
        .riq-audience-card {
          background: #fff;
          border: 1px solid var(--riq-border);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(17, 44, 81, 0.06);
          display: flex;
          gap: 16px;
        }

        .riq-card-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: var(--riq-soft-blue);
          box-shadow: 0 10px 30px rgba(17, 44, 81, 0.06);
        }

        .riq-card-icon svg {
          width: 26px;
          height: 26px;
        }

        .riq-feature-card h3,
        .riq-audience-card h3 {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .riq-feature-card p,
        .riq-audience-card p,
        .riq-footer p {
          color: #334155;
          margin: 0;
        }

        .riq-steps {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .riq-steps > div {
          background: #fff;
          border: 1px solid var(--riq-border);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(17, 44, 81, 0.06);
        }

        .riq-step-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--riq-soft-blue);
          box-shadow: 0 10px 30px rgba(17, 44, 81, 0.06);
          margin-bottom: 14px;
        }

        .riq-step-circle svg {
          width: 26px;
          height: 26px;
        }

        .riq-step-number {
          color: var(--riq-blue);
          font-weight: 900;
          margin-right: 10px;
        }

        .riq-steps h3 {
          font-size: 18px;
          line-height: 1.2;
          margin-bottom: 10px;
        }

        .riq-audience-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .riq-learn {
          display: inline-block;
          margin-top: 12px;
          color: var(--riq-blue);
          font-weight: 800;
        }

        .riq-cta {
          padding: 42px 0 32px;
          background: linear-gradient(180deg, #173c74 0%, #0f2a54 100%);
          color: #d9e5f8;
        }

        .riq-cta-grid {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding: 0;
        }

        .riq-cta-copy {
          max-width: 600px;
        }

        .riq-cta h2 {
          font-size: clamp(28px, 3vw, 42px);
          line-height: 1.08;
          letter-spacing: -0.05em;
          max-width: 600px;
          margin-bottom: 10px;
          color: #fff;
        }

        .riq-cta p {
          color: #cfe0f7;
          margin: 0;
        }

        .riq-cta-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          flex-direction: column;
          align-items: flex-end;
        }

        .riq-cta-button-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .riq-cta-note-row {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          justify-content: flex-end;
          color: #d9e5f8;
          font-size: 13px;
          font-weight: 700;
        }

        .riq-cta-note {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .riq-cta-note svg {
          width: 15px;
          height: 15px;
          stroke: #7fb4ff;
          fill: none;
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .riq-footer {
          padding: 28px 0 34px;
          background: linear-gradient(180deg, #0f2a54 0%, #091c39 100%);
          color: #d9e5f8;
        }

        .riq-footer-grid {
          grid-template-columns: 1.1fr repeat(3, 0.8fr) 1.2fr;
          align-items: start;
          gap: 14px;
        }

        .riq-footer-grid h4 {
          font-size: 14px;
          margin-bottom: 12px;
          color: #fff;
        }

        .riq-footer-grid a {
          display: block;
          color: #d9e5f8;
          text-decoration: none;
          margin-bottom: 8px;
        }

        .riq-footer-grid p {
          font-size: 14px;
          color: #d9e5f8;
        }

        @media (max-width: 991px) {
          .riq-hero-grid,
          .riq-feature-grid,
          .riq-steps,
          .riq-audience-grid,
          .riq-footer-grid,
          .riq-security-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .riq-cta-grid {
            flex-direction: column;
            align-items: flex-start;
            gap: 18px;
          }
        }

        @media (max-width: 640px) {
          .riq-container {
            width: min(100% - 28px, 1160px);
          }

          .riq-navbar {
            height: auto;
            padding: 14px 0;
          }

          .riq-nav-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .riq-menu {
            gap: 14px;
          }

          .riq-hero {
            padding-top: 34px;
          }

          .riq-hero h1 {
            font-size: 44px;
          }

          .riq-hero-actions,
          .riq-cta-actions {
            flex-direction: column;
            width: 100%;
          }

          .riq-btn {
            width: 100%;
          }

          .riq-app-card,
          .riq-feature-grid,
          .riq-steps,
          .riq-audience-grid,
          .riq-footer-grid,
          .riq-security-grid {
            grid-template-columns: 1fr;
          }

          .riq-sidebar {
            display: none;
          }

          .riq-cta-grid {
            padding: 0;
          }
        }
      `}</style>

      <header className="riq-navbar">
        <div className="riq-container riq-nav-inner">
          <a href="#" className="riq-logo" aria-label="RecordIQ">
            <img
              src="/logo/recordiq-logo.png"
              alt="RecordIQ"
              className="riq-logo-img"
            />
          </a>

          <nav className="riq-menu" aria-label="Primary">
            <a href="#product">Product</a>
            <a href="#solutions">Solutions</a>
            <a href="#security">Security</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
            <a href="#about">About</a>
          </nav>

          <a className="riq-btn riq-btn-primary" href="#upload">
            Get Started
          </a>
        </div>
      </header>

      <main>
        <section className="riq-hero">
          <div className="riq-container riq-hero-grid">
            <div>
              <h1>
                Medical Records.
                <br />
                Organized. Timelined.
                <span>Case-Ready.</span>
              </h1>

              <p>
                RecordIQ turns stacks of medical records into clear,
                chronological timelines and case summaries so you can focus on
                what matters.
              </p>

              <div className="riq-hero-actions">
                <a className="riq-btn riq-btn-primary" href="#upload">
                  Upload Records Free
                </a>
                <a className="riq-btn riq-btn-outline" href="#how-it-works">
                  See How It Works
                </a>
              </div>

              <div className="riq-trust-row">
                <div>HIPAA-Ready Infrastructure</div>
                <div>Secure &amp; Private</div>
                <div>AI-Powered Extraction</div>
              </div>
            </div>

            <div className="riq-app-card">
              <aside className="riq-sidebar">
                <div className="riq-sidebar-logo">
                  <img
                    src="/logo/recordiq-logo.png"
                    alt="RecordIQ"
                    className="riq-sidebar-logo-img"
                  />
                </div>
                <div className="riq-side-link active">Dashboard</div>
                <div className="riq-side-link">Uploads</div>
                <div className="riq-side-link">Timeline</div>
                <div className="riq-side-link">Summary</div>
                <div className="riq-side-link">Documents</div>
                <div className="riq-side-link">Settings</div>
              </aside>

              <div className="riq-main-preview">
                <div className="riq-preview-top">
                  <div>
                    <h3>Case Timeline</h3>
                    <div className="riq-preview-sub">
                      John Doe | Uploaded May 12, 2024
                    </div>
                  </div>
                  <div>
                    <button className="riq-mini-btn">Export</button>
                    <button className="riq-mini-btn">Filters</button>
                  </div>
                </div>

                <div className="riq-timeline-date">May 12, 2024</div>
                <div className="riq-event">
                  <div className="riq-dot" />
                  <div>
                    <h4>Emergency Room Visit</h4>
                    <p>Chief complaint: Severe lower back pain after lifting object.</p>
                    <p>
                      <strong>Diagnosis:</strong> Lumbar strain
                    </p>
                    <a className="riq-source" href="#">
                      Source: page 14
                    </a>
                  </div>
                </div>

                <div className="riq-timeline-date">May 20, 2024</div>
                <div className="riq-event">
                  <div className="riq-dot" />
                  <div>
                    <h4>MRI Lumbar Spine</h4>
                    <p>Findings: Small central disc herniation at L4-L5.</p>
                    <a className="riq-source" href="#">
                      Source: page 28
                    </a>
                  </div>
                </div>

                <div className="riq-timeline-date">June 5, 2024</div>
                <div className="riq-event">
                  <div className="riq-dot" />
                  <div>
                    <h4>Physical Therapy Evaluation</h4>
                    <p>Assessment: Limited range of motion and core weakness.</p>
                    <a className="riq-source" href="#">
                      Source: page 45
                    </a>
                  </div>
                </div>

                <div className="riq-timeline-date">July 10, 2024</div>
                <div className="riq-event">
                  <div className="riq-dot" />
                  <div>
                    <h4>Follow-up Visit</h4>
                    <p>Patient reports improvement in pain. Continue PT.</p>
                    <a className="riq-source" href="#">
                      Source: page 62
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="riq-security-strip">
          <div className="riq-container riq-security-grid">
            <div className="riq-security-item">
              <span className="riq-security-icon riq-icon-shell" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <div className="riq-security-copy">
                <strong>Built for Privacy.</strong>
                <span>Designed for Trust.</span>
              </div>
            </div>

            <div className="riq-security-item">
              <span className="riq-security-icon riq-icon-shell" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4c0 2.2 0 3.7-1 5.2" />
                  <path d="M12 4c0 2.2 0 3.7 1 5.2" />
                  <path d="M9 8.5h6" />
                  <path d="M8 10h8" />
                  <path d="M12 3v18" />
                  <path d="M9.5 13.5c.8-1 1.5-1.8 2.5-1.8s1.7.8 2.5 1.8" />
                </svg>
              </span>
              <div className="riq-security-copy">
                <strong>HIPAA</strong>
                <span>Compliant</span>
              </div>
            </div>

            <div className="riq-security-item">
              <span className="riq-security-icon riq-icon-shell" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>
              </span>
              <div className="riq-security-copy">
                <strong>SOC 2</strong>
                <span>Type II</span>
              </div>
            </div>

            <div className="riq-security-item">
              <span className="riq-security-icon riq-icon-shell" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" />
                </svg>
              </span>
              <div className="riq-security-copy">
                <strong>AES-256</strong>
                <span>Encryption</span>
              </div>
            </div>

            <div className="riq-security-note">
              Your data is always secure, private, and never shared.
            </div>
          </div>
        </section>

        <section id="product" className="riq-section">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>Everything You Need for Stronger Cases</h2>
              <p>
                RecordIQ gives legal and medical professionals the clarity they
                need to build stronger, faster, and more confident cases.
              </p>
            </div>

            <div className="riq-feature-grid">
              <div className="riq-feature-card">
                <div className="riq-card-icon riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
                    <path d="M14 2v5h5" />
                    <path d="M12 15V9" />
                    <path d="M9.5 11.5 12 9l2.5 2.5" />
                  </svg>
                </div>
                <div>
                  <h3>Precise, Secure Extraction</h3>
                  <p>
                    AI extracts key medical facts from records with structure,
                    speed, and security.
                  </p>
                </div>
              </div>

              <div className="riq-feature-card">
                <div className="riq-card-icon riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 5h10" />
                    <circle cx="5" cy="7" r="1" />
                    <circle cx="5" cy="12" r="1" />
                    <circle cx="5" cy="17" r="1" />
                    <path d="M7 7h10" />
                    <path d="M7 12h10" />
                    <path d="M7 17h10" />
                  </svg>
                </div>
                <div>
                  <h3>Chronological Timeline</h3>
                  <p>All events are arranged in order with source page references.</p>
                </div>
              </div>

              <div className="riq-feature-card">
                <div className="riq-card-icon riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5" />
                    <path d="M8 11h8" />
                    <path d="M8 15h8" />
                    <path d="M8 19h5" />
                  </svg>
                </div>
                <div>
                  <h3>Case Summary</h3>
                  <p>
                    AI-generated summaries highlight key events, diagnoses, and
                    treatments.
                  </p>
                </div>
              </div>

              <div className="riq-feature-card">
                <div className="riq-card-icon riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v11" />
                    <path d="M8.5 11 12 14.5 15.5 11" />
                    <path d="M5 16h14" />
                    <path d="M7 16v3h10v-3" />
                  </svg>
                </div>
                <div>
                  <h3>Export &amp; Share</h3>
                  <p>Export timelines and summaries for your case in seconds.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="riq-section" style={{ background: "#f8fbff" }}>
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>How RecordIQ Works</h2>
            </div>

            <div className="riq-steps">
              <div>
                <div className="riq-step-circle riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 15h10" />
                    <path d="M12 5v10" />
                    <path d="M9 8l3-3 3 3" />
                    <path d="M5 19h14" />
                  </svg>
                </div>
                <h3>
                  <span className="riq-step-number">1</span>Upload Your Records
                </h3>
                <p>Drag &amp; drop your medical records. We support PDF files of any size.</p>
              </div>

              <div>
                <div className="riq-step-circle riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="3" width="10" height="16" rx="2" />
                    <circle cx="15.5" cy="15.5" r="3.5" />
                    <path d="M18 18l3 3" />
                  </svg>
                </div>
                <h3>
                  <span className="riq-step-number">2</span>AI Identifies Key Facts
                </h3>
                <p>
                  Our AI pulls out the important medical events, diagnoses,
                  treatments, and dates.
                </p>
              </div>

              <div>
                <div className="riq-step-circle riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h10" />
                    <path d="M7 12h10" />
                    <path d="M7 17h7" />
                    <circle cx="5" cy="7" r="1" />
                    <circle cx="5" cy="12" r="1" />
                    <circle cx="5" cy="17" r="1" />
                  </svg>
                </div>
                <h3>
                  <span className="riq-step-number">3</span>Review Your Timeline
                </h3>
                <p>See your records in a clear timeline with source page references.</p>
              </div>

              <div>
                <div className="riq-step-circle riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
                    <path d="M14 3v5h5" />
                    <circle cx="17" cy="16" r="3" />
                    <path d="M17 13v3h3" />
                  </svg>
                </div>
                <h3>
                  <span className="riq-step-number">4</span>Export &amp; Build Your Case
                </h3>
                <p>Download summaries or share with your team securely.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="solutions" className="riq-section">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>Built for Professionals Who Build Strong Cases</h2>
            </div>

            <div className="riq-audience-grid">
              <div className="riq-audience-card">
                <div className="riq-card-icon riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 7h14" />
                    <path d="M7 7l-2 7h4l-2-7z" />
                    <path d="M17 7l-2 7h4l-2-7z" />
                    <path d="M12 7v10" />
                    <path d="M9 17h6" />
                  </svg>
                </div>
                <div>
                  <h3>Personal Injury Attorneys</h3>
                  <p>Save hours. Understand records faster. Build stronger cases.</p>
                  <a className="riq-learn" href="#">
                    Learn more &rarr;
                  </a>
                </div>
              </div>

              <div className="riq-audience-card">
                <div className="riq-card-icon riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="3.5" />
                    <path d="M6.5 21a5.5 5.5 0 0 1 11 0" />
                    <path d="M12 10.5V18" />
                  </svg>
                </div>
                <div>
                  <h3>Medical Professionals</h3>
                  <p>Quickly review patient histories and treatment timelines.</p>
                  <a className="riq-learn" href="#">
                    Learn more &rarr;
                  </a>
                </div>
              </div>

              <div className="riq-audience-card">
                <div className="riq-card-icon riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 4c0 3 6 3 6 0" />
                    <path d="M8 7h8" />
                    <path d="M8 7v3a4 4 0 0 0 8 0V7" />
                    <path d="M10 14c0 3-2 3-2 5" />
                    <path d="M14 14c0 3 2 3 2 5" />
                  </svg>
                </div>
                <div>
                  <h3>Medical Experts</h3>
                  <p>
                    Review complex records, clarify medical findings, and
                    support case strategy with organized source-backed timelines.
                  </p>
                  <a className="riq-learn" href="#">
                    Learn more &rarr;
                  </a>
                </div>
              </div>

              <div className="riq-audience-card">
                <div className="riq-card-icon riq-icon-shell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3>Insurance &amp; Claims</h3>
                  <p>Streamline review. Reduce back-and-forth. Speed decisions.</p>
                  <a className="riq-learn" href="#">
                    Learn more &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="riq-cta">
          <div className="riq-container riq-cta-grid">
            <div className="riq-cta-copy">
              <h2>Ready to Save Time and Build Stronger Cases?</h2>
              <p>
                Join professionals who trust RecordIQ to turn medical records
                into clarity.
              </p>
            </div>

            <div className="riq-cta-actions">
              <div className="riq-cta-button-row">
                <a className="riq-btn riq-btn-primary" href="#upload">
                  Upload Records Free
                </a>
                <a className="riq-btn riq-btn-dark-outline" href="#demo">
                  Book a Demo
                </a>
              </div>

              <div className="riq-cta-note-row" aria-label="Getting started notes">
                <span className="riq-cta-note">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  No credit card required
                </span>
                <span className="riq-cta-note">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Free to get started
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="riq-footer">
        <div className="riq-container riq-footer-grid">
          <div>
            <a href="#" className="riq-logo" aria-label="RecordIQ">
              <img
                src="/logo/recordiq-logo.png"
                alt="RecordIQ"
                className="riq-footer-logo-img"
              />
            </a>
          </div>

          <div>
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Updates</a>
          </div>

          <div>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Security</a>
            <a href="#">Careers</a>
          </div>

          <div>
            <h4>Resources</h4>
            <a href="#">Help Center</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>

          <div>
            <h4>Secure. Private. Compliant.</h4>
            <p>© 2024 RecordIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
