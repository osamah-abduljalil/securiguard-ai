document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const statusElement = document.getElementById('status');
  const statusText = statusElement.querySelector('.status-text');
  const statusIcon = statusElement.querySelector('.status-icon');
  const threatsBlockedElement = document.getElementById('threats-blocked');
  const lastScanElement = document.getElementById('last-scan');
  const urlTableBody = document.getElementById('url-table-body');
  const emailTableBody = document.getElementById('email-table-body');
  const scanNowButton = document.getElementById('scan-now');
  const viewReportButton = document.getElementById('view-report');
  const scanningToggle = document.getElementById('scanning-toggle');
  const scanningStatus = document.getElementById('scanning-status');

  // Load initial state
  chrome.storage.local.get([
    'threatsBlocked',
    'lastScan',
    'scannedUrls',
    'scannedEmails',
    'currentRiskScore',
    'isScanningEnabled'
  ], (result) => {
    // Update scanning toggle state
    if (result.isScanningEnabled !== undefined) {
      scanningToggle.checked = result.isScanningEnabled;
      updateScanningStatus(result.isScanningEnabled);
    }

    // Update stats
    if (result.threatsBlocked) {
      threatsBlockedElement.textContent = result.threatsBlocked;
    }

    if (result.lastScan) {
      lastScanElement.textContent = new Date(result.lastScan).toLocaleString();
    }

    // Update risk display
    if (result.currentRiskScore !== undefined) {
      updateRiskDisplay(result.currentRiskScore);
    }

    // Update URL table
    if (result.scannedUrls) {
      updateUrlTable(result.scannedUrls);
    }

    // Update email table
    if (result.scannedEmails) {
      updateEmailTable(result.scannedEmails);
    }
  });

  // Handle scanning toggle
  scanningToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.local.set({ isScanningEnabled: isEnabled }, () => {
      updateScanningStatus(isEnabled);
      // Notify content script about the change
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'TOGGLE_SCANNING',
            isEnabled
          });
        }
      });
    });
  });

  function updateScanningStatus(isEnabled) {
    scanningStatus.textContent = isEnabled ? 'Scanning is enabled' : 'Scanning is disabled';
    scanningStatus.style.color = isEnabled ? '#4CAF50' : '#F44336';
    scanNowButton.disabled = !isEnabled;
    scanNowButton.style.opacity = isEnabled ? '1' : '0.5';
  }

  // Update risk display
  function updateRiskDisplay(riskScore) {
    let statusClass;
    let statusText;
    let statusIcon;

    if (riskScore <= 30) {
      statusClass = 'safe';
      statusText = 'Safe';
      statusIcon = '<i class="fas fa-check-circle"></i>';
    } else if (riskScore <= 70) {
      statusClass = 'caution';
      statusText = 'Caution';
      statusIcon = '<i class="fas fa-exclamation-triangle"></i>';
    } else {
      statusClass = 'danger';
      statusText = 'Danger';
      statusIcon = '<i class="fas fa-exclamation-circle"></i>';
    }

    statusElement.className = `status ${statusClass}`;
    statusElement.querySelector('.status-text').textContent = `${statusText} (${riskScore}/100)`;
    statusElement.querySelector('.status-icon').innerHTML = statusIcon;
  }

  // Update URL table
  function updateUrlTable(scannedUrls) {
    if (!urlTableBody) return;

    // Clear existing content
    urlTableBody.innerHTML = '';

    if (!scannedUrls || Object.keys(scannedUrls).length === 0) {
      urlTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: #666;">No URLs scanned yet</td>
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

  // Update email table
  function updateEmailTable(scannedEmails) {
    if (!emailTableBody) return;

    // Clear existing content
    emailTableBody.innerHTML = '';

    if (!scannedEmails || Object.keys(scannedEmails).length === 0) {
      emailTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #666;">No emails scanned yet</td>
        </tr>
      `;
      return;
    }

    // Add each email to the table
    Object.entries(scannedEmails).forEach(([subject, data]) => {
      const row = document.createElement('tr');
      
      // Create subject cell
      const subjectCell = document.createElement('td');
      subjectCell.className = 'email-cell';
      subjectCell.title = subject; // Show full subject on hover
      subjectCell.textContent = subject;
      
      // Create sender cell
      const senderCell = document.createElement('td');
      senderCell.className = 'email-cell';
      senderCell.title = data.sender;
      senderCell.textContent = data.sender;
      
      // Create risk score cell
      const scoreCell = document.createElement('td');
      scoreCell.textContent = `${data.analysis.riskScore}/100`;
      
      // Create status cell
      const statusCell = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = 'status-badge';
      
      if (data.analysis.riskScore > 70) {
        statusBadge.className += ' status-high';
        statusBadge.textContent = 'High Risk';
      } else if (data.analysis.riskScore > 30) {
        statusBadge.className += ' status-medium';
        statusBadge.textContent = 'Caution';
      } else {
        statusBadge.className += ' status-low';
        statusBadge.textContent = 'Safe';
      }
      
      statusCell.appendChild(statusBadge);
      
      // Add cells to row
      row.appendChild(subjectCell);
      row.appendChild(senderCell);
      row.appendChild(scoreCell);
      row.appendChild(statusCell);
      
      // Add row to table
      emailTableBody.appendChild(row);
    });
  }

  // Handle scan now button click
  scanNowButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SCAN_CURRENT_PAGE' });
      }
    });
  });

  // Handle view report button click
  viewReportButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'SHOW_SECURITY_REPORT' });
  });

  // Listen for security status updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SECURITY_STATUS_UPDATE') {
      const { riskScore, threatsBlocked, lastScan, scannedUrls, scannedEmails } = message.data;
      
      if (riskScore !== undefined) {
        updateRiskDisplay(riskScore);
      }
      
      if (threatsBlocked !== undefined) {
        threatsBlockedElement.textContent = threatsBlocked;
      }
      
      if (lastScan) {
        lastScanElement.textContent = new Date(lastScan).toLocaleString();
      }
      
      if (scannedUrls) {
        updateUrlTable(scannedUrls);
      }

      if (scannedEmails) {
        updateEmailTable(scannedEmails);
      }
    }
  });
});
