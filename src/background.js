// Import service files
importScripts(
  'services/urlAnalyzer.js',
  'services/threatIntelligence.js',
  'services/emailAnalyzer.js',
  'services/fileScanner.js'
);

// Initialize service worker
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(clients.claim());
});

// Initialize context menu items
chrome.runtime.onInstalled.addListener(() => {
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
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'scanUrl') {
    try {
      const url = info.linkUrl;
      const urlAnalysis = await analyzeUrl(url);
      const threatIntel = await checkThreatIntelligence(url);
      
      // Calculate final risk score
      const riskScore = calculateRiskScore(urlAnalysis, threatIntel);
      
      // Send results back to content script
      chrome.tabs.sendMessage(tab.id, {
        type: 'SCAN_RESULTS',
        data: {
          url,
          riskScore,
          urlAnalysis,
          threatIntel,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error scanning URL:', error);
      const errorMessage = error?.message || error?.toString() || 'Failed to scan URL';
      chrome.tabs.sendMessage(tab.id, {
        type: 'SCAN_ERROR',
        error: errorMessage
      });
    }
  } else if (info.menuItemId === 'scanFile') {
    try {
      const fileUrl = info.linkUrl;
      const file = await fetch(fileUrl).then(r => r.blob());
      const fileAnalysis = await scanFile(file);
      
      // Send results back to content script
      chrome.tabs.sendMessage(tab.id, {
        type: 'SCAN_RESULTS',
        data: {
          fileUrl,
          fileAnalysis,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error scanning file:', error);
      chrome.tabs.sendMessage(tab.id, {
        type: 'SCAN_ERROR',
        error: error.message
      });
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_URL') {
    // Extract and validate URL
    const url = typeof message.url === 'string' ? message.url : 
                (message.url?.href || message.url?.url || null);

    if (!url) {
      console.error('Invalid URL provided:', message.url);
      sendResponse({ 
        success: false, 
        error: 'Invalid URL provided for scanning' 
      });
      return;
    }

    try {
      analyzeUrl(url)
        .then(async (urlAnalysis) => {
          try {
            const threatIntel = await checkThreatIntelligence(url);
            const riskScore = calculateRiskScore(urlAnalysis, threatIntel);
            
            sendResponse({
              success: true,
              data: {
                url,
                riskScore,
                urlAnalysis,
                threatIntel,
                timestamp: new Date().toISOString()
              }
            });
          } catch (error) {
            console.error('Error in threat intelligence check:', error);
            sendResponse({
              success: false,
              error: error?.message || error?.toString() || 'Failed to check threat intelligence'
            });
          }
        })
        .catch(error => {
          console.error('Error in URL analysis:', error);
          sendResponse({
            success: false,
            error: error?.message || error?.toString() || 'Failed to analyze URL'
          });
        });
      return true; // Required for async sendResponse
    } catch (error) {
      console.error('Error processing URL scan request:', error);
      sendResponse({
        success: false,
        error: error?.message || error?.toString() || 'Failed to process URL scan request'
      });
    }
  }
  if (message.type === 'ANALYZE_EMAIL') {
    analyzeEmail(message.data)
      .then(results => sendResponse({ success: true, data: results }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required for async sendResponse
  }
});

// Calculate risk score based on URL analysis and threat intelligence
function calculateRiskScore(urlAnalysis, threatIntel) {
  try {
    let score = urlAnalysis?.riskScore || 50; // Default to middle risk if no score provided
    
    // Adjust score based on threat intelligence
    if (threatIntel?.isKnownMalicious?.isMalicious) {
      score -= 50;
    }
    
    if (threatIntel?.domainInfo?.suspicious) {
      score -= 20;
    }
    
    if (threatIntel?.phishingIndicators?.hasPhishingIndicators) {
      score -= (threatIntel.phishingIndicators.indicators?.length || 0) * 10;
    }
    
    // Normalize score between 0 and 100
    return Math.min(Math.max(score, 0), 100);
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return 50; // Return middle risk score on error
  }
} 