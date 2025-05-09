import { analyzeUrl } from './services/urlAnalyzer';
import { checkThreatIntelligence } from './services/threatIntelligence';
import { analyzeEmail } from './services/emailAnalyzer';
import { scanFile } from './services/fileScanner';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items
  chrome.contextMenus.create({
    id: 'scanUrl',
    title: 'Scan URL with SecuriGuard AI',
    contexts: ['link']
  });

  chrome.contextMenus.create({
    id: 'scanFile',
    title: 'Scan File with SecuriGuard AI',
    contexts: ['link']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'scanUrl') {
    handleUrlScan(info.linkUrl, tab.id);
  } else if (info.menuItemId === 'scanFile') {
    handleFileScan(info.linkUrl, tab.id);
  }
});

// Handle URL scanning
async function handleUrlScan(url, tabId) {
  try {
    // Get AI analysis
    const aiAnalysis = await analyzeUrl(url);
    
    // Get threat intelligence
    const threatData = await checkThreatIntelligence(url);
    
    // Calculate risk score
    const riskScore = calculateRiskScore(aiAnalysis, threatData);
    
    // Send results to content script
    chrome.tabs.sendMessage(tabId, {
      type: 'SCAN_RESULTS',
      data: {
        url,
        riskScore,
        aiAnalysis,
        threatData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error scanning URL:', error);
    chrome.tabs.sendMessage(tabId, {
      type: 'SCAN_ERROR',
      error: error.message
    });
  }
}

// Handle file scanning
async function handleFileScan(fileUrl, tabId) {
  try {
    const scanResults = await scanFile(fileUrl);
    chrome.tabs.sendMessage(tabId, {
      type: 'FILE_SCAN_RESULTS',
      data: scanResults
    });
  } catch (error) {
    console.error('Error scanning file:', error);
    chrome.tabs.sendMessage(tabId, {
      type: 'SCAN_ERROR',
      error: error.message
    });
  }
}

// Calculate risk score based on multiple factors
function calculateRiskScore(aiAnalysis, threatData) {
  let score = 0;
  
  // AI analysis weight: 40%
  score += aiAnalysis.riskScore * 0.4;
  
  // Threat intelligence weight: 40%
  score += threatData.riskScore * 0.4;
  
  // Additional factors weight: 20%
  const additionalFactors = {
    domainAge: threatData.domainAge,
    sslValid: threatData.sslValid,
    reputation: threatData.reputation
  };
  
  score += calculateAdditionalScore(additionalFactors) * 0.2;
  
  return Math.min(Math.max(score, 0), 100);
}

// Calculate score for additional factors
function calculateAdditionalScore(factors) {
  let score = 0;
  
  if (factors.domainAge > 365) score += 20;
  if (factors.sslValid) score += 20;
  if (factors.reputation > 0.7) score += 20;
  
  return score;
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_EMAIL') {
    analyzeEmail(message.data)
      .then(results => sendResponse({ success: true, data: results }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  }
}); 