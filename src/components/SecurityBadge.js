import React from 'react';

const SecurityBadge = ({ riskScore, error }) => {
  const getBadgeStatus = () => {
    if (error) return 'error';
    if (!riskScore) return 'loading';
    if (riskScore <= 30) return 'safe';
    if (riskScore <= 70) return 'warning';
    return 'danger';
  };

  const getBadgeIcon = () => {
    switch (getBadgeStatus()) {
      case 'safe':
        return '✓';
      case 'warning':
        return '⚠';
      case 'danger':
        return '⚠';
      case 'error':
        return '!';
      default:
        return '⟳';
    }
  };

  const getBadgeText = () => {
    switch (getBadgeStatus()) {
      case 'safe':
        return 'Safe';
      case 'warning':
        return 'Caution';
      case 'danger':
        return 'Danger';
      case 'error':
        return 'Error';
      default:
        return 'Scanning...';
    }
  };

  return (
    <div className={`security-badge ${getBadgeStatus()}`}>
      <span className="security-badge-icon">{getBadgeIcon()}</span>
      <span className="security-badge-text">{getBadgeText()}</span>
    </div>
  );
};

export default SecurityBadge; 