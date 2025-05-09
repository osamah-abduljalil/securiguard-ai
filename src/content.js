import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import SecurityBadge from './components/SecurityBadge';
import SecurityTooltip from './components/SecurityTooltip';
import './content.css';

// Initialize state
let currentUrl = window.location.href;
let securityState = {
  riskScore: null,
  analysis: null,
  timestamp: null
};

// Create container for security badge
const badgeContainer = document.createElement('div');
badgeContainer.id = 'securiguard-badge-container';
document.body.appendChild(badgeContainer);

// Initialize React root
const root = createRoot(badgeContainer);

// Render initial badge
root.render(<SecurityBadge riskScore={null} />);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_RESULTS') {
    handleScanResults(message.data);
  } else if (message.type === 'SCAN_ERROR') {
    handleScanError(message.error);
  }
});

// Handle scan results
function handleScanResults(data) {
  securityState = {
    riskScore: data.riskScore,
    analysis: data.aiAnalysis,
    timestamp: data.timestamp
  };

  // Update badge
  root.render(<SecurityBadge riskScore={data.riskScore} />);

  // Show tooltip if risk score is high
  if (data.riskScore > 70) {
    showSecurityTooltip(data);
  }
}

// Handle scan errors
function handleScanError(error) {
  console.error('Scan error:', error);
  // Show error in badge
  root.render(<SecurityBadge error={error} />);
}

// Show security tooltip
function showSecurityTooltip(data) {
  const tooltipContainer = document.createElement('div');
  tooltipContainer.id = 'securiguard-tooltip-container';
  document.body.appendChild(tooltipContainer);

  const tooltipRoot = createRoot(tooltipContainer);
  tooltipRoot.render(<SecurityTooltip data={data} />);

  // Remove tooltip after 5 seconds
  setTimeout(() => {
    tooltipRoot.unmount();
    tooltipContainer.remove();
  }, 5000);
}

// Monitor URL changes
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    // Reset security state
    securityState = {
      riskScore: null,
      analysis: null,
      timestamp: null
    };
    root.render(<SecurityBadge riskScore={null} />);
  }
}).observe(document, { subtree: true, childList: true });

// Add hover listeners for links
document.addEventListener('mouseover', (event) => {
  const target = event.target;
  if (target.tagName === 'A' && target.href) {
    // Request URL scan
    chrome.runtime.sendMessage({
      type: 'SCAN_URL',
      url: target.href
    });
  }
});

// Add click listeners for forms
document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.action) {
    // Request URL scan before form submission
    chrome.runtime.sendMessage({
      type: 'SCAN_URL',
      url: form.action
    }, (response) => {
      if (response && response.riskScore > 70) {
        // Show warning and prevent submission if risk is high
        event.preventDefault();
        showSecurityTooltip(response);
      }
    });
  }
}); 