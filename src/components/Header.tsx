import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Sun, 
  Moon, 
  Layers, 
  Lock, 
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { BrandProfile, ContentItem, Role } from '../types';

interface HeaderProps {
  currentBrand: BrandProfile;
  brands: BrandProfile[];
  onSelectBrand: (brand: BrandProfile) => void;
  currentRole: Role;
  onChangeRole: (role: Role) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenTransparency: () => void;
  onLoadPresetDraft: (draftId: string) => void;
  sampleDrafts: ContentItem[];
}

export const Header: React.FC<HeaderProps> = ({
  currentBrand,
  brands,
  onSelectBrand,
  currentRole,
  onChangeRole,
  isDark,
  onToggleTheme,
  onOpenTransparency,
  onLoadPresetDraft,
  sampleDrafts
}) => {
  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'creator': return 'Content Creator';
      case 'brand_manager': return 'Brand Custodian';
      case 'legal_compliance': return 'Legal / Compliance';
    }
  };

  return (
    <header className="app-header">
      {/* BrandForge Identity */}
      <div className="brand-logo-area">
        <div className="brand-icon-wrapper">
          <ShieldCheck size={22} strokeWidth={2.4} />
        </div>
        <div className="brand-title-wrap">
          <div className="brand-title">
            BrandForge <span className="brand-badge">GOVERNANCE OS</span>
          </div>
          <div className="brand-subtitle">
            by Inkloom AI • Intelligent Pre-Publication Compliance
          </div>
        </div>
      </div>

      {/* Center Controls: Brand Vault & Quick Presets */}
      <div className="header-actions">
        {/* Brand Profile Selector */}
        <div className="brand-selector" title="Active Brand Guidelines Vault">
          <Layers size={15} className="text-muted" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brand:</span>
          <select 
            value={currentBrand.id}
            onChange={(e) => {
              const b = brands.find(item => item.id === e.target.value);
              if (b) onSelectBrand(b);
            }}
          >
            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} (v{b.version})
              </option>
            ))}
          </select>
        </div>

        {/* Demo Preset Selector */}
        <div className="brand-selector" title="Load real-world scenarios for instant testing">
          <FileText size={15} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Load Demo:</span>
          <select 
            onChange={(e) => {
              if (e.target.value) onLoadPresetDraft(e.target.value);
            }}
            defaultValue=""
          >
            <option value="" disabled>Select Test Scenario...</option>
            <option value="draft-01">⚠️ Problematic Press Release (Violations)</option>
            <option value="draft-02">✅ Verified LinkedIn Post (Approved)</option>
            <option value="draft-03">🎨 Visual Banner Graphic (WCAG Test)</option>
          </select>
        </div>

        {/* Role Switcher */}
        <div className="role-selector" title="Switch active role perspective">
          <UserCheck size={15} style={{ color: currentRole === 'legal_compliance' ? '#10b981' : currentRole === 'brand_manager' ? '#a855f7' : '#38bdf8' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role:</span>
          <select 
            value={currentRole} 
            onChange={(e) => onChangeRole(e.target.value as Role)}
          >
            <option value="creator">Creator / Copywriter</option>
            <option value="brand_manager">Brand Manager / Editor</option>
            <option value="legal_compliance">Legal & Compliance</option>
          </select>
          <span className={`role-badge role-${currentRole}`}>
            {getRoleLabel(currentRole)}
          </span>
        </div>

        {/* AI Transparency & Privacy Shield Button */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onOpenTransparency}
          title="Inspect Local AI Privacy Sandbox & Disclosures"
          style={{ gap: '0.4rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}
        >
          <Lock size={14} style={{ color: '#10b981' }} />
          <span>Zero-Retention Guard</span>
        </button>

        {/* Theme Toggle */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={onToggleTheme}
          title="Toggle Dark / Light Theme"
          style={{ padding: '0.4rem' }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
