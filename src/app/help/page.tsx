'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

const faqs = [
  {
    q: 'Is there a limit on file size for conversion?',
    a: 'Free accounts can upload files up to 50MB. Premium accounts support files up to 2GB with batch processing.'
  },
  {
    q: 'How secure are my documents?',
    a: 'All uploads are encrypted with 256-bit TLS. Files are automatically and permanently deleted from our servers within 60 minutes of conversion.'
  },
  {
    q: 'Can I use FileConvert on my mobile device?',
    a: 'Yes! FileConvert is fully responsive and works on all modern browsers on smartphones, tablets, and desktops.'
  },
  {
    q: 'Which file formats are supported?',
    a: 'We support PDF, DOCX, DOC, XLSX, CSV, PPTX, JPG, PNG, HEIC, TIFF, BMP and more. See our tools pages for the full list.'
  }
];

const categories = [
  'Select a category',
  'Conversion Issue',
  'Account & Billing',
  'File Upload Problem',
  'Feature Request',
  'Other'
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', category: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setForm({ name: '', email: '', category: '', message: '' });
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>How can we help?</h1>
          <p className={styles.heroSubtitle}>
            Search our knowledge base or get in touch with our specialist support team. We&apos;re here to help you manage your documents efficiently.
          </p>
        </div>
      </div>

      {/* Main two-column layout — on mobile: form first (formCol order:1), FAQ second (faqCol order:2) */}
      <div className={styles.main}>

        {/* FAQ Column — order:2 on mobile, order:1 on desktop */}
        <div className={styles.faqCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </span>
              <h2 className={styles.cardTitle}>Frequently Asked Questions</h2>
            </div>

            <div className={styles.accordion}>
              {faqs.map((faq, i) => (
                <div key={i} className={styles.accordionItem}>
                  <button
                    className={styles.accordionBtn}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    {faq.q}
                    <svg
                      className={`${styles.accordionChevron} ${openFaq === i ? styles.open : ''}`}
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div className={`${styles.accordionContent} ${openFaq === i ? styles.open : ''}`}>
                    <p className={styles.accordionBody}>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Still have questions */}
            <div className={styles.stillBox}>
              <div className={styles.stillIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div>
                <p className={styles.stillTitle}>Still have questions?</p>
                <p className={styles.stillDesc}>If you couldn&apos;t find the answer in our FAQ, feel free to reach out using the feedback form.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column — order:1 on mobile (shows first), order:2 on desktop */}
        <div className={styles.formCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardHeaderIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </span>
              <h2 className={styles.cardTitle}>Send Feedback</h2>
            </div>

            {submitted ? (
              <div className={styles.successState}>
                <svg className={styles.successIcon} width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p className={styles.successTitle}>Message Sent!</p>
                <p className={styles.successDesc}>We&apos;ll get back to you within 2–4 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Issue Category</label>
                  <select
                    className={styles.select}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    required
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={i === 0 ? '' : c} disabled={i === 0}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Message</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>

                <div className={styles.responseNote}>
                  <span className={styles.responseNoteIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </span>
                  <p className={styles.responseNoteText}>
                    <strong>Response time note:</strong> Our team typically responds within <strong>2–4 business hours</strong>. Premium members are prioritized.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* CTA Banner */}
      <div className={styles.cta}>
        <div className={styles.ctaInner}>
          <div>
            <h2 className={styles.ctaTitle}>Need direct assistance?</h2>
            <p className={styles.ctaDesc}>Our document specialists are available for live chat from 9AM to 6PM EST for all enterprise customers.</p>
          </div>
          <button className={styles.ctaBtn}>Start Live Chat</button>
        </div>
      </div>
    </div>
  );
}
