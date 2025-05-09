import { Configuration, OpenAIApi } from 'openai';
import { extractFeatures } from '../utils/urlFeatures';

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export async function analyzeUrl(url) {
  try {
    // Extract URL features
    const features = extractFeatures(url);
    
    // Prepare prompt for AI analysis
    const prompt = generateAnalysisPrompt(url, features);
    
    // Get AI analysis
    const aiResponse = await getAIAnalysis(prompt);
    
    // Process and return results
    return {
      riskScore: calculateRiskScore(aiResponse, features),
      analysis: aiResponse,
      features,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw new Error('Failed to analyze URL');
  }
}

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

async function getAIAnalysis(prompt) {
  try {
    const response = await openai.createCompletion({
      model: "gpt-4",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.3
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error getting AI analysis:', error);
    throw new Error('Failed to get AI analysis');
  }
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

function extractAIScore(aiAnalysis) {
  // Extract numerical score from AI analysis
  const scoreMatch = aiAnalysis.match(/risk score:?\s*(\d+)/i);
  return scoreMatch ? parseInt(scoreMatch[1]) : 50;
} 