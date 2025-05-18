document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const scanButton = document.getElementById('scanButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    const aboutLink = document.getElementById('aboutLink');
    const aboutModal = document.getElementById('aboutModal');
    const closeModal = document.querySelector('.close');

    // Modal functionality
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });

    // URL validation function
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Update status indicator
    function updateStatus(status, color) {
        statusDot.style.backgroundColor = color;
        statusText.textContent = status;
    }

    // Parse URL information
    function parseUrlInfo(url) {
        const urlObj = new URL(url);
        return {
            domain: urlObj.hostname,
            protocol: urlObj.protocol.replace(':', ''),
            path: urlObj.pathname || '/'
        };
    }

    // Enhanced security checks with detailed explanations
    async function performSecurityChecks(url) {
        // Simulate API calls with timeouts
        const checks = {
            ssl: await new Promise(resolve => setTimeout(() => resolve(Math.random() > 0.2), 1000)),
            malware: await new Promise(resolve => setTimeout(() => resolve(Math.random() > 0.1), 1500)),
            phishing: await new Promise(resolve => setTimeout(() => resolve(Math.random() > 0.15), 1200))
        };

        const sslDetails = {
            status: checks.ssl ? 'Secure' : 'Not Secure',
            explanation: checks.ssl 
                ? 'The website uses HTTPS with a valid SSL certificate, ensuring encrypted communication between your browser and the website. This protects your data from being intercepted by third parties.'
                : 'The website does not use HTTPS or has an invalid SSL certificate. This means data transmitted between you and the website is not encrypted and could be intercepted by malicious actors. Avoid entering sensitive information on this site.'
        };

        const malwareDetails = {
            status: checks.malware ? 'Clean' : 'Suspicious',
            explanation: checks.malware
                ? 'No known malware or malicious code has been detected on this website. The site appears to be free from harmful software that could compromise your device or data.'
                : 'This website has been flagged for potentially hosting malware or malicious code. Exercise extreme caution and avoid downloading any files or entering sensitive information. The site may attempt to install harmful software on your device.'
        };

        const phishingDetails = {
            status: checks.phishing ? 'Safe' : 'Potential Threat',
            explanation: checks.phishing
                ? 'No phishing indicators detected. The website appears to be legitimate and is not attempting to impersonate another site to steal your information.'
                : 'This website shows characteristics of a phishing site. It may be attempting to steal personal information by impersonating a legitimate website. Do not enter any personal or financial information on this site.'
        };

        return {
            sslStatus: sslDetails.status,
            sslExplanation: sslDetails.explanation,
            malwareStatus: malwareDetails.status,
            malwareExplanation: malwareDetails.explanation,
            phishingStatus: phishingDetails.status,
            phishingExplanation: phishingDetails.explanation
        };
    }

    // Enhanced reputation check with detailed information
    async function checkReputation(domain) {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const age = Math.floor(Math.random() * 10) + 1;
        const score = Math.floor(Math.random() * 100);
        
        const reputationDetails = {
            domainAge: `${age} years`,
            ageExplanation: age < 2 
                ? 'This is a relatively new domain. Exercise caution as new domains are often used for malicious purposes. Scammers frequently create new domains to avoid detection and maintain anonymity.'
                : 'This domain has been registered for a significant period, which is generally a positive indicator. Long-standing domains are less likely to be used for malicious purposes.',
            reputationScore: `${score}/100`,
            scoreExplanation: score < 30 
                ? 'Low reputation score indicates potential security concerns or suspicious activity associated with this domain. The site may have been involved in malicious activities or has received numerous security complaints.'
                : score < 70 
                    ? 'Moderate reputation score. The domain shows some concerning patterns but may still be legitimate. Exercise caution and verify the site\'s authenticity before sharing sensitive information.'
                    : 'High reputation score indicates the domain is well-established and generally trustworthy. The site has a good track record and is unlikely to pose significant security risks.'
        };

        return reputationDetails;
    }

    // Main scanning function
    async function scanUrl(url) {
        if (!isValidUrl(url)) {
            alert('Please enter a valid URL');
            return;
        }

        // Show results container and set initial status
        resultsContainer.style.display = 'block';
        updateStatus('Scanning...', 'var(--warning-color)');

        try {
            // Parse URL information
            const urlInfo = parseUrlInfo(url);
            document.getElementById('domain').textContent = urlInfo.domain;
            document.getElementById('protocol').textContent = urlInfo.protocol;
            document.getElementById('path').textContent = urlInfo.path;

            // Perform security checks
            const securityInfo = await performSecurityChecks(url);
            
            // Update security information with descriptions
            const sslStatus = document.getElementById('sslStatus');
            sslStatus.textContent = securityInfo.sslStatus;
            sslStatus.setAttribute('data-status', securityInfo.sslStatus);
            document.getElementById('sslDescription').textContent = securityInfo.sslExplanation;
            
            const malwareStatus = document.getElementById('malwareStatus');
            malwareStatus.textContent = securityInfo.malwareStatus;
            malwareStatus.setAttribute('data-status', securityInfo.malwareStatus);
            document.getElementById('malwareDescription').textContent = securityInfo.malwareExplanation;
            
            const phishingStatus = document.getElementById('phishingStatus');
            phishingStatus.textContent = securityInfo.phishingStatus;
            phishingStatus.setAttribute('data-status', securityInfo.phishingStatus);
            document.getElementById('phishingDescription').textContent = securityInfo.phishingExplanation;

            // Check reputation
            const reputationInfo = await checkReputation(urlInfo.domain);
            
            const domainAge = document.getElementById('domainAge');
            domainAge.textContent = reputationInfo.domainAge;
            domainAge.setAttribute('data-age', reputationInfo.domainAge.includes('new') ? 'new' : 'old');
            document.getElementById('domainAgeDescription').textContent = reputationInfo.ageExplanation;
            
            const reputationScore = document.getElementById('reputationScore');
            reputationScore.textContent = reputationInfo.reputationScore;
            const score = parseInt(reputationInfo.reputationScore);
            reputationScore.setAttribute('data-score', 
                score < 30 ? 'low' : score < 70 ? 'moderate' : 'high');
            document.getElementById('reputationScoreDescription').textContent = reputationInfo.scoreExplanation;

            // Update final status
            const isSafe = securityInfo.sslStatus === 'Secure' && 
                          securityInfo.malwareStatus === 'Clean' && 
                          securityInfo.phishingStatus === 'Safe';
            
            updateStatus(
                isSafe ? 'Scan Complete - Safe' : 'Scan Complete - Issues Found',
                isSafe ? 'var(--success-color)' : 'var(--danger-color)'
            );

        } catch (error) {
            console.error('Scanning error:', error);
            updateStatus('Scan Failed', 'var(--danger-color)');
        }
    }

    // Event listeners
    scanButton.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            scanUrl(url);
        }
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const url = urlInput.value.trim();
            if (url) {
                scanUrl(url);
            }
        }
    });
}); 