import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import SecurityBadge from './components/SecurityBadge';
import SecurityTooltip from './components/SecurityTooltip';
import './content.css';

// Initialize state
let currentUrl = window.location.href;
let currentRiskScore = null;
let lastScan = null;
let securityState = {
  riskScore: null,
  analysis: null,
  timestamp: null
};

// Store scanned URLs and their results
const scannedUrls = new Map();
// Store scanned emails and their results
const scannedEmails = new Map();
let isScanningEnabled = true;

// Load initial state
chrome.storage.local.get(['isScanningEnabled', 'currentRiskScore', 'lastScan'], (result) => {
  if (result.isScanningEnabled !== undefined) {
    isScanningEnabled = result.isScanningEnabled;
    if (!isScanningEnabled) {
      removeAllSecurityElements();
    }
  }
  
  if (result.currentRiskScore !== undefined) {
    currentRiskScore = result.currentRiskScore;
  }

  if (result.lastScan) {
    lastScan = result.lastScan;
  }
});

// Function to check if extension context is valid
function isExtensionContextValid() {
  try {
    return chrome.runtime.id !== undefined;
  } catch (error) {
    return false;
  }
}

// Function to handle extension context invalidation
function handleExtensionContextInvalid() {
  console.log('Extension context invalidated. Attempting to reconnect...');
  // Clear any existing state
  securityState = {
    riskScore: null,
    analysis: null,
    timestamp: null
  };
  // Update UI to show disconnected state
  if (root) {
    root.render(<SecurityBadge error="Extension disconnected. Please refresh the page." />);
  }
}

// Function to remove all security-related elements
function removeAllSecurityElements() {
  // Remove main security badge
  const mainBadge = document.getElementById('security-badge');
  if (mainBadge) {
    mainBadge.remove();
  }

  // Remove React badge container
  const badgeContainer = document.getElementById('securiguard-badge-container');
  if (badgeContainer) {
    badgeContainer.remove();
  }

  // Remove all link badges
  const linkBadges = document.querySelectorAll('.securiguard-link-badge');
  linkBadges.forEach(badge => badge.remove());

  // Remove email badges
  const emailBadges = document.querySelectorAll('.securiguard-email-badge');
  emailBadges.forEach(badge => badge.remove());

  // Remove all tooltips
  const tooltips = document.querySelectorAll('.securiguard-tooltip, .securiguard-email-tooltip');
  tooltips.forEach(tooltip => tooltip.remove());

  // Restore all links to their original state
  const links = document.getElementsByTagName('a');
  Array.from(links).forEach(link => {
    link.style.pointerEvents = '';
    link.style.opacity = '';
    link.style.textDecoration = '';
  });
}

// Function to restore scanning
function restoreScanning() {
  // Recreate React badge container
  const badgeContainer = document.createElement('div');
  badgeContainer.id = 'securiguard-badge-container';
  document.body.appendChild(badgeContainer);

  // Reinitialize React root
  const root = createRoot(badgeContainer);
  root.render(<SecurityBadge riskScore={null} />);

  // Rescan current page
  scanCurrentPage();
}

// Create container for security badge
const badgeContainer = document.createElement('div');
badgeContainer.id = 'securiguard-badge-container';
document.body.appendChild(badgeContainer);

// Initialize React root
const root = createRoot(badgeContainer);

// Render initial badge
root.render(<SecurityBadge riskScore={null} />);

// Function to show security tooltip
function showSecurityTooltip(data, anchorElement) {
  // Remove existing tooltip if any
  const existingTooltip = document.querySelector('.securiguard-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  // Create tooltip container
  const tooltipContainer = document.createElement('div');
  tooltipContainer.className = 'securiguard-tooltip';
  tooltipContainer.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 300px;
    font-size: 14px;
  `;

  // Position tooltip
  const rect = anchorElement.getBoundingClientRect();
  tooltipContainer.style.left = `${rect.right + 10}px`;
  tooltipContainer.style.top = `${rect.top}px`;

  // Add tooltip content
  tooltipContainer.innerHTML = `
    <div style="margin-bottom: 8px;">
      <strong>Security Analysis</strong>
      <span style="float: right; cursor: pointer;" class="close-tooltip">×</span>
    </div>
    <div style="margin-bottom: 8px;">
      <strong>Risk Score:</strong> ${data.riskScore}/100
    </div>
    <div style="margin-bottom: 8px;">
      <strong>Analysis:</strong><br>
      ${data.analysis ? data.analysis.warnings.join('<br>') : 'No detailed analysis available'}
    </div>
  `;

  // Add close button handler
  tooltipContainer.querySelector('.close-tooltip').addEventListener('click', () => {
    tooltipContainer.remove();
  });

  // Add tooltip to document
  document.body.appendChild(tooltipContainer);

  // Close tooltip when clicking outside
  document.addEventListener('click', function closeTooltip(e) {
    if (!tooltipContainer.contains(e.target) && e.target !== anchorElement) {
      tooltipContainer.remove();
      document.removeEventListener('click', closeTooltip);
    }
  });
}

// Function to create and add security badge
function createSecurityBadge(link, riskScore, analysis) {
  // Remove existing badge if any
  const existingBadge = link.parentElement.querySelector('.securiguard-link-badge');
  if (existingBadge) {
    existingBadge.remove();
  }

  // Create badge container
  const badgeContainer = document.createElement('span');
  badgeContainer.className = 'securiguard-link-badge';
  badgeContainer.style.cssText = `
    display: inline-block;
    margin-left: 5px;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
  `;

  // Set badge color based on risk score
  if (riskScore > 70) {
    badgeContainer.style.backgroundColor = '#ff4444';
    badgeContainer.style.color = 'white';
    badgeContainer.textContent = '⚠️ High Risk';
    // Make link non-clickable
    link.style.pointerEvents = 'none';
    link.style.opacity = '0.7';
    link.style.textDecoration = 'line-through';
  } else if (riskScore > 30) {
    badgeContainer.style.backgroundColor = '#ffbb33';
    badgeContainer.style.color = 'black';
    badgeContainer.textContent = '⚠️ Caution';
  } else {
    badgeContainer.style.backgroundColor = '#00C851';
    badgeContainer.style.color = 'white';
    badgeContainer.textContent = '✓ Safe';
  }

  // Add click handler for tooltip
  badgeContainer.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showSecurityTooltip({
      url: link.href,
      riskScore,
      analysis
    }, badgeContainer);
  });

  // Insert badge after the link
  link.parentElement.insertBefore(badgeContainer, link.nextSibling);
}

// Function to scan all URLs on the page
async function scanAllUrls() {
  const links = document.getElementsByTagName('a');
  for (const link of links) {
    if (link.href && !scannedUrls.has(link.href)) {
      try {
        const url = link.href.toString();
        chrome.runtime.sendMessage({
          type: 'SCAN_URL',
          url: url
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error scanning URL:', chrome.runtime.lastError);
            return;
          }
          
          if (response && response.success && response.data) {
            scannedUrls.set(url, response.data);
            createSecurityBadge(link, response.data.riskScore, response.data.urlAnalysis);
            
            // Store scanned URLs in chrome.storage.local
            chrome.storage.local.get(['scannedUrls'], (result) => {
              const storedUrls = result.scannedUrls || {};
              storedUrls[url] = response.data;
              chrome.storage.local.set({ scannedUrls: storedUrls });
            });
          }
        });
      } catch (error) {
        console.error('Error scanning URL:', error);
      }
    }
  }
}

// Initial scan of all URLs
scanAllUrls();

// Monitor DOM changes to scan new URLs
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      scanAllUrls();
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Monitor URL changes
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    // Clear scanned URLs cache
    scannedUrls.clear();
    // Scan URLs on the new page
    scanAllUrls();
  }
}).observe(document, { subtree: true, childList: true });

// Add styles for security badges
const style = document.createElement('style');
style.textContent = `
  .securiguard-link-badge {
    display: inline-block;
    margin-left: 5px;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
  }
  .securiguard-tooltip {
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 300px;
    font-size: 14px;
  }
`;
document.head.appendChild(style);

// Listen for messages from popup and background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isExtensionContextValid()) {
    handleExtensionContextInvalid();
    return;
  }

  if (message.type === 'GET_SECURITY_STATUS') {
    // Send current security state
    sendResponse({
      riskScore: securityState.riskScore,
      analysis: securityState.analysis,
      timestamp: securityState.timestamp
    });
  } else if (message.type === 'SCAN_RESULTS') {
    handleScanResults(message.data);
    sendResponse({ success: true });
  } else if (message.type === 'SCAN_ERROR') {
    handleScanError(message.error);
    sendResponse({ success: false, error: message.error });
  } else if (message.type === 'SCAN_URL') {
    // Forward scan request to background script
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError;
          if (error.message.includes('Extension context invalidated')) {
            handleExtensionContextInvalid();
          } else {
            console.error('Error scanning URL:', error.message || error);
            handleScanError(error);
          }
          sendResponse({ success: false, error: error.message || error });
        } else if (!response || !response.success) {
          const error = response?.error || 'Failed to scan URL';
          console.error('Error scanning URL:', error);
          handleScanError(error);
          sendResponse({ success: false, error });
        } else {
          handleScanResults(response.data);
          sendResponse({ success: true });
        }
      });
    } catch (error) {
      if (error.message.includes('Extension context invalidated')) {
        handleExtensionContextInvalid();
      } else {
        console.error('Error sending message:', error);
        handleScanError(error);
      }
      sendResponse({ success: false, error: error.message || error });
    }
    return true; // Required for async sendResponse
  } else if (message.type === 'TOGGLE_SCANNING') {
    isScanningEnabled = message.isEnabled;
    if (isScanningEnabled) {
      restoreScanning();
    } else {
      removeAllSecurityElements();
    }
    sendResponse({ success: true });
  } else if (message.type === 'SCAN_CURRENT_PAGE') {
    if (isScanningEnabled) {
      // Clear existing scan results
      scannedUrls.clear();
      currentRiskScore = null;
      
      // Force rescan
      scanCurrentPage().then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        console.error('Error during scan:', error);
        sendResponse({ success: false, error: error.message });
      });
    } else {
      sendResponse({ success: false, error: 'Scanning is disabled' });
    }
    return true; // Required for async sendResponse
  }
});

// Handle scan results
function handleScanResults(data) {
  if (!data) {
    handleScanError('No scan results received');
    return;
  }

  try {
    securityState = {
      riskScore: data.riskScore,
      analysis: data.aiAnalysis || data.urlAnalysis,
      timestamp: data.timestamp || new Date().toISOString()
    };

    // Update badge
    root.render(<SecurityBadge riskScore={data.riskScore} />);

    // Show tooltip if risk score is high
    if (data.riskScore > 70) {
      showSecurityTooltip(data);
    }
  } catch (error) {
    console.error('Error handling scan results:', error);
    handleScanError(error);
  }
}

// Handle scan errors
function handleScanError(error) {
  console.error('Scan error:', error);
  // Extract error message properly
  const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
  // Show error in badge
  root.render(<SecurityBadge error={errorMessage} />);
}

// Function to check if current page is Gmail
function isGmailPage() {
  return window.location.hostname === 'mail.google.com';
}

// Function to get current email content
function getCurrentEmailContent() {
  if (!isGmailPage()) return null;

  // Get email content from Gmail's DOM
  const emailContent = document.querySelector('.a3s.aiL');
  if (!emailContent) return null;

  return {
    subject: document.querySelector('h2.hP')?.textContent || '',
    sender: document.querySelector('.gD')?.getAttribute('email') || '',
    content: emailContent.textContent || '',
    links: Array.from(emailContent.getElementsByTagName('a')).map(a => a.href)
  };
}

// Function to analyze email content
async function analyzeEmailContent(emailData) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_EMAIL',
      data: emailData
    });

    if (response && response.success) {
      return response.data;
    }
    throw new Error('Failed to analyze email');
  } catch (error) {
    console.error('Error analyzing email:', error);
    return null;
  }
}

// Function to create email security badge
function createEmailSecurityBadge(riskScore, analysis) {
  // Remove existing badge if any
  const existingBadge = document.querySelector('.securiguard-email-badge');
  if (existingBadge) {
    existingBadge.remove();
  }

  // Create badge container
  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'securiguard-email-badge';
  badgeContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 15px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `;

  // Set badge color based on risk score
  if (riskScore > 70) {
    badgeContainer.style.backgroundColor = '#ff4444';
    badgeContainer.style.color = 'white';
    badgeContainer.textContent = '⚠️ High Risk Email';
  } else if (riskScore > 30) {
    badgeContainer.style.backgroundColor = '#ffbb33';
    badgeContainer.style.color = 'black';
    badgeContainer.textContent = '⚠️ Suspicious Email';
  } else {
    badgeContainer.style.backgroundColor = '#00C851';
    badgeContainer.style.color = 'white';
    badgeContainer.textContent = '✓ Safe Email';
  }

  // Add click handler for tooltip
  badgeContainer.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showEmailSecurityTooltip(riskScore, analysis);
  });

  // Add badge to document
  document.body.appendChild(badgeContainer);
}

// Function to show email security tooltip
function showEmailSecurityTooltip(riskScore, analysis) {
  // Remove existing tooltip if any
  const existingTooltip = document.querySelector('.securiguard-email-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  // Create tooltip container
  const tooltipContainer = document.createElement('div');
  tooltipContainer.className = 'securiguard-email-tooltip';
  tooltipContainer.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 300px;
    font-size: 14px;
  `;

  // Add tooltip content
  tooltipContainer.innerHTML = `
    <div style="margin-bottom: 10px;">
      <strong>Email Security Analysis</strong>
      <span style="float: right; cursor: pointer;" class="close-tooltip">×</span>
    </div>
    <div style="margin-bottom: 8px;">
      <strong>Risk Score:</strong> ${riskScore}/100
    </div>
    <div style="margin-bottom: 8px;">
      <strong>Analysis:</strong><br>
      ${analysis.warnings.join('<br>')}
    </div>
    <div style="margin-bottom: 8px;">
      <strong>Recommendations:</strong><br>
      ${analysis.recommendations.join('<br>')}
    </div>
  `;

  // Add close button handler
  tooltipContainer.querySelector('.close-tooltip').addEventListener('click', () => {
    tooltipContainer.remove();
  });

  // Add tooltip to document
  document.body.appendChild(tooltipContainer);

  // Close tooltip when clicking outside
  document.addEventListener('click', function closeTooltip(e) {
    if (!tooltipContainer.contains(e.target) && !e.target.classList.contains('securiguard-email-badge')) {
      tooltipContainer.remove();
      document.removeEventListener('click', closeTooltip);
    }
  });
}

// Monitor Gmail for email changes
if (isGmailPage()) {
  // Initial email check
  const checkEmail = async () => {
    const emailData = getCurrentEmailContent();
    if (emailData) {
      const analysis = await analyzeEmailContent(emailData);
      if (analysis) {
        createEmailSecurityBadge(analysis.riskScore, analysis);
        // Store email analysis
        chrome.storage.local.get(['scannedEmails'], (result) => {
          const storedEmails = result.scannedEmails || {};
          storedEmails[emailData.subject] = {
            ...emailData,
            analysis,
            timestamp: new Date().toISOString()
          };
          chrome.storage.local.set({ scannedEmails: storedEmails });
        });
      }
    }
  };

  // Check email when URL changes (new email opened)
  let lastEmailUrl = window.location.href;
  new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastEmailUrl) {
      lastEmailUrl = currentUrl;
      checkEmail();
    }
  }).observe(document, { subtree: true, childList: true });

  // Initial check
  checkEmail();
}

// Function to analyze URL
async function analyzeUrl(url) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'SCAN_URL',
      url: url
    });

    if (response && response.success) {
      return response.data;
    }
    throw new Error('Failed to analyze URL');
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw error;
  }
}

// Function to check threat intelligence
async function checkThreatIntelligence(url) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_THREAT_INTELLIGENCE',
      url: url
    });

    if (response && response.success) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error checking threat intelligence:', error);
    return null;
  }
}

// Function to calculate risk score
function calculateRiskScore(analysis, threatIntel) {
  let riskScore = 0;

  // Base score from URL analysis
  if (analysis && analysis.riskScore) {
    riskScore += analysis.riskScore;
  }

  // Additional score from threat intelligence
  if (threatIntel) {
    if (threatIntel.isMalicious) {
      riskScore += 50;
    }
    if (threatIntel.reputationScore) {
      riskScore += (100 - threatIntel.reputationScore) / 2;
    }
  }

  // Cap the risk score at 100
  return Math.min(100, Math.max(0, riskScore));
}

// Function to scan current page
async function scanCurrentPage() {
  if (!isScanningEnabled) {
    throw new Error('Scanning is disabled');
  }

  try {
    const url = window.location.href;
    
    // Update badge to scanning state
    updateSecurityBadge(null);

    // Clear existing scan results for this URL
    scannedUrls.delete(url);
    
    // Analyze URL and check threat intelligence
    const [analysis, threatIntel] = await Promise.all([
      analyzeUrl(url),
      checkThreatIntelligence(url)
    ]);
    
    // Calculate final risk score
    const riskScore = calculateRiskScore(analysis, threatIntel);
    currentRiskScore = riskScore;
    
    // Update last scan timestamp
    lastScan = new Date().toISOString();
    
    // Store scanned URL
    scannedUrls.set(url, {
      riskScore,
      timestamp: lastScan,
      analysis,
      threatIntel
    });
    
    // Save to storage
    await chrome.storage.local.set({ 
      scannedUrls: Object.fromEntries(scannedUrls),
      currentRiskScore: riskScore,
      lastScan: lastScan
    });
    
    // Update security badge
    updateSecurityBadge(riskScore);
    
    // Notify popup
    chrome.runtime.sendMessage({
      type: 'SECURITY_STATUS_UPDATE',
      data: {
        riskScore,
        scannedUrls: Object.fromEntries(scannedUrls),
        currentRiskScore: riskScore,
        lastScan: lastScan
      }
    });

    return { success: true, riskScore };
  } catch (error) {
    console.error('Error scanning page:', error);
    updateSecurityBadge(null, error);
    throw error;
  }
}

// Update risk display
function updateRiskDisplay(riskScore) {
  let statusClass;
  let statusText;
  let statusIcon;

  if (riskScore <= 30) {
    statusClass = 'safe';
    statusText = 'Safe';
    statusIcon = '✓'; // Unicode checkmark
  } else if (riskScore <= 70) {
    statusClass = 'caution';
    statusText = 'Caution';
    statusIcon = '⚠️'; // Warning emoji
  } else {
    statusClass = 'danger';
    statusText = 'Danger';
    statusIcon = '⚠️'; // Warning emoji
  }

  statusElement.className = `status ${statusClass}`;
  statusElement.querySelector('.status-text').textContent = `${statusText} (${riskScore}/100)`;
  statusElement.querySelector('.status-icon').textContent = statusIcon;
}

// Function to update security badge
function updateSecurityBadge(riskScore, error = null) {
  if (!isScanningEnabled) return;

  let existingBadge = document.getElementById('security-badge');
  if (!existingBadge) {
    existingBadge = document.createElement('div');
    existingBadge.id = 'security-badge';
    document.body.appendChild(existingBadge);
  }

  // Update badge content
  existingBadge.className = 'security-badge';
  if (error) {
    existingBadge.classList.add('error');
    existingBadge.innerHTML = `
      <span class="security-badge-icon"><i class="fas fa-exclamation-circle"></i></span>
      <span class="security-badge-text">Error</span>
    `;
  } else if (riskScore === null) {
    existingBadge.classList.add('scanning');
    existingBadge.innerHTML = `
      <span class="security-badge-icon"><i class="fas fa-sync fa-spin"></i></span>
      <span class="security-badge-text">Scanning...</span>
    `;
  } else {
    if (riskScore <= 30) {
      existingBadge.classList.add('safe');
      existingBadge.innerHTML = `
        <span class="security-badge-icon"><i class="fas fa-check-circle"></i></span>
        <span class="security-badge-text">Safe</span>
      `;
    } else if (riskScore <= 70) {
      existingBadge.classList.add('caution');
      existingBadge.innerHTML = `
        <span class="security-badge-icon"><i class="fas fa-exclamation-triangle"></i></span>
        <span class="security-badge-text">Caution</span>
      `;
    } else {
      existingBadge.classList.add('danger');
      existingBadge.innerHTML = `
        <span class="security-badge-icon"><i class="fas fa-exclamation-circle"></i></span>
        <span class="security-badge-text">Danger</span>
      `;
    }
  }
}

// Initialize scanning
if (isScanningEnabled) {
  scanCurrentPage();
} 