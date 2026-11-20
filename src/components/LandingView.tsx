import React from 'react';
import { PainPointsSections } from './PainPointsSections';

export const LandingView = () => {}}>
        <h2>About ZSREV</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
          The EMR and RCM world runs on misaligned incentives. Practices book demos that never happen. Vendors spend heavily on G2 and Capterra and still get appointments that produce zero results.
        </p>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
          Led by Zahid Ali — HIPAA-certified, with experience on both the provider and vendor side — ZSREV gives both a clear read on where things are actually leaking, before another contract is signed.
        </p>
        <div style={{ marginTop: '2rem', fontWeight: 'bold' }}>
          <p>No PHI. No patient data. A few quick questions, and a clear map of where to look next.</p>
          <p><em>Stuck anywhere? Our team of experts is one click away.</em></p>
        </div>
      </section>
      {/* ABOUT INTRO END */}


      {/* ========================================== */}
      {/* AUDIENCE CARDS START */}
      {/* ========================================== */}
      <section id="audiences" className="audience-section">
        <PainPointsSections />
      </section>
      {/* AUDIENCE CARDS END */}


      {/* ========================================== */}
      {/* EXPERT STRIP START */}
      {/* ========================================== */}
      <section className="expert-strip-section" style={{ backgroundColor: '#f8f9fa', padding: '3rem 2rem', textAlign: 'center' }}>
        <h3>You already have a team of experts who know the flow.</h3>
        <p>Stuck anywhere — a contract term, a workflow gap, a vendor decision — help is one click away.</p>
        <p>A quick meeting can save you hours of exploring options.</p>
      </section>
      {/* EXPERT STRIP END */}


      {/* ========================================== */}
      {/* HOW IT WORKS START */}
      {/* ========================================== */}
      <section id="how-it-works" className="how-it-works-section" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>How It Works</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h4>Step 1</h4>
            <p>Answer a few quick questions.</p>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h4>Step 2</h4>
            <p>Get a clear map of your revenue leaks and workflow gaps.</p>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h4>Step 3</h4>
            <p>Talk to our team — one click away, hours saved.</p>
          </div>
        </div>
      </section>
      {/* HOW IT WORKS END */}


      {/* ========================================== */}
      {/* FINAL CTA START */}
      {/* ========================================== */}
      <section className="final-cta-section" style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#111', color: '#fff' }}>
        <h2>See where you're leaking — before the next contract.</h2>
        <br />
        <a href="/diagnostic" style={{ display: 'inline-block', padding: '1rem 2rem', backgroundColor: '#fff', color: '#111', fontWeight: 'bold', textDecoration: 'none', borderRadius: '5px' }}>
          Take the diagnostic
        </a>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
          Note: No PHI. No patient data.
        </p>
      </section>
      {/* FINAL CTA END */}

    </div>
  );
};
