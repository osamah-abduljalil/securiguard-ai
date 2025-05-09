document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const currentRiskElement = document.getElementById('current-risk');
  const threatsBlockedElement = document.getElementById('threats-blocked');
  const lastScanElement = document.getElementById('last-scan');
  const scanNowButton = document.getElementById('scan-now');

  // Load stats from storage
  chrome.storage.local.get(['threatsBlocked', 'lastScan'], (result) => {
    if (result.threatsBlocked) {
      threatsBlockedElement.textContent = result.threatsBlocked;
    }
    if (result.lastScan) {
      lastScanElement.textContent = new Date(result.lastScan).toLocaleString();
    }
  });

  // Get current tab's security status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    chrome.tabs.sendMessage(currentTab.id, { type: 'GET_SECURITY_STATUS' }, (response) => {
      if (response && response.riskScore !== null) {
        updateRiskDisplay(response.riskScore);
      }
    });
  });

  // Handle scan now button click
  scanNowButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      chrome.tabs.sendMessage(currentTab.id, { type: 'SCAN_URL', url: currentTab.url });
    });
  });

  // Update risk display
  function updateRiskDisplay(riskScore) {
    let riskText;
    let riskColor;

    if (riskScore <= 30) {
      riskText = 'Safe';
      riskColor = '#4CAF50';
    } else if (riskScore <= 70) {
      riskText = 'Caution';
      riskColor = '#FFC107';
    } else {
      riskText = 'Danger';
      riskColor = '#F44336';
    }

    currentRiskElement.textContent = `${riskText} (${riskScore}/100)`;
    currentRiskElement.style.color = riskColor;
  }

  // Listen for security status updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SECURITY_STATUS_UPDATE') {
      updateRiskDisplay(message.data.riskScore);
      
      // Update last scan time
      lastScanElement.textContent = new Date().toLocaleString();
      chrome.storage.local.set({ lastScan: new Date().toISOString() });

      // Update threats blocked if a threat was detected
      if (message.data.riskScore > 70) {
        chrome.storage.local.get(['threatsBlocked'], (result) => {
          const newCount = (result.threatsBlocked || 0) + 1;
          threatsBlockedElement.textContent = newCount;
          chrome.storage.local.set({ threatsBlocked: newCount });
        });
      }
    }
  });
});
