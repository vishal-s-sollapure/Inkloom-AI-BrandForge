import React, { useState } from 'react';
import { 
  GitPullRequest, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MessageSquare, 
  History, 
  Award, 
  ShieldCheck, 
  Send, 
  Check, 
  Download,
  UserCheck,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ComplianceCertificate, ContentItem, Role } from '../types';

interface WorkflowHubProps {
  contentItem: ContentItem;
  currentRole: Role;
  onUpdateStatus: (newStatus: 'draft' | 'in_review' | 'changes_requested' | 'approved') => void;
  onAddComment: (commentText: string) => void;
  onResolveComment: (commentId: string) => void;
  onGenerateSeal: () => Promise<void>;
}

export const WorkflowHub: React.FC<WorkflowHubProps> = ({
  contentItem,
  currentRole,
  onUpdateStatus,
  onAddComment,
  onResolveComment,
  onGenerateSeal
}) => {
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [selectedRevisionVersion, setSelectedRevisionVersion] = useState<number>(1);
  const [isSealing, setIsSealing] = useState<boolean>(false);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim());
    setNewCommentText('');
  };

  const handleTriggerSeal = async () => {
    setIsSealing(true);
    await onGenerateSeal();
    setIsSealing(false);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  const getStepStatus = (step: 'draft' | 'in_review' | 'changes_requested' | 'approved') => {
    const order = ['draft', 'in_review', 'approved'];
    if (contentItem.status === 'changes_requested') {
      if (step === 'changes_requested') return 'active-warning';
      if (step === 'draft') return 'completed';
      return 'pending';
    }
    const currentIdx = order.indexOf(contentItem.status);
    const stepIdx = order.indexOf(step);
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Workflow Header Banner */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <GitPullRequest size={20} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Review & Approval Lifecycle Hub</h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Role-based governance state machine with human-in-the-loop review, contextual discussion threads, and audit seals.
          </p>
        </div>

        {/* Current State Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lifecycle State:</span>
          <span className={`pill ${contentItem.status === 'approved' ? 'pill-success' : contentItem.status === 'changes_requested' ? 'pill-critical' : 'pill-warning'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
            {contentItem.status.toUpperCase().replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Lifecycle Progress Bar */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          
          {/* Connector Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '5%',
            right: '5%',
            height: '2px',
            backgroundColor: 'var(--border-subtle)',
            zIndex: 1
          }} />

          {/* Step 1: Draft */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '0.4rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: getStepStatus('draft') === 'completed' || getStepStatus('draft') === 'active' ? '#6366f1' : 'var(--bg-secondary)',
              border: '2px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Check size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>1. Creator Draft</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pre-screened</span>
          </div>

          {/* Step 2: In Review */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '0.4rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: contentItem.status === 'in_review' ? '#f59e0b' : contentItem.status === 'approved' ? '#6366f1' : 'var(--bg-secondary)',
              border: `2px solid ${contentItem.status === 'in_review' ? '#f59e0b' : contentItem.status === 'approved' ? '#6366f1' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Clock size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>2. Brand Review</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tone & Nomenclature</span>
          </div>

          {/* Step 3: Legal & Compliance Sign-off */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '0.4rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: contentItem.status === 'approved' ? '#10b981' : 'var(--bg-secondary)',
              border: `2px solid ${contentItem.status === 'approved' ? '#10b981' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <FileCheck2 size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>3. Legal Sign-off</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Claim Verification</span>
          </div>

          {/* Step 4: Approved & Cryptographic Seal */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '0.4rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: contentItem.status === 'approved' ? '#10b981' : 'var(--bg-secondary)',
              border: `2px solid ${contentItem.status === 'approved' ? '#10b981' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: contentItem.status === 'approved' ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none'
            }}>
              <Award size={18} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>4. Compliance Seal</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ready to Publish</span>
          </div>

        </div>

        {/* Role Action Controls */}
        <div style={{
          marginTop: '1.75rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={18} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '0.85rem' }}>
              Acting as: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{currentRole.replace('_', ' ')}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Creator Actions */}
            {currentRole === 'creator' && (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onUpdateStatus('in_review')}
                  disabled={contentItem.status === 'in_review'}
                >
                  <Send size={14} />
                  <span>Submit to Brand Queue</span>
                </button>
              </>
            )}

            {/* Brand Manager Actions */}
            {currentRole === 'brand_manager' && (
              <>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onUpdateStatus('changes_requested')}
                >
                  <AlertCircle size={14} />
                  <span>Request Revisions</span>
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onUpdateStatus('in_review')}
                >
                  <CheckCircle2 size={14} />
                  <span>Endorse Brand Voice</span>
                </button>
              </>
            )}

            {/* Legal & Compliance Actions */}
            {currentRole === 'legal_compliance' && (
              <>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onUpdateStatus('changes_requested')}
                >
                  <AlertCircle size={14} />
                  <span>Reject Claims</span>
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleTriggerSeal}
                  disabled={isSealing || contentItem.complianceScore < 70}
                >
                  <Award size={16} />
                  <span>{isSealing ? 'Computing SHA-256...' : 'Approve & Issue Compliance Seal'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Comments & Revision Diffs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Contextual Discussion & Feedback */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} style={{ color: '#6366f1' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Reviewer Feedback & Discussion</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {contentItem.comments.length} comment{contentItem.comments.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Comment Thread */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto' }}>
            {contentItem.comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No review comments yet. Start the conversation below.
              </div>
            ) : (
              contentItem.comments.map(c => (
                <div
                  key={c.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: c.resolved ? 'rgba(255, 255, 255, 0.02)' : 'rgba(99, 102, 241, 0.05)',
                    border: `1px solid ${c.resolved ? 'var(--border-subtle)' : 'rgba(99, 102, 241, 0.25)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                        {c.authorName}
                      </span>
                      <span className={`role-badge role-${c.authorRole}`} style={{ fontSize: '0.65rem' }}>
                        {c.authorRole.replace('_', ' ')}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {c.timestamp}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    {c.text}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                      onClick={() => onResolveComment(c.id)}
                    >
                      <Check size={12} style={{ color: c.resolved ? '#10b981' : 'inherit' }} />
                      <span>{c.resolved ? 'Resolved' : 'Mark as Resolved'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input Form */}
          <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <input
              type="text"
              placeholder={`Add comment as ${currentRole.replace('_', ' ')}...`}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.825rem',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Send size={13} />
              <span>Post</span>
            </button>
          </form>
        </div>

        {/* Right Column: Revision History & Cryptographic Seal */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Certificate Badge if Approved */}
          {contentItem.certificate ? (
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.08))',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <Award size={22} style={{ color: '#10b981' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>
                  Pre-Publication Compliance Seal Issued
                </h4>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                <div><strong>Certificate ID:</strong> <span className="font-mono">{contentItem.certificate.certificateId}</span></div>
                <div><strong>Authorized Approver:</strong> {contentItem.certificate.approvedBy} ({contentItem.certificate.approverRole.replace('_', ' ')})</div>
                <div><strong>Timestamp:</strong> {new Date(contentItem.certificate.timestamp).toLocaleString()}</div>
                <div><strong>Brand Vault Version:</strong> {contentItem.certificate.brandVaultVersion}</div>
                <div><strong>Compliance Score:</strong> {contentItem.certificate.complianceScore}% ({contentItem.certificate.rulesEvaluatedCount} rules evaluated)</div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '0.6rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.75rem'
              }}>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  Cryptographic SHA-256 Audit Fingerprint:
                </div>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: '#818cf8', wordBreak: 'break-all' }}>
                  {contentItem.certificate.sha256Hash}
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const certStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contentItem.certificate, null, 2));
                  const link = document.createElement('a');
                  link.setAttribute("href", certStr);
                  link.setAttribute("download", `${contentItem.certificate?.certificateId}.json`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
                style={{ width: '100%', gap: '0.4rem' }}
              >
                <Download size={14} />
                <span>Export Audit Certificate (JSON)</span>
              </button>
            </div>
          ) : (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed var(--border-subtle)',
              textAlign: 'center'
            }}>
              <ShieldCheck size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                Compliance Seal Pending
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Legal & Compliance approval required to issue tamper-evident pre-publication verification seal.
              </p>
            </div>
          )}

          {/* Revision History Log */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <History size={16} style={{ color: '#6366f1' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Revision Snapshot Log</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {contentItem.revisions.map(rev => (
                <div
                  key={rev.version}
                  style={{
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: '#c7d2fe' }}>Version {rev.version}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{rev.timestamp}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {rev.summary} (by {rev.author})
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
