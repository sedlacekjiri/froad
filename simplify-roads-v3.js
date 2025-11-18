#!/usr/bin/env node

const fs = require('fs');

// Douglas-Peucker simplification algorithm
function simplifyDouglasPeucker(points, tolerance) {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyDouglasPeucker(points.slice(0, maxIndex + 1), tolerance);
    const right = simplifyDouglasPeucker(points.slice(maxIndex), tolerance);
    return left.slice(0, -1).concat(right);
  } else {
    return [first, last];
  }
}

function perpendicularDistance(point, lineStart, lineEnd) {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

// Read the HTML file
const filePath = process.argv[2] || 'explore.html';
const tolerance = parseFloat(process.argv[3]) || 0.00006;

console.log(`Reading ${filePath}...`);
console.log(`Using tolerance: ${tolerance}°`);

let content = fs.readFileSync(filePath, 'utf8');

// Find the froadData array start
const froadDataStart = content.indexOf('const froadData = [');
if (froadDataStart === -1) {
  console.error('Could not find froadData array!');
  process.exit(1);
}

// Find matching closing bracket for the array
let bracketCount = 0;
let froadDataEnd = -1;
let inArray = false;

for (let i = froadDataStart; i < content.length; i++) {
  const char = content[i];

  if (char === '[') {
    bracketCount++;
    inArray = true;
  } else if (char === ']') {
    bracketCount--;
    if (inArray && bracketCount === 0) {
      froadDataEnd = i + 1;
      break;
    }
  }
}

if (froadDataEnd === -1) {
  console.error('Could not find end of froadData array!');
  process.exit(1);
}

// Extract the array section
const beforeData = content.substring(0, froadDataStart);
const afterData = content.substring(froadDataEnd);
let dataSection = content.substring(froadDataStart, froadDataEnd);

console.log('\nProcessing roads...');

let totalOriginalPoints = 0;
let totalSimplifiedPoints = 0;
let roadsProcessed = 0;

// Process each coords array
let position = 0;
let result = '';

while (position < dataSection.length) {
  const coordsMatch = dataSection.substring(position).match(/coords:\[\[/);

  if (!coordsMatch) {
    // No more coords found
    result += dataSection.substring(position);
    break;
  }

  // Add everything before and including "coords:[["
  const matchStart = position + coordsMatch.index;
  result += dataSection.substring(position, matchStart + 'coords:'.length);

  // Find the end of this coords array (count brackets after "coords:")
  let coordsBrackets = 2; // We have [[
  let coordsEnd = matchStart + coordsMatch[0].length;

  while (coordsEnd < dataSection.length && coordsBrackets > 0) {
    if (dataSection[coordsEnd] === '[') coordsBrackets++;
    else if (dataSection[coordsEnd] === ']') coordsBrackets--;
    coordsEnd++;
  }

  // Extract the coordinates string (between [[ and ]])
  const coordsStart = matchStart + coordsMatch[0].length;
  const coordsStr = dataSection.substring(coordsStart, coordsEnd - 2); // -2 for the ]]

  // Parse coordinates
  const coords = [];
  const pairRegex = /\[(-?\d+\.?\d*),(-?\d+\.?\d*)\]/g;
  let match;

  while ((match = pairRegex.exec(coordsStr)) !== null) {
    coords.push([parseFloat(match[1]), parseFloat(match[2])]);
  }

  if (coords.length > 0) {
    totalOriginalPoints += coords.length;

    // Simplify
    const simplified = simplifyDouglasPeucker(coords, tolerance);
    totalSimplifiedPoints += simplified.length;
    roadsProcessed++;

    // Format back with [[ and ]]
    const simplifiedStr = simplified.map(([lat, lng]) => `[${lat},${lng}]`).join(',');
    result += '[[' + simplifiedStr + ']]';

    if (roadsProcessed % 10 === 0) {
      process.stdout.write(`\rProcessed ${roadsProcessed} roads...`);
    }
  } else {
    // Empty or invalid coords, keep as is
    result += '[[' + coordsStr + ']]';
  }

  position = coordsEnd;
}

console.log(`\rProcessed ${roadsProcessed} roads...   `);

// Reconstruct file
const newContent = beforeData + result + afterData;

// Create backup
const backupPath = filePath + '.backup';
fs.writeFileSync(backupPath, content);
fs.writeFileSync(filePath, newContent);

const originalSize = content.length;
const newSize = newContent.length;

console.log('\n✅ Simplification complete!');
console.log(`\nRoads processed: ${roadsProcessed}`);
console.log(`Original points: ${totalOriginalPoints}`);
console.log(`Simplified points: ${totalSimplifiedPoints}`);
console.log(`Points removed: ${totalOriginalPoints - totalSimplifiedPoints} (${((1 - totalSimplifiedPoints/totalOriginalPoints) * 100).toFixed(1)}%)`);
console.log(`\nOriginal file size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`New file size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Size reduction: ${((originalSize - newSize) / 1024 / 1024).toFixed(2)} MB (${((1 - newSize/originalSize) * 100).toFixed(1)}%)`);
console.log(`\nBackup saved to: ${backupPath}`);
