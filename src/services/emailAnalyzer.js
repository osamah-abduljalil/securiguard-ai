import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Email Analyzer Service
async function analyzeEmail(emailContent) {
  try {
    // Extract email features
    const features = extractEmailFeatures(emailContent);
    
    // Analyze email content
    const contentAnalysis = analyzeEmailContent(features);
    
    // Get AI analysis
    const aiAnalysis = await getAIAnalysis(emailContent, features);
    
    // Check for phishing indicators
    const phishingIndicators = checkPhishingIndicators(features);
    
    // Calculate risk score
    const riskScore = calculateRiskScore(contentAnalysis, phishingIndicators, aiAnalysis);
    
    return {
      riskScore,
      features,
      contentAnalysis,
      phishingIndicators,
      aiAnalysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing email:', error);
    throw error;
  }
}

function extractEmailFeatures(emailContent) {
  return {
    hasLinks: /https?:\/\/[^\s]+/.test(emailContent),
    hasAttachments: /attachment|attached|enclosed/i.test(emailContent),
    hasUrgency: /urgent|immediately|asap|hurry/i.test(emailContent),
    hasMoneyKeywords: /money|payment|bank|account|transfer|wire/i.test(emailContent),
    hasPersonalInfo: /password|login|account|verify|confirm/i.test(emailContent),
    hasSuspiciousSender: /noreply|no-reply|support@|help@/i.test(emailContent),
    hasGrammarErrors: /[A-Z]{2,}|[!]{2,}|[?]{2,}/.test(emailContent),
    hasExternalLinks: /(https?:\/\/[^\s]+)/g.test(emailContent)
  };
}

function analyzeEmailContent(features) {
  const analysis = {
    suspicious: false,
    warnings: [],
    score: 0
  };

  // Check for suspicious patterns
  if (features.hasUrgency) {
    analysis.warnings.push('Contains urgency indicators');
    analysis.score -= 15;
  }

  if (features.hasMoneyKeywords) {
    analysis.warnings.push('Contains financial keywords');
    analysis.score -= 20;
  }

  if (features.hasPersonalInfo) {
    analysis.warnings.push('Requests personal information');
    analysis.score -= 25;
  }

  if (features.hasSuspiciousSender) {
    analysis.warnings.push('Suspicious sender address');
    analysis.score -= 10;
  }

  if (features.hasGrammarErrors) {
    analysis.warnings.push('Contains grammar/spelling errors');
    analysis.score -= 10;
  }

  analysis.suspicious = analysis.score < -30;
  return analysis;
}

async function getAIAnalysis(emailContent, features) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this email content for potential security risks:
Email Content: ${emailContent}

Features:
- Has links: ${features.hasLinks}
- Has attachments: ${features.hasAttachments}
- Has urgency indicators: ${features.hasUrgency}
- Has money keywords: ${features.hasMoneyKeywords}
- Has personal info requests: ${features.hasPersonalInfo}
- Has suspicious sender: ${features.hasSuspiciousSender}
- Has grammar errors: ${features.hasGrammarErrors}
- Has external links: ${features.hasExternalLinks}

Please analyze for:
1. Phishing attempts
2. Social engineering
3. Suspicious links
4. Malicious attachments
5. Urgency/Scarcity tactics
6. Overall risk assessment

Provide a detailed analysis and risk score (0-100).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting AI analysis:', error);
    throw new Error('Failed to get AI analysis');
  }
}

function checkPhishingIndicators(features) {
  const indicators = [];
  
  if (features.hasExternalLinks) {
    indicators.push({
      type: 'external_links',
      confidence: 0.7,
      description: 'Contains external links'
    });
  }
  
  if (features.hasAttachments) {
    indicators.push({
      type: 'attachments',
      confidence: 0.6,
      description: 'Contains attachments'
    });
  }
  
  return {
    hasPhishingIndicators: indicators.length > 0,
    indicators,
    riskLevel: indicators.length > 1 ? 'high' : indicators.length === 1 ? 'medium' : 'low'
  };
}

function calculateRiskScore(contentAnalysis, phishingIndicators, aiAnalysis) {
  // Base score of 50
  let score = 50;
  
  // Adjust based on content analysis
  score += contentAnalysis.score;
  
  // Adjust based on phishing indicators
  if (phishingIndicators.hasPhishingIndicators) {
    score -= phishingIndicators.indicators.length * 10;
  }
  
  // Extract score from AI analysis
  const aiScore = extractAIScore(aiAnalysis);
  score = (score + aiScore) / 2;
  
  // Normalize score between 0 and 100
  return Math.min(Math.max(score, 0), 100);
}

function extractAIScore(aiAnalysis) {
  // Extract numerical score from AI analysis
  const scoreMatch = aiAnalysis.match(/risk score:?\s*(\d+)/i);
  return scoreMatch ? parseInt(scoreMatch[1]) : 50;
}

// Export functions
self.analyzeEmail = analyzeEmail; 