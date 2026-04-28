<section class="riq-page">
  <style>
    :root {
      --riq-navy: #071a33;
      --riq-navy-2: #0b2344;
      --riq-blue: #1664e8;
      --riq-blue-2: #2f7df6;
      --riq-text: #0b1830;
      --riq-muted: #65758b;
      --riq-border: #dce5f2;
      --riq-bg: #f7fbff;
      --riq-card: #ffffff;
      --riq-soft-blue: #edf5ff;
      --riq-shadow: 0 18px 50px rgba(18, 45, 82, 0.12);
    }

    .riq-page {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--riq-text);
      background: #ffffff;
      line-height: 1.45;
      overflow: hidden;
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
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .riq-nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 28px;
    }

    .riq-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 27px;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--riq-text);
      text-decoration: none;
      white-space: nowrap;
    }

    .riq-logo span {
      color: var(--riq-blue);
    }

    .riq-logo-mark {
      width: 34px;
      height: 34px;
      border: 2px solid var(--riq-blue);
      border-radius: 10px;
      display: grid;
      place-items: center;
      position: relative;
    }

    .riq-logo-mark:before {
      content: "";
      width: 14px;
      height: 18px;
      border: 2px solid var(--riq-blue);
      border-radius: 3px;
      display: block;
    }

    .riq-menu {
      display: flex;
      align-items: center;
      gap: 34px;
      font-size: 14px;
      font-weight: 650;
    }

    .riq-menu a {
      color: var(--riq-text);
      text-decoration: none;
      opacity: 0.9;
    }

    .riq-menu a:hover {
      color: var(--riq-blue);
    }

    .riq-nav-actions {
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 14px;
      font-weight: 700;
    }

    .riq-login {
      color: var(--riq-text);
      text-decoration: none;
    }

    .riq-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 50px;
      padding: 0 26px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 15px;
      text-decoration: none;
      transition: 0.2s ease;
      border: 1px solid transparent;
      cursor: pointer;
      white-space: nowrap;
    }

    .riq-btn-primary {
      background: linear-gradient(180deg, var(--riq-blue-2), var(--riq-blue));
      color: #ffffff;
      box-shadow: 0 12px 26px rgba(22, 100, 232, 0.22);
    }

    .riq-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 16px 30px rgba(22, 100, 232, 0.28);
    }

    .riq-btn-outline {
      color: var(--riq-text);
      background: #ffffff;
      border-color: #b9c7da;
    }

    .riq-btn-outline:hover {
      border-color: var(--riq-blue);
      color: var(--riq-blue);
    }

    .riq-hero {
      padding: 42px 0 34px;
      background:
        radial-gradient(circle at 70% 16%, rgba(22, 100, 232, 0.09), transparent 30%),
        linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
    }

    .riq-hero-grid {
      display: grid;
      grid-template-columns: 1fr 1.05fr;
      align-items: center;
      gap: 70px;
      min-height: 540px;
    }

    .riq-hero h1 {
      font-size: clamp(44px, 5vw, 66px);
      line-height: 1.02;
      letter-spacing: -0.065em;
      margin: 0 0 28px;
      color: #06152c;
    }

    .riq-hero h1 span {
      color: var(--riq-blue);
      display: block;
    }

    .riq-hero p {
      max-width: 560px;
      color: var(--riq-muted);
      font-size: 21px;
      line-height: 1.55;
      margin: 0 0 32px;
      font-weight: 500;
    }

    .riq-hero-actions {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
      margin-bottom: 38px;
    }

    .riq-trust-row {
      display: flex;
      align-items: center;
      gap: 34px;
      flex-wrap: wrap;
      color: #425169;
      font-size: 14px;
      font-weight: 700;
    }

    .riq-trust-item {
      display: flex;
      align-items: center;
      gap: 9px;
    }

    .riq-icon {
      width: 22px;
      height: 22px;
      display: inline-grid;
      place-items: center;
      color: var(--riq-blue);
      flex: 0 0 auto;
    }

    .riq-app-card {
      background: #ffffff;
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
      font-weight: 800;
      font-size: 20px;
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 28px;
      color: var(--riq-text);
    }

    .riq-side-link {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 38px;
      padding: 0 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 750;
      color: #526074;
      margin-bottom: 8px;
    }

    .riq-side-link.active {
      color: var(--riq-blue);
      background: #e9f2ff;
    }

    .riq-main-preview {
      padding: 26px 30px 28px;
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

    .riq-preview-title h3 {
      margin: 0 0 4px;
      font-size: 22px;
      letter-spacing: -0.03em;
    }

    .riq-preview-title div {
      color: #7b8799;
      font-size: 12px;
      font-weight: 700;
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
      font-weight: 800;
      color: #4b5870;
    }

    .riq-timeline-date {
      color: #56637a;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 12px;
    }

    .riq-event {
      display: grid;
      grid-template-columns: 20px 1fr;
      column-gap: 16px;
      position: relative;
      padding-bottom: 26px;
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
      letter-spacing: -0.01em;
    }

    .riq-event p {
      margin: 0 0 5px;
      color: #627188;
      font-size: 12px;
      line-height: 1.4;
    }

    .riq-source {
      color: var(--riq-blue);
      font-size: 12px;
      font-weight: 800;
      text-decoration: none;
    }

    .riq-security-strip {
      background: linear-gradient(90deg, #edf5ff, #f8fbff, #edf5ff);
      border-top: 1px solid #e3edf8;
      border-bottom: 1px solid #e3edf8;
      padding: 27px 0;
    }

    .riq-security-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1fr 1.4fr;
      align-items: center;
      gap: 28px;
    }

    .riq-security-item {
      display: flex;
      align-items: center;
      gap: 13px;
      font-size: 13px;
      font-weight: 850;
      color: #20314b;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .riq-security-item strong {
      display: block;
      text-transform: none;
      letter-spacing: -0.01em;
      font-size: 15px;
    }

    .riq-security-note {
      color: #56657b;
      font-size: 13px;
      line-height: 1.45;
      font-weight: 650;
    }

    .riq-section {
      padding: 52px 0;
    }

    .riq-section-soft {
      background: linear-gradient(180deg, #ffffff, #f8fbff);
    }

    .riq-section-head {
      text-align: center;
      max-width: 680px;
      margin: 0 auto 34px;
    }

    .riq-section-head h2 {
      margin: 0 0 11px;
      font-size: clamp(28px, 3vw, 34px);
      line-height: 1.12;
      letter-spacing: -0.045em;
      color: #071831;
    }

    .riq-section-head p {
      margin: 0;
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
      grid-template-columns: 48px 1fr;
      gap: 18px;
      align-items: start;
    }

    .riq-card-icon {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      background: #edf5ff;
      display: grid;
      place-items: center;
      color: var(--riq-blue);
    }

    .riq-feature-card h3,
    .riq-audience-card h3 {
      margin: 0 0 8px;
      font-size: 15px;
      letter-spacing: -0.02em;
      color: #13233b;
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
      position: relative;
      margin-top: 12px;
    }

    .riq-step {
      text-align: left;
      position: relative;
    }

    .riq-step-circle {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background: #edf5ff;
      display: grid;
      place-items: center;
      color: var(--riq-blue);
      margin: 0 auto 20px;
    }

    .riq-step h3 {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 0 0 8px;
      font-size: 15px;
      letter-spacing: -0.02em;
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
      grid-template-columns: repeat(3, 1fr);
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
      font-weight: 850;
      text-decoration: none;
    }

    .riq-cta {
      background:
        radial-gradient(circle at 80% 40%, rgba(22, 100, 232, 0.22), transparent 35%),
        linear-gradient(135deg, #06162b, #092645 58%, #06162b);
      color: #ffffff;
      padding: 52px 0;
    }

    .riq-cta-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 50px;
      align-items: center;
    }

    .riq-cta h2 {
      margin: 0 0 14px;
      max-width: 600px;
      font-size: clamp(30px, 3.5vw, 42px);
      line-height: 1.12;
      letter-spacing: -0.055em;
    }

    .riq-cta p {
      margin: 0;
      max-width: 520px;
      color: #c8d5e7;
      font-size: 18px;
      line-height: 1.55;
      font-weight: 500;
    }

    .riq-cta-actions {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .riq-cta .riq-btn-outline {
      background: transparent;
      border-color: rgba(255, 255, 255, 0.45);
      color: #ffffff;
      min-width: 220px;
    }

    .riq-cta .riq-btn-primary {
      min-width: 250px;
    }

    .riq-cta-notes {
      display: flex;
      gap: 32px;
      color: #b9c9dd;
      font-size: 14px;
      font-weight: 650;
      margin-top: 18px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .riq-footer {
      background: #07162a;
      color: #dce7f5;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding: 32px 0;
    }

    .riq-footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.6fr;
      gap: 34px;
      align-items: start;
    }

    .riq-footer .riq-logo {
      color: #ffffff;
      font-size: 25px;
    }

    .riq-footer h4 {
      margin: 0 0 10px;
      font-size: 13px;
      color: #ffffff;
    }

    .riq-footer a,
    .riq-footer p {
      display: block;
      color: #aebdd2;
      text-decoration: none;
      font-size: 13px;
      margin: 0 0 6px;
      font-weight: 550;
    }

    svg {
      display: block;
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
      .riq-trust-row {
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
    }
  </style>

  <header class="riq-navbar">
    <div class="riq-container riq-nav-inner">
      <a href="#" class="riq-logo" aria-label="RecordIQ">
        <span class="riq-logo-mark"></span>
        Record<span>IQ</span>
      </a>

      <nav class="riq-menu">
        <a href="#product">Product</a>
        <a href="#solutions">Solutions⌄</a>
        <a href="#security">Security</a>
        <a href="#pricing">Pricing</a>
        <a href="#resources">Resources⌄</a>
        <a href="#about">About</a>
      </nav>

      <div class="riq-nav-actions">
        <a class="riq-login" href="#login">Log in</a>
        <a class="riq-btn riq-btn-primary" href="#upload">Get Started</a>
      </div>
    </div>
  </header>

  <main>
    <section class="riq-hero">
      <div class="riq-container riq-hero-grid">
        <div>
          <h1>
            Medical Records.<br />
            Organized. Timelined.
            <span>Case-Ready.</span>
          </h1>

          <p>
            RecordIQ turns stacks of medical records into clear, chronological timelines and case summaries—so you can focus on what matters.
          </p>

          <div class="riq-hero-actions">
            <a class="riq-btn riq-btn-primary" href="#upload">Upload Records Free</a>
            <a class="riq-btn riq-btn-outline" href="#how-it-works">See How It Works</a>
          </div>

          <div class="riq-trust-row">
            <div class="riq-trust-item">
              <span class="riq-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              HIPAA Compliant
            </div>
            <div class="riq-trust-item">
              <span class="riq-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2"/></svg>
              </span>
              Secure & Private
            </div>
            <div class="riq-trust-item">
              <span class="riq-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 18a5 5 0 1 1 1-9.9A7 7 0 0 1 21 12a4 4 0 0 1-1 7H7Z" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M9 14h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </span>
              AI-Powered Extraction
            </div>
          </div>
        </div>

        <div class="riq-app-card">
          <aside class="riq-sidebar">
            <div class="riq-sidebar-logo">▣ Record<span style="color:#1664e8;">IQ</span></div>
            <div class="riq-side-link active">⌂ Dashboard</div>
            <div class="riq-side-link">⇧ Uploads</div>
            <div class="riq-side-link">☷ Timeline</div>
            <div class="riq-side-link">▤ Summary</div>
            <div class="riq-side-link">□ Documents</div>
            <div class="riq-side-link">⚙ Settings</div>
          </aside>

          <div class="riq-main-preview">
            <div class="riq-preview-top">
              <div class="riq-preview-title">
                <h3>Case Timeline</h3>
                <div>John Doe  |  Uploaded May 12, 2024</div>
              </div>
              <div class="riq-preview-actions">
                <button class="riq-mini-btn">Export⌄</button>
                <button class="riq-mini-btn">Filters</button>
              </div>
            </div>

            <div class="riq-timeline-date">May 12, 2024</div>

            <div class="riq-event">
              <div class="riq-dot"></div>
              <div>
                <h4>Emergency Room Visit</h4>
                <p>Chief complaint: Severe lower back pain after lifting object.</p>
                <p><strong>Diagnosis:</strong> Lumbar strain</p>
                <a class="riq-source" href="#">Source: page 14</a>
              </div>
            </div>

            <div class="riq-timeline-date">May 20, 2024</div>

            <div class="riq-event">
              <div class="riq-dot"></div>
              <div>
                <h4>MRI Lumbar Spine</h4>
                <p>Findings: Small central disc herniation at L4-L5.</p>
                <a class="riq-source" href="#">Source: page 28</a>
              </div>
            </div>

            <div class="riq-timeline-date">June 5, 2024</div>

            <div class="riq-event">
              <div class="riq-dot"></div>
              <div>
                <h4>Physical Therapy Evaluation</h4>
                <p>Assessment: Limited range of motion and core weakness.</p>
                <a class="riq-source" href="#">Source: page 45</a>
              </div>
            </div>

            <div class="riq-timeline-date">July 10, 2024</div>

            <div class="riq-event">
              <div class="riq-dot"></div>
              <div>
                <h4>Follow-up Visit</h4>
                <p>Patient reports improvement in pain. Continue PT.</p>
                <a class="riq-source" href="#">Source: page 62</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="security" class="riq-security-strip">
      <div class="riq-container riq-security-grid">
        <div class="riq-security-item">
          <span class="riq-icon">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none"><path d="M12 3 19 6v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3Z" stroke="currentColor" stroke-width="2"/><path d="m9 12 2 2 4-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </span>
          <div><strong>Built for Privacy.</strong>Designed for Trust.</div>
        </div>

        <div class="riq-security-item">⚕ HIPAA<br />Compliant</div>
        <div class="riq-security-item">▣ SOC 2<br />Type II</div>
        <div class="riq-security-item">⬟ AES-256<br />Encryption</div>
        <div class="riq-security-note">Your data is always secure, private, and never shared.</div>
      </div>
    </section>

    <section id="product" class="riq-section">
      <div class="riq-container">
        <div class="riq-section-head">
          <h2>Everything You Need for Stronger Cases</h2>
          <p>RecordIQ gives legal and medical professionals the clarity they need to build stronger, faster, and more confident cases.</p>
        </div>

        <div class="riq-feature-grid">
          <div class="riq-feature-card">
            <div class="riq-card-icon">▧</div>
            <div>
              <h3>Upload & Extract</h3>
              <p>Securely upload PDFs. We extract and organize every record.</p>
            </div>
          </div>

          <div class="riq-feature-card">
            <div class="riq-card-icon">☷</div>
            <div>
              <h3>Chronological Timeline</h3>
              <p>All events are arranged in order with source page references.</p>
            </div>
          </div>

          <div class="riq-feature-card">
            <div class="riq-card-icon">▤</div>
            <div>
              <h3>Case Summary</h3>
              <p>AI-generated summaries highlight key events, diagnoses, and treatments.</p>
            </div>
          </div>

          <div class="riq-feature-card">
            <div class="riq-card-icon">↓</div>
            <div>
              <h3>Export & Share</h3>
              <p>Export timelines and summaries for your case in seconds.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="riq-section riq-section-soft">
      <div class="riq-container">
        <div class="riq-section-head">
          <h2>How RecordIQ Works</h2>
        </div>

        <div class="riq-steps">
          <div class="riq-step">
            <div class="riq-step-circle">⇧</div>
            <h3><span class="riq-step-number">1</span>Upload Your Records</h3>
            <p>Drag & drop your medical records. We support PDF files of any size.</p>
          </div>

          <div class="riq-step">
            <div class="riq-step-circle">▧</div>
            <h3><span class="riq-step-number">2</span>We Extract & Organize</h3>
            <p>Our AI extracts the important information and organizes it chronologically.</p>
          </div>

          <div class="riq-step">
            <div class="riq-step-circle">☷</div>
            <h3><span class="riq-step-number">3</span>Review Your Timeline</h3>
            <p>See your records in a clear timeline with source page references.</p>
          </div>

          <div class="riq-step">
            <div class="riq-step-circle">▧</div>
            <h3><span class="riq-step-number">4</span>Export & Build Your Case</h3>
            <p>Download summaries or share with your team securely.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="solutions" class="riq-section">
      <div class="riq-container">
        <div class="riq-section-head">
          <h2>Built for Professionals Who Build Strong Cases</h2>
        </div>

        <div class="riq-audience-grid">
          <div class="riq-audience-card">
            <div class="riq-card-icon">⚖</div>
            <div>
              <h3>Personal Injury Attorneys</h3>
              <p>Save hours. Understand records faster. Build stronger cases.</p>
              <a class="riq-learn" href="#">Learn more →</a>
            </div>
          </div>

          <div class="riq-audience-card">
            <div class="riq-card-icon">♁</div>
            <div>
              <h3>Medical Professionals</h3>
              <p>Quickly review patient histories and treatment timelines.</p>
              <a class="riq-learn" href="#">Learn more →</a>
            </div>
          </div>

          <div class="riq-audience-card">
            <div class="riq-card-icon">⬟</div>
            <div>
              <h3>Insurance & Claims</h3>
              <p>Streamline review. Reduce back-and-forth. Speed decisions.</p>
              <a class="riq-learn" href="#">Learn more →</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="riq-cta">
      <div class="riq-container riq-cta-grid">
        <div>
          <h2>Ready to Save Time and Build Stronger Cases?</h2>
          <p>Join professionals who trust RecordIQ to turn medical records into clarity.</p>
        </div>

        <div>
          <div class="riq-cta-actions">
            <a class="riq-btn riq-btn-primary" href="#upload">Upload Records Free</a>
            <a class="riq-btn riq-btn-outline" href="#demo">Book a Demo</a>
          </div>

          <div class="riq-cta-notes">
            <span>✓ No credit card required</span>
            <span>✓ Free to get started</span>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="riq-footer">
    <div class="riq-container riq-footer-grid">
      <div>
        <a href="#" class="riq-logo">
          <span class="riq-logo-mark"></span>
          Record<span>IQ</span>
        </a>
      </div>

      <div>
        <h4>Product</h4>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#updates">Updates</a>
      </div>

      <div>
        <h4>Company</h4>
        <a href="#about">About</a>
        <a href="#security">Security</a>
        <a href="#careers">Careers</a>
      </div>

      <div>
        <h4>Resources</h4>
        <a href="#help">Help Center</a>
        <a href="#blog">Blog</a>
        <a href="#contact">Contact</a>
      </div>

      <div>
        <h4>Secure. Private. Compliant.</h4>
        <p>© 2024 RecordIQ. All rights reserved.</p>
      </div>
    </div>
  </footer>
</section>