import axios from 'axios';
import { getDomainAge, checkSSL } from '../utils/urlFeatures';

// API keys would be stored in environment variables
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const GOOGLE_SAFE_BROWSING_API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

// Threat Intelligence Service
async function checkThreatIntelligence(url) {
  try {
    // Extract domain from URL
    const domain = new URL(url).hostname;
    
    // Check against known malicious domains
    const isKnownMalicious = await checkKnownMaliciousDomains(domain);
    
    // Check domain age and registration
    const domainInfo = await checkDomainInfo(domain);
    
    // Check for phishing indicators
    const phishingIndicators = await checkPhishingIndicators(url);
    
    return {
      isKnownMalicious,
      domainInfo,
      phishingIndicators,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking threat intelligence:', error);
    throw error;
  }
}

async function checkKnownMaliciousDomains(domain) {
  // This would typically call an external API
  // For now, we'll use a simple mock implementation
  const knownMaliciousDomains = [
    'malicious-site.com',
    'phishing-attempt.net',
    'scam-website.org'
  ];
  
  return {
    isMalicious: knownMaliciousDomains.includes(domain),
    confidence: 0.8,
    source: 'Internal Database'
  };
}

async function checkDomainInfo(domain) {
  // This would typically call a WHOIS API
  // For now, we'll use a simple mock implementation
  return {
    age: Math.floor(Math.random() * 3650), // Random age between 0-10 years
    registrar: 'Example Registrar',
    lastUpdated: new Date(Date.now() - Math.random() * 31536000000).toISOString(), // Random date within last year
    suspicious: Math.random() > 0.8 // 20% chance of being suspicious
  };
}

async function checkPhishingIndicators(url) {
  // Enhanced phishing detection without PhishTank
  const indicators = [];
  const domain = new URL(url).hostname;
  
  // Check for common phishing patterns
  if (url.includes('login') || url.includes('signin')) {
    indicators.push({
      type: 'login_page',
      confidence: 0.7,
      description: 'URL contains login-related keywords'
    });
  }
  
  if (url.includes('secure') || url.includes('verify')) {
    indicators.push({
      type: 'security_keywords',
      confidence: 0.6,
      description: 'URL contains security-related keywords'
    });
  }

  // Check for typosquatting
  const commonBrands = ['google', 'facebook', 'amazon', 'apple', 'microsoft', 'paypal'];
  const domainWithoutTLD = domain.split('.')[0];
  for (const brand of commonBrands) {
    if (isTyposquatting(domainWithoutTLD, brand)) {
      indicators.push({
        type: 'typosquatting',
        confidence: 0.9,
        description: `Domain appears to be typosquatting ${brand}`
      });
    }
  }

  // Check for suspicious TLDs
  const suspiciousTLDs = ['.xyz', '.top', '.loan', '.click', '.work', '.site'];
  if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
    indicators.push({
      type: 'suspicious_tld',
      confidence: 0.5,
      description: 'Domain uses a suspicious TLD'
    });
  }

  // Check for IP address in domain
  if (isIPAddress(domain)) {
    indicators.push({
      type: 'ip_address',
      confidence: 0.8,
      description: 'Domain is an IP address'
    });
  }
  
  return {
    hasPhishingIndicators: indicators.length > 0,
    indicators,
    riskLevel: indicators.length > 1 ? 'high' : indicators.length === 1 ? 'medium' : 'low'
  };
}

// Helper function to detect typosquatting
function isTyposquatting(domain, brand) {
  if (domain === brand) return false;
  
  // Check for common typosquatting patterns
  const patterns = [
    // Missing character
    (str) => brand.split('').some((_, i) => str === brand.slice(0, i) + brand.slice(i + 1)),
    // Extra character
    (str) => brand.split('').some((_, i) => str === brand.slice(0, i) + 'x' + brand.slice(i)),
    // Adjacent character swap
    (str) => brand.split('').some((_, i) => str === brand.slice(0, i) + brand[i + 1] + brand[i] + brand.slice(i + 2)),
    // Common character substitutions
    (str) => str.replace(/[0o]/g, 'o') === brand || str.replace(/[1i]/g, 'i') === brand
  ];
  
  return patterns.some(pattern => pattern(domain));
}

// Helper function to check if string is an IP address
function isIPAddress(str) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(str) || ipv6Regex.test(str);
}

// Export functions
self.checkThreatIntelligence = checkThreatIntelligence;

async function checkVirusTotal(url) {
  try {
    const response = await axios.get(`https://www.virustotal.com/vtapi/v2/url/report`, {
      params: {
        apikey: VIRUSTOTAL_API_KEY,
        resource: url
      }
    });

    return {
      positives: response.data.positives,
      total: response.data.total,
      categories: response.data.categories,
      lastSeen: response.data.last_seen
    };
  } catch (error) {
    console.error('VirusTotal API error:', error);
    return null;
  }
}

async function checkGoogleSafeBrowsing(url) {
  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`,
      {
        client: {
          clientId: "securiguard-ai",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }]
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Google Safe Browsing API error:', error);
    return null;
  }
}

function calculateThreatScore(threatData) {
  let score = 0;
  
  // VirusTotal score (40% weight)
  if (threatData.virusTotal) {
    const vtScore = (threatData.virusTotal.positives / threatData.virusTotal.total) * 100;
    score += vtScore * 0.4;
  }
  
  // Google Safe Browsing score (40% weight)
  if (threatData.safeBrowsing && threatData.safeBrowsing.matches) {
    score += 100 * 0.4;
  }
  
  // Enhanced phishing detection score (20% weight)
  const phishingScore = calculatePhishingScore(threatData.phishingIndicators);
  score += phishingScore * 0.2;
  
  return Math.min(Math.max(score, 0), 100);
}

function calculatePhishingScore(phishingIndicators) {
  if (!phishingIndicators || !phishingIndicators.indicators) return 0;
  
  let score = 0;
  const weights = {
    typosquatting: 100,
    ip_address: 80,
    suspicious_tld: 60,
    login_page: 40,
    security_keywords: 30
  };
  
  phishingIndicators.indicators.forEach(indicator => {
    score += weights[indicator.type] || 20;
  });
  
  return Math.min(score, 100);
} 