import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { EditorStudio } from './components/EditorStudio';
import { VisualInspector } from './components/VisualInspector';
import { BrandVault } from './components/BrandVault';
import { WorkflowHub } from './components/WorkflowHub';
import { AnalyticsHub } from './components/AnalyticsHub';
import { TransparencyModal } from './components/TransparencyModal';

import { mockBrandProfiles, sampleContentDrafts } from './data/mockData';
import { 
  AnalysisFinding, 
  BrandProfile, 
  ContentFormat, 
  ContentItem, 
  Role 
} from './types';
import { 
  analyzeContent, 
  applyCorrection, 
  generateComplianceSeal 
} from './services/governanceEngine';

export const App: React.FC = () => {
  // Brand & Role State
  const [brands, setBrands] = useState<BrandProfile[]>(mockBrandProfiles);
  const [currentBrand, setCurrentBrand] = useState<BrandProfile>(mockBrandProfiles[0]);
  const [currentRole, setCurrentRole] = useState<Role>('creator');

  // UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isTransparencyOpen, setIsTransparencyOpen] = useState<boolean>(false);

  // Active Content Draft State
  const [activeDraft, setActiveDraft] = useState<ContentItem>(() => {
    // Initialize first draft and run initial analysis
    const initial = { ...sampleContentDrafts[0] };
    const analysis = analyzeContent(initial.rawText, initial.format, mockBrandProfiles[0]);
    initial.findings = analysis.findings;
    initial.complianceScore = analysis.score;
    return initial;
  });

  // Toggle Theme Class on Body
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  // Re-run analysis whenever text, format, or active brand guidelines change
  const runAnalysis = useCallback((text: string, format: ContentFormat, brand: BrandProfile) => {
    const analysis = analyzeContent(text, format, brand);
    setActiveDraft(prev => {
      // Preserve status of findings previously dismissed or accepted if still present
      const updatedFindings = analysis.findings.map(newF => {
        const existing = prev.findings.find(f => f.id === newF.id || (f.quote === newF.quote && f.category === newF.category));
        if (existing && existing.status !== 'pending') {
          return { ...newF, status: existing.status, dismissalReason: existing.dismissalReason };
        }
        return newF;
      });

      return {
        ...prev,
        rawText: text,
        format,
        findings: updatedFindings,
        complianceScore: analysis.score,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // Update text, title, or format
  const handleUpdateContent = (updatedText: string, updatedTitle?: string, format?: ContentFormat) => {
    const targetFormat = format || activeDraft.format;
    const targetTitle = updatedTitle !== undefined ? updatedTitle : activeDraft.title;

    setActiveDraft(prev => ({
      ...prev,
      title: targetTitle
    }));

    runAnalysis(updatedText, targetFormat, currentBrand);
  };

  // Apply a single recommended fix
  const handleApplySingleFix = (finding: AnalysisFinding) => {
    const newText = applyCorrection(activeDraft.rawText, finding);
    
    // Mark this finding as accepted
    setActiveDraft(prev => ({
      ...prev,
      findings: prev.findings.map(f => f.id === finding.id ? { ...f, status: 'accepted' } : f)
    }));

    runAnalysis(newText, activeDraft.format, currentBrand);
  };

  // Dismiss a finding with author justification
  const handleDismissFinding = (findingId: string, reason: string) => {
    setActiveDraft(prev => {
      const updatedFindings = prev.findings.map(f => 
        f.id === findingId ? { ...f, status: 'dismissed' as const, dismissalReason: reason } : f
      );

      // Recalculate score without this dismissed item
      const pending = updatedFindings.filter(f => f.status === 'pending');
      let deduction = 0;
      pending.forEach(p => deduction += p.impactScore);
      const newScore = Math.max(12, 100 - deduction);

      return {
        ...prev,
        findings: updatedFindings,
        complianceScore: pending.length === 0 ? 100 : newScore
      };
    });
  };

  // Reset a finding back to pending
  const handleUndoFindingStatus = (findingId: string) => {
    setActiveDraft(prev => ({
      ...prev,
      findings: prev.findings.map(f => f.id === findingId ? { ...f, status: 'pending' as const } : f)
    }));
    runAnalysis(activeDraft.rawText, activeDraft.format, currentBrand);
  };

  // Submit draft to review queue or change state
  const handleUpdateStatus = (newStatus: 'draft' | 'in_review' | 'changes_requested' | 'approved') => {
    setActiveDraft(prev => ({
      ...prev,
      status: newStatus,
      revisions: [
        ...prev.revisions,
        {
          version: prev.revisions.length + 1,
          timestamp: 'Just now',
          author: currentRole === 'creator' ? 'Alex Rivera' : currentRole === 'brand_manager' ? 'Marcus Vance' : 'Sarah Jenkins (Esq.)',
          role: currentRole,
          summary: `Status updated to ${newStatus.replace('_', ' ')}`,
          contentSnapshot: prev.rawText.substring(0, 100) + '...'
        }
      ]
    }));
  };

  // In-line comments
  const handleAddComment = (commentText: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      authorName: currentRole === 'creator' ? 'Alex Rivera' : currentRole === 'brand_manager' ? 'Marcus Vance' : 'Sarah Jenkins (Esq.)',
      authorRole: currentRole,
      text: commentText,
      timestamp: 'Just now',
      resolved: false
    };

    setActiveDraft(prev => ({
      ...prev,
      comments: [newComment, ...prev.comments]
    }));
  };

  const handleResolveComment = (commentId: string) => {
    setActiveDraft(prev => ({
      ...prev,
      comments: prev.comments.map(c => c.id === commentId ? { ...c, resolved: !c.resolved } : c)
    }));
  };

  // Generate Cryptographic Pre-Publication Compliance Seal
  const handleGenerateSeal = async () => {
    const approverName = currentRole === 'legal_compliance' ? 'Sarah Jenkins (Esq.)' : 'Marcus Vance (Creative Lead)';
    const cert = await generateComplianceSeal(
      activeDraft.title,
      activeDraft.rawText,
      approverName,
      currentRole,
      currentBrand.version,
      activeDraft.complianceScore,
      currentBrand.rules.length
    );

    setActiveDraft(prev => ({
      ...prev,
      status: 'approved',
      certificate: cert
    }));
  };

  // Load a demo scenario
  const handleLoadPresetDraft = (draftId: string) => {
    const found = sampleContentDrafts.find(d => d.id === draftId);
    if (found) {
      const cloned = { ...found };
      const analysis = analyzeContent(cloned.rawText, cloned.format, currentBrand);
      cloned.findings = analysis.findings;
      cloned.complianceScore = analysis.score;
      setActiveDraft(cloned);

      if (draftId === 'draft-03') {
        setActiveTab('visual');
      } else {
        setActiveTab('editor');
      }
    }
  };

  // Update visual asset
  const handleUpdateAssetContrast = (fg: string, bg: string, altText: string) => {
    setActiveDraft(prev => {
      const currentImg = prev.imageAsset || {
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop',
        altText: '',
        foregroundHex: fg,
        backgroundHex: bg,
        contrastRatio: 16.1,
        wcagRating: 'AAA' as const,
        hasLogoSafeZone: true
      };

      return {
        ...prev,
        imageAsset: {
          ...currentImg,
          foregroundHex: fg,
          backgroundHex: bg,
          altText
        }
      };
    });
  };

  const pendingFindingsCount = activeDraft.findings.filter(f => f.status === 'pending').length;
  const commentsCount = activeDraft.comments.filter(c => !c.resolved).length;

  return (
    <div className="app-container">
      {/* Top Application Header */}
      <Header
        currentBrand={currentBrand}
        brands={brands}
        onSelectBrand={(newBrand) => {
          setCurrentBrand(newBrand);
          runAnalysis(activeDraft.rawText, activeDraft.format, newBrand);
        }}
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenTransparency={() => setIsTransparencyOpen(true)}
        onLoadPresetDraft={handleLoadPresetDraft}
        sampleDrafts={sampleContentDrafts}
      />

      {/* Main Feature Tabs Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingIssuesCount={pendingFindingsCount}
        commentsCount={commentsCount}
        isApproved={activeDraft.status === 'approved'}
      />

      {/* Main Content Workspace View */}
      <main className="app-content">
        {activeTab === 'editor' && (
          <EditorStudio
            contentItem={activeDraft}
            brand={currentBrand}
            currentRole={currentRole}
            onUpdateContent={handleUpdateContent}
            onApplySingleFix={handleApplySingleFix}
            onDismissFinding={handleDismissFinding}
            onUndoFindingStatus={handleUndoFindingStatus}
            onSubmitForReview={() => {
              handleUpdateStatus('in_review');
              setActiveTab('workflow');
            }}
          />
        )}

        {activeTab === 'visual' && (
          <VisualInspector
            brand={currentBrand}
            contentItem={activeDraft}
            onUpdateAssetContrast={handleUpdateAssetContrast}
          />
        )}

        {activeTab === 'vault' && (
          <BrandVault
            brand={currentBrand}
            currentRole={currentRole}
            onUpdateBrand={(updated) => {
              setCurrentBrand(updated);
              setBrands(prev => prev.map(b => b.id === updated.id ? updated : b));
              runAnalysis(activeDraft.rawText, activeDraft.format, updated);
            }}
          />
        )}

        {activeTab === 'workflow' && (
          <WorkflowHub
            contentItem={activeDraft}
            currentRole={currentRole}
            onUpdateStatus={handleUpdateStatus}
            onAddComment={handleAddComment}
            onResolveComment={handleResolveComment}
            onGenerateSeal={handleGenerateSeal}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsHub />
        )}
      </main>

      {/* Privacy Sandbox & AI Ethics Modal */}
      <TransparencyModal
        isOpen={isTransparencyOpen}
        onClose={() => setIsTransparencyOpen(false)}
      />
    </div>
  );
};

export default App;
