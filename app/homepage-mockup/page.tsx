const navLinks = [
  { label: "Product", href: "#" },
  { label: "Solutions", href: "#" , caret: true },
  { label: "Security", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Resources", href: "#", caret: true },
  { label: "About", href: "#" },
];

const securityItems = [
  {
    title: "Built for Privacy.",
    subtitle: "Designed for Trust.",
    icon: ShieldCheckIcon,
    blue: true,
  },
  {
    title: "HIPAA",
    subtitle: "COMPLIANT",
    icon: CaduceusIcon,
  },
  {
    title: "SOC 2",
    subtitle: "TYPE II",
    icon: LockIcon,
  },
  {
    title: "AES-256",
    subtitle: "ENCRYPTION",
    icon: ShieldIcon,
  },
  {
    title: "Your data is always secure,",
    subtitle: "private, and never shared.",
    icon: null,
    note: true,
  },
] as const;

const featureCards = [
  {
    title: "Upload & Extract",
    text: "Securely upload PDFs. We extract and organize every record.",
    icon: DocumentUploadIcon,
  },
  {
    title: "Chronological Timeline",
    text: "All events are arranged in order with source page references.",
    icon: BulletedTimelineIcon,
  },
  {
    title: "Case Summary",
    text: "AI-generated summaries highlight key events, diagnoses, and treatments.",
    icon: SummaryLinesIcon,
  },
  {
    title: "Export & Share",
    text: "Export timelines and summaries for your case in seconds.",
    icon: ExportIcon,
  },
] as const;

const steps = [
  {
    num: "1",
    title: "Upload Your Records",
    text: "Drag & drop your medical records. We support PDF files of any size.",
    icon: CloudUploadIcon,
  },
  {
    num: "2",
    title: "We Extract & Organize",
    text: "Our AI extracts the important information and organizes it chronologically.",
    icon: DocumentSearchIcon,
  },
  {
    num: "3",
    title: "Review Your Timeline",
    text: "See your records in a clear timeline with source page references.",
    icon: ChecklistIcon,
  },
  {
    num: "4",
    title: "Export & Build Your Case",
    text: "Download summaries or share with your team securely.",
    icon: DocumentExportIcon,
  },
] as const;

const audienceCards = [
  {
    title: "Personal Injury Attorneys",
    text: "Save hours. Understand records faster. Build stronger cases.",
    icon: ScalesIcon,
  },
  {
    title: "Medical Professionals",
    text: "Quickly review patient histories and treatment timelines.",
    icon: DoctorIcon,
  },
  {
    title: "Medical Experts",
    text: "Review complex records, clarify medical findings, and support case strategy with organized source-backed timelines.",
    icon: StethoscopeIcon,
  },
  {
    title: "Insurance & Claims",
    text: "Streamline review. Reduce back-and-forth. Speed decisions.",
    icon: ShieldCheckIcon,
  },
] as const;

export default function HomepageMockupPage() {
  return (
    <div className="riq-page">
      <style>{`
        :root {
          --riq-text: #0b1b3f;
          --riq-text-soft: #4f607d;
          --riq-blue: #1664e8;
          --riq-blue-2: #1d5be7;
          --riq-border: #dbe6f6;
          --riq-soft: #f5f8fe;
          --riq-soft-2: #edf5ff;
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

        button {
          font: inherit;
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
          border-bottom: 1px solid #e6edf8;
          background: #ffffff;
        }

        .riq-nav {
          min-height: 66px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .riq-logo {
          display: block;
          width: 188px;
          height: auto;
          object-fit: contain;
          flex: 0 0 auto;
        }

        .riq-logo-sidebar {
          display: block;
          width: 118px;
          height: auto;
          object-fit: contain;
        }

        .riq-logo-footer {
          display: block;
          width: 176px;
          height: auto;
          object-fit: contain;
        }

        .riq-nav-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .riq-nav-links a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--riq-text);
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
        }

        .riq-caret {
          display: inline-block;
          width: 10px;
          height: 10px;
          color: #1a315a;
          transform: translateY(1px);
        }

        .riq-nav-actions {
          display: flex;
          align-items: center;
          gap: 18px;
          flex: 0 0 auto;
        }

        .riq-login {
          color: var(--riq-text);
          font-size: 15px;
          font-weight: 600;
        }

        .riq-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 22px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 700;
          border: 1px solid transparent;
          cursor: pointer;
          white-space: nowrap;
        }

        .riq-btn-primary {
          background: linear-gradient(180deg, #2d78ff 0%, #1664e8 100%);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(22, 100, 232, 0.18);
        }

        .riq-btn-secondary {
          background: #ffffff;
          color: var(--riq-text);
          border-color: #b8cae8;
        }

        .riq-btn-dark {
          background: transparent;
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.48);
        }

        .riq-hero {
          padding: 38px 0 22px;
          background: #ffffff;
        }

        .riq-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(520px, 0.98fr);
          gap: 52px;
          align-items: center;
        }

        .riq-hero-copy h1 {
          margin: 0 0 22px;
          color: var(--riq-text);
          font-size: clamp(50px, 5.7vw, 74px);
          line-height: 0.98;
          letter-spacing: -0.055em;
          font-weight: 700;
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
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
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
          color: #63789a;
          flex: 0 0 auto;
        }

        .riq-mock {
          display: grid;
          grid-template-columns: 175px 1fr;
          min-height: 530px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid var(--riq-border);
          border-radius: 24px;
          box-shadow: var(--riq-shadow);
        }

        .riq-mock-sidebar {
          padding: 22px 18px;
          background: linear-gradient(180deg, #f7fbff 0%, #f5f8fe 100%);
          border-right: 1px solid var(--riq-border);
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
          color: #4a5a78;
          font-size: 14px;
          font-weight: 600;
        }

        .riq-mock-nav-item.active {
          background: #eaf1ff;
          color: var(--riq-blue);
        }

        .riq-mock-nav-item svg {
          width: 18px;
          height: 18px;
          flex: 0 0 auto;
        }

        .riq-mock-main {
          padding: 24px 26px;
        }

        .riq-mock-head {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 18px;
          margin-bottom: 18px;
          border-bottom: 1px solid var(--riq-border);
        }

        .riq-mock-head h3 {
          margin: 0 0 6px;
          color: var(--riq-text);
          font-size: 24px;
          line-height: 1.1;
          font-weight: 700;
        }

        .riq-mock-head p {
          margin: 0;
          color: #60718d;
          font-size: 12px;
          font-weight: 600;
        }

        .riq-mock-head-actions {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex-wrap: wrap;
        }

        .riq-mock-chip {
          min-height: 40px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #cbd8ee;
          border-radius: 12px;
          color: var(--riq-text);
          font-size: 14px;
          font-weight: 700;
        }

        .riq-timeline {
          display: grid;
          gap: 20px;
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
          bottom: -26px;
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
          margin-bottom: 8px;
          color: #3e4f6d;
          font-size: 14px;
          font-weight: 700;
        }

        .riq-timeline-title {
          margin: 0 0 6px;
          color: var(--riq-text);
          font-size: 16px;
          font-weight: 700;
        }

        .riq-timeline-body {
          margin: 0 0 6px;
          color: #586983;
          font-size: 13px;
          line-height: 1.45;
        }

        .riq-timeline-source {
          color: var(--riq-blue);
          font-size: 13px;
          font-weight: 700;
        }

        .riq-security-strip {
          background: linear-gradient(180deg, #f7fbff 0%, #f3f8ff 100%);
          border-top: 1px solid #edf4fe;
          border-bottom: 1px solid #edf4fe;
        }

        .riq-security-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.88fr 0.88fr 0.88fr 1.35fr;
          gap: 18px;
          align-items: center;
          padding: 14px 0;
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
          color: var(--riq-text);
          font-size: 15px;
          line-height: 1.18;
          font-weight: 700;
        }

        .riq-security-item span {
          display: block;
          color: #4d5f7b;
          font-size: 15px;
          line-height: 1.32;
          font-weight: 600;
        }

        .riq-security-note strong,
        .riq-security-note span {
          display: block;
          color: #3c4f6e;
          font-size: 15px;
          line-height: 1.32;
          font-weight: 600;
        }

        .riq-section {
          padding: 54px 0;
          background: #ffffff;
        }

        .riq-section-soft {
          background: linear-gradient(180deg, #fbfdff 0%, #f7fbff 100%);
        }

        .riq-section-head {
          max-width: 860px;
          margin: 0 auto 34px;
          text-align: center;
        }

        .riq-section-head h2 {
          margin: 0 0 12px;
          color: var(--riq-text);
          font-size: clamp(34px, 4vw, 54px);
          line-height: 1.05;
          letter-spacing: -0.045em;
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
          display: grid;
          grid-template-columns: 66px 1fr;
          gap: 18px;
          align-items: start;
          min-height: 168px;
          padding: 22px;
        }

        .riq-card-icon {
          display: grid;
          place-items: center;
          width: 62px;
          height: 62px;
          border-radius: 18px;
          background: #edf5ff;
          color: var(--riq-blue);
          flex: 0 0 auto;
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
          color: var(--riq-text);
          font-size: 16px;
          line-height: 1.3;
          font-weight: 700;
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
          position: relative;
          padding: 16px 12px 0;
          text-align: left;
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
          display: grid;
          place-items: center;
          width: 88px;
          height: 88px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #edf5ff;
          color: var(--riq-blue);
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
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          margin-top: 1px;
          border-radius: 50%;
          background: var(--riq-blue);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          flex: 0 0 auto;
        }

        .riq-step-copy h3 {
          margin: 0 0 6px;
          color: var(--riq-text);
          font-size: 16px;
          line-height: 1.35;
          font-weight: 700;
        }

        .riq-step-copy p {
          margin: 0;
          color: #5b6d88;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 500;
        }

        .riq-audience-card {
          display: grid;
          grid-template-columns: 58px 1fr;
          gap: 18px;
          align-items: start;
          min-height: 188px;
          padding: 24px;
        }

        .riq-audience-card h3 {
          margin: 2px 0 8px;
          color: var(--riq-text);
          font-size: 16px;
          line-height: 1.35;
          font-weight: 700;
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

        .riq-bottom {
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #123b7d 0%, #0b2d66 46%, #08244f 100%);
          color: #ffffff;
          margin-top: 8px;
        }

        .riq-bottom::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 22% 10%, rgba(73, 138, 255, 0.13), transparent 38%),
            radial-gradient(circle at 82% 20%, rgba(64, 132, 255, 0.08), transparent 30%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0));
          pointer-events: none;
        }

        .riq-bottom-dots {
          position: absolute;
          right: 12px;
          bottom: 10px;
          width: 190px;
          height: 124px;
          opacity: 0.56;
          pointer-events: none;
          background-image: radial-gradient(rgba(74, 145, 255, 0.65) 1.35px, transparent 1.35px);
          background-size: 14px 14px;
        }

        .riq-bottom-inner {
          position: relative;
          z-index: 1;
          padding: 28px 0 18px;
        }

        .riq-cta-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 24px;
          padding-bottom: 4px;
        }

        .riq-cta-copy h2 {
          margin: 0 0 10px;
          color: #ffffff;
          font-size: clamp(32px, 3.8vw, 52px);
          line-height: 1.04;
          letter-spacing: -0.05em;
          font-weight: 700;
          max-width: 620px;
        }

        .riq-cta-copy p {
          margin: 0;
          color: rgba(255, 255, 255, 0.85);
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
          justify-content: flex-end;
          gap: 14px;
          flex-wrap: wrap;
        }

        .riq-cta-points {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          flex-wrap: wrap;
          color: rgba(255, 255, 255, 0.92);
          font-size: 12px;
          font-weight: 600;
        }

        .riq-cta-points span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .riq-cta-points svg {
          width: 16px;
          height: 16px;
          color: #2d8dff;
          flex: 0 0 auto;
        }

        .riq-divider {
          margin: 12px 0 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
        }

        .riq-footer-grid {
          display: grid;
          grid-template-columns: 1.28fr 0.82fr 0.82fr 0.82fr 1.16fr;
          gap: 16px;
          align-items: start;
        }

        .riq-footer-brand {
          padding-top: 4px;
        }

        .riq-footer-col h4,
        .riq-footer-legal h4 {
          margin: 0 0 12px;
          color: #ffffff;
          font-size: 15px;
          line-height: 1.2;
          font-weight: 700;
        }

        .riq-footer-col {
          display: grid;
          gap: 10px;
        }

        .riq-footer-col a,
        .riq-footer-legal p {
          color: rgba(255, 255, 255, 0.88);
          font-size: 15px;
          line-height: 1.5;
          font-weight: 500;
        }

        .riq-footer-legal p {
          margin: 0;
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

          .riq-bottom-dots {
            width: 132px;
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

          <nav className="riq-nav-links" aria-label="Primary">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href}>
                <span>{item.label}</span>
                {item.caret ? (
                  <svg className="riq-caret" viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </a>
            ))}
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
                  <img className="riq-logo-sidebar" src="/logo/recordiq-logo.png" alt="RecordIQ" />
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

            <div className="riq-security-item riq-security-note">
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
              {featureCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div className="riq-card riq-feature-card" key={card.title}>
                    <div className="riq-card-icon" aria-hidden="true">
                      <Icon />
                    </div>
                    <div>
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="riq-section riq-section-soft">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>How RecordIQ Works</h2>
            </div>

            <div className="riq-works-grid">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div className="riq-step-card" key={step.title}>
                    <div className="riq-step-icon" aria-hidden="true">
                      <Icon />
                    </div>
                    <div className="riq-step-meta">
                      <span className="riq-step-num">{step.num}</span>
                      <div className="riq-step-copy">
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="riq-section">
          <div className="riq-container">
            <div className="riq-section-head">
              <h2>Built for Professionals Who Build Strong Cases</h2>
            </div>

            <div className="riq-grid-4">
              {audienceCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div className="riq-card riq-audience-card" key={card.title}>
                    <div className="riq-card-icon" aria-hidden="true">
                      <Icon />
                    </div>
                    <div>
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                      <a className="riq-learn" href="#">
                        Learn more <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="riq-bottom">
          <div className="riq-bottom-dots" aria-hidden="true" />
          <div className="riq-container riq-bottom-inner">
            <div className="riq-cta-grid">
              <div className="riq-cta-copy">
                <h2>Ready to Save Time and Build Stronger Cases?</h2>
                <p>
                  Join professionals who trust RecordIQ to turn medical records into clarity.
                </p>
              </div>

              <div className="riq-cta-actions">
                <div className="riq-cta-buttons">
                  <a className="riq-btn riq-btn-primary" href="#">
                    Upload Records Free
                  </a>
                  <a className="riq-btn riq-btn-dark" href="#">
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
                <img className="riq-logo-footer" src="/logo/recordiq-logo.png" alt="RecordIQ" />
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
      </main>
    </div>
  );
}

function IconBase({ children }: { children: React.ReactNode }) {
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
      <path d="M12 3.8v16.4" />
      <path d="M12 6.2c-2.1 0-3.8 1.1-5.1 3" />
      <path d="M12 6.2c2.1 0 3.8 1.1 5.1 3" />
      <path d="M7.2 10.4c1 .9 2.4 1.4 4.8 1.4s3.8-.5 4.8-1.4" />
      <path d="M7.2 13.6c1-.9 2.4-1.4 4.8-1.4s3.8.5 4.8 1.4" />
      <path d="M12 18.8c-2.1 0-3.8-1.1-5.1-3" />
      <path d="M12 18.8c2.1 0 3.8-1.1 5.1-3" />
      <path d="M8.5 8.8 6.4 7.2" />
      <path d="M15.5 8.8l2.1-1.6" />
      <path d="M8.5 15.2 6.4 16.8" />
      <path d="M15.5 15.2l2.1 1.6" />
    </IconBase>
  );
}

function UploadRecordIcon() {
  return (
    <IconBase>
      <path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 20V5A1.5 1.5 0 0 1 8.5 3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="M12 15V10" />
      <path d="m9.8 12.2 2.2-2.2 2.2 2.2" />
      <circle cx="17.2" cy="17.2" r="2.35" />
      <path d="M17.2 16.05v2.3" />
      <path d="M16.05 17.2h2.3" />
    </IconBase>
  );
}

function DocumentUploadIcon() {
  return <UploadRecordIcon />;
}

function BulletedTimelineIcon() {
  return (
    <IconBase>
      <circle cx="6" cy="7" r="1.2" />
      <circle cx="6" cy="12" r="1.2" />
      <circle cx="6" cy="17" r="1.2" />
      <path d="M9.8 7h8.2" />
      <path d="M9.8 12h8.2" />
      <path d="M9.8 17h8.2" />
    </IconBase>
  );
}

function SummaryLinesIcon() {
  return (
    <IconBase>
      <path d="M5.2 7h13.6" />
      <path d="M5.2 11h13.6" />
      <path d="M5.2 15h13.6" />
      <path d="M5.2 19h13.6" />
    </IconBase>
  );
}

function ExportIcon() {
  return (
    <IconBase>
      <path d="M12 3.5v9.5" />
      <path d="m8.5 9.8 3.5 3.5 3.5-3.5" />
      <path d="M5.8 19h12.4" />
    </IconBase>
  );
}

function CloudUploadIcon() {
  return (
    <IconBase>
      <path d="M7 18h10a4 4 0 0 0 .6-7.9A5.2 5.2 0 0 0 6.6 9.2 3.6 3.6 0 0 0 7 18Z" />
      <path d="M12 16V9.5" />
      <path d="m9.2 12.2 2.8-2.8 2.8 2.8" />
    </IconBase>
  );
}

function SearchDocumentIcon() {
  return (
    <IconBase>
      <path d="M8 3.5h6l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 7 20V5A1.5 1.5 0 0 1 8.5 3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="M10.8 12h3.1" />
      <path d="M10.8 14.2h4.2" />
      <circle cx="13.8" cy="15" r="2.7" />
      <path d="m15.9 17.1 2.2 2.2" />
    </IconBase>
  );
}

function DocumentSearchIcon() {
  return <SearchDocumentIcon />;
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
      <path d="M16.1 12.3v3.3" />
      <path d="M16.1 15.6c0 1.7 1.2 2.9 2.9 2.9" />
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
