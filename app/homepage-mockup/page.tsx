export default function HomepageMockupPage() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
<section class="riq-page">
  <style>
    :root {
      --riq-blue: #1664e8;
      --riq-text: #0b1830;
      --riq-muted: #65758b;
      --riq-border: #dce5f2;
      --riq-soft-blue: #edf5ff;
      --riq-shadow: 0 18px 50px rgba(18, 45, 82, 0.12);
    }

    .riq-page {
      font-family: Inter, Arial, sans-serif;
      color: var(--riq-text);
      background: #ffffff;
      line-height: 1.45;
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
      background: white;
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
    }

    .riq-logo span {
      color: var(--riq-blue);
    }

    .riq-menu {
      display: flex;
      gap: 32px;
      font-size: 14px;
      font-weight: 700;
    }

    .riq-menu a {
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
    }

    .riq-btn-primary {
      background: var(--riq-blue);
      color: white;
      box-shadow: 0 12px 26px rgba(22,100,232,.22);
    }

    .riq-btn-outline {
      background: white;
      color: var(--riq-text);
      border-color: #b9c7da;
    }

    .riq-hero {
      padding: 56px 0;
      background: linear-gradient(180deg, #fff 0%, #f7fbff 100%);
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
      color: var(--riq-muted);
      font-size: 21px;
      margin: 0 0 32px;
    }

    .riq-hero-actions {
      display: flex;
      gap: 18px;
      margin-bottom: 34px;
    }

    .riq-trust-row {
      display: flex;
      gap: 28px;
      flex-wrap: wrap;
      color: #425169;
      font-size: 14px;
      font-weight: 700;
    }

    .riq-app-card {
      background: white;
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
      margin-bottom: 28px;
    }

    .riq-side-link {
      height: 38px;
      padding: 9px 12px;
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
      padding: 26px 30px;
    }

    .riq-preview-top {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e3ebf5;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }

    .riq-preview-top h3 {
      margin: 0;
      font-size: 22px;
    }

    .riq-preview-sub {
      color: #7b8799;
      font-size: 12px;
      font-weight: 700;
    }

    .riq-mini-btn {
      border: 1px solid #d5dfed;
      background: white;
      border-radius: 7px;
      padding: 9px 13px;
      font-size: 12px;
      font-weight: 800;
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

    .riq-event h4 {
      margin: 0 0 4px;
      font-size: 14px;
    }

    .riq-event p {
      margin: 0 0 5px;
      color: #627188;
      font-size: 12px;
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
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr;
  align-items: center;
  gap: 28px;
}

.riq-security-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #20314b;
}

.riq-security-item strong {
  display: block;
  color: #071831;
  font-size: 15px;
  line-height: 1.15;
  font-weight: 900;
  text-transform: none;
  letter-spacing: 0;
}

.riq-security-item span {
  display: block;
  color: #20314b;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.riq-security-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #ffffff;
  display: grid !important;
  place-items: center;
  color: var(--riq-blue);
  box-shadow: 0 10px 24px rgba(17, 44, 81, 0.08);
  flex: 0 0 auto;
}

.riq-security-icon svg {
  width: 28px;
  height: 28px;
  stroke: currentColor;
  display: block;
}

.riq-security-note {
  color: #56657b;
  font-size: 13px;
  line-height: 1.45;
  font-weight: 650;
}
    .riq-section {
      padding: 56px 0;
    }

    .riq-section-head {
      text-align: center;
      max-width: 680px;
      margin: 0 auto 34px;
    }

    .riq-section-head h2 {
      margin: 0 0 11px;
      font-size: 34px;
      letter-spacing: -0.04em;
    }

    .riq-section-head p {
      margin: 0;
      color: var(--riq-muted);
      font-size: 16px;
    }

    .riq-feature-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }

    .riq-feature-card,
    .riq-audience-card {
      background: white;
      border: 1px solid #dfe8f4;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 12px 28px rgba(17,44,81,.05);
    }

    .riq-feature-card {
      display: grid;
      grid-template-columns: 54px 1fr;
      gap: 18px;
    }

   .riq-card-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: #edf5ff;
  display: grid;
  place-items: center;
  color: var(--riq-blue);
  flex: 0 0 auto;
}

.riq-card-icon svg {
  width: 30px;
  height: 30px;
  stroke: currentColor;
}

    .riq-feature-card h3,
    .riq-audience-card h3 {
      margin: 0 0 8px;
      font-size: 15px;
    }

    .riq-feature-card p,
    .riq-audience-card p {
      margin: 0;
      color: #66758b;
      font-size: 13px;
    }

    .riq-steps {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 36px;
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
      font-size: 30px;
    }

    .riq-step h3 {
      margin: 0 0 8px;
      font-size: 15px;
    }

    .riq-step-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--riq-blue);
      color: white;
      display: inline-grid;
      place-items: center;
      font-size: 12px;
      margin-right: 8px;
    }

    .riq-step p {
      margin: 0;
      color: #647389;
      font-size: 14px;
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
      background: linear-gradient(135deg, #06162b, #092645 58%, #06162b);
      color: white;
      padding: 56px 0;
    }

    .riq-cta-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 50px;
      align-items: center;
    }

    .riq-cta h2 {
      margin: 0 0 14px;
      font-size: 42px;
      line-height: 1.12;
      letter-spacing: -0.05em;
    }

    .riq-cta p {
      margin: 0;
      color: #c8d5e7;
      font-size: 18px;
    }

    .riq-cta-actions {
      display: flex;
      gap: 20px;
    }

    .riq-cta .riq-btn-outline {
      background: transparent;
      border-color: rgba(255,255,255,.45);
      color: white;
    }

    .riq-footer {
      background: #07162a;
      color: #dce7f5;
      border-top: 1px solid rgba(255,255,255,.12);
      padding: 32px 0;
    }

    .riq-footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.6fr;
      gap: 34px;
    }

    .riq-footer a,
    .riq-footer p {
      display: block;
      color: #aebdd2;
      text-decoration: none;
      font-size: 13px;
      margin: 0 0 6px;
    }

    .riq-footer h4 {
      color: white;
      margin: 0 0 10px;
    }

    @media (max-width: 991px) {
      .riq-menu {
        display: none;
      }

      .riq-hero-grid,
      .riq-cta-grid {
        grid-template-columns: 1fr;
      }

      .riq-security-grid,
      .riq-feature-grid,
      .riq-steps,
      .riq-audience-grid,
      .riq-footer-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .riq-container {
        width: min(100% - 28px, 1160px);
      }

      .riq-hero h1 {
        font-size: 44px;
      }

      .riq-hero-actions {
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
.riq-security-item {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  font-weight: 800;
  color: #20314b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.riq-security-item strong {
  display: block;
  color: #071831;
  font-size: 15px;
  line-height: 1.1;
}

.riq-security-item span {
  display: block;
}

.riq-security-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #ffffff;
  display: grid;
  place-items: center;
  color: var(--riq-blue);
  box-shadow: 0 10px 24px rgba(17, 44, 81, 0.08);
  flex: 0 0 auto;
}

.riq-security-icon svg {
  width: 28px;
  height: 28px;
  stroke: currentColor;
}

.riq-security-note {
  color: #56657b;
  font-size: 13px;
  line-height: 1.45;
  font-weight: 650;
}
      .riq-security-grid,
      .riq-feature-grid,
      .riq-steps,
      .riq-audience-grid,
      .riq-footer-grid {
        grid-template-columns: 1fr;
      }
    }
      .riq-security-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr;
  align-items: center;
  gap: 28px;
}

.riq-security-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #20314b;
}

.riq-security-item strong {
  display: block;
  color: #071831;
  font-size: 15px;
  line-height: 1.15;
  font-weight: 900;
  text-transform: none;
  letter-spacing: 0;
}

.riq-security-item span {
  display: block;
  color: #20314b;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.riq-security-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #ffffff;
  display: grid !important;
  place-items: center;
  color: var(--riq-blue);
  box-shadow: 0 10px 24px rgba(17, 44, 81, 0.08);
  flex: 0 0 auto;
}

.riq-security-icon svg {
  width: 28px;
  height: 28px;
  stroke: currentColor;
  display: block;
}

.riq-security-note {
  color: #56657b;
  font-size: 13px;
  line-height: 1.45;
  font-weight: 650;
}
  </style>

  <header class="riq-navbar">
    <div class="riq-container riq-nav-inner">
      <a href="#" class="riq-logo">Record<span>IQ</span></a>

      <nav class="riq-menu">
        <a href="#product">Product</a>
        <a href="#solutions">Solutions</a>
        <a href="#security">Security</a>
        <a href="#pricing">Pricing</a>
        <a href="#resources">Resources</a>
        <a href="#about">About</a>
      </nav>

      <a class="riq-btn riq-btn-primary" href="#upload">Get Started</a>
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
            <div>✓ HIPAA-Ready Infrastructure</div>
            <div>🔒 Secure & Private</div>
            <div>☁ AI-Powered Extraction</div>
          </div>
        </div>

        <div class="riq-app-card">
          <aside class="riq-sidebar">
            <div class="riq-sidebar-logo">Record<span style="color:#1664e8;">IQ</span></div>
            <div class="riq-side-link active">Dashboard</div>
            <div class="riq-side-link">Uploads</div>
            <div class="riq-side-link">Timeline</div>
            <div class="riq-side-link">Summary</div>
            <div class="riq-side-link">Documents</div>
            <div class="riq-side-link">Settings</div>
          </aside>

          <div class="riq-main-preview">
            <div class="riq-preview-top">
              <div>
                <h3>Case Timeline</h3>
                <div class="riq-preview-sub">John Doe | Uploaded May 12, 2024</div>
              </div>
              <div>
                <button class="riq-mini-btn">Export</button>
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
      <span class="riq-security-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
          <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z"></path>
          <path d="M9 12l2 2 4-5"></path>
        </svg>
      </span>
      <div>
        <strong>Built for Privacy.</strong>
        <span>Designed for Trust.</span>
      </div>
    </div>

    <div class="riq-security-item">
      <span class="riq-security-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
          <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z"></path>
          <path d="M9 12l2 2 4-5"></path>
        </svg>
      </span>
      <div>
        <strong>HIPAA</strong>
        <span>READY</span>
      </div>
    </div>

    <div class="riq-security-item">
      <span class="riq-security-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
          <rect x="5" y="10" width="14" height="10" rx="2"></rect>
          <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
        </svg>
      </span>
      <div>
        <strong>SOC 2</strong>
        <span>PLANNED</span>
      </div>
    </div>

    <div class="riq-security-item">
      <span class="riq-security-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
          <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z"></path>
          <path d="M12 8v8"></path>
          <path d="M8 12h8"></path>
        </svg>
      </span>
      <div>
        <strong>AES-256</strong>
        <span>ENCRYPTION</span>
      </div>
    </div>

    <div class="riq-security-note">
      Your data is designed to stay secure, private, and protected.
    </div>
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
            <div class="riq-card-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6"/>
    <path d="M12 17V11"/>
    <path d="M9 14l3-3 3 3"/>
  </svg>
</div>
            <div>
             <h3>Precise, Secure Extraction</h3>
<p>AI extracts key medical facts from records with structure, speed, and security.</p>
            </div>
          </div>

          <div class="riq-feature-card">
            <div class="riq-card-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
    <path d="M8 6h13"/>
    <path d="M8 12h13"/>
    <path d="M8 18h13"/>
    <circle cx="3.5" cy="6" r="1.5"/>
    <circle cx="3.5" cy="12" r="1.5"/>
    <circle cx="3.5" cy="18" r="1.5"/>
  </svg>
</div>
            <div>
              <h3>Chronological Timeline</h3>
              <p>All events are arranged in order with source page references.</p>
            </div>
          </div>

          <div class="riq-feature-card">
            <div class="riq-card-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
    <path d="M4 6h16"/>
    <path d="M4 12h16"/>
    <path d="M4 18h10"/>
  </svg>
</div>
            <div>
              <h3>Case Summary</h3>
              <p>AI-generated summaries highlight key events, diagnoses, and treatments.</p>
            </div>
          </div>

          <div class="riq-feature-card">
            <div class="riq-card-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
    <path d="M12 3v12"/>
    <path d="M7 10l5 5 5-5"/>
    <path d="M5 21h14"/>
  </svg>
</div>
            <div>
              <h3>Export & Share</h3>
              <p>Export timelines and summaries for your case in seconds.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="riq-section" style="background:#f8fbff;">
      <div class="riq-container">
        <div class="riq-section-head">
          <h2>How RecordIQ Works</h2>
        </div>

        <div class="riq-steps">
          <div>
            <div class="riq-step-circle">⇧</div>
            <h3><span class="riq-step-number">1</span>Upload Your Records</h3>
            <p>Drag & drop your medical records. We support PDF files of any size.</p>
          </div>

          <div>
            <div class="riq-step-circle">▧</div>
          <h3><span class="riq-step-number">2</span>AI Identifies Key Facts</h3>
<p>Our AI pulls out the important medical events, diagnoses, treatments, and dates.</p>
          </div>

          <div>
            <div class="riq-step-circle">☷</div>
            <h3><span class="riq-step-number">3</span>Review Your Timeline</h3>
            <p>See your records in a clear timeline with source page references.</p>
          </div>

          <div>
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
            <div class="riq-card-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
    <path d="M12 3v18"/>
    <path d="M5 7h14"/>
    <path d="M6 7l-3 7h6l-3-7z"/>
    <path d="M18 7l-3 7h6l-3-7z"/>
  </svg>
</div>
            <div>
              <h3>Personal Injury Attorneys</h3>
              <p>Save hours. Understand records faster. Build stronger cases.</p>
              <a class="riq-learn" href="#">Learn more →</a>
            </div>
          </div>

          <div class="riq-audience-card">
            <div class="riq-card-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
    <circle cx="12" cy="7" r="4"/>
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
    <path d="M12 14v7"/>
    <path d="M9 18h6"/>
  </svg>
</div>
            <div>
              <h3>Medical Professionals</h3>
              <p>Quickly review patient histories and treatment timelines.</p>
              <a class="riq-learn" href="#">Learn more →</a>
            </div>
          </div>

          <div class="riq-audience-card">
            <div class="riq-card-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
    <path d="M6 3v6a4 4 0 0 0 8 0V3"/>
    <path d="M6 3H4"/>
    <path d="M14 3h2"/>
    <path d="M10 13v2a5 5 0 0 0 10 0v-2"/>
    <circle cx="20" cy="11" r="2"/>
  </svg>
</div>
            <div>
              <h3>Medical Experts</h3>
              <p>Review complex records, clarify medical findings, and support case strategy with organized source-backed timelines.</p>
              <a class="riq-learn" href="#">Learn more →</a>
            </div>
          </div>

          <div class="riq-audience-card">
            <div class="riq-card-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
    <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z"/>
    <path d="M9 12l2 2 4-5"/>
  </svg>
</div>
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

        <div class="riq-cta-actions">
          <a class="riq-btn riq-btn-primary" href="#upload">Upload Records Free</a>
          <a class="riq-btn riq-btn-outline" href="#demo">Book a Demo</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="riq-footer">
    <div class="riq-container riq-footer-grid">
      <div>
        <a href="#" class="riq-logo">Record<span>IQ</span></a>
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
        <h4>Secure. Private. Designed for Compliance.</h4>
        <p>© 2024 RecordIQ. All rights reserved.</p>
      </div>
    </div>
  </footer>
</section>
        `,
      }}
    />
  );
}