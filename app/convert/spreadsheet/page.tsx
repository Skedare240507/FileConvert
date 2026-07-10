'use client';

import React from 'react';
import styles from './page.module.css';

export default function SpreadsheetTools() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGpcRdVKIbSdz4ZBDajMV_gJnk5eipF_AaGT2qSaz3lHkCXNvdiwncTQnyKBKmS-hrZ-ovlL_RqabdvTTiomxTSiputTaFnkZTCZeYlZAyeLKkAmHolQAAsT2LB6x0z7N7u10EnDotuqkbzrlUEb-Wv0KmEDrWdctDlaB4IZjPFRJRZkj9BuyLvHZCHbjAmJYYUD0yzQQ3195INFzpeA6UeTXgnkdOYlGDQX7E4P0RQ-p4teKY0_hKVBK1Wkax5jIXRznb3Vmtaw"
          alt="background"
          aria-hidden="true"
          className={styles.heroBg}
        />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Spreadsheet Tools</h1>
          <p className={styles.subtitle}>
            The professional standard for Excel, CSV, and Google Sheets conversion. Clean, fast, and secure document processing for modern workflows.
          </p>
          <div className={styles.tags}>
            <span className={styles.tag}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
              Enterprise Grade
            </span>
            <span className={`${styles.tag} ${styles.tagOutline}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock</span>
              256-bit Encryption
            </span>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className={styles.toolsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Available Utilities</h2>
            <p className={styles.sectionDesc}>Select a conversion tool to begin your document processing task.</p>
          </div>
        </div>

        <div className={styles.toolsGrid}>
          {/* Tool Card: Excel to PDF */}
          <div className={styles.toolCard} onClick={() => window.location.href = '/convert/excel-to-pdf'}>
            <div className={styles.toolIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>picture_as_pdf</span>
            </div>
            <h3 className={styles.toolTitle}>Excel to PDF</h3>
            <p className={styles.toolDesc}>Convert .xlsx and .xls spreadsheets into professional PDF documents while preserving all formatting.</p>
            <div className={styles.toolLink}>
              Start Conversion
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>
          </div>

          {/* Tool Card: Excel to CSV */}
          <div className={styles.toolCard} onClick={() => window.location.href = '/convert/excel-to-csv'}>
            <div className={styles.toolIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>description</span>
            </div>
            <h3 className={styles.toolTitle}>Excel to CSV</h3>
            <p className={styles.toolDesc}>Efficiently export spreadsheet data to universally compatible CSV format for databases and analysis.</p>
            <div className={styles.toolLink}>
              Start Conversion
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>
          </div>

          {/* Tool Card: CSV to Excel */}
          <div className={styles.toolCard} onClick={() => window.location.href = '/convert/csv-to-excel'}>
            <div className={styles.toolIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>table_chart</span>
            </div>
            <h3 className={styles.toolTitle}>CSV to Excel</h3>
            <p className={styles.toolDesc}>Import raw comma-separated values into a fully editable and formatted Excel workbook.</p>
            <div className={styles.toolLink}>
              Start Conversion
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features/CTA Area */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.featuresImgWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgKLuAFIQpwpqQJ2OsGKr05YVu7DWgXTBqNuxlUqywFYyvKKAZk_hcu-3ENT0YUPAmYW4km0Fbi2eIArRlCbsdVwStbOm6KKY8_366vIUcJiHOfoMWGqeLhqyUr1SjMoygtuUBRVA68qckwaJymxSD4_2bktAZpiYqOpdTNkdkR614AkOunRrzSncQZd9nswfm_Nz7TAwRwxjEAznI57t2N700-TFGyDv5aLjoBb3kLqwtCCK03YPYh-L0WtuZsiK5KVnQEYPapQ"
              className={styles.featuresImg}
              alt="Professional features"
            />
          </div>
          <div>
            <span className={styles.featuresPretitle}>Professional Features</span>
            <h2 className={styles.featuresMainTitle}>Built for Corporate Accuracy</h2>
            <ul className={styles.featuresList}>
              <li className={styles.featuresListItem}>
                <span className={`material-symbols-outlined ${styles.featuresListIcon}`}>check_circle</span>
                <span className={styles.featuresListText}>Precision formatting retention for complex Excel formulas.</span>
              </li>
              <li className={styles.featuresListItem}>
                <span className={`material-symbols-outlined ${styles.featuresListIcon}`}>check_circle</span>
                <span className={styles.featuresListText}>Batch processing support for up to 100 files simultaneously.</span>
              </li>
              <li className={styles.featuresListItem}>
                <span className={`material-symbols-outlined ${styles.featuresListIcon}`}>check_circle</span>
                <span className={styles.featuresListText}>Secure cloud deletion after 2 hours for total privacy.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
