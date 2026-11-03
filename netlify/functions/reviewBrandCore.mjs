/**
 * BrandForge — Core AI Brand Review Engine
 * Inkloom AI Brand Governance Challenge (Round 3)
 * Participant: Vishal S Sollapure | Team: BrandForge
 * 
 * Provides:
 * 1. Secure server-side Gemini API integration with structured JSON schema.
 * 2. Active guideline-grounded context ingestion (RAG-lite).
 * 3. Clear separation of brand rule violations vs factual claims requiring evidence.
 * 4. Contextual intent-preserving revisions and confidence indicators.
 * 5. Robust offline / failure fallback to the deterministic rules engine.
 */

// Helper to escape regex special characters
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Count words accurately
export function countWords(str) {
  if (!str || !str.trim()) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

// Input boundary validator
export function validateInput(title, text) {
  const errors = [];
  if (!title || !title.trim()) {
    errors.push('Content title is required.');
  } else if (title.trim().length > 120) {
    errors.push('Content title exceeds 120 characters.');
  }

  if (!text || !text.trim()) {
    errors.push('Content draft is empty. Please enter copy to review.');
  } else {
    const words = countWords(text);
    if (words < 4) {
      errors.push('Content draft is too brief for an audit (minimum 4 words required).');
    } else if (text.length > 25000) {
      errors.push('Content draft exceeds maximum recommended length of 25,000 characters.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Deterministic rules engine (baseline and resilient fallback)
export function runDeterministicReview(text, guidelines = {}) {
  const findings = [];
  const lowerText = text.toLowerCase();

  // 1. Avoided Terminology
  if (Array.isArray(guidelines.avoidTerms)) {
    guidelines.avoidTerms.forEach((item, index) => {
      if (!item || !item.term) return;
      const termToFind = item.term.trim().toLowerCase();
      if (!termToFind) return;

      const pattern = new RegExp(`\\b${escapeRegExp(termToFind)}\\b`, 'gi');
      let match;
      while ((match = pattern.exec(text)) !== null) {
        findings.push({
          findingId: `rule-avoid-${index}-${match.index}`,
          type: 'brand_violation',
          severity: 'high',
          ruleCitation: `Prohibited Terminology: "${item.term}"`,
          guidelineSection: 'Prohibited Terminology',
          evidence: match[0],
          locationIndex: match.index,
          explanation: item.reason || 'This term is explicitly marked as avoided under active brand guidelines.',
          recommendation: item.replacement ? `Replace with: "${item.replacement}"` : 'Remove or rephrase this term.',
          suggestedReplacement: item.replacement || '',
          isVerificationNeeded: false,
          confidence: 100
        });
      }
    });
  }

  // 2. Unsupported Superlatives & Promissory Claims (Verification Needed)
  if (Array.isArray(guidelines.verificationClaims)) {
    guidelines.verificationClaims.forEach((claim, index) => {
      const cleanClaim = claim.trim().toLowerCase();
      if (!cleanClaim) return;

      const leftBoundary = /^\w/.test(cleanClaim) ? '\\b' : '';
      const rightBoundary = /\w$/.test(cleanClaim) ? '\\b' : '(?=[\\s.,!?;:]|$)';
      const pattern = new RegExp(`${leftBoundary}${escapeRegExp(cleanClaim)}${rightBoundary}`, 'gi');
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const isApproved = guidelines.approvedFacts && guidelines.approvedFacts.some(fact =>
          fact.toLowerCase().includes(cleanClaim)
        );

        if (!isApproved) {
          findings.push({
            findingId: `rule-verify-${index}-${match.index}`,
            type: 'claim_verification',
            severity: 'high',
            ruleCitation: `Claim Requiring Verification: "${cleanClaim}"`,
            guidelineSection: 'Factual Claims & Verification',
            evidence: match[0],
            locationIndex: match.index,
            explanation: `The claim "${match[0]}" is an absolute assertion or high-risk promotional superlative that requires verified supporting evidence before publication.`,
            recommendation: 'Verify against approved statistical sources, or soften to measured language (e.g. "designed to achieve high reliability").',
            suggestedReplacement: '',
            isVerificationNeeded: true,
            confidence: 95
          });
        }
      }
    });
  }

  // 3. Tone & Aggressive Hype Keywords
  const toneHypeRules = [
    { trigger: 'zero risk', replacement: 'verifiably mitigated operational risk', reason: 'Claims of "zero risk" violate truth-in-advertising guidelines.' },
    { trigger: 'literally magic', replacement: 'engineered with precision', reason: 'Unprofessional juvenile hyperbole; degrades enterprise brand credibility.' },
    { trigger: 'overnight without any effort', replacement: 'with structured automated assistance', reason: 'Unrealistic promise that diminishes customer strategic contribution.' },
    { trigger: 'total dominance', replacement: 'verified market leadership', reason: 'Overly aggressive militaristic tone out of alignment with brand demeanor.' }
  ];

  toneHypeRules.forEach((rule, idx) => {
    const pattern = new RegExp(`\\b${escapeRegExp(rule.trigger)}\\b`, 'gi');
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const alreadyCaught = findings.some(f => f.locationIndex === match.index);
      if (!alreadyCaught) {
        findings.push({
          findingId: `rule-tone-${idx}-${match.index}`,
          type: 'tone_style',
          severity: 'medium',
          ruleCitation: `Tone & Voice Mismatch: "${match[0]}"`,
          guidelineSection: 'Voice, Tone & Demeanor',
          evidence: match[0],
          locationIndex: match.index,
          explanation: rule.reason,
          recommendation: `Softened alternative: "${rule.replacement}"`,
          suggestedReplacement: rule.replacement,
          isVerificationNeeded: false,
          confidence: 90
        });
      }
    }
  });

  // 4. Missing Preferred Terminology
  const brandName = guidelines.brandName || 'Inkloom AI';
  if (lowerText.includes('the tool') || lowerText.includes('our software') || lowerText.includes('the system')) {
    if (!lowerText.includes(brandName.toLowerCase())) {
      findings.push({
        findingId: 'rule-preferred-brand-name',
        type: 'brand_violation',
        severity: 'low',
        ruleCitation: `Consider Using Official Brand Name: "${brandName}"`,
        guidelineSection: 'Official Nomenclature',
        evidence: 'Generic terms: "the tool" / "the software"',
        locationIndex: 0,
        explanation: `Draft relies on generic nouns without reinforcing the official brand identity "${brandName}".`,
        recommendation: `Incorporate "${brandName}" in the introductory positioning statement.`,
        suggestedReplacement: brandName,
        isVerificationNeeded: false,
        confidence: 85
      });
    }
  }

  // 5. Accessibility & Sentence Length Check (> 30 words)
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  sentences.forEach((sentence, idx) => {
    const wordsInSentence = sentence.split(/\s+/).filter(Boolean);
    if (wordsInSentence.length > 30) {
      findings.push({
        findingId: `rule-access-length-${idx}`,
        type: 'accessibility',
        severity: 'low',
        ruleCitation: `High Cognitive Load: Sentence Exceeds 30 Words (${wordsInSentence.length} words)`,
        guidelineSection: 'Cognitive Accessibility',
        evidence: sentence.substring(0, 50) + '...',
        locationIndex: text.indexOf(sentence),
        explanation: 'Long multi-clause sentences reduce reader comprehension by up to 40% across digital and mobile displays.',
        recommendation: 'Break this complex sentence into two shorter declarative statements.',
        suggestedReplacement: '',
        isVerificationNeeded: false,
        confidence: 95
      });
    }
  });

  // Calculate heuristic score
  let deduction = 0;
  findings.forEach(f => {
    if (f.severity === 'high') deduction += 18;
    else if (f.severity === 'medium') deduction += 8;
    else deduction += 3;
  });
  const complianceScore = Math.max(10, 100 - deduction);

  // Generate revision
  let suggestedRevision = text;
  if (Array.isArray(guidelines.avoidTerms)) {
    guidelines.avoidTerms.forEach(item => {
      if (item.term && item.replacement) {
        const pat = new RegExp(`\\b${escapeRegExp(item.term)}\\b`, 'gi');
        suggestedRevision = suggestedRevision.replace(pat, item.replacement);
      }
    });
  }
  const toneReplacements = [
    { from: 'zero risk', to: 'verifiably mitigated operational risk' },
    { from: 'literally magic', to: 'engineered with precision' },
    { from: '10x your growth overnight without any effort', to: 'streamline your workflow velocity sustainably' },
    { from: '100 billion dollars', to: 'measurable operational cost efficiencies' },
    { from: 'total dominance', to: 'verified market leadership' }
  ];
  toneReplacements.forEach(tr => {
    const fromPat = new RegExp(`\\b${escapeRegExp(tr.from)}\\b`, 'gi');
    suggestedRevision = suggestedRevision.replace(fromPat, tr.to);
  });

  const claimsRequiringEvidenceCount = findings.filter(f => f.isVerificationNeeded).length;

  return {
    complianceScore,
    summary: findings.length === 0
      ? 'Content is compliant with active brand guidelines.'
      : `Identified ${findings.length} findings (${findings.filter(f => f.severity === 'high').length} high risk, ${claimsRequiringEvidenceCount} claims requiring factual evidence).`,
    findings,
    suggestedRevision,
    claimsRequiringEvidenceCount,
    engine: 'deterministic',
    isFallback: false
  };
}

// JSON Schema definition for Gemini Structured Outputs
export const GEMINI_REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    complianceScore: {
      type: 'integer',
      description: 'Compliance score from 10 (severe violations) to 100 (fully compliant)'
    },
    summary: {
      type: 'string',
      description: 'Executive 1-2 sentence assessment of brand compliance'
    },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          findingId: { type: 'string' },
          type: {
            type: 'string',
            enum: ['brand_violation', 'claim_verification', 'tone_style', 'accessibility']
          },
          severity: {
            type: 'string',
            enum: ['high', 'medium', 'low']
          },
          guidelineSection: {
            type: 'string',
            description: 'Specific section of the brand guidelines violated or referenced'
          },
          ruleCitation: {
            type: 'string',
            description: 'Explicit rule title or guideline clause cited'
          },
          evidence: {
            type: 'string',
            description: 'Exact verbatim excerpt from the draft content'
          },
          explanation: {
            type: 'string',
            description: 'Why this violates guidelines or why evidence is needed'
          },
          recommendation: {
            type: 'string',
            description: 'Concrete actionable guidance for the author'
          },
          suggestedReplacement: {
            type: 'string',
            description: 'Suggested replacement phrase if applicable, or empty string'
          },
          isVerificationNeeded: {
            type: 'boolean',
            description: 'True if this is an empirical claim needing evidence, false for brand style/rule violations'
          },
          confidence: {
            type: 'integer',
            description: 'Confidence percentage between 50 and 100'
          }
        },
        required: [
          'findingId',
          'type',
          'severity',
          'guidelineSection',
          'ruleCitation',
          'evidence',
          'explanation',
          'recommendation',
          'isVerificationNeeded',
          'confidence'
        ]
      }
    },
    suggestedRevision: {
      type: 'string',
      description: 'Complete rewritten draft that eliminates violations, softens hype, and maintains author voice'
    },
    claimsRequiringEvidenceCount: {
      type: 'integer',
      description: 'Count of findings where isVerificationNeeded is true'
    }
  },
  required: [
    'complianceScore',
    'summary',
    'findings',
    'suggestedRevision',
    'claimsRequiringEvidenceCount'
  ]
};

// System instruction and prompt builder
export function buildGeminiPrompt(title, contentType, rawText, guidelines = {}) {
  const brandName = guidelines.brandName || 'Inkloom AI';
  const brandVoice = guidelines.brandVoice || 'Authoritative, Empathetic, Forward-Looking, Clear, and Honest';
  const preferredTerms = (guidelines.preferredTerms || []).join(', ') || 'N/A';
  
  const avoidTerms = (guidelines.avoidTerms || []).map(i => {
    return `- "${i.term}" -> Replace with: "${i.replacement || 'rephrase'}" (Reason: ${i.reason || 'Avoided'})`;
  }).join('\n') || 'None specified';

  const approvedFacts = (guidelines.approvedFacts || []).map(f => `- ${f}`).join('\n') || 'None specified';
  const verificationClaims = (guidelines.verificationClaims || []).join(', ') || 'None specified';
  const accessibilityRules = guidelines.accessibilityRules || 'Sentences under 30 words; inclusive tone.';
  const visualRules = guidelines.visualRules || 'Headings in Title Case.';

  const systemInstruction = `You are BrandForge AI, an enterprise-grade Pre-Publication Brand Governance & Editorial Compliance Auditor.
Your job is to rigorously review marketing drafts against the organization's official brand guidelines.

### CORE OPERATING RULES:
1. POLICY TRACEABILITY: Every single critique must cite a specific clause from the active brand guidelines below. Do NOT hallucinate rules or policies that are not stated.
2. SEPARATE CLAIMS FROM VIOLATIONS:
   - "brand_violation": Definite policy breaches (e.g. avoided words, forbidden phrases, incorrect naming, excessive sentence length). Set isVerificationNeeded = false.
   - "claim_verification": Factual assertions, metrics, ROI figures, statistics, or promissory guarantees (e.g. "100%", "zero risk", "billions saved") that lack proof in the Approved Facts Repository. Set isVerificationNeeded = true and prompt the author to attach a verified source link.
3. CONTEXT-PRESERVING REVISION: The suggestedRevision MUST preserve the author's original message, syntax structure, and marketing punch while eliminating prohibited terms, softening hyperbolic guarantees, and applying approved brand nomenclature.
4. CONFIDENCE INDICATOR: Provide a confidence percentage (50-100) reflecting semantic certainty.
5. COMPLIANCE SCORE: Compute a fair 0-100 score based on severity (High: -18, Medium: -8, Low: -3, minimum floor 10). If zero issues, score is 100.

### ACTIVE BRAND GUIDELINES:
- Official Brand Name: ${brandName}
- Brand Voice & Demeanor: ${brandVoice}
- Preferred Nomenclature: ${preferredTerms}
- Avoided Terminology & Required Replacements:
${avoidTerms}
- Approved Facts Repository (Claims matching these are safe):
${approvedFacts}
- High-Risk Claim Triggers Requiring Verification:
${verificationClaims}
- Cognitive Accessibility Rules:
${accessibilityRules}
- Visual & Formatting Standards:
${visualRules}`;

  const userPrompt = `Please audit this draft:
Content Title: ${title}
Content Format: ${contentType}

Draft Body:
"""
${rawText}
"""

Return your evaluation strictly conforming to the requested JSON schema.`;

  return { systemInstruction, userPrompt };
}

// Call Gemini API via Google Generative Language REST endpoint
export async function callGeminiApi({
  title,
  contentType,
  rawText,
  guidelines,
  apiKey,
  model = 'gemini-2.5-flash',
  timeoutMs = 9000
}) {
  const cleanApiKey = (apiKey || '').trim().replace(/^["']|["']$/g, '');
  const cleanModel = (model || 'gemini-2.5-flash').trim();

  const { systemInstruction, userPrompt } = buildGeminiPrompt(title, contentType, rawText, guidelines);

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      response_schema: GEMINI_REVIEW_SCHEMA,
      temperature: 0.1,
      max_output_tokens: 4096
    }
  };

  const candidateModels = [
    cleanModel,
    'gemini-2.5-flash',
    'gemini-2.0-flash'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const targetModel = candidateModels[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(cleanApiKey)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cleanApiKey
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        // If 404 (model not found) and more candidates exist, try next candidate model
        if (res.status === 404 && i < candidateModels.length - 1) {
          console.warn(`[BrandForge AI Review] Model '${targetModel}' returned 404. Trying fallback candidate '${candidateModels[i + 1]}'...`);
          lastError = new Error(`Gemini API returned status ${res.status}: ${errText.slice(0, 300)}`);
          continue;
        }
        throw new Error(`Gemini API returned status ${res.status}: ${errText.slice(0, 300)}`);
      }

      const resJson = await res.json();
      const candidate = resJson.candidates && resJson.candidates[0];
      const textPart = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0];
      const rawContent = textPart && textPart.text;

      if (!rawContent) {
        throw new Error('Gemini API returned empty candidate response.');
      }

      const parsed = JSON.parse(rawContent);

      // Validate structured fields
      if (typeof parsed.complianceScore !== 'number' || !Array.isArray(parsed.findings)) {
        throw new Error('Gemini response did not conform to required JSON structure.');
      }

      // Ensure finding IDs and sane confidence bounds
      parsed.findings.forEach((f, idx) => {
        if (!f.findingId) f.findingId = `ai-finding-${idx + 1}`;
        if (typeof f.confidence !== 'number' || f.confidence < 50 || f.confidence > 100) {
          f.confidence = 90;
        }
        f.isVerificationNeeded = Boolean(f.isVerificationNeeded);
      });

      parsed.claimsRequiringEvidenceCount = parsed.findings.filter(f => f.isVerificationNeeded).length;
      parsed.engine = 'gemini';
      parsed.model = targetModel;
      parsed.isFallback = false;

      return parsed;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      // If error is 404 and more candidates exist, loop continues
      if (err.message && err.message.includes('404') && i < candidateModels.length - 1) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All candidate Gemini models failed.');
}

// Master review dispatcher with defensive fallback
export async function reviewBrand({
  title,
  contentType = 'general',
  rawText,
  guidelines = {},
  apiKey = process.env.GEMINI_API_KEY,
  model = process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  forceEngine = null // 'deterministic' | 'gemini' | null (auto)
}) {
  // 1. Boundary check
  const validation = validateInput(title, rawText);
  if (!validation.isValid) {
    return {
      status: 400,
      error: validation.errors[0],
      validation
    };
  }

  const cleanApiKey = (apiKey || '').trim().replace(/^["']|["']$/g, '');
  const cleanModel = (model || 'gemini-2.5-flash').trim();
  const isKeyMissingOrPlaceholder = !cleanApiKey || cleanApiKey.includes('placeholder') || cleanApiKey === 'your_gemini_api_key_here' || cleanApiKey.length < 15;

  // 2. Forced or fallback deterministic mode
  if (forceEngine === 'deterministic' || isKeyMissingOrPlaceholder) {
    const result = runDeterministicReview(rawText, guidelines);
    const notice = isKeyMissingOrPlaceholder
      ? 'Gemini API key not configured in Netlify environment variables (GEMINI_API_KEY). Evaluated using local deterministic rules engine.'
      : null;

    return {
      status: 200,
      data: {
        ...result,
        title,
        contentType,
        rawText,
        timestamp: new Date().toISOString(),
        engine: 'deterministic',
        isFallback: forceEngine !== 'deterministic' && isKeyMissingOrPlaceholder,
        notice
      }
    };
  }

  // 3. Attempt Gemini Review
  try {
    const aiResult = await callGeminiApi({
      title,
      contentType,
      rawText,
      guidelines,
      apiKey: cleanApiKey,
      model: cleanModel
    });

    return {
      status: 200,
      data: {
        ...aiResult,
        title,
        contentType,
        rawText,
        timestamp: new Date().toISOString()
      }
    };
  } catch (err) {
    // Graceful fallback to deterministic engine on network error, rate-limit, or timeout
    console.warn(`[BrandForge AI Review] Falling back to deterministic engine due to: ${err.message}`);
    const fallbackResult = runDeterministicReview(rawText, guidelines);

    let diagnosticNotice = `AI service unavailable (${err.message.slice(0, 100)}). Evaluated using local deterministic rules engine.`;
    if (err.message.includes('API key not valid') || err.message.includes('400')) {
      diagnosticNotice = 'The GEMINI_API_KEY configured in Netlify environment variables was rejected by Google as invalid (HTTP 400). Please check your key in Google AI Studio. Evaluated using local deterministic rules engine.';
    } else if (err.message.includes('quota') || err.message.includes('429')) {
      diagnosticNotice = 'Gemini rate limit or quota exceeded. Evaluated using local deterministic rules engine.';
    }

    return {
      status: 200,
      data: {
        ...fallbackResult,
        title,
        contentType,
        rawText,
        timestamp: new Date().toISOString(),
        engine: 'deterministic_fallback',
        isFallback: true,
        fallbackReason: err.message,
        notice: diagnosticNotice
      }
    };
  }
}

