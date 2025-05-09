import React, { useState, useEffect, useRef } from 'react';
import './SecurityBadge.css';

const SecurityBadge = ({ riskScore, error }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const badgeRef = useRef(null);

  // Load saved position from storage
  useEffect(() => {
    chrome.storage.local.get(['badgePosition'], (result) => {
      if (result.badgePosition) {
        setPosition(result.badgePosition);
      }
    });
  }, []);

  // Save position to storage when it changes
  useEffect(() => {
    if (!isDragging) {
      chrome.storage.local.set({ badgePosition: position });
    }
  }, [position, isDragging]);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('close-badge')) return;
    
    setIsDragging(true);
    const rect = badgeRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep badge within viewport bounds
    const maxX = window.innerWidth - badgeRef.current.offsetWidth;
    const maxY = window.innerHeight - badgeRef.current.offsetHeight;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!isDragging) {
      // Show popup with security report
      chrome.runtime.sendMessage({ type: 'SHOW_SECURITY_REPORT' });
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  const getBadgeStatus = () => {
    if (error) return 'error';
    if (!riskScore) return 'scanning';
    if (riskScore <= 30) return 'safe';
    if (riskScore <= 70) return 'caution';
    return 'danger';
  };

  const getBadgeIcon = () => {
    if (error) return '⚠️';
    if (!riskScore) return '🔄';
    if (riskScore <= 30) return '✓';
    if (riskScore <= 70) return '⚠️';
    return '⚠️';
  };

  const getBadgeText = () => {
    if (error) return 'Error';
    if (!riskScore) return 'Scanning...';
    if (riskScore <= 30) return 'Safe';
    if (riskScore <= 70) return 'Caution';
    return 'Danger';
  };

  if (!isVisible) return null;

  return (
    <div
      ref={badgeRef}
      className={`security-badge ${getBadgeStatus()} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 10000
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      <button className="close-badge" onClick={handleClose}>×</button>
      <span className="security-badge-icon">{getBadgeIcon()}</span>
      <span className="security-badge-text">{getBadgeText()}</span>
    </div>
  );
};

export default SecurityBadge; 