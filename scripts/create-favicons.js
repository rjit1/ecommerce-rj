// Simple script to create placeholder favicon files
const fs = require('fs');
const path = require('path');

// Create a simple SVG favicon
const svgFavicon = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#87CEEB"/>
  <text x="16" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">RJ</text>
</svg>`;

// Write SVG favicon
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svgFavicon);

console.log('Created favicon.svg');
console.log('Note: For production, you should create proper PNG favicon files using an online favicon generator.');