import OpenAI from 'openai';

// Initialize OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// File Scanner Service
async function scanFile(file) {
  try {
    // Extract file features
    const features = extractFileFeatures(file);
    
    // Analyze file content
    const contentAnalysis = analyzeFileContent(features);
    
    // Check for malware indicators
    const malwareIndicators = checkMalwareIndicators(features);
    
    // Calculate risk score
    const riskScore = calculateRiskScore(contentAnalysis, malwareIndicators);
    
    return {
      riskScore,
      features,
      contentAnalysis,
      malwareIndicators,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error scanning file:', error);
    throw error;
  }
}

function extractFileFeatures(file) {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    extension: file.name.split('.').pop().toLowerCase(),
    isExecutable: /\.(exe|bat|cmd|msi|dll|sys)$/i.test(file.name),
    isScript: /\.(js|vbs|ps1|sh|bash|py|rb|php)$/i.test(file.name),
    isDocument: /\.(doc|docx|xls|xlsx|pdf|txt|rtf)$/i.test(file.name),
    isArchive: /\.(zip|rar|7z|tar|gz)$/i.test(file.name),
    isImage: /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)
  };
}

function analyzeFileContent(features) {
  const analysis = {
    suspicious: false,
    warnings: [],
    score: 0
  };

  // Check for suspicious patterns
  if (features.isExecutable) {
    analysis.warnings.push('File is an executable');
    analysis.score -= 30;
  }

  if (features.isScript) {
    analysis.warnings.push('File is a script');
    analysis.score -= 20;
  }

  if (features.isArchive) {
    analysis.warnings.push('File is an archive');
    analysis.score -= 15;
  }

  if (features.size > 10 * 1024 * 1024) { // 10MB
    analysis.warnings.push('File is unusually large');
    analysis.score -= 10;
  }

  analysis.suspicious = analysis.score < -20;
  return analysis;
}

function checkMalwareIndicators(features) {
  const indicators = [];
  
  if (features.isExecutable) {
    indicators.push({
      type: 'executable',
      confidence: 0.8,
      description: 'File is an executable program'
    });
  }
  
  if (features.isScript) {
    indicators.push({
      type: 'script',
      confidence: 0.7,
      description: 'File is a script that can execute code'
    });
  }
  
  if (features.isArchive) {
    indicators.push({
      type: 'archive',
      confidence: 0.6,
      description: 'File is an archive that may contain malicious content'
    });
  }
  
  return {
    hasMalwareIndicators: indicators.length > 0,
    indicators,
    riskLevel: indicators.length > 1 ? 'high' : indicators.length === 1 ? 'medium' : 'low'
  };
}

function calculateRiskScore(contentAnalysis, malwareIndicators) {
  // Base score of 50
  let score = 50;
  
  // Adjust based on content analysis
  score += contentAnalysis.score;
  
  // Adjust based on malware indicators
  if (malwareIndicators.hasMalwareIndicators) {
    score -= malwareIndicators.indicators.length * 15;
  }
  
  // Normalize score between 0 and 100
  return Math.min(Math.max(score, 0), 100);
}

// Export functions
self.scanFile = scanFile; 