import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  X, 
  CheckCircle2, 
  Key, 
  FileCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransparencyModal: React.FC<TransparencyModalProps> = ({
  isOpen,
  onClose
}) => {
  const [testHashText, setTestHashText] = useState<string>('');
  const [computedHash, setComputedHash] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleComputeTestHash = async () => {
    if (!testHashText) return;
    setIsVerifying(true);
    const msgBuffer = new TextEncoder().encode(testHashText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setComputedHash(hex);
    setIsVerifying(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', maxHeight: '88vh', overflowY: 'auto', padding: '1.75rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Confidentiality & AI Ethics Disclosure</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Responsible design, zero-leakage sandbox architecture, and transparent AI disclosures.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 4 Responsible Design Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <Lock size={15} />
              <span>Zero-Retention Privacy Sandbox</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Draft enterprise content is evaluated locally in-browser. Content is never transmitted to public foundation model training corpora.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <Cpu size={15} />
              <span>Deterministic Heuristics First</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Every flagged issue links to a verified Guideline Rule ID and approved source excerpt. Zero black-box rejections or hallucinations.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={15} />
              <span>Human-in-the-Loop Supremacy</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The platform never overrides author intent automatically. Writers and brand managers can dismiss or modify any suggestion with justification.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <Key size={15} />
              <span>SHA-256 Audit Seal</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Approved content receives a tamper-evident cryptographic signature sealing author identity, timestamp, and active brand rules.
            </p>
          </div>

        </div>

        {/* Live Cryptographic Verifier Sandbox */}
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileCheck size={16} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Interactive Web Crypto SHA-256 Verifier</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Test the tamper-evident hashing engine in real-time. Any modification to text immediately shifts the cryptographic seal:
          </p>

          <input
            type="text"
            placeholder="Type any test sentence to compute its live SHA-256 fingerprint..."
            value={testHashText}
            onChange={(e) => {
              setTestHashText(e.target.value);
            }}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.825rem',
              outline: 'none',
              marginBottom: '0.65rem'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handleComputeTestHash}>
              <span>Generate Audit Hash</span>
            </button>
            {computedHash && (
              <span className="font-mono" style={{ fontSize: '0.75rem', color: '#34d399', wordBreak: 'break-all' }}>
                {computedHash}
              </span>
            )}
          </div>
        </div>

        {/* Regulatory & Submission Disclosures */}
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
          <strong>Compliance Standards:</strong> Aligned with ISO/IEC 27001:2022 standards, EU AI Act High-Risk Governance Transparency Articles, and FTC Substantiation Policy Statement for Quantitative Claims.
        </div>
      </div>
    </div>
  );
};
