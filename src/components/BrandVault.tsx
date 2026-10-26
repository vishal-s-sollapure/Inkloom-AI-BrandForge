import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  ShieldAlert, 
  Database, 
  Palette, 
  Upload, 
  Download, 
  Plus, 
  Search,
  ExternalLink,
  Trash2,
  Save
} from 'lucide-react';
import { ApprovedFact, BrandProfile, ForbiddenTerm, GuidelineRule, Role } from '../types';

interface BrandVaultProps {
  brand: BrandProfile;
  currentRole: Role;
  onUpdateBrand: (updatedBrand: BrandProfile) => void;
}

export const BrandVault: React.FC<BrandVaultProps> = ({
  brand,
  currentRole,
  onUpdateBrand
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'terms' | 'facts' | 'colors' | 'import_export'>('rules');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add Term Modal State
  const [showAddTermModal, setShowAddTermModal] = useState<boolean>(false);
  const [newTerm, setNewTerm] = useState<Partial<ForbiddenTerm>>({
    term: '',
    category: 'prohibited',
    reason: '',
    suggestedReplacement: '',
    guidelineRuleId: 'RULE-TERM-01'
  });

  // Add Fact Modal State
  const [showAddFactModal, setShowAddFactModal] = useState<boolean>(false);
  const [newFact, setNewFact] = useState<Partial<ApprovedFact>>({
    claim: '',
    category: 'Operational Metric',
    source: '',
    dateVerified: new Date().toISOString().split('T')[0],
    confidence: 1.0
  });

  // Import JSON State
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  // Terminology Handlers
  const handleSaveNewTerm = () => {
    if (!newTerm.term || !newTerm.suggestedReplacement) return;
    const termToAdd: ForbiddenTerm = {
      id: `TERM-${Date.now()}`,
      term: newTerm.term,
      category: newTerm.category || 'prohibited',
      reason: newTerm.reason || 'Flagged under enterprise brand guidelines.',
      suggestedReplacement: newTerm.suggestedReplacement,
      guidelineRuleId: newTerm.guidelineRuleId || 'RULE-TERM-01'
    };
    onUpdateBrand({
      ...brand,
      forbiddenTerms: [...brand.forbiddenTerms, termToAdd]
    });
    setShowAddTermModal(false);
    setNewTerm({ term: '', category: 'prohibited', reason: '', suggestedReplacement: '', guidelineRuleId: 'RULE-TERM-01' });
  };

  const handleDeleteTerm = (id: string) => {
    onUpdateBrand({
      ...brand,
      forbiddenTerms: brand.forbiddenTerms.filter(t => t.id !== id)
    });
  };

  // Facts Handlers
  const handleSaveNewFact = () => {
    if (!newFact.claim || !newFact.source) return;
    const factToAdd: ApprovedFact = {
      id: `FACT-${Date.now()}`,
      claim: newFact.claim,
      category: newFact.category || 'Enterprise Claim',
      source: newFact.source,
      dateVerified: newFact.dateVerified || new Date().toISOString().split('T')[0],
      confidence: newFact.confidence || 0.99
    };
    onUpdateBrand({
      ...brand,
      approvedFacts: [...brand.approvedFacts, factToAdd]
    });
    setShowAddFactModal(false);
    setNewFact({ claim: '', category: 'Operational Metric', source: '', dateVerified: new Date().toISOString().split('T')[0], confidence: 1.0 });
  };

  const handleDeleteFact = (id: string) => {
    onUpdateBrand({
      ...brand,
      approvedFacts: brand.approvedFacts.filter(f => f.id !== id)
    });
  };

  // Import / Export Handlers
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(brand, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${brand.id}-guidelines-vault.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = () => {
    try {
      setImportError('');
      const parsed = JSON.parse(importJsonText);
      if (!parsed.id || !parsed.name || !Array.isArray(parsed.rules)) {
        setImportError('Invalid Brand Vault format: missing id, name, or rules array.');
        return;
      }
      onUpdateBrand(parsed);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
      setImportJsonText('');
    } catch (err: any) {
      setImportError('Failed to parse JSON: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Brand Vault Banner */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <BookOpen size={20} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{brand.name} Brand Vault & Knowledge Base</h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Single source of approved truth for voice guidelines, prohibited nomenclature, verified factual claims, and design tokens.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportJson} title="Export Brand Vault as JSON">
            <Download size={14} />
            <span>Export JSON Vault</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`nav-tab-btn ${activeSubTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('rules')}
        >
          <FileText size={15} />
          <span>Brand Rules ({brand.rules.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'terms' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('terms')}
        >
          <ShieldAlert size={15} />
          <span>Terminology Lexicon ({brand.forbiddenTerms.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'facts' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('facts')}
        >
          <Database size={15} />
          <span>Approved Facts Library ({brand.approvedFacts.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('colors')}
        >
          <Palette size={15} />
          <span>Design Palette ({brand.colors.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'import_export' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('import_export')}
        >
          <Upload size={15} />
          <span>Import Custom Guidelines</span>
        </button>
      </div>

      {/* Tab 1: Rules */}
      {activeSubTab === 'rules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '1rem' }}>
          {brand.rules.map(rule => (
            <div key={rule.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-mono" style={{ fontSize: '0.725rem', color: '#818cf8', fontWeight: 600 }}>
                  {rule.id}
                </span>
                <span className={`pill pill-${rule.severity}`} style={{ fontSize: '0.65rem' }}>
                  {rule.severity.toUpperCase()}
                </span>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {rule.title}
              </h4>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {rule.summary}
              </p>

              <div style={{
                marginTop: 'auto',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.725rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
              }}>
                "{rule.sourceText}"
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Terminology Lexicon */}
      {activeSubTab === 'terms' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search forbidden terms or replacements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.65rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  minWidth: '260px'
                }}
              />
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setShowAddTermModal(true)}>
              <Plus size={14} />
              <span>Add Forbidden Term</span>
            </button>
          </div>

          {/* Terminology Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Flagged / Forbidden Term</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Category</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Recommended Replacement</th>
                  <th style={{ padding: '0.65rem 0.75rem' }}>Brand Rationale</th>
                  <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brand.forbiddenTerms
                  .filter(t => t.term.toLowerCase().includes(searchTerm.toLowerCase()) || t.suggestedReplacement.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(term => (
                    <tr key={term.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fb7185' }}>
                        "{term.term}"
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="pill pill-warning" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                          {term.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#34d399' }}>
                        "{term.suggestedReplacement}"
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                        {term.reason}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteTerm(term.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                          title="Delete term"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Approved Facts */}
      {activeSubTab === 'facts' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Approved Facts & Verified Claims</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Numerical claims in marketing materials must reference one of these verified records.
              </p>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setShowAddFactModal(true)}>
              <Plus size={14} />
              <span>Add Approved Fact</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {brand.approvedFacts.map(fact => (
              <div
                key={fact.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="font-mono" style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                      {fact.id}
                    </span>
                    <span className="pill pill-success" style={{ fontSize: '0.65rem' }}>
                      {fact.category}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Verified: {fact.dateVerified}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    "{fact.claim}"
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <strong>Verification Source:</strong> {fact.source} (Confidence: {Math.round(fact.confidence * 100)}%)
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteFact(fact.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                  title="Remove verified fact"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Design Tokens */}
      {activeSubTab === 'colors' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Brand Color Palette & Swatches</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Design tokens enforced across promotional graphics, websites, and email headers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {brand.colors.map(col => (
              <div
                key={col.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: col.hex,
                  border: '1px solid rgba(255,255,255,0.2)',
                  flexShrink: 0
                }} />

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {col.name}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.8rem', color: '#818cf8' }}>
                    {col.hex}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Usage: {col.usage}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Min Contrast: {col.minContrastRatio}:1
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Import Custom Guidelines */}
      {activeSubTab === 'import_export' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Import Custom Brand Guidelines</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Paste a JSON or schema-compliant brand guideline file to replace or customize the active Brand Vault rules.
          </p>

          {importSuccess && (
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ✓ Brand Guidelines successfully imported and loaded into BrandForge!
            </div>
          )}

          {importError && (
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: '#fb7185', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ⚠️ {importError}
            </div>
          )}

          <textarea
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder={`{\n  "id": "custom-brand",\n  "name": "Acme Global",\n  "version": "1.0",\n  "rules": [...],\n  "forbiddenTerms": [...],\n  "approvedFacts": [...]\n}`}
            style={{
              width: '100%',
              minHeight: '220px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              outline: 'none',
              marginBottom: '1rem'
            }}
          />

          <button className="btn btn-primary" onClick={handleImportJson}>
            <Save size={15} />
            <span>Validate & Import Guidelines</span>
          </button>
        </div>
      )}

      {/* Modal: Add Forbidden Term */}
      {showAddTermModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Add Forbidden Term to Lexicon</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prohibited Term / Phrase:</label>
                <input
                  type="text"
                  placeholder="e.g. infallible, cheap, 100% guarantee"
                  value={newTerm.term}
                  onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category:</label>
                <select
                  value={newTerm.category}
                  onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value as any })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="prohibited">Prohibited (Critical Blocker)</option>
                  <option value="hyperbole">Hyperbole & Empty Hype</option>
                  <option value="deprecated">Deprecated Old Nomenclature</option>
                  <option value="competitor">Unauthorized Competitor Reference</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recommended Replacement:</label>
                <input
                  type="text"
                  placeholder="e.g. resilient and battle-tested"
                  value={newTerm.suggestedReplacement}
                  onChange={(e) => setNewTerm({ ...newTerm, suggestedReplacement: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brand Rationale:</label>
                <input
                  type="text"
                  placeholder="Why is this term forbidden under brand guidelines?"
                  value={newTerm.reason}
                  onChange={(e) => setNewTerm({ ...newTerm, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddTermModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveNewTerm}>Save Term</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Approved Fact */}
      {showAddFactModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Add Approved Fact or Verified Claim</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Statement / Claim:</label>
                <textarea
                  placeholder="e.g. Inkloom AI achieved 99.4% precision in benchmark testing across 5,000 corporate assets..."
                  value={newFact.claim}
                  onChange={(e) => setNewFact({ ...newFact, claim: e.target.value })}
                  style={{ width: '100%', minHeight: '70px', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verification Source Document:</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford HAI 2026 Audit Report / SEC 10-K filing"
                  value={newFact.source}
                  onChange={(e) => setNewFact({ ...newFact, source: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category:</label>
                <input
                  type="text"
                  placeholder="e.g. Performance Benchmark, Security, Pricing"
                  value={newFact.category}
                  onChange={(e) => setNewFact({ ...newFact, category: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddFactModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveNewFact}>Save Verified Fact</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
