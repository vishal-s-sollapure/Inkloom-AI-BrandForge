import { AnalysisFinding, BrandProfile, ComplianceCertificate, ContentFormat, Role } from '../types';

/**
 * Calculates sRGB relative luminance according to WCAG 2.1 specs
 */
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Computes WCAG 2.1 Contrast Ratio between two hex colors
 */
export function calculateWcagContrast(fgHex: string, bgHex: string) {
  try {
    const l1 = getLuminance(fgHex);
    const l2 = getLuminance(bgHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    const roundedRatio = Math.round(ratio * 10) / 10;

    return {
      ratio: roundedRatio,
      aaNormal: roundedRatio >= 4.5,
      aaLarge: roundedRatio >= 3.0,
      aaaNormal: roundedRatio >= 7.0,
      aaaLarge: roundedRatio >= 4.5,
      rating: (roundedRatio >= 7.0 ? 'AAA' : roundedRatio >= 4.5 ? 'AA' : 'Fail') as 'AAA' | 'AA' | 'Fail'
    };
  } catch {
    return {
      ratio: 1.0,
      aaNormal: false,
      aaLarge: false,
      aaaNormal: false,
      aaaLarge: false,
      rating: 'Fail' as 'AAA' | 'AA' | 'Fail'
    };
  }
}

/**
 * Calculates Flesch-Kincaid Grade Level & Reading Ease
 */
export function calculateReadability(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);

  if (words.length === 0 || sentences.length === 0) {
    return { gradeLevel: 0, readingEase: 100, wordCount: 0, sentenceCount: 0 };
  }

  // Count syllables heuristically
  let totalSyllables = 0;
  for (const word of words) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length <= 3) {
      totalSyllables += 1;
      continue;
    }
    const syllables = clean.replace(/(?:[^laeiouy]|ed|es|e)$/, '')
                           .replace(/^y/, '')
                           .match(/[aeiouy]{1,2}/g);
    totalSyllables += syllables ? syllables.length : 1;
  }

  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = totalSyllables / words.length;

  // Flesch Reading Ease: 206.835 - 1.015 * (words/sentence) - 84.6 * (syllables/word)
  const readingEase = Math.round(206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord));
  
  // Flesch-Kincaid Grade Level: 0.39 * (words/sentence) + 11.8 * (syllables/word) - 15.59
  const gradeLevel = Math.max(1, Math.round((0.39 * wordsPerSentence) + (11.8 * syllablesPerWord) - 15.59));

  return {
    gradeLevel,
    readingEase: Math.max(0, Math.min(100, readingEase)),
    wordCount: words.length,
    sentenceCount: sentences.length,
    syllablesPerWord: Math.round(syllablesPerWord * 10) / 10
  };
}

/**
 * 6-Pillar Governance Engine Real-Time Analysis
 */
export function analyzeContent(
  text: string,
  format: ContentFormat,
  brand: BrandProfile
): {
  findings: AnalysisFinding[];
  score: number;
  stats: {
    words: number;
    sentences: number;
    readingEase: number;
    gradeLevel: number;
    criticalCount: number;
    warningCount: number;
    suggestionCount: number;
  };
} {
  const findings: AnalysisFinding[] = [];
  const lowerText = text.toLowerCase();

  // 1. Pillar: Terminology & Forbidden Words
  brand.forbiddenTerms.forEach((forbidden, idx) => {
    const termLower = forbidden.term.toLowerCase();
    let searchStart = 0;
    while (searchStart < lowerText.length) {
      const matchIndex = lowerText.indexOf(termLower, searchStart);
      if (matchIndex === -1) break;

      const matchedQuote = text.substring(matchIndex, matchIndex + forbidden.term.length);
      const rule = brand.rules.find(r => r.id === forbidden.guidelineRuleId) || brand.rules[0];

      findings.push({
        id: `finding-term-${idx}-${matchIndex}`,
        category: 'terminology',
        severity: forbidden.category === 'prohibited' ? 'critical' : 'warning',
        title: `Prohibited Terminology: "${matchedQuote}"`,
        quote: matchedQuote,
        location: { start: matchIndex, end: matchIndex + forbidden.term.length },
        ruleId: forbidden.guidelineRuleId,
        ruleTitle: rule ? rule.title : 'Terminology Policy',
        guidelineSource: rule ? rule.sourceText : 'Inkloom Brand Governance Standards',
        explanation: forbidden.reason,
        suggestedCorrection: forbidden.suggestedReplacement,
        status: 'pending',
        impactScore: forbidden.category === 'prohibited' ? 18 : 8
      });

      searchStart = matchIndex + forbidden.term.length;
    }
  });

  // 2. Pillar: Tone & Voice (Unsubstantiated Hyperbole / Aggressive Tone)
  const hypeKeywords = [
    { word: 'literally magic', replace: 'engineered with precision', ruleId: 'RULE-TONE-01', expl: 'Hyperbolic phrases damage enterprise credibility and sound juvenile.' },
    { word: '10x your growth overnight', replace: 'accelerate your workflow velocity sustainably', ruleId: 'RULE-TONE-01', expl: 'Unrealistic "overnight" growth promises flag spam filters and legal reviews.' },
    { word: 'zero risk', replace: 'verifiably minimized operational risk', ruleId: 'RULE-TONE-01', expl: 'Claiming "zero risk" exposes organizations to product liability and misrepresentation.' },
    { word: 'without any effort', replace: 'with streamlined automated assistance', ruleId: 'RULE-TONE-02', expl: 'Implies superficial work and neglects necessary human strategic input.' }
  ];

  hypeKeywords.forEach((hk, idx) => {
    const matchIdx = lowerText.indexOf(hk.word.toLowerCase());
    if (matchIdx !== -1) {
      // Avoid duplicate if already caught by forbidden terms
      if (!findings.some(f => f.location.start === matchIdx)) {
        const quote = text.substring(matchIdx, matchIdx + hk.word.length);
        const rule = brand.rules.find(r => r.id === hk.ruleId) || brand.rules[0];

        findings.push({
          id: `finding-tone-${idx}`,
          category: 'tone',
          severity: 'warning',
          title: `Overly Aggressive or Hyperbolic Tone: "${quote}"`,
          quote,
          location: { start: matchIdx, end: matchIdx + hk.word.length },
          ruleId: hk.ruleId,
          ruleTitle: rule.title,
          guidelineSource: rule.sourceText,
          explanation: hk.expl,
          suggestedCorrection: hk.replace,
          status: 'pending',
          impactScore: 10
        });
      }
    }
  });

  // 3. Pillar: Fact-Checking & Unsupported Numerical Claims
  // Detect suspicious claims: "$100 billion", "100%", "zero", unverified statistics
  const statRegex = /(\d+[\d,.]*\s*(billion|million|trillion|percent|%|x|\$))/gi;
  let match;
  while ((match = statRegex.exec(text)) !== null) {
    const rawMatch = match[0];
    const matchStart = match.index;
    
    // Check if this matched claim appears anywhere in approved facts
    const isApproved = brand.approvedFacts.some(fact =>
      fact.claim.toLowerCase().includes(rawMatch.toLowerCase())
    );

    // If already covered in forbidden terms (e.g. 100 billion dollars), skip duplicate
    const alreadyCaught = findings.some(f => f.location.start <= matchStart && f.location.end >= matchStart + rawMatch.length);

    if (!isApproved && !alreadyCaught) {
      const rule = brand.rules.find(r => r.id === 'RULE-CLAIM-01') || brand.rules[0];
      const verifiedExample = brand.approvedFacts[0]?.claim || 'verified enterprise metric';

      findings.push({
        id: `finding-claim-${matchStart}`,
        category: 'claim',
        severity: 'critical',
        title: `Unsupported Claim / Unverified Metric: "${rawMatch}"`,
        quote: rawMatch,
        location: { start: matchStart, end: matchStart + rawMatch.length },
        ruleId: 'RULE-CLAIM-01',
        ruleTitle: 'Substantiation Required for Performance & ROI Figures',
        guidelineSource: rule.sourceText,
        explanation: `The claim "${rawMatch}" could not be matched against any verified entry in the Approved Facts repository. Publishing unverified quantitative claims exposes the enterprise to FTC/regulatory scrutiny.`,
        suggestedCorrection: `Refer to approved fact: "${verifiedExample.substring(0, 60)}..."`,
        status: 'pending',
        impactScore: 18
      });
    }
  }

  // 4. Pillar: Accessibility & Readability Heuristics
  const readability = calculateReadability(text);
  if (readability.wordCount > 30 && readability.gradeLevel > 13) {
    const rule = brand.rules.find(r => r.id === 'RULE-ACCESS-01') || brand.rules[0];
    findings.push({
      id: 'finding-access-reading-level',
      category: 'accessibility',
      severity: 'suggestion',
      title: `High Cognitive Load (Grade Level ${readability.gradeLevel})`,
      quote: text.substring(0, 60) + '...',
      location: { start: 0, end: Math.min(60, text.length) },
      ruleId: 'RULE-ACCESS-01',
      ruleTitle: 'Readability & Jargon Density',
      guidelineSource: rule.sourceText,
      explanation: `Current draft has a Flesch-Kincaid Grade Level of ${readability.gradeLevel} (target is 8th–11th grade). Long compound sentences reduce reader retention by up to 35%.`,
      suggestedCorrection: 'Break long compound sentences into shorter, punchy declarative statements.',
      status: 'pending',
      impactScore: 4
    });
  }

  // 5. Pillar: Messaging / Platform-Specific Rules
  if (format === 'press_release' && !lowerText.includes('iso') && !lowerText.includes('certified')) {
    const rule = brand.rules.find(r => r.id === 'RULE-CLAIM-02') || brand.rules[0];
    findings.push({
      id: 'finding-msg-iso-missing',
      category: 'messaging',
      severity: 'suggestion',
      title: 'Missing Security & Compliance Assurance Boilerplate',
      quote: 'Press Release Body',
      location: { start: 0, end: 0 },
      ruleId: 'RULE-CLAIM-02',
      ruleTitle: 'Mandatory ISO Certification Reference',
      guidelineSource: rule.sourceText,
      explanation: 'Enterprise press releases should explicitly mention our ISO/IEC 27001 certification and zero data retention to instill trust in security-conscious enterprise buyers.',
      suggestedCorrection: 'Add: "Inkloom AI operates under ISO/IEC 27001:2022 standards with a strict zero-retention policy for draft enterprise assets."',
      status: 'pending',
      impactScore: 3
    });
  }

  // Calculate overall compliance score
  let scoreDeduction = 0;
  let criticalCount = 0;
  let warningCount = 0;
  let suggestionCount = 0;

  findings.forEach(f => {
    if (f.status === 'pending') {
      scoreDeduction += f.impactScore;
      if (f.severity === 'critical') criticalCount++;
      if (f.severity === 'warning') warningCount++;
      if (f.severity === 'suggestion') suggestionCount++;
    }
  });

  const rawScore = Math.max(12, 100 - scoreDeduction);
  const complianceScore = findings.length === 0 ? 100 : rawScore;

  return {
    findings,
    score: complianceScore,
    stats: {
      words: readability.wordCount,
      sentences: readability.sentenceCount,
      readingEase: readability.readingEase,
      gradeLevel: readability.gradeLevel,
      criticalCount,
      warningCount,
      suggestionCount
    }
  };
}

/**
 * Applies a single suggested correction cleanly into the content string
 */
export function applyCorrection(currentText: string, finding: AnalysisFinding): string {
  if (!finding.quote || !finding.suggestedCorrection) return currentText;

  // If quote exists verbatim in current text, replace first occurrence
  if (currentText.includes(finding.quote)) {
    return currentText.replace(finding.quote, finding.suggestedCorrection);
  }

  // Fallback: replace case-insensitive
  const regex = new RegExp(finding.quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return currentText.replace(regex, finding.suggestedCorrection);
}

/**
 * Batch-applies all pending corrections cleanly
 */
export function applyAllCorrections(currentText: string, findings: AnalysisFinding[]): string {
  let updatedText = currentText;
  
  // Sort findings by longest quote first to avoid substring collision
  const sortedFindings = [...findings]
    .filter(f => f.status === 'pending' && f.suggestedCorrection && !f.suggestedCorrection.startsWith('Add:'))
    .sort((a, b) => b.quote.length - a.quote.length);

  for (const finding of sortedFindings) {
    if (finding.quote && updatedText.toLowerCase().includes(finding.quote.toLowerCase())) {
      const regex = new RegExp(finding.quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      updatedText = updatedText.replace(regex, finding.suggestedCorrection);
    }
  }

  return updatedText;
}

/**
 * Generates an immutable, cryptographic SHA-256 Pre-Publication Compliance Seal
 */
export async function generateComplianceSeal(
  docTitle: string,
  text: string,
  approverName: string,
  approverRole: Role,
  brandVersion: string,
  score: number,
  ruleCount: number
): Promise<ComplianceCertificate> {
  const timestamp = new Date().toISOString();
  const rawPayload = `${docTitle}|${text}|${approverName}|${approverRole}|${brandVersion}|${score}|${timestamp}`;

  // Use native Web Crypto API for SHA-256
  const msgBuffer = new TextEncoder().encode(rawPayload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const randomCertNum = Math.floor(100000 + Math.random() * 900000);

  return {
    certificateId: `CERT-INKLOOM-${new Date().getFullYear()}-${randomCertNum}`,
    sha256Hash,
    documentTitle: docTitle,
    approvedBy: approverName,
    approverRole,
    timestamp,
    brandVaultVersion: brandVersion,
    rulesEvaluatedCount: ruleCount,
    complianceScore: score,
    isImmutable: true
  };
}
