export type Role = 'creator' | 'brand_manager' | 'legal_compliance';

export type ContentFormat = 'article' | 'social_post' | 'press_release' | 'visual_asset' | 'email';

export type SocialChannel = 'linkedin' | 'x_twitter' | 'instagram' | 'blog' | 'press' | 'generic';

export type FindingSeverity = 'critical' | 'warning' | 'suggestion';

export type FindingCategory = 'tone' | 'terminology' | 'claim' | 'messaging' | 'visual' | 'accessibility';

export type FindingStatus = 'pending' | 'accepted' | 'dismissed' | 'exempted';

export type DocumentStatus = 'draft' | 'in_review' | 'changes_requested' | 'approved';

export interface ApprovedFact {
  id: string;
  claim: string;
  category: string;
  source: string;
  dateVerified: string;
  confidence: number;
}

export interface ForbiddenTerm {
  id: string;
  term: string;
  category: 'prohibited' | 'deprecated' | 'competitor' | 'hyperbole';
  reason: string;
  suggestedReplacement: string;
  guidelineRuleId: string;
}

export interface ColorToken {
  id: string;
  name: string;
  hex: string;
  usage: string;
  minContrastRatio: number;
}

export interface GuidelineRule {
  id: string;
  pillar: FindingCategory;
  title: string;
  summary: string;
  sourceText: string;
  severity: FindingSeverity;
  frictionCount?: number; // How often users dispute or get flagged on this rule
}

export interface BrandProfile {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  description: string;
  version: string;
  voiceAttributes: {
    tone: string[];
    avoid: string[];
    targetAudience: string;
  };
  rules: GuidelineRule[];
  forbiddenTerms: ForbiddenTerm[];
  approvedFacts: ApprovedFact[];
  colors: ColorToken[];
}

export interface AnalysisFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  quote: string;
  location: {
    start: number;
    end: number;
  };
  ruleId: string;
  ruleTitle: string;
  guidelineSource: string;
  explanation: string;
  suggestedCorrection: string;
  status: FindingStatus;
  dismissalReason?: string;
  impactScore: number;
}

export interface ReviewComment {
  id: string;
  authorName: string;
  authorRole: Role;
  text: string;
  timestamp: string;
  resolved: boolean;
}

export interface RevisionEntry {
  version: number;
  timestamp: string;
  author: string;
  role: Role;
  summary: string;
  contentSnapshot: string;
}

export interface ComplianceCertificate {
  certificateId: string;
  sha256Hash: string;
  documentTitle: string;
  approvedBy: string;
  approverRole: Role;
  timestamp: string;
  brandVaultVersion: string;
  rulesEvaluatedCount: number;
  complianceScore: number;
  isImmutable: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  format: ContentFormat;
  channel: SocialChannel;
  rawText: string;
  author: {
    name: string;
    role: Role;
    avatar: string;
  };
  status: DocumentStatus;
  complianceScore: number;
  findings: AnalysisFinding[];
  comments: ReviewComment[];
  revisions: RevisionEntry[];
  certificate?: ComplianceCertificate;
  imageAsset?: {
    url: string;
    altText: string;
    foregroundHex: string;
    backgroundHex: string;
    contrastRatio: number;
    wcagRating: 'AAA' | 'AA' | 'Fail';
    hasLogoSafeZone: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
