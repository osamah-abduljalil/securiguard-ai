const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../dist/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Function to generate icon
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4CAF50');
  gradient.addColorStop(1, '#2196F3');

  // Draw rounded rectangle
  const padding = size * 0.1;
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.moveTo(padding + radius, padding);
  ctx.lineTo(size - padding - radius, padding);
  ctx.arcTo(size - padding, padding, size - padding, padding + radius, radius);
  ctx.lineTo(size - padding, size - padding - radius);
  ctx.arcTo(size - padding, size - padding, size - padding - radius, size - padding, radius);
  ctx.lineTo(padding + radius, size - padding);
  ctx.arcTo(padding, size - padding, padding, size - padding - radius, radius);
  ctx.lineTo(padding, padding + radius);
  ctx.arcTo(padding, padding, padding + radius, padding, radius);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw shield symbol
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';

  // Draw cross
  const center = size / 2;
  const lineLength = size * 0.375;
  ctx.beginPath();
  ctx.moveTo(center - lineLength, center);
  ctx.lineTo(center + lineLength, center);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(center, center - lineLength);
  ctx.lineTo(center, center + lineLength);
  ctx.stroke();

  // Draw circle
  ctx.lineWidth = size * 0.03;
  ctx.beginPath();
  ctx.arc(center, center, size * 0.3, 0, Math.PI * 2);
  ctx.stroke();

  return canvas;
}

// Generate icons in different sizes
[16, 48, 128].forEach(size => {
  const canvas = generateIcon(size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);
  console.log(`Generated icon${size}.png`);
}); 