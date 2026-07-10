import styles from './page.module.css';

export default function Home() {
  const tools = [
    { title: 'PDF to Word', desc: 'Convert uneditable PDF text into fully customizable Word documents.', link: '/convert/pdf-to-word', iconBg: '#fff1f2', iconColor: '#e11d48', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path> },
    { title: 'PDF to PPT', desc: 'Turn your documents into dynamic presentations in seconds.', link: '/convert/pdf-to-ppt', iconBg: '#fff7ed', iconColor: '#ea580c', icon: <path d="M2 3h20v14H2z"></path> },
    { title: 'PDF to JPG', desc: 'Extract high-resolution images from any PDF file flawlessly.', link: '/convert/pdf-to-jpg', iconBg: '#eff6ff', iconColor: '#2563eb', icon: <rect x="3" y="3" width="18" height="18" rx="2"></rect> },
    { title: 'JPG to PDF', desc: 'Combine multiple images into a single, professional PDF document.', link: '/convert/jpg-to-pdf', iconBg: '#f0fdf4', iconColor: '#16a34a', icon: <rect x="3" y="3" width="18" height="18" rx="2"></rect> },
    { title: 'JPG to PPT', desc: 'Create slide decks directly from your image assets instantly.', link: '/convert/jpg-to-ppt', iconBg: '#fefce8', iconColor: '#ca8a04', icon: <path d="M2 3h20v14H2z"></path> },
    { title: 'Excel to CSV', desc: 'Clean, data-first conversion for spreadsheets and databases.', link: '/convert/excel-to-csv', iconBg: '#f0fdf4', iconColor: '#16a34a', icon: <rect x="3" y="3" width="18" height="18" rx="2"></rect> },
    { title: 'CSV to Excel', desc: 'Import raw data into powerful Excel workbooks for analysis.', link: '/convert/csv-to-excel', iconBg: '#f0fdf4', iconColor: '#16a34a', icon: <rect x="3" y="3" width="18" height="18" rx="2"></rect> },
    { title: 'Word to PDF', desc: 'Lock formatting and fonts by converting Word docs to PDF.', link: '/convert/word-to-pdf', iconBg: '#eff6ff', iconColor: '#2563eb', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path> },
    { title: 'Word to PPT', desc: 'Auto-generate slide layouts based on your document structure.', link: '/convert/word-to-ppt', iconBg: '#faf5ff', iconColor: '#9333ea', icon: <path d="M2 3h20v14H2z"></path> },
  ];

  return (
    <div className={styles.container}>
      {/* HERO */}
      <section className={styles.hero}>
        {/* Background image as real img element — always works regardless of CSS module quirks */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.jpg"
          alt="background image"
          aria-hidden="true"
          className={styles.heroBgImg}
        />
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.pillBadge}>The Professional Standard</div>
          <h1 className={styles.title}>
            Transform documents with <span className={styles.highlight}>Digital Precision</span>
          </h1>
          <p className={styles.subtitle}>
            Elevate your productivity with our suite of premium document tools. Secure, fast, and remarkably easy to use for professionals and students alike.
          </p>
          <div className={styles.heroActions}>
            <a href="#tools" className={styles.primaryBtn}>Convert a file now →</a>
            <a href="#tools" className={styles.secondaryBtn}>Explore All Tools</a>
          </div>
          <div className={styles.trustBadges}>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Secure SSL
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.3 0-.5 0-.8.1A7.5 7.5 0 0 0 3 14.5c0 2.5 2 4.5 4.5 4.5h10z"></path></svg>
              Cloud Sync
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Privacy First
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"></path><path d="M21 17v-6h-6"></path></svg>
              Instant Undo
            </span>
          </div>
        </div>
      </section>

      {/* TOOLS GRID */}
       
      <section id="tools" className={styles.toolsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <h2 className={styles.sectionTitle}>Common Converters</h2>
            <p className={styles.sectionSubtitle}>The tools you use every day, optimized for maximum speed and quality retention.</p>
          </div>
          <div className={styles.navControls}>
            <button aria-label="Previous">‹</button>
            <button aria-label="Next">›</button>
          </div>
        </div>
        <div className={styles.grid}>
          {tools.map((tool, index) => (
            <a key={index} href={tool.link} className={styles.toolCard}>
              <div className={styles.toolIconWrap} style={{ backgroundColor: tool.iconBg }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tool.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {tool.icon}
                </svg>
              </div>
              <div className={styles.toolCardContent}>
                <h3 className={styles.toolTitle}>{tool.title}</h3>
                <p className={styles.toolDesc}>{tool.desc}</p>
                <div className={styles.toolLink}>Start Conversion ↗</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className={styles.stepsSection}>
        <h2 className={styles.sectionTitleCentered}>Three Clicks to Perfection</h2>
        <p className={styles.sectionSubtitleCentered}>Our streamlined engine processes millions of files every month with industrial-grade efficiency.</p>
        <div className={styles.stepsWrapper}>
          <div className={styles.stepsLine}></div>
          {[
            { n: 1, title: 'Upload', desc: 'Drag and drop your files into our secure landing zone.', active: true },
            { n: 2, title: 'Validate', desc: 'We scan your file for integrity and optimal settings.', active: false },
            { n: 3, title: 'Convert', desc: 'Our high-speed servers process the transformation.', active: false },
            { n: 4, title: 'Download', desc: 'Grab your perfectly formatted file and get to work.', active: false },
          ].map((step) => (
            <div key={step.n} className={styles.step}>
              <div className={`${styles.stepNumber} ${step.active ? styles.stepActive : ''}`}>{step.n}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
