export default function HomepageMockupPage() {
  const iconProps = {
    width: 32,
    height: 32,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <div className="riq-page">
      <style>{`
        :root,
        .riq-page {
          --riq-blue: #1664e8;
          --riq-blue-dark: #0f56d9;
          --riq-text: #071831;
          --riq-muted: #52627a;
          --riq-border: #dce7f5;
          --riq-soft-blue: #edf5ff;
          --riq-shadow: 0 18px 50px rgba(18, 45, 82, 0.12);
          --riq-navy: #061a35;
          --riq-navy-2: #09294f;
        }

        .riq-page {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: var(--riq-text);
          background: #ffffff;
          line-height: 1.45;
          overflow-x: hidden;
        }

        .riq-page * {
          box-sizing: border-box;
        }

        .riq-container {
          width: min(1160px, calc(100% - 40px));
          margin: 0 auto;
        }

        .riq-navbar {
          height: 82px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e7edf6;
          background: #ffffff;
        }

        .riq-nav-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 28px;
        }

        .riq-logo-link {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          flex: 0 0 auto;
        }

        .riq-logo-img {
          width: 210px;
          height: auto;
          display: block;
          object-fit: contain;
        }

        .riq-sidebar-logo-img {
          width: 132px;
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

        .riq-menu {
          display: flex;
          align-items: center;
          gap: 34px;
          font-size: 14px;
          font-weight: 800;
        }

        .riq-menu a {
          color: var(--riq-text);
          text-decoration: none;
        }

        .riq-menu a:hover {
          color: var(--riq-blue);
        }

        .riq-nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .riq-login {
          color: var(--riq-text);
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
        }

        .riq-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          min-height: 50px;
          padding: 0 28px;
          border-radius: 9px;
          font-weight: 900;
          font-size: 15px;
          text-decoration: none;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .riq-btn-primary {
          background: linear-gradient(180deg, #2f7df6, var(--riq-blue));
          color: #ffffff;
          box-shadow: 0 14px 30px rgba(22, 100, 232, 0.24);
        }

        .riq-btn-outline {
          background: #ffffff;
          color: var(--riq-text);
          border-color: #aebfd5;
        }

        .riq-hero {
          padding: 52px 0 34px;
          background:
            radial-gradient(circle at 72% 14%, rgba(22, 100, 232, 0.08), transparent 32%),
            linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
        }

        .riq-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 70px;
          align-items: center;
          min-height: 540px;
        }

        .riq-hero h1 {
          font-size: clamp(46px, 5vw, 66px);
          line-height: 1.03;
          letter-spacing: -0.065em;
          margin: 0 0 26px;
          color: var(--riq-text);
          font-weight: 850;
        }

        .riq-hero h1 span {
          color: var(--riq-blue);
          display: block;
        }

        .riq-hero p {
          max-width: 560px;
          color: var(--riq-muted);
          font-size: 20px;
          line-height: 1.55;
          margin: 0 0 32px;
          font-weight: 500;
        }

        .riq-hero-actions {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }

        .riq-trust-row {
          display: flex;
          align-items: center;
          gap: 30px;
          flex-wrap: wrap;
          color: #425169;
          font-size: 14px;
          font-weight: 750;
        }

        .riq-trust-item {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .riq-trust-item svg {
          color: var(--riq-blue);
          width: 22px;
          height: 22px;
        }

        .riq-app-card {
          background: #ffffff;
          border: 1px solid #dce6f3;
          border-radius: 18px;
          box-shadow: var(--riq-shadow);
          overflow: hidden;
          display: grid;
          grid-template-columns: 160px 1fr;
          min-height: 475px;
        }

        .riq-sidebar {
          background: linear-gradient(180deg, #f8fbff, #f1f6fd);
          border-right: 1px solid #e2eaf5;
          padding: 25px 18px;
        }

        .riq-sidebar-logo {
          margin-bottom: 30px;
        }

        .riq-side-link {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 38px;
          padding: 0 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 850;
          color: #526074;
          margin-bottom: 8px;
        }

        .riq-side-link.active {
          color: var(--riq-blue);
          background: #e9f2ff;
        }

        .riq-side-link svg {
          width: 15px;
          height: 15px;
          color: currentColor;
        }

        .riq-main-preview {
          padding: 26px 30px;
        }

        .riq-preview-top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          border-bottom: 1px solid #e3ebf5;
          padding-bottom: 18px;
          margin-bottom: 20px;
        }

        .riq-preview-top h3 {
          margin: 0 0 4px;
          font-size: 23px;
          letter-spacing: -0.03em;
          font-weight: 800;
        }

        .riq-preview-sub {
          color: #59677c;
          font-size: 12px;
          font-weight: 800;
        }

        .riq-preview-actions {
          display: flex;
          gap: 10px;
        }

        .riq-mini-btn {
          border: 1px solid #d5dfed;
          background: #ffffff;
          border-radius: 7px;
          padding: 9px 13px;
          font-size: 12px;
          font-weight: 900;
          color: #172842;
        }

        .riq-timeline-date {
          color: #43536c;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 12px;
        }

        .riq-event {
          display: grid;
          grid-template-columns: 20px 1fr;
          column-gap: 16px;
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

        .riq-event h4 {
          margin: 0 0 4px;
          font-size: 14px;
          color: #13233b;
          font-weight: 850;
        }

        .riq-event p {
          margin: 0 0 5px;
          color: #58677c;
          font-size: 12px;
          line-height: 1.4;
        }

        .riq-source {
          color: var(--riq-blue);
          font-size: 12px;
          font-weight: 900;
          text-decoration: none;
        }

        .riq-security-strip {
          background: linear-gradient(90deg, #edf5ff, #f8fbff, #edf5ff);
          border-top: 1px solid #e3edf8;
          border-bottom: 1px solid #e3edf8;
          padding: 26px 0;
        }

        .riq-security-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr 1.55fr;
          align-items: center;
          gap: 30px;
        }

        .riq-security-item {
          display: flex;
          align-items: center;
          gap: 15px;
          color: var(--riq-text);
        }

        .riq-security-icon {
          width: 50px;
          height: 50px;
          display: grid;
          place-items: center;
          color: var(--riq-blue);
          flex: 0 0 auto;
        }

        .riq-security-icon svg {
          width: 44px;
          height: 44px;
          stroke: currentColor;
          fill: none;
          display: block;
        }

        .riq-security-copy strong {
          display: block;
          color: var(--riq-text);
          font-size: 15px;
          line-height: 1.12;
          font-weight: 900;
          letter-spacing: -0.01em;
        }

        .riq-security-copy span {
          display: block;
          color: var(--riq-text);
          font-size: 13px;
          line-height: 1.2;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .riq-security-note {
          color: #43536c;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 750;
        }

        .riq-section {
          padding: 56px 0;
        }

        .riq-section-soft {
          background: linear-gradient(180deg, #ffffff, #f8fbff);
        }

        .riq-section-head {
          text-align: center;
          max-width: 740px;
          margin: 0 auto 34px;
        }

        .riq-section-head h2 {
          margin: 0 0 11px;
          font-size: clamp(28px, 3vw, 36px);
          line-height: 1.12;
          letter-spacing: -0.045em;
          color: var(--riq-text);
          font-weight: 850;
        }

        .riq-section-head p {
          margin: 0 auto;
          color: var(--riq-muted);
          font-size: 16px;
          line-height: 1.55;
          font-weight: 550;
        }

        .riq-feature-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .riq-feature-card,
        .riq-audience-card {
          background: #ffffff;
          border: 1px solid #dfe8f4;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 12px 28px rgba(17, 44, 81, 0.05);
          min-height: 122px;
        }

        .riq-feature-card {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 18px;
          align-items: start;
        }

        .riq-card-icon {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: var(--riq-soft-blue);
          display: grid;
          place-items: center;
          color: var(--riq-blue);
          flex: 0 0 auto;
        }

        .riq-card-icon svg {
          width: 32px;
          height: 32px;
          stroke: currentColor;
          fill: none;
        }

        .riq-feature-card h3,
        .riq-audience-card h3 {
          margin: 0 0 8px;
          font-size: 15px;
          letter-spacing: -0.02em;
          color: #13233b;
          font-weight: 850;
        }

        .riq-feature-card p,
        .riq-audience-card p {
          margin: 0;
          color: #66758b;
          font-size: 13px;
          line-height: 1.45;
          font-weight: 550;
        }

        .riq-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 36px;
          margin-top: 8px;
        }

        .riq-step {
          position: relative;
        }

        .riq-step-circle {
          width: 78px;
          height: 78px;
          border-radius: 50%;
          background: var(--riq-soft-blue);
          display: grid;
          place-items: center;
          color: var(--riq-blue);
          margin: 0 auto 20px;
        }

        .riq-step-circle svg {
          width: 44px;
          height: 44px;
          stroke: currentColor;
          fill: none;
        }

        .riq-step h3 {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 8px;
          font-size: 15px;
          letter-spacing: -0.02em;
          color: #13233b;
          font-weight: 850;
        }

        .riq-step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--riq-blue);
          color: #ffffff;
          display: inline-grid;
          place-items: center;
          font-size: 12px;
          font-weight: 900;
          flex: 0 0 auto;
        }

        .riq-step p {
          margin: 0;
          color: #647389;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 550;
          padding-left: 33px;
        }

        .riq-audience-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .riq-audience-card {
          display: grid;
          grid-template-columns: 58px 1fr;
          gap: 20px;
          align-items: start;
          min-height: 142px;
        }

        .riq-learn {
          display: inline-flex;
          margin-top: 14px;
          color: var(--riq-blue);
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
        }

        .riq-cta {
          background:
            radial-gradient(circle at 86% 38%, rgba(22, 100, 232, 0.24), transparent 36%),
            linear-gradient(135deg, #06162b, #092645 58%, #06162b);
          color: #ffffff;
          padding: 34px 0 22px;
        }

        .riq-cta-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 46px;
          align-items: center;
        }

        .riq-cta h2 {
          margin: 0 0 10px;
          max-width: 620px;
          font-size: clamp(28px, 3vw, 38px);
          line-height: 1.12;
          letter-spacing: -0.055em;
          font-weight: 850;
        }

        .riq-cta p {
          margin: 0;
          max-width: 540px;
          color: #c8d5e7;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 500;
        }

        .riq-cta-actions {
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .riq-cta .riq-btn-outline {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.46);
          color: #ffffff;
          min-width: 190px;
        }

        .riq-cta .riq-btn-primary {
          min-width: 230px;
        }

        .riq-cta-notes {
          display: flex;
          gap: 28px;
          color: #c2d4ea;
          font-size: 13px;
          font-weight: 750;
          margin-top: 14px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .riq-cta-note {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .riq-cta-note svg {
          width: 16px;
          height: 16px;
          color: #75a9ff;
        }

        .riq-footer {
          background: linear-gradient(135deg, #06162b, #082544 64%, #06162b);
          color: #dce7f5;
          border-top: 1px solid rgba(255, 255, 255, 0.13);
          padding: 22px 0 26px;
        }

        .riq-footer-grid {
          display: grid;
          grid-template-columns: 1.7fr 0.8fr 0.8fr 0.8fr 1.4fr;
          gap: 28px;
          align-items: start;
        }

        .riq-footer h4 {
          margin: 0 0 9px;
          font-size: 13px;
          color: #ffffff;
          font-weight: 850;
        }

        .riq-footer a,
        .riq-footer p {
          display: block;
          color: #aebdd2;
          text-decoration: none;
          font-size: 13px;
          margin: 0 0 5px;
          font-weight: 550;
        }

        @media (max-width: 991px) {
          .riq-menu {
            display: none;
          }

          .riq-hero-grid,
          .riq-cta-grid {
            grid-template-columns: 1fr;
            gap: 42px;
          }

          .riq-app-card {
            max-width: 680px;
          }

          .riq-security-grid,
          .riq-feature-grid,
          .riq-steps,
          .riq-audience-grid,
          .riq-footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .riq-cta-actions,
          .riq-cta-notes {
            justify-content: flex-start;
          }
        }

        @media (max-width: 640px) {
          .riq-container {
            width: min(100% - 28px, 1160px);
          }

          .riq-navbar {
            height: auto;
            padding: 16px 0;
          }

          .riq-nav-actions {
            display: none;
          }

          .riq-logo-img {
            width: 170px;
          }

          .riq-hero {
            padding-top: 36px;
          }

          .riq-hero-grid {
            min-height: auto;
          }

          .riq-hero p {
            font-size: 17px;
          }

          .riq-hero-actions,
          .riq-trust-row,
          .riq-cta-actions,
          .riq-cta-notes {
            align-items: stretch;
            flex-direction: column;
          }

          .riq-btn {
            width: 100%;
          }

          .riq-app-card {
            grid-template-columns: 1fr;
          }

          .riq-sidebar {
            display: none;
          }

          .riq-main-preview {
            padding: 22px;
          }

          .riq-preview-top {
            flex-direction: column;
          }

          .riq-security-grid,
          .riq-feature-grid,
          .riq-steps,
          .riq-audience-grid,
          .riq-footer-grid {
            grid-template-columns: 1fr;
          }

          .riq-feature-card,
          .riq-audience-card {
            grid-template-columns: 54px 1fr;
          }

          .riq-section {
            padding: 44px 0;
          }

          .riq-cta {
            padding: 34px 0 22px;
          }

          .riq-footer {
            padding: 22px 0 26px;
          }
        }
      `}</style>

      <header className="riq-navbar">
        <div className="riq-container riq-nav-inner">
          <a href="#" className="riq-logo-link" aria-label="RecordIQ">
            <img src="/logo/recordiq-logo.png" alt="RecordIQ" className="riq-logo-img" />
          </a>

          <nav className="riq-menu" aria-label="Primary">
            <a href="#product">Product</a>
            <a href="#solutions">Solutions</a>
            <a href="#security">Security</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
            <a href="#about">About</a>
          </nav>

          <div className="riq-nav-actions">
            <a className="riq-login" href="#login">Log in</a>
            <a className="riq-btn riq-btn-primary" href="#upload">Get Started</a>
          </div>
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
                RecordIQ turns stacks of medical records into clear, chronological timelines and case summaries—so you can focus on what matters.
              </p>

              <div className="riq-hero-actions">
                <a className="riq-btn riq-btn-primary" href="#upload">Upload Records Free</a>
                <a className="riq-btn riq-btn-outline" href="#how-it-works">See How It Works</a>
              </div>

              <div className="riq-trust-row">
                <div className="riq-trust-item">
                  <ShieldCheckIcon />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="riq-trust-item">
                  <LockIcon />
                  <span>Secure &amp; Private</span>
                </div>
                <div className="riq-trust-item">
                  <CloudIcon />
                  <span>AI-Powered Extraction</span>
                </div>
              </div>
            </div>

            <div className="riq-app-card">
              <aside className="riq-sidebar">
                <div className="riq-sidebar-logo">
                  <img src="/logo/recordiq-logo.png" alt="RecordIQ" className="riq-sidebar-logo-img" />
                </div>

                <div className="riq-side-link active"><HomeIcon /> Dashboard</div>
                <div className="riq-side-link"><UploadIcon /> Uploads</div>
                <div className="riq-side-link"><TimelineIcon /> Timeline</div>
                <div className="riq-side-link"><SummaryIcon /> Summary</div>
                <div className="riq-side-link"><DocumentIcon /> Documents</div>
                <div className="riq-side-link"><SettingsIcon /> Settings</div>
              </aside>

              <div className="riq-main-preview">
                <div className="riq-preview-top">
                  <div>
                    <h3>Case Timeline</h3>
                    <div className="riq-preview-sub">John Doe | Uploaded May 12, 2024</div>
                  </div>

                  <div className="riq-preview-actions">
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
                    <p><strong>Diagnosis:</strong> Lumbar strain</p>
                    <a className="riq-source" href="#">Source: page 14</a>
                  </div>
                </div>

                <div className="riq-timeline-date">May 20, 2024</div>
                <div className="riq-event">
                  <div className="riq-dot" />
                  <div>
                    <h4>MRI Lumbar Spine</h4>
                    <p>Findings: Small central disc herniation at L4-L5.</p>
                    <a className="riq-source" href="#">Source: page 28</a>
                  </div>
                </div>

                <div className="riq-timeline-date">June 5, 2024</div>
                <div className="riq-event">
                  <div className="riq-dot" />
                  <div>
                    <h4>Physical Therapy Evaluation</h4>
                    <p>Assessment: Limited range of motion and core weakness.</p>
                    <a className="riq-source" href="#">Source: page 45</a>
                  </div>
                </div>

                <div className="riq-timeline-date">July 10, 2024</div>
                <div className="riq-event">
                  <div className="riq-dot" />
                  <div>
                    <h4>Follow-up Visit</h4>
                    <p>Patient reports improvement in pain. Continue PT.</p>
                    <a className="riq-source" href="#">Source: page 62</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="riq-security-strip">
          <div className="riq-container riq-security-grid">
            <SecurityItem icon={<ShieldCheckIcon />} title="Built for Privacy." subtitle="Designed for Trust." />
            <SecurityItem icon={<CaduceusIcon />} title="HIPAA" subtitle="Compliant" />
            <SecurityItem icon={<LockIcon />} title="SOC 2" subtitle="Type II" />
            <SecurityItem icon={<ShieldIcon />} title="AES-256" subtitle="Encryption" />
            <div className="riq-security-note">Your data is always secure, private, and never shared.</div>
          </div>
        </section>

        <section id="product" className="riq-section">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>Everything You Need for Stronger Cases</h2>
              <p>RecordIQ gives legal and medical professionals the clarity they need to build stronger, faster, and more confident cases.</p>
            </div>

            <div className="riq-feature-grid">
              <FeatureCard icon={<DocumentUploadIcon />} title="Precise, Secure Extraction">
                AI extracts key medical facts from records with structure, speed, and security.
              </FeatureCard>

              <FeatureCard icon={<TimelineIcon />} title="Chronological Timeline">
                All events are arranged in order with source page references.
              </FeatureCard>

              <FeatureCard icon={<SummaryIcon />} title="Case Summary">
                AI-generated summaries highlight key events, diagnoses, and treatments.
              </FeatureCard>

              <FeatureCard icon={<DownloadTrayIcon />} title="Export & Share">
                Export timelines and summaries for your case in seconds.
              </FeatureCard>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="riq-section riq-section-soft">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>How RecordIQ Works</h2>
            </div>

            <div className="riq-steps">
              <StepCard number="1" icon={<CloudUploadIcon />} title="Upload Your Records">
                Drag &amp; drop your medical records. We support PDF files of any size.
              </StepCard>

              <StepCard number="2" icon={<DocumentSearchIcon />} title="AI Identifies Key Facts">
                Our AI pulls out the important medical events, diagnoses, treatments, and dates.
              </StepCard>

              <StepCard number="3" icon={<ChecklistIcon />} title="Review Your Timeline">
                See your records in a clear timeline with source page references.
              </StepCard>

              <StepCard number="4" icon={<DocumentExportIcon />} title="Export & Build Your Case">
                Download summaries or share with your team securely.
              </StepCard>
            </div>
          </div>
        </section>

        <section id="solutions" className="riq-section">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>Built for Professionals Who Build Strong Cases</h2>
            </div>

            <div className="riq-audience-grid">
              <AudienceCard icon={<ScalesIcon />} title="Personal Injury Attorneys">
                Save hours. Understand records faster. Build stronger cases.
              </AudienceCard>

              <AudienceCard icon={<DoctorIcon />} title="Medical Professionals">
                Quickly review patient histories and treatment timelines.
              </AudienceCard>

              <AudienceCard icon={<StethoscopeIcon />} title="Medical Experts">
                Review complex records, clarify medical findings, and support case strategy with organized source-backed timelines.
              </AudienceCard>

              <AudienceCard icon={<ShieldCheckIcon />} title="Insurance & Claims">
                Streamline review. Reduce back-and-forth. Speed decisions.
              </AudienceCard>
            </div>
          </div>
        </section>

        <section className="riq-cta">
          <div className="riq-container riq-cta-grid">
            <div>
              <h2>Ready to Save Time and Build Stronger Cases?</h2>
              <p>Join professionals who trust RecordIQ to turn medical records into clarity.</p>
            </div>

            <div>
              <div className="riq-cta-actions">
                <a className="riq-btn riq-btn-primary" href="#upload">Upload Records Free</a>
                <a className="riq-btn riq-btn-outline" href="#demo">Book a Demo</a>
              </div>

              <div className="riq-cta-notes">
                <span className="riq-cta-note"><CheckIcon /> No credit card required</span>
                <span className="riq-cta-note"><CheckIcon /> Free to get started</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="riq-footer">
        <div className="riq-container riq-footer-grid">
          <div>
            <img src="/logo/recordiq-logo.png" alt="RecordIQ" className="riq-footer-logo-img" />
          </div>

          <FooterColumn title="Product" links={["Features", "Pricing", "Updates"]} />
          <FooterColumn title="Company" links={["About", "Security", "Careers"]} />
          <FooterColumn title="Resources" links={["Help Center", "Blog", "Contact"]} />

          <div>
            <h4>Secure. Private. Compliant.</h4>
            <p>© 2024 RecordIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );

  function SecurityItem({
    icon,
    title,
    subtitle,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  }) {
    return (
      <div className="riq-security-item">
        <span className="riq-security-icon" aria-hidden="true">{icon}</span>
        <div className="riq-security-copy">
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
      </div>
    );
  }

  function FeatureCard({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="riq-feature-card">
        <div className="riq-card-icon" aria-hidden="true">{icon}</div>
        <div>
          <h3>{title}</h3>
          <p>{children}</p>
        </div>
      </div>
    );
  }

  function StepCard({
    number,
    icon,
    title,
    children,
  }: {
    number: string;
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="riq-step">
        <div className="riq-step-circle" aria-hidden="true">{icon}</div>
        <h3><span className="riq-step-number">{number}</span>{title}</h3>
        <p>{children}</p>
      </div>
    );
  }

  function AudienceCard({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="riq-audience-card">
        <div className="riq-card-icon" aria-hidden="true">{icon}</div>
        <div>
          <h3>{title}</h3>
          <p>{children}</p>
          <a className="riq-learn" href="#">Learn more →</a>
        </div>
      </div>
    );
  }

  function FooterColumn({ title, links }: { title: string; links: string[] }) {
    return (
      <div>
        <h4>{title}</h4>
        {links.map((link) => (
          <a href="#" key={link}>{link}</a>
        ))}
      </div>
    );
  }

  function Svg({ children }: { children: React.ReactNode }) {
    return <svg {...iconProps}>{children}</svg>;
  }

  function ShieldCheckIcon() {
    return (
      <Svg>
        <path d="M12 3.2 19 6.2v5.2c0 4.9-3 8.1-7 9.4-4-1.3-7-4.5-7-9.4V6.2l7-3Z" />
        <path d="m8.7 12.1 2.2 2.2 4.5-5" />
      </Svg>
    );
  }

  function ShieldIcon() {
    return (
      <Svg>
        <path d="M12 3.2 19 6.2v5.2c0 4.9-3 8.1-7 9.4-4-1.3-7-4.5-7-9.4V6.2l7-3Z" />
      </Svg>
    );
  }

  function LockIcon() {
    return (
      <Svg>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7.4a4 4 0 0 1 8 0V10" />
        <path d="M12 14v2.5" />
      </Svg>
    );
  }

  function CaduceusIcon() {
    return (
      <Svg>
        <path d="M12 3v18" />
        <path d="M8.2 5.5c0 1.5 1.5 2.5 3.8 2.5s3.8-1 3.8-2.5" />
        <path d="M8.2 18.5c0-1.5 1.5-2.5 3.8-2.5s3.8 1 3.8 2.5" />
        <path d="M7 10h10" />
        <path d="M7 14h10" />
        <path d="M9 10c-2 0-3.5-1.2-3.5-2.8" />
        <path d="M15 10c2 0 3.5-1.2 3.5-2.8" />
        <path d="M9 14c-2 0-3.5 1.2-3.5 2.8" />
        <path d="M15 14c2 0 3.5 1.2 3.5 2.8" />
      </Svg>
    );
  }

  function DocumentUploadIcon() {
    return (
      <Svg>
        <path d="M14 3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V9l-6-6Z" />
        <path d="M14 3v6h6" />
        <path d="M12 17v-6" />
        <path d="m9.5 13.5 2.5-2.5 2.5 2.5" />
      </Svg>
    );
  }

  function TimelineIcon() {
    return (
      <Svg>
        <path d="M9 6h11" />
        <path d="M9 12h11" />
        <path d="M9 18h11" />
        <circle cx="4.5" cy="6" r="1.4" />
        <circle cx="4.5" cy="12" r="1.4" />
        <circle cx="4.5" cy="18" r="1.4" />
      </Svg>
    );
  }

  function SummaryIcon() {
    return (
      <Svg>
        <path d="M6 5h12" />
        <path d="M6 10h12" />
        <path d="M6 15h12" />
        <path d="M6 20h8" />
      </Svg>
    );
  }

  function DownloadTrayIcon() {
    return (
      <Svg>
        <path d="M12 4v11" />
        <path d="m8 11 4 4 4-4" />
        <path d="M5 20h14" />
      </Svg>
    );
  }

  function CloudUploadIcon() {
    return (
      <Svg>
        <path d="M7 18a5 5 0 1 1 1-9.9A7 7 0 0 1 21 12a4 4 0 0 1-1 7H7Z" />
        <path d="M12 18v-7" />
        <path d="m9 14 3-3 3 3" />
      </Svg>
    );
  }

  function DocumentSearchIcon() {
    return (
      <Svg>
        <path d="M14 3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21H11" />
        <path d="M14 3v6h6" />
        <path d="M14 3l6 6" />
        <circle cx="16" cy="16" r="3" />
        <path d="m18.4 18.4 2.1 2.1" />
      </Svg>
    );
  }

  function ChecklistIcon() {
    return (
      <Svg>
        <path d="M9 6h11" />
        <path d="M9 12h11" />
        <path d="M9 18h11" />
        <path d="m4 6 .8.8L6.5 5" />
        <path d="m4 12 .8.8L6.5 11" />
        <path d="m4 18 .8.8L6.5 17" />
      </Svg>
    );
  }

  function DocumentExportIcon() {
    return (
      <Svg>
        <path d="M14 3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V9l-6-6Z" />
        <path d="M14 3v6h6" />
        <circle cx="16" cy="16" r="3" />
        <path d="M16 14.5v3" />
        <path d="m14.8 16.3 1.2 1.2 1.2-1.2" />
      </Svg>
    );
  }

  function ScalesIcon() {
    return (
      <Svg>
        <path d="M12 3v18" />
        <path d="M5 7h14" />
        <path d="M6 7 3.5 14h5L6 7Z" />
        <path d="M18 7 15.5 14h5L18 7Z" />
        <path d="M4 14h4" />
        <path d="M16 14h4" />
        <path d="M9 21h6" />
      </Svg>
    );
  }

  function DoctorIcon() {
    return (
      <Svg>
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        <path d="M12 14v7" />
        <path d="M9 18h6" />
      </Svg>
    );
  }

  function StethoscopeIcon() {
    return (
      <Svg>
        <path d="M6 3v6a4 4 0 0 0 8 0V3" />
        <path d="M6 3H4" />
        <path d="M14 3h2" />
        <path d="M10 13v2a5 5 0 0 0 10 0v-2" />
        <circle cx="20" cy="11" r="2" />
      </Svg>
    );
  }

  function HomeIcon() {
    return (
      <Svg>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M10 20v-6h4v6" />
      </Svg>
    );
  }

  function UploadIcon() {
    return (
      <Svg>
        <path d="M12 17V5" />
        <path d="m8 9 4-4 4 4" />
        <path d="M5 20h14" />
      </Svg>
    );
  }

  function DocumentIcon() {
    return (
      <Svg>
        <path d="M14 3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V9l-6-6Z" />
        <path d="M14 3v6h6" />
      </Svg>
    );
  }

  function SettingsIcon() {
    return (
      <Svg>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3-.2-.1a1.7 1.7 0 0 0-2 .1 1.7 1.7 0 0 0-1 1.6V22h-5v-.4a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-2-.1l-.2.1-2-3 .1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3 .2.1a1.7 1.7 0 0 0 2-.1 1.7 1.7 0 0 0 1-1.6V2h5v.4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 2 .1l.2-.1 2 3-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
      </Svg>
    );
  }

  function CloudIcon() {
    return (
      <Svg>
        <path d="M7 18a5 5 0 1 1 1-9.9A7 7 0 0 1 21 12a4 4 0 0 1-1 7H7Z" />
      </Svg>
    );
  }

  function CheckIcon() {
    return (
      <Svg>
        <path d="m5 12 4 4L19 6" />
      </Svg>
    );
  }
}