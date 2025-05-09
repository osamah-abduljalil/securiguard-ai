import React from 'react';

const SecurityTooltip = ({ data }) => {
  const { riskScore, analysis, threatData } = data;

  const getRiskLevel = () => {
    if (riskScore <= 30) return 'Low Risk';
    if (riskScore <= 70) return 'Medium Risk';
    return 'High Risk';
  };

  const getRiskColor = () => {
    if (riskScore <= 30) return '#4CAF50';
    if (riskScore <= 70) return '#FFC107';
    return '#F44336';
  };

  const renderThreatFactors = () => {
    if (!threatData) return null;

    const factors = [];

    if (threatData.virusTotal?.positives > 0) {
      factors.push({
        icon: '🦠',
        text: `Detected by ${threatData.virusTotal.positives} security vendors`
      });
    }

    if (threatData.safeBrowsing?.matches) {
      factors.push({
        icon: '🌐',
        text: 'Flagged by Google Safe Browsing'
      });
    }

    if (threatData.phishTank?.inDatabase) {
      factors.push({
        icon: '🎣',
        text: 'Known phishing site'
      });
    }

    if (!threatData.sslValid) {
      factors.push({
        icon: '🔒',
        text: 'Not using HTTPS'
      });
    }

    return factors;
  };

  return (
    <div className="security-tooltip">
      <div className="security-tooltip-header">
        <h3 className="security-tooltip-title" style={{ color: getRiskColor() }}>
          {getRiskLevel()}
        </h3>
      </div>

      <div className="security-tooltip-content">
        <p>Risk Score: {riskScore}/100</p>
        
        {analysis && (
          <div className="security-tooltip-analysis">
            <p>{analysis}</p>
          </div>
        )}

        {renderThreatFactors() && (
          <div className="security-tooltip-risk-factors">
            {renderThreatFactors().map((factor, index) => (
              <div key={index} className="security-tooltip-risk-factor">
                <span className="security-tooltip-risk-factor-icon">{factor.icon}</span>
                <span>{factor.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="security-tooltip-actions">
        <button
          className="security-tooltip-button secondary"
          onClick={() => window.close()}
        >
          Close
        </button>
        <button
          className="security-tooltip-button primary"
          onClick={() => {
            // Implement "Learn More" action
            window.open('https://securiguard.ai/learn-more', '_blank');
          }}
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default SecurityTooltip; 