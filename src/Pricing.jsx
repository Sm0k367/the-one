import React from 'react';

export default function Pricing() {
  return (
    <div className="pricing-section" style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      background: '#1e293b', 
      borderRadius: '12px', 
      margin: '2rem auto', 
      maxWidth: '600px' 
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#60a5fa' }}>
        Unlock Unlimited Access
      </h2>
      
      <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#94a3b8' }}>
        Get unlimited messages, priority responses, and access to advanced features with our Pro plan.
      </p>

      <div style={{ 
        background: '#334155', 
        padding: '1.5rem', 
        borderRadius: '12px', 
        marginBottom: '1.5rem' 
      }}>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>$9.99 / month</h3>
        <p style={{ color: '#60a5fa', fontWeight: 'bold' }}>Pro Plan</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
          <li>✅ Unlimited conversations</li>
          <li>✅ Faster AI responses</li>
          <li>✅ Priority support</li>
          <li>✅ No daily limits</li>
        </ul>
      </div>

      {/* Your Stripe Checkout redirect button */}
      <a 
        href="https://buy.stripe.com/3cI8wQgj74LI592cDM0Fi05"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          background: '#3b82f6',
          color: 'white',
          padding: '1rem 2.5rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          borderRadius: '9999px',
          textDecoration: 'none',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
        }}
        onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
        onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}
      >
        Subscribe to Pro → Unlock Now
      </a>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
        Secure payment via Stripe. Cancel anytime.
      </p>
    </div>
  );
}
