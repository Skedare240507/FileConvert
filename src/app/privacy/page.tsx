import React from 'react';
import styles from './page.module.css';

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>Effective Date: July 18, 2026</p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. About FileConvert</h2>
          <p className={styles.text}>
            FileConvert is a completely free, easy-to-use platform designed to help you transform files across different formats securely. 
            You do not need to create an account or provide personal details to use our core services.
          </p>
          <p className={styles.text}>Currently, we support the following conversions. Please check our homepage for the most up-to-date list:</p>
          <div className={styles.toolsList}>
            <span className={styles.toolBadge}>PDF to Word</span>
            <span className={styles.toolBadge}>PDF to PPT</span>
            <span className={styles.toolBadge}>PDF to JPG</span>
            <span className={styles.toolBadge}>JPG to PDF</span>
            <span className={styles.toolBadge}>JPG to PPT</span>
            <span className={styles.toolBadge}>Excel to CSV</span>
            <span className={styles.toolBadge}>CSV to Excel</span>
            <span className={styles.toolBadge}>Word to PDF</span>
            <span className={styles.toolBadge}>Word to PPT</span>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Cost & Refunds</h2>
          <p className={styles.text}>
            Our platform is 100% free of charge. We do not process payments, ask for credit card information, or charge subscription fees. Because no monetary transactions occur on FileConvert, we do not have a refund policy.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Information We Collect</h2>
          <p className={styles.text}>We believe in data minimization. We only collect what is strictly necessary to run the service:</p>
          <ul className={styles.list}>
            <li><strong>Your Files:</strong> When you upload a file for conversion, it is temporarily stored on our servers solely for processing.</li>
            <li><strong>Technical Data:</strong> Basic usage data, such as IP addresses and browser types, to monitor security and prevent abuse.</li>
            <li><strong>Cookies:</strong> We use strictly essential cookies to make the website function properly. No third-party advertising or tracking cookies are employed.</li>
          </ul>
          <p className={styles.text}>We do not collect sensitive personal data or require account registration.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. How We Use Your Files</h2>
          <p className={styles.text}>
            Your files are used exclusively to perform the requested format conversion. We do not review, reuse, or extract data from your documents for any other purpose.
          </p>
          <p className={styles.text}>
            To protect your privacy, all uploaded files and converted outputs are <strong>automatically deleted from our servers within 1 hour</strong> after conversion.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. No Sharing of Your Data</h2>
          <p className={styles.text}>We do not sell, rent, or trade your personal data or uploaded files to third parties. We may only share data under the following narrow exceptions:</p>
          <ul className={styles.list}>
            <li><strong>Legal Compliance:</strong> If required by law, subpoena, or legal process.</li>
            <li><strong>Protecting Rights:</strong> To enforce our terms, investigate fraud, or protect the safety of our users.</li>
            <li><strong>Infrastructure Providers:</strong> We use trusted cloud providers to host our service. They process data strictly on our behalf and are bound by stringent confidentiality agreements.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Data Security</h2>
          <p className={styles.text}>
            We implement reasonable technical and organizational safeguards to protect your files, including encrypted data transfers (SSL/TLS) and automatic file deletion policies. However, please note that no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Children's Privacy</h2>
          <p className={styles.text}>
            FileConvert is not directed at children under the age of 13 (or the applicable jurisdictional minimum age). We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Your Rights</h2>
          <p className={styles.text}>Depending on your location, you may have the right to:</p>
          <ul className={styles.list}>
            <li>Request information about the data we have about you.</li>
            <li>Request deletion of your data.</li>
            <li>Object to our processing of your data.</li>
          </ul>
          <p className={styles.text}>To exercise these rights, please contact us using the information provided below.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Policy Changes</h2>
          <p className={styles.text}>
            We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. Any updates will be posted on this page with a revised "Effective Date." Your continued use of FileConvert after changes are posted constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Contact Us</h2>
          <p className={styles.text}>If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us at:</p>
          <p className={styles.text}>
            <strong>Email:</strong> <a className={styles.link} href="mailto:support@fileconvert.test">support@fileconvert.test</a><br />
            <strong>Website:</strong> <a className={styles.link} href="/">fileconvert.test</a>
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          Disclaimer: This Privacy Policy is provided as a general informational template and does not constitute legal advice. It should be reviewed and adapted against applicable data protection laws relevant to your specific user base before being used as a binding legal document.
        </p>
      </footer>
    </div>
  );
}
