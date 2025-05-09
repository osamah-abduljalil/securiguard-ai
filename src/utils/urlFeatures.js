export function extractFeatures(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    return {
      domain,
      tld: extractTLD(domain),
      pathLength: urlObj.pathname.split('/').filter(Boolean).length,
      hasQueryParams: urlObj.search.length > 0,
      hasSpecialChars: hasSpecialCharacters(url),
      isIpAddress: isIPAddress(domain),
      hasSubdomain: domain.split('.').length > 2,
      protocol: urlObj.protocol,
      port: urlObj.port,
      path: urlObj.pathname,
      query: urlObj.search,
      hash: urlObj.hash
    };
  } catch (error) {
    console.error('Error extracting URL features:', error);
    throw new Error('Invalid URL format');
  }
}

function extractTLD(domain) {
  const parts = domain.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function hasSpecialCharacters(url) {
  // Check for common special characters used in phishing
  const specialChars = /[<>{}[\]\\^~`@#$%&*()_+=|'";:,?]/;
  return specialChars.test(url);
}

function isIPAddress(domain) {
  // Check if domain is an IP address
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(domain) || ipv6Regex.test(domain);
}

export function isSuspiciousTLD(tld) {
  const suspiciousTLDs = [
    'xyz', 'top', 'loan', 'work', 'click', 'download',
    'win', 'bid', 'stream', 'review', 'account'
  ];
  
  return suspiciousTLDs.includes(tld.toLowerCase());
}

export function isKnownPhishingDomain(domain) {
  // This would typically check against a database of known phishing domains
  // For now, we'll use a simple check for common phishing patterns
  const phishingPatterns = [
    /paypal.*security/i,
    /bank.*login/i,
    /amazon.*verify/i,
    /google.*signin/i,
    /microsoft.*account/i
  ];
  
  return phishingPatterns.some(pattern => pattern.test(domain));
}

export function getDomainAge(domain) {
  // This would typically make an API call to get domain age
  // For now, return a mock value
  return Math.floor(Math.random() * 3650); // Random age between 0-10 years
}

export function checkSSL(url) {
  return url.startsWith('https://');
}

export function analyzeUrlStructure(url) {
  const features = extractFeatures(url);
  let riskFactors = [];
  
  if (features.isIpAddress) {
    riskFactors.push('Uses IP address instead of domain name');
  }
  
  if (features.hasSpecialChars) {
    riskFactors.push('Contains suspicious special characters');
  }
  
  if (isSuspiciousTLD(features.tld)) {
    riskFactors.push('Uses suspicious TLD');
  }
  
  if (isKnownPhishingDomain(features.domain)) {
    riskFactors.push('Matches known phishing patterns');
  }
  
  if (!checkSSL(url)) {
    riskFactors.push('Not using HTTPS');
  }
  
  return {
    riskFactors,
    riskLevel: calculateRiskLevel(riskFactors)
  };
}

function calculateRiskLevel(riskFactors) {
  if (riskFactors.length >= 3) return 'HIGH';
  if (riskFactors.length >= 1) return 'MEDIUM';
  return 'LOW';
} 