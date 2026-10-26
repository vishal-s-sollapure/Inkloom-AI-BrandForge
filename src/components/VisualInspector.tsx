import React, { useState } from 'react';
import { 
  Eye, 
  Palette, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Image as ImageIcon, 
  Sliders, 
  ShieldCheck, 
  Info,
  Maximize2
} from 'lucide-react';
import { BrandProfile, ContentItem } from '../types';
import { calculateWcagContrast } from '../services/governanceEngine';

interface VisualInspectorProps {
  brand: BrandProfile;
  contentItem: ContentItem;
  onUpdateAssetContrast: (fg: string, bg: string, altText: string) => void;
}

export const VisualInspector: React.FC<VisualInspectorProps> = ({
  brand,
  contentItem,
  onUpdateAssetContrast
}) => {
  const currentAsset = contentItem.imageAsset || {
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop',
    altText: 'Inkloom AI brand governance dashboard preview on laptop display with team analytics',
    foregroundHex: '#FFFFFF',
    backgroundHex: '#0F172A',
    contrastRatio: 16.1,
    wcagRating: 'AAA' as const,
    hasLogoSafeZone: true
  };

  const [fgColor, setFgColor] = useState<string>(currentAsset.foregroundHex);
  const [bgColor, setBgColor] = useState<string>(currentAsset.backgroundHex);
  const [altText, setAltText] = useState<string>(currentAsset.altText);
  const [showLogoGrid, setShowLogoGrid] = useState<boolean>(true);

  const contrastResult = calculateWcagContrast(fgColor, bgColor);

  const handleFgChange = (newFg: string) => {
    setFgColor(newFg);
    onUpdateAssetContrast(newFg, bgColor, altText);
  };

  const handleBgChange = (newBg: string) => {
    setBgColor(newBg);
    onUpdateAssetContrast(fgColor, newBg, altText);
  };

  const handleAltChange = (newAlt: string) => {
    setAltText(newAlt);
    onUpdateAssetContrast(fgColor, bgColor, newAlt);
  };

  // Evaluate Alt-Text Quality
  const altTextWords = altText.trim().split(/\s+/).filter(Boolean).length;
  const isAltTextValid = altTextWords >= 5 && !altText.toLowerCase().startsWith('image of') && !altText.toLowerCase().startsWith('picture of');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Eye size={20} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Visual & Graphic Asset Governance</h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Audit promotional graphics, banner overlays, color palette consistency, and WCAG 2.1 accessibility before publishing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="score-badge" style={{ padding: '0.4rem 0.8rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contrast:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: contrastResult.rating !== 'Fail' ? '#10b981' : '#f43f5e' }}>
              {contrastResult.ratio}:1
            </span>
            <span className={`pill ${contrastResult.rating !== 'Fail' ? 'pill-success' : 'pill-critical'}`}>
              WCAG {contrastResult.rating}
            </span>
          </div>

          <button
            className={`btn btn-sm ${showLogoGrid ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowLogoGrid(!showLogoGrid)}
            title="Toggle Logo Clear-Space Overlay Guide"
          >
            <Maximize2 size={14} />
            <span>{showLogoGrid ? 'Hide Logo Safe Zone' : 'Show Logo Safe Zone'}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Column: Visual Asset Preview */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Interactive Graphic Preview</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aspect Ratio: 1200 x 630 (OpenGraph Standard)</span>
          </div>

          {/* Graphic Container with Overlay */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            backgroundColor: bgColor,
            minHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2.5rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Background Image / Ambient Blur */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${currentAsset.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
              filter: 'blur(1px)'
            }} />

            {/* Logo Clear-space Guide Overlay */}
            {showLogoGrid && (
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                border: '1px dashed rgba(99, 102, 241, 0.6)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.7rem',
                color: '#c7d2fe',
                fontFamily: 'var(--font-mono)'
              }}>
                <ShieldCheck size={14} style={{ color: '#6366f1' }} />
                <span>Logo Safe Zone (1x Height Clear Space)</span>
              </div>
            )}

            {/* Dynamic Text Overlay */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
              maxWidth: '85%'
            }}>
              <h3 style={{
                color: fgColor,
                fontSize: '1.75rem',
                fontWeight: 800,
                lineHeight: 1.25,
                marginBottom: '0.75rem',
                textShadow: '0 2px 10px rgba(0,0,0,0.4)'
              }}>
                Intelligent Brand Governance for the Modern Enterprise
              </h3>
              <p style={{
                color: fgColor,
                fontSize: '0.95rem',
                opacity: 0.9,
                lineHeight: 1.5,
                textShadow: '0 1px 6px rgba(0,0,0,0.4)'
              }}>
                Review text, images, and claims before publication with verified AI and human control.
              </p>
            </div>

            {/* Bottom Status Tag */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              zIndex: 2,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(6px)',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: contrastResult.rating !== 'Fail' ? '#10b981' : '#f43f5e' }} />
              <span>WCAG 2.1: {contrastResult.ratio}:1</span>
            </div>
          </div>

          {/* Alt-Text Audit Section */}
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Screen Reader Alt-Text Description:
              </label>
              <span className={`pill ${isAltTextValid ? 'pill-success' : 'pill-critical'}`} style={{ fontSize: '0.675rem' }}>
                {isAltTextValid ? '✓ Accessible Alt-Text' : '⚠️ Incomplete Alt-Text'}
              </span>
            </div>

            <textarea
              value={altText}
              onChange={(e) => handleAltChange(e.target.value)}
              placeholder="Provide a meaningful description of the image content for screen readers..."
              style={{
                width: '100%',
                minHeight: '70px',
                background: 'var(--bg-input)',
                border: `1px solid ${isAltTextValid ? 'var(--border-subtle)' : 'var(--danger-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem',
                color: 'var(--text-primary)',
                fontSize: '0.825rem',
                outline: 'none'
              }}
            />
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              WCAG Guideline 1.1.1: Must be at least 5 words and clearly describe informational visual elements without redundant phrasing like "image of".
            </div>
          </div>
        </div>

        {/* Right Column: WCAG & Brand Color Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* WCAG Compliance Report Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sliders size={18} style={{ color: '#6366f1' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>WCAG 2.1 Contrast Analysis</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: contrastResult.aaNormal ? 'var(--success-bg)' : 'var(--danger-bg)',
                border: `1px solid ${contrastResult.aaNormal ? 'var(--success-border)' : 'var(--danger-border)'}`
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Normal Text (AA)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: contrastResult.aaNormal ? '#34d399' : '#fb7185' }}>
                  {contrastResult.aaNormal ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{contrastResult.aaNormal ? 'PASS (≥ 4.5:1)' : 'FAIL (< 4.5:1)'}</span>
                </div>
              </div>

              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: contrastResult.aaaLarge ? 'var(--success-bg)' : 'var(--warning-bg)',
                border: `1px solid ${contrastResult.aaaLarge ? 'var(--success-border)' : 'var(--warning-border)'}`
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Large Display Text (AAA)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', color: contrastResult.aaaLarge ? '#34d399' : '#fbbf24' }}>
                  {contrastResult.aaaLarge ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{contrastResult.aaaLarge ? 'PASS (≥ 4.5:1)' : 'WARNING (< 4.5:1)'}</span>
                </div>
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Foreground Text Color:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => handleFgChange(e.target.value)}
                    style={{ cursor: 'pointer', border: 'none', background: 'none', width: '28px', height: '28px' }}
                  />
                  <span className="font-mono" style={{ fontSize: '0.8rem' }}>{fgColor.toUpperCase()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Background Canvas Color:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => handleBgChange(e.target.value)}
                    style={{ cursor: 'pointer', border: 'none', background: 'none', width: '28px', height: '28px' }}
                  />
                  <span className="font-mono" style={{ fontSize: '0.8rem' }}>{bgColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Approved Brand Swatches Library */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Palette size={18} style={{ color: '#10b981' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Approved {brand.name} Color Swatches</h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Click any swatch to apply it directly to the canvas background:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
              {brand.colors.map(color => (
                <button
                  key={color.id}
                  onClick={() => handleBgChange(color.hex)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  title={`Apply ${color.name} (${color.hex})`}
                >
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    backgroundColor: color.hex,
                    border: '1px solid rgba(255,255,255,0.2)'
                  }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {color.name}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {color.hex}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
