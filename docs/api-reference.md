# SecuriGuard AI API Reference

This document provides detailed information about the APIs and interfaces available in SecuriGuard AI.

## Background Script API

### Message Handling

```javascript
// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle message
  sendResponse({ success: true });
});
```

### Storage API

```javascript
// Store data
chrome.storage.local.set({ key: value }, () => {
  console.log('Data saved');
});

// Retrieve data
chrome.storage.local.get(['key'], (result) => {
  console.log('Data retrieved:', result.key);
});
```

### Tab Management

```javascript
// Query tabs
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  // Handle tabs
});

// Send message to tab
chrome.tabs.sendMessage(tabId, message, (response) => {
  // Handle response
});
```

## Content Script API

### Security Badge

```javascript
// Create security badge
function createSecurityBadge(riskScore) {
  // Implementation
}

// Update badge status
function updateBadgeStatus(status) {
  // Implementation
}

// Remove badge
function removeBadge() {
  // Implementation
}
```

### URL Analysis

```javascript
// Analyze URL
async function analyzeUrl(url) {
  // Implementation
}

// Calculate risk score
function calculateRiskScore(factors) {
  // Implementation
}

// Check URL safety
async function checkUrlSafety(url) {
  // Implementation
}
```

### Email Analysis

```javascript
// Analyze email
async function analyzeEmail(email) {
  // Implementation
}

// Check sender
async function checkSender(sender) {
  // Implementation
}

// Verify content
async function verifyContent(content) {
  // Implementation
}
```

## Message Passing

### Popup to Background

```javascript
// Send message to background
chrome.runtime.sendMessage({
  type: 'ACTION_TYPE',
  data: payload
}, (response) => {
  // Handle response
});
```

### Content to Background

```javascript
// Send message from content script
chrome.runtime.sendMessage({
  type: 'CONTENT_ACTION',
  data: payload
}, (response) => {
  // Handle response
});
```

### Background to Content

```javascript
// Send message to content script
chrome.tabs.sendMessage(tabId, {
  type: 'BACKGROUND_ACTION',
  data: payload
}, (response) => {
  // Handle response
});
```

## Storage API

### Data Structure

```javascript
// Security data
{
  isScanningEnabled: boolean,
  currentRiskScore: number,
  scannedUrls: Array<{
    url: string,
    riskScore: number,
    timestamp: number
  }>,
  scannedEmails: Array<{
    subject: string,
    sender: string,
    riskScore: number,
    timestamp: number
  }>
}
```

### Storage Methods

```javascript
// Save security data
function saveSecurityData(data) {
  // Implementation
}

// Load security data
function loadSecurityData() {
  // Implementation
}

// Clear security data
function clearSecurityData() {
  // Implementation
}
```

## Security API

### Risk Assessment

```javascript
// Calculate URL risk
function calculateUrlRisk(url) {
  // Implementation
}

// Calculate email risk
function calculateEmailRisk(email) {
  // Implementation
}

// Get risk level
function getRiskLevel(score) {
  // Implementation
}
```

### Threat Detection

```javascript
// Check for malware
async function checkMalware(url) {
  // Implementation
}

// Check for phishing
async function checkPhishing(url) {
  // Implementation
}

// Check for suspicious content
async function checkSuspiciousContent(content) {
  // Implementation
}
```

## UI Components API

### Security Badge

```javascript
// Badge properties
{
  riskScore: number,
  status: string,
  position: string,
  visible: boolean
}

// Badge methods
function updateBadge(properties) {
  // Implementation
}

function showBadge() {
  // Implementation
}

function hideBadge() {
  // Implementation
}
```

### Popup Interface

```javascript
// Popup state
{
  isScanningEnabled: boolean,
  currentRiskScore: number,
  recentScans: Array,
  settings: Object
}

// Popup methods
function updatePopupState(state) {
  // Implementation
}

function showNotification(message) {
  // Implementation
}

function updateSettings(settings) {
  // Implementation
}
```

## Event Handlers

### URL Events

```javascript
// URL change handler
function handleUrlChange(url) {
  // Implementation
}

// URL scan complete handler
function handleUrlScanComplete(result) {
  // Implementation
}

// URL risk update handler
function handleUrlRiskUpdate(risk) {
  // Implementation
}
```

### Email Events

```javascript
// Email scan handler
function handleEmailScan(email) {
  // Implementation
}

// Email risk update handler
function handleEmailRiskUpdate(risk) {
  // Implementation
}

// Email scan complete handler
function handleEmailScanComplete(result) {
  // Implementation
}
```

## Utility Functions

### URL Processing

```javascript
// Parse URL
function parseUrl(url) {
  // Implementation
}

// Validate URL
function validateUrl(url) {
  // Implementation
}

// Normalize URL
function normalizeUrl(url) {
  // Implementation
}
```

### Security Utilities

```javascript
// Generate risk report
function generateRiskReport(data) {
  // Implementation
}

// Format security data
function formatSecurityData(data) {
  // Implementation
}

// Validate security data
function validateSecurityData(data) {
  // Implementation
}
```

## Error Handling

### Error Types

```javascript
// Error types
const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SCAN_ERROR: 'SCAN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR'
};
```

### Error Handlers

```javascript
// Handle network error
function handleNetworkError(error) {
  // Implementation
}

// Handle scan error
function handleScanError(error) {
  // Implementation
}

// Handle validation error
function handleValidationError(error) {
  // Implementation
}
```

## Constants

### Risk Levels

```javascript
// Risk level constants
const RiskLevels = {
  SAFE: 'SAFE',
  CAUTION: 'CAUTION',
  DANGER: 'DANGER'
};

// Risk score thresholds
const RiskThresholds = {
  SAFE: 30,
  CAUTION: 70,
  DANGER: 100
};
```

### Configuration

```javascript
// Default configuration
const DefaultConfig = {
  scanningEnabled: true,
  notificationEnabled: true,
  riskThreshold: 70,
  scanInterval: 5000
};
``` 