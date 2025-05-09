document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const currentRiskElement = document.getElementById('current-risk');
  const threatsBlockedElement = document.getElementById('threats-blocked');
  const lastScanElement = document.getElementById('last-scan');
  const scanNowButton = document.getElementById('scan-now');
  const urlTableBody = document.getElementById('url-table-body');

  // Initialize elements with default values
  if (currentRiskElement) currentRiskElement.textContent = 'Scanning...';
  if (threatsBlockedElement) threatsBlockedElement.textContent = '0';
  if (lastScanElement) lastScanElement.textContent = 'Never';

  // Load stats from storage
  chrome.storage.local.get(['threatsBlocked', 'lastScan', 'scannedUrls'], (result) => {
    if (result.threatsBlocked && threatsBlockedElement) {
      threatsBlockedElement.textContent = result.threatsBlocked;
    }
    if (result.lastScan && lastScanElement) {
      lastScanElement.textContent = new Date(result.lastScan).toLocaleString();
    }
    if (result.scannedUrls) {
      updateUrlTable(result.scannedUrls);
    }
  });

  // Get current tab's security status
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) return;
    
    const currentTab = tabs[0];
    chrome.tabs.sendMessage(currentTab.id, { type: 'GET_SECURITY_STATUS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Error getting security status:', chrome.runtime.lastError);
        if (currentRiskElement) currentRiskElement.textContent = 'Error';
        return;
      }
      
      if (response && response.riskScore !== null && currentRiskElement) {
        updateRiskDisplay(response.riskScore);
      }
    });
  });

  // Handle scan now button click
  if (scanNowButton) {
    scanNowButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]) return;
        
        const currentTab = tabs[0];
        chrome.tabs.sendMessage(currentTab.id, { type: 'SCAN_URL', url: currentTab.url }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error scanning URL:', chrome.runtime.lastError);
            return;
          }
        });
      });
    });
  }

  // Update risk display
  function updateRiskDisplay(riskScore) {
    if (!currentRiskElement) return;
    
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

  // Update URL table
  function updateUrlTable(scannedUrls) {
    if (!urlTableBody) return;

    // Clear existing content
    urlTableBody.innerHTML = '';

    if (!scannedUrls || Object.keys(scannedUrls).length === 0) {
      urlTableBody.innerHTML = `
        <tr>
          <td colspan="3" class="no-urls">No URLs scanned yet</td>
        </tr>
      `;
      return;
    }

    // Add each URL to the table
    Object.entries(scannedUrls).forEach(([url, data]) => {
      const row = document.createElement('tr');
      
      // Create URL cell
      const urlCell = document.createElement('td');
      urlCell.className = 'url-cell';
      urlCell.title = url; // Show full URL on hover
      urlCell.textContent = url;
      
      // Create risk score cell
      const scoreCell = document.createElement('td');
      scoreCell.textContent = `${data.riskScore}/100`;
      
      // Create status cell
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = 'status-badge';
      
      if (data.riskScore > 70) {
        statusBadge.className += ' status-high';
        statusBadge.textContent = 'High Risk';
      } else if (data.riskScore > 30) {
        statusBadge.className += ' status-medium';
        statusBadge.textContent = 'Caution';
      } else {
        statusBadge.className += ' status-low';
        statusBadge.textContent = 'Safe';
      }
      
      statusCell.appendChild(statusBadge);
      
      // Add cells to row
      row.appendChild(urlCell);
      row.appendChild(scoreCell);
      row.appendChild(statusCell);
      
      // Add row to table
      urlTableBody.appendChild(row);
    });
  }

  // Listen for security status updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SECURITY_STATUS_UPDATE') {
      updateRiskDisplay(message.data.riskScore);
      
      // Update last scan time
      if (lastScanElement) {
        lastScanElement.textContent = new Date().toLocaleString();
      }
      chrome.storage.local.set({ lastScan: new Date().toISOString() });

      // Update threats blocked if a threat was detected
      if (message.data.riskScore > 70 && threatsBlockedElement) {
        chrome.storage.local.get(['threatsBlocked'], (result) => {
          const newCount = (result.threatsBlocked || 0) + 1;
          threatsBlockedElement.textContent = newCount;
          chrome.storage.local.set({ threatsBlocked: newCount });
        });
      }

      // Update URL table
      chrome.storage.local.get(['scannedUrls'], (result) => {
        if (result.scannedUrls) {
          updateUrlTable(result.scannedUrls);
        }
      });
    }
  });
});
