export default function HomepageMockupPage() {
  return (
    <div className="riq-page">
      <style>{`
        :root {
          --riq-text: #0b1b3f;
          --riq-text-soft: #4f607d;
          --riq-blue: #2468f2;
          --riq-blue-2: #1d5be7;
          --riq-border: #dbe6f6;
          --riq-soft: #f4f8ff;
          --riq-soft-2: #eef5ff;
          --riq-white: #ffffff;
          --riq-navy: #071b3b;
          --riq-navy-2: #0b2d66;
          --riq-shadow: 0 18px 50px rgba(15, 42, 87, 0.12);
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: var(--riq-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .riq-page {
          background: #ffffff;
          color: var(--riq-text);
        }

        .riq-container {
          width: min(1200px, calc(100% - 48px));
          margin: 0 auto;
        }

        .riq-topbar {
          border-bottom: 1px solid var(--riq-border);
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .riq-nav {
          min-height: 88px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .riq-logo-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 0 0 auto;
        }

        .riq-logo {
          display: block;
          height: 44px;
          width: auto;
          object-fit: contain;
        }

        .riq-logo-small {
          display: block;
          height: 30px;
          width: auto;
          object-fit: contain;
        }

        .riq-nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .riq-nav-links a {
          font-size: 16px;
          font-weight: 600;
          color: var(--riq-text);
        }

        .riq-nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 0 0 auto;
        }

        .riq-login {
          font-size: 15px;
          font-weight: 600;
          color: var(--riq-text);
        }

        .riq-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 54px;
          border-radius: 12px;
          padding: 0 26px;
          font-size: 16px;
          font-weight: 700;
          border: 1px solid transparent;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          cursor: pointer;
        }

        .riq-btn:hover {
          transform: translateY(-1px);
        }

        .riq-btn-primary {
          background: linear-gradient(180deg, #2c74ff 0%, #2468f2 100%);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(36, 104, 242, 0.18);
        }

        .riq-btn-secondary {
          background: #ffffff;
          color: var(--riq-text);
          border-color: #b8cae8;
        }

        .riq-btn-outline-dark {
          background: transparent;
          color: #ffffff;
          border-color: rgba(255,255,255,0.45);
        }

        .riq-hero {
          padding: 46px 0 26px;
          background: #ffffff;
        }

        .riq-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(520px, 0.98fr);
          gap: 52px;
          align-items: center;
        }

        .riq-hero-copy h1 {
          margin: 0 0 24px;
          font-size: clamp(50px, 5.7vw, 78px);
          line-height: 0.98;
          letter-spacing: -0.05em;
          font-weight: 700;
          color: var(--riq-text);
        }

        .riq-hero-copy .accent {
          color: var(--riq-blue);
        }

        .riq-hero-copy p {
          max-width: 650px;
          margin: 0 0 28px;
          color: var(--riq-text-soft);
          font-size: 18px;
          line-height: 1.55;
          font-weight: 500;
        }

        .riq-hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }

        .riq-mini-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          align-items: center;
          color: var(--riq-text-soft);
          font-size: 14px;
          font-weight: 600;
        }

        .riq-mini-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .riq-mini-trust-item svg {
          width: 18px;
          height: 18px;
          color: #627799;
          flex: 0 0 auto;
        }

        .riq-mock {
          background: #ffffff;
          border: 1px solid var(--riq-border);
          border-radius: 24px;
          box-shadow: var(--riq-shadow);
          overflow: hidden;
          min-height: 540px;
          display: grid;
          grid-template-columns: 175px 1fr;
        }

        .riq-mock-sidebar {
          background: linear-gradient(180deg, #f7fbff 0%, #f5f8fe 100%);
          border-right: 1px solid var(--riq-border);
          padding: 22px 18px;
        }

        .riq-mock-logo {
          margin-bottom: 18px;
        }

        .riq-mock-nav {
          display: grid;
          gap: 8px;
        }

        .riq-mock-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 44px;
          padding: 0 10px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #4a5a78;
        }

        .riq-mock-nav-item.active {
          background: #eaf1ff;
          color: var(--riq-blue);
        }

        .riq-mock-nav-item svg {
          width: 18px;
          height: 18px;
          color: currentColor;
          flex: 0 0 auto;
        }

        .riq-mock-main {
          padding: 24px 26px;
          background: #ffffff;
        }

        .riq-mock-head {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--riq-border);
          margin-bottom: 18px;
        }

        .riq-mock-head h3 {
          margin: 0 0 6px;
          font-size: 24px;
          line-height: 1.1;
          font-weight: 700;
          color: var(--riq-text);
        }

        .riq-mock-head p {
          margin: 0;
          color: #60718d;
          font-size: 12px;
          font-weight: 600;
        }

        .riq-mock-head-actions {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .riq-mock-chip {
          min-height: 40px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #cbd8ee;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          color: var(--riq-text);
          background: #ffffff;
        }

        .riq-timeline {
          position: relative;
          display: grid;
          gap: 22px;
          padding-left: 8px;
        }

        .riq-timeline-item {
          position: relative;
          padding-left: 46px;
        }

        .riq-timeline-item::before {
          content: "";
          position: absolute;
          left: 10px;
          top: 26px;
          bottom: -28px;
          width: 2px;
          background: #c9daf8;
        }

        .riq-timeline-item:last-child::before {
          display: none;
        }

        .riq-timeline-dot {
          position: absolute;
          left: 0;
          top: 24px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--riq-blue);
          border: 4px solid #dcebff;
          box-shadow: 0 0 0 2px #ffffff;
        }

        .riq-timeline-date {
          font-size: 14px;
          font-weight: 700;
          color: #3e4f6d;
          margin-bottom: 8px;
        }

        .riq-timeline-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--riq-text);
          margin: 0 0 6px;
        }

        .riq-timeline-body {
          margin: 0 0 6px;
          font-size: 13px;
          line-height: 1.45;
          color: #586983;
        }

        .riq-timeline-source {
          font-size: 13px;
          font-weight: 700;
          color: var(--riq-blue);
        }

        .riq-security-strip {
          background: linear-gradient(180deg, #f7fbff 0%, #f3f8ff 100%);
          border-top: 1px solid #edf4fe;
          border-bottom: 1px solid #edf4fe;
        }

        .riq-security-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
          align-items: center;
          padding: 16px 0;
        }

        .riq-security-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .riq-security-icon {
          width: 54px;
          height: 54px;
          color: #071831;
          flex: 0 0 auto;
        }

        .riq-security-item:first-child .riq-security-icon {
          color: var(--riq-blue);
        }

        .riq-security-icon svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .riq-security-item strong {
          display: block;
          font-size: 15px;
          line-height: 1.28;
          font-weight: 700;
          color: var(--riq-text);
        }

        .riq-security-item span {
          display: block;
          font-size: 15px;
          line-height: 1.35;
          color: #4d5f7b;
          font-weight: 600;
        }

        .riq-section {
          padding: 56px 0;
          background: #ffffff;
        }

        .riq-section-soft {
          background: linear-gradient(180deg, #fbfdff 0%, #f7fbff 100%);
        }

        .riq-section-head {
          text-align: center;
          max-width: 860px;
          margin: 0 auto 34px;
        }

        .riq-section-head h2 {
          margin: 0 0 12px;
          font-size: clamp(34px, 4vw, 54px);
          line-height: 1.05;
          letter-spacing: -0.045em;
          color: var(--riq-text);
          font-weight: 700;
        }

        .riq-section-head p {
          margin: 0 auto;
          max-width: 760px;
          color: var(--riq-text-soft);
          font-size: 17px;
          line-height: 1.55;
          font-weight: 500;
        }

        .riq-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .riq-card {
          background: #ffffff;
          border: 1px solid var(--riq-border);
          border-radius: 18px;
          box-shadow: 0 8px 22px rgba(17, 44, 81, 0.04);
        }

        .riq-feature-card {
          padding: 22px;
          display: grid;
          grid-template-columns: 66px 1fr;
          gap: 18px;
          align-items: start;
          min-height: 168px;
        }

        .riq-card-icon {
          width: 62px;
          height: 62px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: #edf5ff;
          color: var(--riq-blue);
        }

        .riq-card-icon svg {
          width: 42px;
          height: 42px;
          display: block;
        }

        .riq-audience-card .riq-card-icon {
          width: 66px;
          height: 66px;
        }

        .riq-audience-card .riq-card-icon svg {
          width: 44px;
          height: 44px;
        }

        .riq-feature-card h3 {
          margin: 2px 0 8px;
          font-size: 16px;
          line-height: 1.3;
          font-weight: 700;
          color: var(--riq-text);
        }

        .riq-feature-card p {
          margin: 0;
          color: #5d6f8b;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 500;
        }

        .riq-works-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-top: 22px;
        }

        .riq-step-card {
          text-align: left;
          padding: 16px 12px 0;
          position: relative;
        }

        .riq-step-card::after {
          content: "";
          position: absolute;
          top: 44px;
          right: -16px;
          width: 32px;
          border-top: 2px dotted #bcd3fb;
        }

        .riq-step-card:last-child::after {
          display: none;
        }

        .riq-step-icon {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: #edf5ff;
          color: var(--riq-blue);
          display: grid;
          place-items: center;
          margin: 0 auto 16px;
        }

        .riq-step-icon svg {
          width: 48px;
          height: 48px;
          display: block;
        }

        .riq-step-meta {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .riq-step-num {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--riq-blue);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .riq-step-copy h3 {
          margin: 0 0 6px;
          font-size: 16px;
          line-height: 1.35;
          font-weight: 700;
          color: var(--riq-text);
        }

        .riq-step-copy p {
          margin: 0;
          color: #5b6d88;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 500;
        }

        .riq-audience-card {
          padding: 24px;
          display: grid;
          grid-template-columns: 58px 1fr;
          gap: 18px;
          align-items: start;
          min-height: 188px;
        }

        .riq-audience-card h3 {
          margin: 2px 0 8px;
          font-size: 16px;
          line-height: 1.35;
          font-weight: 700;
          color: var(--riq-text);
        }

        .riq-audience-card p {
          margin: 0 0 14px;
          color: #5d6f8b;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 500;
        }

        .riq-learn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--riq-blue);
          font-size: 15px;
          font-weight: 700;
        }

        .riq-dark-band {
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #123b7d 0%, #0b2d66 42%, #08244f 100%);
          color: #ffffff;
          margin-top: 10px;
        }

        .riq-dark-band::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 22% 10%, rgba(73, 138, 255, 0.13), transparent 38%),
            radial-gradient(circle at 82% 20%, rgba(64, 132, 255, 0.08), transparent 30%),
            linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0));
          pointer-events: none;
        }

        .riq-footer-dots {
          position: absolute;
          right: 14px;
          bottom: 8px;
          width: 200px;
          height: 138px;
          background-image: radial-gradient(rgba(74, 145, 255, 0.5) 1.5px, transparent 1.5px);
          background-size: 14px 14px;
          opacity: 0.5;
          pointer-events: none;
        }

        .riq-dark-inner {
          position: relative;
          z-index: 1;
          padding: 16px 0 10px;
        }

        .riq-cta-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 26px;
          align-items: center;
          padding-bottom: 4px;
        }

        .riq-cta-copy h2 {
          margin: 0 0 10px;
          color: #ffffff;
          font-size: clamp(36px, 4vw, 56px);
          line-height: 1.04;
          letter-spacing: -0.05em;
          font-weight: 700;
          max-width: 620px;
        }

        .riq-cta-copy p {
          margin: 0;
          color: rgba(255,255,255,0.85);
          font-size: 17px;
          line-height: 1.5;
          font-weight: 500;
          max-width: 620px;
        }

        .riq-cta-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .riq-cta-buttons {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .riq-cta-points {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: flex-end;
          color: rgba(255,255,255,0.9);
          font-size: 12px;
          font-weight: 600;
        }

        .riq-cta-points span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .riq-divider {
          border-top: 1px solid rgba(255,255,255,0.14);
          margin-bottom: 8px;
        }

        .riq-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 0.9fr 0.9fr 0.9fr 1.1fr;
          gap: 16px;
          align-items: start;
        }

        .riq-footer-brand {
          padding-top: 6px;
        }

        .riq-footer-brand .riq-logo {
          height: 38px;
        }

        .riq-footer-col h4,
        .riq-footer-legal h4 {
          margin: 0 0 14px;
          font-size: 15px;
          line-height: 1.2;
          font-weight: 700;
          color: #ffffff;
        }

        .riq-footer-col {
          display: grid;
          gap: 12px;
        }

        .riq-footer-col a {
          color: rgba(255,255,255,0.88);
          font-size: 15px;
          font-weight: 500;
        }

        .riq-footer-legal p {
          margin: 0;
          color: rgba(255,255,255,0.88);
          font-size: 15px;
          line-height: 1.55;
          font-weight: 500;
        }

        .riq-hide-mobile {
          display: inline;
        }

        @media (max-width: 1120px) {
          .riq-hero-grid,
          .riq-cta-grid,
          .riq-footer-grid {
            grid-template-columns: 1fr;
          }

          .riq-security-grid,
          .riq-grid-4,
          .riq-works-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .riq-cta-actions {
            align-items: flex-start;
          }

          .riq-cta-buttons,
          .riq-cta-points {
            justify-content: flex-start;
          }

          .riq-footer-dots {
            width: 130px;
            height: 100px;
          }
        }

        @media (max-width: 860px) {
          .riq-container {
            width: min(100% - 28px, 1200px);
          }

          .riq-nav {
            min-height: auto;
            padding: 18px 0;
            flex-wrap: wrap;
          }

          .riq-nav-links {
            order: 3;
            width: 100%;
            justify-content: flex-start;
            gap: 18px;
          }

          .riq-nav-actions {
            margin-left: auto;
          }

          .riq-hero-copy h1 {
            font-size: clamp(42px, 9vw, 58px);
          }

          .riq-mock {
            grid-template-columns: 150px 1fr;
            min-height: auto;
          }

          .riq-security-grid,
          .riq-grid-4,
          .riq-works-grid,
          .riq-footer-grid {
            grid-template-columns: 1fr;
          }

          .riq-step-card::after {
            display: none;
          }

          .riq-security-item {
            min-height: auto;
          }

          .riq-hide-mobile {
            display: none;
          }
        }
      `}</style>

      <header className="riq-topbar">
        <div className="riq-container riq-nav">
          <a className="riq-logo-wrap" href="#">
            <img className="riq-logo" src="/logo/recordiq-logo.png" alt="RecordIQ" />
          </a>

          <nav className="riq-nav-links">
            <a href="#">Product</a>
            <a href="#">Solutions</a>
            <a href="#">Security</a>
            <a href="#">Pricing</a>
            <a href="#">Resources</a>
            <a href="#">About</a>
          </nav>

          <div className="riq-nav-actions">
            <a className="riq-login riq-hide-mobile" href="#">
              Log in
            </a>
            <a className="riq-btn riq-btn-primary" href="#">
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="riq-hero">
          <div className="riq-container riq-hero-grid">
            <div className="riq-hero-copy">
              <h1>
                Medical Records.
                <br />
                Organized. Timelined.
                <br />
                <span className="accent">Case-Ready.</span>
              </h1>

              <p>
                RecordIQ turns stacks of medical records into clear, chronological
                timelines and case summaries so you can focus on what matters.
              </p>

              <div className="riq-hero-actions">
                <a className="riq-btn riq-btn-primary" href="#">
                  Upload Records Free
                </a>
                <a className="riq-btn riq-btn-secondary" href="#">
                  See How It Works
                </a>
              </div>

              <div className="riq-mini-trust">
                <span className="riq-mini-trust-item">
                  <ShieldCheckMini />
                  HIPAA Compliant
                </span>
                <span className="riq-mini-trust-item">
                  <LockMini />
                  Secure &amp; Private
                </span>
                <span className="riq-mini-trust-item">
                  <CloudMini />
                  AI-Powered Extraction
                </span>
              </div>
            </div>

            <div className="riq-mock">
              <aside className="riq-mock-sidebar">
                <div className="riq-mock-logo">
                  <img
                    className="riq-logo-small"
                    src="/logo/recordiq-logo.png"
                    alt="RecordIQ"
                  />
                </div>

                <div className="riq-mock-nav">
                  <div className="riq-mock-nav-item active">
                    <HomeLineIcon />
                    Dashboard
                  </div>
                  <div className="riq-mock-nav-item">
                    <UploadLineIcon />
                    Uploads
                  </div>
                  <div className="riq-mock-nav-item">
                    <TimelineLineIcon />
                    Timeline
                  </div>
                  <div className="riq-mock-nav-item">
                    <DocLineIcon />
                    Summary
                  </div>
                  <div className="riq-mock-nav-item">
                    <DocLineIcon />
                    Documents
                  </div>
                  <div className="riq-mock-nav-item">
                    <GearLineIcon />
                    Settings
                  </div>
                </div>
              </aside>

              <div className="riq-mock-main">
                <div className="riq-mock-head">
                  <div>
                    <h3>Case Timeline</h3>
                    <p>John Doe | Uploaded May 12, 2024</p>
                  </div>

                  <div className="riq-mock-head-actions">
                    <div className="riq-mock-chip">Export</div>
                    <div className="riq-mock-chip">Filters</div>
                  </div>
                </div>

                <div className="riq-timeline">
                  <div className="riq-timeline-item">
                    <div className="riq-timeline-dot" />
                    <div className="riq-timeline-date">May 12, 2024</div>
                    <div className="riq-timeline-title">Emergency Room Visit</div>
                    <p className="riq-timeline-body">
                      Chief complaint: Severe lower back pain after lifting object.
                    </p>
                    <p className="riq-timeline-body">
                      <strong>Diagnosis:</strong> Lumbar strain
                    </p>
                    <div className="riq-timeline-source">Source: page 14</div>
                  </div>

                  <div className="riq-timeline-item">
                    <div className="riq-timeline-dot" />
                    <div className="riq-timeline-date">May 20, 2024</div>
                    <div className="riq-timeline-title">MRI Lumbar Spine</div>
                    <p className="riq-timeline-body">
                      Findings: Small central disc herniation at L4-L5.
                    </p>
                    <div className="riq-timeline-source">Source: page 28</div>
                  </div>

                  <div className="riq-timeline-item">
                    <div className="riq-timeline-dot" />
                    <div className="riq-timeline-date">June 5, 2024</div>
                    <div className="riq-timeline-title">Physical Therapy Evaluation</div>
                    <p className="riq-timeline-body">
                      Assessment: Limited range of motion and core weakness.
                    </p>
                    <div className="riq-timeline-source">Source: page 45</div>
                  </div>

                  <div className="riq-timeline-item">
                    <div className="riq-timeline-dot" />
                    <div className="riq-timeline-date">July 10, 2024</div>
                    <div className="riq-timeline-title">Follow-up Visit</div>
                    <p className="riq-timeline-body">
                      Patient reports improvement in pain. Continue PT.
                    </p>
                    <div className="riq-timeline-source">Source: page 62</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="riq-security-strip">
  <div className="riq-container riq-security-grid">
    <div className="riq-security-item">
      <div className="riq-security-icon">
        <ShieldCheckIcon />
      </div>
      <div>
        <strong>Built for Privacy.</strong>
        <span>Designed for Trust.</span>
      </div>
    </div>

    <div className="riq-security-item">
      <div className="riq-security-icon">
        <CaduceusIcon />
      </div>
      <div>
        <strong>HIPAA</strong>
        <span>COMPLIANT</span>
      </div>
    </div>

    <div className="riq-security-item">
      <div className="riq-security-icon">
        <LockIcon />
      </div>
      <div>
        <strong>SOC 2</strong>
        <span>TYPE II</span>
      </div>
    </div>

    <div className="riq-security-item">
      <div className="riq-security-icon">
        <ShieldIcon />
      </div>
      <div>
        <strong>AES-256</strong>
        <span>ENCRYPTION</span>
      </div>
    </div>

    <div className="riq-security-item">
      <div>
        <strong>Your data is always secure,</strong>
        <span>private, and never shared.</span>
      </div>
    </div>
  </div>
</section>

        <section className="riq-section">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>Everything You Need for Stronger Cases</h2>
              <p>
                RecordIQ gives legal and medical professionals the clarity they
                need to build stronger, faster, and more confident cases.
              </p>
            </div>

            <div className="riq-grid-4">
  <div className="riq-card riq-feature-card">
    <div className="riq-card-icon">
      <DocumentUploadIcon />
    </div>
    <div>
      <h3>Upload &amp; Extract</h3>
      <p>Securely upload PDFs. We extract and organize every record.</p>
    </div>
  </div>

  <div className="riq-card riq-feature-card">
    <div className="riq-card-icon">
      <BulletedTimelineIcon />
    </div>
    <div>
      <h3>Chronological Timeline</h3>
      <p>All events are arranged in order with source page references.</p>
    </div>
  </div>

  <div className="riq-card riq-feature-card">
    <div className="riq-card-icon">
      <SummaryLinesIcon />
    </div>
    <div>
      <h3>Case Summary</h3>
      <p>AI-generated summaries highlight key events, diagnoses, and treatments.</p>
    </div>
  </div>

  <div className="riq-card riq-feature-card">
    <div className="riq-card-icon">
      <ExportIcon />
    </div>
    <div>
      <h3>Export &amp; Share</h3>
      <p>Export timelines and summaries for your case in seconds.</p>
    </div>
  </div>
</div>
          </div>
        </section>

        <section className="riq-section riq-section-soft">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>How RecordIQ Works</h2>
            </div>

            <div className="riq-works-grid">
  <div className="riq-step-card">
    <div className="riq-step-icon">
      <CloudUploadIcon />
    </div>
    <div className="riq-step-meta">
      <span className="riq-step-num">1</span>
      <div className="riq-step-copy">
        <h3>Upload Your Records</h3>
        <p>Drag &amp; drop your medical records. We support PDF files of any size.</p>
      </div>
    </div>
  </div>

  <div className="riq-step-card">
    <div className="riq-step-icon">
      <DocumentSearchIcon />
    </div>
    <div className="riq-step-meta">
      <span className="riq-step-num">2</span>
      <div className="riq-step-copy">
        <h3>We Extract &amp; Organize</h3>
        <p>Our AI extracts the important information and organizes it chronologically.</p>
      </div>
    </div>
  </div>

  <div className="riq-step-card">
    <div className="riq-step-icon">
      <ChecklistIcon />
    </div>
    <div className="riq-step-meta">
      <span className="riq-step-num">3</span>
      <div className="riq-step-copy">
        <h3>Review Your Timeline</h3>
        <p>See your records in a clear timeline with source page references.</p>
      </div>
    </div>
  </div>

  <div className="riq-step-card">
    <div className="riq-step-icon">
      <DocumentExportIcon />
    </div>
    <div className="riq-step-meta">
      <span className="riq-step-num">4</span>
      <div className="riq-step-copy">
        <h3>Export &amp; Build Your Case</h3>
        <p>Download summaries or share with your team securely.</p>
      </div>
    </div>
  </div>
</div>
          </div>
        </section>

        <section className="riq-section">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>Built for Professionals Who Build Strong Cases</h2>
            </div>

            <div className="riq-grid-4">
  <div className="riq-card riq-audience-card">
    <div className="riq-card-icon">
      <ScalesIcon />
    </div>
    <div>
      <h3>Personal Injury Attorneys</h3>
      <p>Save hours. Understand records faster. Build stronger cases.</p>
      <a className="riq-learn" href="#">
        Learn more →
      </a>
    </div>
  </div>

  <div className="riq-card riq-audience-card">
    <div className="riq-card-icon">
      <DoctorIcon />
    </div>
    <div>
      <h3>Medical Professionals</h3>
      <p>Quickly review patient histories and treatment timelines.</p>
      <a className="riq-learn" href="#">
        Learn more →
      </a>
    </div>
  </div>

  <div className="riq-card riq-audience-card">
    <div className="riq-card-icon">
      <StethoscopeIcon />
    </div>
    <div>
      <h3>Medical Experts</h3>
      <p>
        Review complex records, clarify medical findings, and support case
        strategy with organized source-backed timelines.
      </p>
      <a className="riq-learn" href="#">
        Learn more →
      </a>
    </div>
  </div>

  <div className="riq-card riq-audience-card">
    <div className="riq-card-icon">
      <ShieldCheckIcon />
    </div>
    <div>
      <h3>Insurance &amp; Claims</h3>
      <p>Streamline review. Reduce back-and-forth. Speed decisions.</p>
      <a className="riq-learn" href="#">
        Learn more →
      </a>
    </div>
  </div>
</div>
          </div>
        </section>
      </main>

      <section className="riq-dark-band">
        <div className="riq-footer-dots" />

        <div className="riq-container riq-dark-inner">
          <div className="riq-cta-grid">
            <div className="riq-cta-copy">
              <h2>Ready to Save Time and Build Stronger Cases?</h2>
              <p>
                Join professionals who trust RecordIQ to turn medical records
                into clarity.
              </p>
            </div>

            <div className="riq-cta-actions">
              <div className="riq-cta-buttons">
                <a className="riq-btn riq-btn-primary" href="#">
                  Upload Records Free
                </a>
                <a className="riq-btn riq-btn-outline-dark" href="#">
                  Book a Demo
                </a>
              </div>

              <div className="riq-cta-points">
                <span>
                  <CheckMini />
                  No credit card required
                </span>
                <span>
                  <CheckMini />
                  Free to get started
                </span>
              </div>
            </div>
          </div>

          <div className="riq-divider" />

          <div className="riq-footer-grid">
            <div className="riq-footer-brand">
              <img className="riq-logo" src="/logo/recordiq-logo.png" alt="RecordIQ" />
            </div>

            <div className="riq-footer-col">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Updates</a>
            </div>

            <div className="riq-footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Security</a>
              <a href="#">Careers</a>
            </div>

            <div className="riq-footer-col">
              <h4>Resources</h4>
              <a href="#">Help Center</a>
              <a href="#">Blog</a>
              <a href="#">Contact</a>
            </div>

            <div className="riq-footer-legal">
              <h4>Secure. Private. Compliant.</h4>
              <p>© 2024 RecordIQ. All rights reserved.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function IconBase({ children }: { children: any }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
function ShieldCheckMini() {
  return (
    <IconBase>
      <path d="M12 3.5 18.5 6v5.7c0 4.6-2.8 7.8-6.5 9-3.7-1.2-6.5-4.4-6.5-9V6L12 3.5Z" />
      <path d="m9.2 12.1 1.9 1.9 3.8-4.2" />
    </IconBase>
  );
}

function LockMini() {
  return (
    <IconBase>
      <rect x="5.5" y="10" width="13" height="10" rx="2.2" />
      <path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10" />
    </IconBase>
  );
}

function CloudMini() {
  return (
    <IconBase>
      <path d="M7 18h9a4 4 0 0 0 .6-7.95A5.2 5.2 0 0 0 6.6 9.2 3.6 3.6 0 0 0 7 18Z" />
    </IconBase>
  );
}

function CheckMini() {
  return (
    <IconBase>
      <path d="m5 12 4 4 10-10" />
    </IconBase>
  );
}

function HomeLineIcon() {
  return (
    <IconBase>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M9.5 20v-5h5v5" />
    </IconBase>
  );
}

function UploadLineIcon() {
  return (
    <IconBase>
      <path d="M12 17V7" />
      <path d="m8.5 10.5 3.5-3.5 3.5 3.5" />
      <path d="M5 20h14" />
    </IconBase>
  );
}

function TimelineLineIcon() {
  return (
    <IconBase>
      <circle cx="6" cy="7" r="1.4" />
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="6" cy="17" r="1.4" />
      <path d="M10 7h8" />
      <path d="M10 12h8" />
      <path d="M10 17h8" />
    </IconBase>
  );
}

function DocLineIcon() {
  return (
    <IconBase>
      <path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 20V5A1.5 1.5 0 0 1 8.5 3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="M10 12h4" />
      <path d="M10 16h5" />
    </IconBase>
  );
}

function GearLineIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.7v2.1" />
      <path d="M12 18.2v2.1" />
      <path d="m5.8 5.8 1.5 1.5" />
      <path d="m16.7 16.7 1.5 1.5" />
      <path d="M3.7 12h2.1" />
      <path d="M18.2 12h2.1" />
      <path d="m5.8 18.2 1.5-1.5" />
      <path d="m16.7 7.3 1.5-1.5" />
    </IconBase>
  );
}
function ShieldCheckIcon() {
  return (
    <IconBase>
      <path d="M12 3.5 18.5 6v5.7c0 4.6-2.8 7.8-6.5 9-3.7-1.2-6.5-4.4-6.5-9V6L12 3.5Z" />
      <path d="m9.2 12.1 1.9 1.9 3.8-4.2" />
    </IconBase>
  );
}

function ShieldIcon() {
  return (
    <IconBase>
      <path d="M12 3.5 18.5 6v5.7c0 4.6-2.8 7.8-6.5 9-3.7-1.2-6.5-4.4-6.5-9V6L12 3.5Z" />
    </IconBase>
  );
}

function LockIcon() {
  return (
    <IconBase>
      <rect x="5.5" y="10" width="13" height="10" rx="2.2" />
      <path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10" />
      <path d="M12 14.2v2.3" />
    </IconBase>
  );
}

function CaduceusIcon() {
  return (
    <IconBase>
      <path d="M12 4v16" />
      <path d="M12 6c-2.2 0-4 1.4-5 3.4" />
      <path d="M12 6c2.2 0 4 1.4 5 3.4" />
      <path d="M12 18c2.2 0 4-1.4 5-3.4" />
      <path d="M12 18c-2.2 0-4-1.4-5-3.4" />
      <path d="M8 9.2c1 .7 2.1 1.1 4 1.1s3-.4 4-1.1" />
      <path d="M8 14.8c1-.7 2.1-1.1 4-1.1s3 .4 4 1.1" />
      <path d="M8.2 11.2 6.4 12.8" />
      <path d="M15.8 11.2l1.8 1.6" />
      <path d="M8.2 12.8 6.4 11.2" />
      <path d="M15.8 12.8l1.8-1.6" />
    </IconBase>
  );
}

function DocumentUploadIcon() {
  return (
    <IconBase>
      <path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 20V5A1.5 1.5 0 0 1 8.5 3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="M12 15v-4" />
      <path d="m10 11.5 2-2 2 2" />
      <circle cx="17.2" cy="17.2" r="2.3" />
      <path d="M17.2 16v2.4" />
      <path d="M16 17.2h2.4" />
    </IconBase>
  );
}

function BulletedTimelineIcon() {
  return (
    <IconBase>
      <circle cx="5.8" cy="7" r="1.2" />
      <circle cx="5.8" cy="12" r="1.2" />
      <circle cx="5.8" cy="17" r="1.2" />
      <path d="M9.2 7h8.8" />
      <path d="M9.2 12h8.8" />
      <path d="M9.2 17h8.8" />
    </IconBase>
  );
}

function SummaryLinesIcon() {
  return (
    <IconBase>
      <path d="M5.3 7h13.4" />
      <path d="M5.3 11h13.4" />
      <path d="M5.3 15h13.4" />
      <path d="M5.3 19h13.4" />
    </IconBase>
  );
}

function ExportIcon() {
  return (
    <IconBase>
      <path d="M12 3.5v9.5" />
      <path d="m8.5 9.8 3.5 3.5 3.5-3.5" />
      <path d="M6 19h12" />
    </IconBase>
  );
}

function CloudUploadIcon() {
  return (
    <IconBase>
      <path d="M7 18h9a4 4 0 0 0 .6-7.95A5.2 5.2 0 0 0 6.6 9.2 3.6 3.6 0 0 0 7 18Z" />
      <path d="M12 16V9.5" />
      <path d="m9 12.5 3-3 3 3" />
    </IconBase>
  );
}

function DocumentSearchIcon() {
  return (
    <IconBase>
      <path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 20V5A1.5 1.5 0 0 1 8.5 3.5Z" />
      <path d="M14 3.5V8h4" />
      <circle cx="13.8" cy="14.8" r="2.7" />
      <path d="m15.9 16.9 2.2 2.2" />
    </IconBase>
  );
}

function ChecklistIcon() {
  return (
    <IconBase>
      <rect x="5" y="6" width="2.6" height="2.6" rx=".4" />
      <rect x="5" y="10.7" width="2.6" height="2.6" rx=".4" />
      <rect x="5" y="15.4" width="2.6" height="2.6" rx=".4" />
      <path d="M10.2 7.3H18" />
      <path d="M10.2 12H18" />
      <path d="M10.2 16.7H18" />
    </IconBase>
  );
}

function DocumentExportIcon() {
  return (
    <IconBase>
      <path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 20V5A1.5 1.5 0 0 1 8.5 3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="M12 11v5" />
      <path d="m9.5 13.5 2.5 2.5 2.5-2.5" />
      <circle cx="17" cy="17" r="2.2" />
    </IconBase>
  );
}

function ScalesIcon() {
  return (
    <IconBase>
      <path d="M12 4v14" />
      <path d="M7 7h10" />
      <path d="M7 7 4.2 12h5.6L7 7Z" />
      <path d="M17 7 14.2 12h5.6L17 7Z" />
      <path d="M4.7 12c.5 1.4 1.8 2.3 3.3 2.3s2.8-.9 3.3-2.3" />
      <path d="M12 20H8" />
      <path d="M16 20h-4" />
    </IconBase>
  );
}

function DoctorIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="7.2" r="3.2" />
      <path d="M7 19.5v-1.7c0-2.5 2.2-4.3 5-4.3s5 1.8 5 4.3v1.7" />
      <path d="M12 10.8v3.2" />
      <path d="M10.4 12.4h3.2" />
    </IconBase>
  );
}

function StethoscopeIcon() {
  return (
    <IconBase>
      <path d="M7 4v5a3.8 3.8 0 0 0 7.6 0V4" />
      <path d="M7 4H5.5" />
      <path d="M14.6 4H16" />
      <path d="M10.8 12.8v2.1a4.7 4.7 0 0 0 9.4 0v-1.5" />
      <circle cx="20.2" cy="11.2" r="1.8" />
    </IconBase>
  );
}
