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

// Function to analyze email content
async function analyzeEmail(emailData) {
  try {
    const { subject, sender, content, links } = emailData;
    const warnings = [];
    const recommendations = [];
    let riskScore = 0;

    // Check sender domain
    const senderDomain = sender.split('@')[1];
    if (!senderDomain) {
      warnings.push('Invalid sender email address');
      riskScore += 20;
    }

    // Check for suspicious patterns in subject
    const suspiciousPatterns = [
      'urgent',
      'action required',
      'verify your account',
      'suspicious activity',
      'unusual login',
      'account suspended',
      'password expired',
      'security alert',
      'verify your identity',
      'confirm your details'
    ];

    const subjectLower = subject.toLowerCase();
    suspiciousPatterns.forEach(pattern => {
      if (subjectLower.includes(pattern)) {
        warnings.push(`Suspicious pattern in subject: "${pattern}"`);
        riskScore += 10;
      }
    });

    // Check for suspicious links
    if (links && links.length > 0) {
      const suspiciousDomains = [
        'bit.ly',
        'tinyurl.com',
        'goo.gl',
        't.co',
        'is.gd',
        'cli.gs',
        'ow.ly',
        'yfrog.com',
        'migre.me',
        'ff.im',
        'tiny.cc',
        'url4.eu',
        'tr.im',
        'twit.ac',
        'su.pr',
        'twurl.nl',
        'snipurl.com',
        'short.to',
        'BudURL.com',
        'ping.fm',
        'post.ly',
        'Just.as',
        'bkite.com',
        'snipr.com',
        'fic.kr',
        'loopt.us',
        'htxt.it',
        'AltURL.com',
        'RedirX.com',
        'DigBig.com',
        'short.ie',
        'u.mavrev.com',
        'kl.am',
        'wp.me',
        'u.nu',
        'rubyurl.com',
        'om.ly',
        'to.ly',
        'bit.do',
        't.co',
        'lnkd.in',
        'db.tt',
        'qr.ae',
        'adf.ly',
        'goo.gl',
        'bitly.com',
        'cur.lv',
        'tinyurl.com',
        'ow.ly',
        'bit.ly',
        'adcrun.ch',
        'ity.im',
        'q.gs',
        'is.gd',
        'po.st',
        'bc.vc',
        'twitthis.com',
        'ht.ly',
        'alturl.com',
        'u.to',
        'j.mp',
        'buzurl.com',
        'cutt.us',
        'u.bb',
        'yourls.org',
        'x.co',
        'prettylinkpro.com',
        'scrnch.me',
        'filoops.info',
        'vzturl.com',
        'qr.net',
        '1url.com',
        'tweez.me',
        'v.gd',
        'tr.im',
        'link.zip.net'
      ];

      links.forEach(link => {
        try {
          const url = new URL(link);
          if (suspiciousDomains.includes(url.hostname)) {
            warnings.push(`Suspicious URL shortener detected: ${url.hostname}`);
            riskScore += 15;
          }
        } catch (e) {
          warnings.push(`Invalid URL detected: ${link}`);
          riskScore += 20;
        }
      });
    }

    // Check for common phishing indicators in content
    const phishingIndicators = [
      'click here',
      'verify now',
      'confirm your account',
      'update your information',
      'your account will be suspended',
      'unusual activity detected',
      'security check required',
      'verify your identity',
      'confirm your details',
      'your account has been compromised'
    ];

    const contentLower = content.toLowerCase();
    phishingIndicators.forEach(indicator => {
      if (contentLower.includes(indicator)) {
        warnings.push(`Phishing indicator found: "${indicator}"`);
        riskScore += 10;
      }
    });

    // Add recommendations based on warnings
    if (warnings.length > 0) {
      recommendations.push('Be cautious with this email');
      recommendations.push('Verify the sender\'s identity');
      recommendations.push('Do not click on any links without verification');
      recommendations.push('Do not provide any personal information');
    } else {
      recommendations.push('Email appears to be safe');
      recommendations.push('Continue to exercise caution with links');
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    return {
      riskScore,
      warnings,
      recommendations
    };
  } catch (error) {
    console.error('Error analyzing email:', error);
    return {
      riskScore: 100,
      warnings: ['Error analyzing email'],
      recommendations: ['Treat this email with caution']
    };
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_URL') {
    analyzeUrl(message.url)
      .then(analysis => {
        sendResponse({ success: true, data: analysis });
      })
      .catch(error => {
        console.error('Error scanning URL:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  } else if (message.type === 'ANALYZE_EMAIL') {
    analyzeEmail(message.data)
      .then(analysis => {
        sendResponse({ success: true, data: analysis });
      })
      .catch(error => {
        console.error('Error analyzing email:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  } else if (message.type === 'SHOW_SECURITY_REPORT') {
    chrome.windows.create({
      url: chrome.runtime.getURL('report.html'),
      type: 'popup',
      width: 800,
      height: 600
    });
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