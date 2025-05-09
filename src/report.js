document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const currentRiskElement = document.getElementById('current-risk');
  const threatsBlockedElement = document.getElementById('threats-blocked');
  const lastScanElement = document.getElementById('last-scan');
  const urlTableBody = document.getElementById('url-table-body');
  const emailTableBody = document.getElementById('email-table-body');

  // Load data from storage
  chrome.storage.local.get([
    'threatsBlocked',
    'lastScan',
    'scannedUrls',
    'scannedEmails',
    'currentRiskScore'
  ], (result) => {
    // Update summary cards
    if (result.threatsBlocked && threatsBlockedElement) {
      threatsBlockedElement.textContent = result.threatsBlocked;
    }

    if (result.lastScan && lastScanElement) {
      lastScanElement.textContent = new Date(result.lastScan).toLocaleString();
    }

    if (result.currentRiskScore && currentRiskElement) {
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

  // Update risk display
  function updateRiskDisplay(riskScore) {
    if (!currentRiskElement) return;
    
    let riskText;
    let riskClass;

    if (riskScore <= 30) {
      riskText = 'Safe';
      riskClass = 'safe';
    } else if (riskScore <= 70) {
      riskText = 'Caution';
      riskClass = 'caution';
    } else {
      riskText = 'Danger';
      riskClass = 'danger';
    }

    currentRiskElement.textContent = `${riskText} (${riskScore}/100)`;
    currentRiskElement.className = `summary-value ${riskClass}`;
  }

  // Update URL table
  function updateUrlTable(scannedUrls) {
    if (!urlTableBody) return;

    // Clear existing content
    urlTableBody.innerHTML = '';

    if (!scannedUrls || Object.keys(scannedUrls).length === 0) {
      urlTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="no-data">No URLs scanned yet</td>
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

      // Create timestamp cell
      const timestampCell = document.createElement('td');
      timestampCell.textContent = new Date(data.timestamp).toLocaleString();
      
      // Add cells to row
      row.appendChild(urlCell);
      row.appendChild(scoreCell);
      row.appendChild(statusCell);
      row.appendChild(timestampCell);
      
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
          <td colspan="5" class="no-data">No emails scanned yet</td>
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

      // Create timestamp cell
      const timestampCell = document.createElement('td');
      timestampCell.textContent = new Date(data.timestamp).toLocaleString();
      
      // Add cells to row
      row.appendChild(subjectCell);
      row.appendChild(senderCell);
      row.appendChild(scoreCell);
      row.appendChild(statusCell);
      row.appendChild(timestampCell);
      
      // Add row to table
      emailTableBody.appendChild(row);
    });
  }
}); 