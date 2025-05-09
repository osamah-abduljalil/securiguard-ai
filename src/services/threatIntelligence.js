import axios from 'axios';
import { getDomainAge, checkSSL } from '../utils/urlFeatures';

// API keys would be stored in environment variables
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const GOOGLE_SAFE_BROWSING_API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
const PHISHTANK_API_KEY = process.env.PHISHTANK_API_KEY;

export async function checkThreatIntelligence(url) {
  try {
    // Run all checks in parallel
    const [
      virusTotalData,
      safeBrowsingData,
      phishTankData,
      domainAge,
      sslStatus
    ] = await Promise.all([
      checkVirusTotal(url),
      checkGoogleSafeBrowsing(url),
      checkPhishTank(url),
      getDomainAge(new URL(url).hostname),
      checkSSL(url)
    ]);

    // Combine and analyze results
    const threatData = {
      virusTotal: virusTotalData,
      safeBrowsing: safeBrowsingData,
      phishTank: phishTankData,
      domainAge,
      sslValid: sslStatus,
      timestamp: new Date().toISOString()
    };

    // Calculate overall risk score
    threatData.riskScore = calculateThreatScore(threatData);

    return threatData;
  } catch (error) {
    console.error('Error checking threat intelligence:', error);
    throw new Error('Failed to check threat intelligence');
  }
}

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

async function checkPhishTank(url) {
  try {
    const response = await axios.get(`https://checkurl.phishtank.com/checkurl/`, {
      params: {
        url: url,
        format: 'json',
        app_key: PHISHTANK_API_KEY
      }
    });

    return {
      inDatabase: response.data.in_database,
      verified: response.data.verified,
      verifiedAt: response.data.verified_at
    };
  } catch (error) {
    console.error('PhishTank API error:', error);
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
  
  // Google Safe Browsing score (30% weight)
  if (threatData.safeBrowsing && threatData.safeBrowsing.matches) {
    score += 100 * 0.3;
  }
  
  // PhishTank score (20% weight)
  if (threatData.phishTank && threatData.phishTank.inDatabase) {
    score += 100 * 0.2;
  }
  
  // Domain age and SSL score (10% weight)
  const domainScore = calculateDomainScore(threatData.domainAge, threatData.sslValid);
  score += domainScore * 0.1;
  
  return Math.min(Math.max(score, 0), 100);
}

function calculateDomainScore(domainAge, sslValid) {
  let score = 0;
  
  // Domain age score (0-50 points)
  if (domainAge > 365) score += 50;
  else if (domainAge > 180) score += 30;
  else if (domainAge > 90) score += 20;
  else if (domainAge > 30) score += 10;
  
  // SSL score (0-50 points)
  if (sslValid) score += 50;
  
  return score;
} 