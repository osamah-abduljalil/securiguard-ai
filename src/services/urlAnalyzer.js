import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractFeatures } from '../utils/urlFeatures';

// Initialize Gemini configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// URL Analyzer Service
async function analyzeUrl(url) {
  try {
    // Extract URL features
    const features = extractUrlFeatures(url);
    
    // Analyze URL structure
    const structureAnalysis = analyzeUrlStructure(features);
    
    // Get AI analysis
    const aiAnalysis = await getAIAnalysis(url, features);
    
    // Calculate initial risk score
    const riskScore = calculateInitialRiskScore(structureAnalysis, aiAnalysis);
    
    return {
      riskScore,
      features,
      structureAnalysis,
      aiAnalysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw error;
  }
}

function extractUrlFeatures(url) {
  try {
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      hasSubdomain: urlObj.hostname.split('.').length > 2,
      isHttps: urlObj.protocol === 'https:',
      pathLength: urlObj.pathname.split('/').filter(Boolean).length,
      hasQueryParams: urlObj.search.length > 0,
      hasSpecialChars: /[<>{}[\]\\^~`@#$%&*()_+=|'";:,?]/.test(url)
    };
  } catch (error) {
    console.error('Error extracting URL features:', error);
    throw error;
  }
}

function analyzeUrlStructure(features) {
  const analysis = {
    suspicious: false,
    warnings: [],
    score: 0
  };

  // Check for suspicious patterns
  if (!features.isHttps) {
    analysis.warnings.push('Not using HTTPS');
    analysis.score -= 20;
  }

  if (features.hasSpecialChars) {
    analysis.warnings.push('Contains special characters');
    analysis.score -= 15;
  }

  if (features.pathLength > 5) {
    analysis.warnings.push('Unusually long path');
    analysis.score -= 10;
  }

  if (features.hasQueryParams) {
    analysis.warnings.push('Contains query parameters');
    analysis.score -= 5;
  }

  analysis.suspicious = analysis.score < -20;
  return analysis;
}

async function getAIAnalysis(url, features) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this URL for potential security risks:
URL: ${url}
Features:
- Protocol: ${features.protocol}
- Hostname: ${features.hostname}
- Path length: ${features.pathLength}
- Has query params: ${features.hasQueryParams}
- Has special chars: ${features.hasSpecialChars}
- Has subdomain: ${features.hasSubdomain}
- Is HTTPS: ${features.isHttps}

Please analyze for:
1. Phishing patterns
2. Suspicious domain names
3. URL obfuscation
4. Social engineering attempts
5. Overall risk assessment

Provide a detailed analysis and risk score (0-100).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting AI analysis:', error);
    throw new Error('Failed to get AI analysis');
  }
}

function calculateInitialRiskScore(structureAnalysis, aiAnalysis) {
  // Base score of 50
  let score = 50;
  
  // Adjust based on structure analysis
  score += structureAnalysis.score;
  
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
self.analyzeUrl = analyzeUrl;

function generateAnalysisPrompt(url, features) {
  return `Analyze this URL for potential security risks:
URL: ${url}
Features:
- Domain: ${features.domain}
- TLD: ${features.tld}
- Path length: ${features.pathLength}
- Has query params: ${features.hasQueryParams}
- Has special chars: ${features.hasSpecialChars}
- Is IP address: ${features.isIpAddress}
- Has subdomain: ${features.hasSubdomain}

Please analyze for:
1. Phishing patterns
2. Suspicious domain names
3. URL obfuscation
4. Social engineering attempts
5. Overall risk assessment

Provide a detailed analysis and risk score (0-100).`;
}

function calculateRiskScore(aiAnalysis, features) {
  let score = 0;
  
  // Base score from features
  if (features.isIpAddress) score += 20;
  if (features.hasSpecialChars) score += 15;
  if (features.hasQueryParams) score += 10;
  if (features.pathLength > 3) score += 5;
  
  // Adjust based on AI analysis
  const aiScore = extractAIScore(aiAnalysis);
  score = (score + aiScore) / 2;
  
  return Math.min(Math.max(score, 0), 100);
} 