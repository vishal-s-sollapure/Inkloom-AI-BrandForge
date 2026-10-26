import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Check, 
  RotateCcw, 
  Send, 
  Copy, 
  BookOpen, 
  Wand2, 
  ShieldCheck, 
  Filter,
  CheckCheck,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  AnalysisFinding, 
  BrandProfile, 
  ContentFormat, 
  ContentItem, 
  FindingCategory, 
  FindingSeverity, 
  Role 
} from '../types';
import { applyCorrection, applyAllCorrections } from '../services/governanceEngine';

interface EditorStudioProps {
  contentItem: ContentItem;
  brand: BrandProfile;
  currentRole: Role;
  onUpdateContent: (updatedText: string, updatedTitle?: string, format?: ContentFormat) => void;
  onApplySingleFix: (finding: AnalysisFinding) => void;
  onDismissFinding: (findingId: string, reason: string) => void;
  onUndoFindingStatus: (findingId: string) => void;
  onSubmitForReview: () => void;
}

export const EditorStudio: React.FC<EditorStudioProps> = ({
  contentItem,
  brand,
  currentRole,
  onUpdateContent,
  onApplySingleFix,
  onDismissFinding,
  onUndoFindingStatus,
  onSubmitForReview
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [dismissModalFinding, setDismissModalFinding] = useState<AnalysisFinding | null>(null);
  const [dismissalReason, setDismissalReason] = useState<string>('');
  const [expandedGuidelineId, setExpandedGuidelineId] = useState<string | null>(null);

  const findings = contentItem.findings || [];
  const pendingFindings = findings.filter(f => f.status === 'pending');
  
  // Filtered findings list
  const filteredFindings = findings.filter(f => {
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    return true;
  });

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'score-perfect';
    if (score >= 75) return 'score-good';
    if (score >= 50) return 'score-warning';
    return 'score-danger';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(contentItem.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyAll = () => {
    const cleanText = applyAllCorrections(contentItem.rawText, findings);
    onUpdateContent(cleanText);
  };

  const handleConfirmDismiss = () => {
    if (dismissModalFinding) {
      onDismissFinding(dismissModalFinding.id, dismissalReason || 'Creator manual discretion applied.');
      setDismissModalFinding(null);
      setDismissalReason('');
    }
  };

  return (
    <div className="studio-container">
      {/* Studio Top Control Bar */}
      <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Document Title & Format */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <input 
              type="text" 
              value={contentItem.title}
              onChange={(e) => onUpdateContent(contentItem.rawText, e.target.value)}
              placeholder="Content Asset Title..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format:</span>
              <select
                value={contentItem.format}
                onChange={(e) => onUpdateContent(contentItem.rawText, contentItem.title, e.target.value as ContentFormat)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  outline: 'none'
                }}
              >
                <option value="press_release">📰 Press Release</option>
                <option value="article">📝 Long-form Article / Blog</option>
                <option value="social_post">📱 Social Media Announcement</option>
                <option value="email">✉️ Enterprise Email Newsletter</option>
                <option value="visual_asset">🖼️ Visual Asset Copy</option>
              </select>

              <span className={`pill ${contentItem.status === 'approved' ? 'pill-success' : 'pill-warning'}`}>
                Status: {contentItem.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Right Metrics: Compliance Gauge & Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Compliance Score Gauge */}
            <div className="score-badge" title="BrandForge Compliance Index">
              <div className={`score-circle ${getScoreColorClass(contentItem.complianceScore)}`}>
                {contentItem.complianceScore}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {contentItem.complianceScore >= 90 ? 'Brand Approved' : contentItem.complianceScore >= 75 ? 'Minor Revisions' : 'Policy Blockers'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {pendingFindings.length} issue{pendingFindings.length === 1 ? '' : 's'} detected
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            {pendingFindings.length > 0 && (
              <button 
                className="btn btn-primary"
                onClick={handleApplyAll}
                title="Automatically apply all safe terminology and tone suggestions"
              >
                <Wand2 size={15} />
                <span>Apply All Safe Fixes</span>
              </button>
            )}

            <button 
              className="btn btn-secondary"
              onClick={handleCopy}
              title="Copy text to clipboard"
            >
              {copied ? <Check size={15} style={{ color: '#10b981' }} /> : <Copy size={15} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {contentItem.status === 'draft' && (
              <button 
                className="btn btn-success"
                onClick={onSubmitForReview}
                title="Submit to Brand & Legal review queue"
              >
                <Send size={15} />
                <span>Submit for Review</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="studio-grid">
        
        {/* Left Column: Live Content Editor */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Content Draft</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time linting active • Zero-data-retention sandbox
            </div>
          </div>

          {/* Interactive Text Area */}
          <textarea
            className="editor-textarea"
            value={contentItem.rawText}
            onChange={(e) => onUpdateContent(e.target.value)}
            placeholder="Type, paste, or draft your content here..."
          />

          {/* Editor Footer Telemetry */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Words: <strong style={{ color: 'var(--text-primary)' }}>{contentItem.rawText.trim().split(/\s+/).filter(Boolean).length}</strong></span>
              <span>Characters: <strong style={{ color: 'var(--text-primary)' }}>{contentItem.rawText.length}</strong></span>
              {contentItem.format === 'social_post' && (
                <span style={{ color: contentItem.rawText.length > 280 ? '#f43f5e' : '#10b981' }}>
                  X/Twitter: {280 - contentItem.rawText.length} left
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={12} style={{ color: '#6366f1' }} />
              <span>Human in control • AI suggestions require author confirmation</span>
            </div>
          </div>
        </div>

        {/* Right Column: Explainable Findings & Suggestions */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '720px', overflowY: 'auto' }}>
          
          {/* Header & Filter Controls */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Governance Findings</span>
                <span className="pill pill-warning" style={{ fontSize: '0.7rem' }}>
                  {pendingFindings.length} Pending
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                6 Pillars Evaluated
              </div>
            </div>

            {/* Severity Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['all', 'critical', 'warning', 'suggestion'].map(sev => (
                <button
                  key={sev}
                  className={`btn btn-sm ${filterSeverity === sev ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}
                  onClick={() => setFilterSeverity(sev)}
                >
                  {sev}
                </button>
              ))}

              <div style={{ marginLeft: 'auto' }}>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.4rem',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Pillars</option>
                  <option value="tone">Tone & Voice</option>
                  <option value="terminology">Terminology</option>
                  <option value="claim">Facts & Claims</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="messaging">Messaging</option>
                </select>
              </div>
            </div>
          </div>

          {/* Findings List */}
          {filteredFindings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
              <CheckCheck size={42} style={{ color: '#10b981', margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No Issues Detected</div>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                Content fully aligns with active brand rules, approved facts, and accessibility guidelines.
              </p>
            </div>
          ) : (
            <div>
              {filteredFindings.map((finding) => (
                <div key={finding.id} className={`finding-card ${finding.severity}`}>
                  
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={`pill pill-${finding.severity}`} style={{ fontSize: '0.65rem' }}>
                        {finding.severity.toUpperCase()}
                      </span>
                      <span className="pill pill-suggestion" style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>
                        {finding.category}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {finding.status !== 'pending' && (
                      <span 
                        className="pill" 
                        style={{ 
                          fontSize: '0.65rem', 
                          background: finding.status === 'accepted' ? 'var(--success-bg)' : 'rgba(255, 255, 255, 0.08)',
                          color: finding.status === 'accepted' ? '#34d399' : 'var(--text-muted)'
                        }}
                      >
                        {finding.status === 'accepted' ? '✓ Accepted' : '⊘ Dismissed'}
                      </span>
                    )}
                  </div>

                  {/* Flagged Item Title & Quote */}
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {finding.title}
                  </div>

                  {/* Explanation */}
                  <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.55rem' }}>
                    {finding.explanation}
                  </div>

                  {/* Expandable Guideline Source Citation */}
                  <div style={{ marginBottom: '0.65rem' }}>
                    <button
                      onClick={() => setExpandedGuidelineId(expandedGuidelineId === finding.id ? null : finding.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#818cf8',
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <BookOpen size={12} />
                      <span>Guideline Rule: {finding.ruleId}</span>
                      <ChevronDown size={12} style={{ transform: expandedGuidelineId === finding.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {expandedGuidelineId === finding.id && (
                      <div style={{ 
                        marginTop: '0.4rem', 
                        padding: '0.6rem', 
                        borderRadius: 'var(--radius-sm)', 
                        background: 'rgba(99, 102, 241, 0.08)', 
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        fontSize: '0.725rem',
                        color: 'var(--text-primary)',
                        lineHeight: 1.5
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.2rem', color: '#c7d2fe' }}>
                          Official Guideline Rule Excerpt:
                        </div>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          "{finding.guidelineSource}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Suggested Correction Box */}
                  {finding.suggestedCorrection && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.65rem',
                      marginBottom: '0.65rem'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#34d399', marginBottom: '0.2rem' }}>
                        Suggested Context-Preserving Correction:
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        "{finding.suggestedCorrection}"
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {finding.status === 'pending' ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          style={{ flex: 1, padding: '0.35rem 0.5rem' }}
                          onClick={() => onApplySingleFix(finding)}
                        >
                          <Check size={13} />
                          <span>Apply Correction</span>
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.5rem' }}
                          onClick={() => setDismissModalFinding(finding)}
                          title="Dismiss or request exemption with justification"
                        >
                          <span>Dismiss</span>
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                        onClick={() => onUndoFindingStatus(finding.id)}
                      >
                        <RotateCcw size={12} />
                        <span>Re-evaluate</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dismissal Justification Modal */}
      {dismissModalFinding && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Author Justification / Exemption</span>
              </div>
              <button 
                onClick={() => setDismissModalFinding(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              You are dismissing rule <strong>{dismissModalFinding.ruleId}</strong> for quote: <em>"{dismissModalFinding.quote}"</em>. 
              Please record your editorial reasoning for the brand audit log.
            </p>

            <textarea
              value={dismissalReason}
              onChange={(e) => setDismissalReason(e.target.value)}
              placeholder="e.g. Approved special campaign exemption granted by CMO; satirical context; custom legal clearance..."
              style={{
                width: '100%',
                minHeight: '90px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setDismissModalFinding(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmDismiss}>
                Log Exemption & Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
