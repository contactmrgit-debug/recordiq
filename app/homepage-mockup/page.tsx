export default function HomepageMockupPage() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
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

    /* keep the rest of your CSS here */
  </style>

  <!-- keep the rest of your homepage HTML here -->

</section>
        `,
      }}
    />
  );
}