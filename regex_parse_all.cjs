const fs = require('fs');
const content = fs.readFileSync('raw_sliced_overrides.txt', 'utf8');

// Let's print out all paragraphs we can find in the file.
// We can use a regex that matches "text":"..." and "highlight":"..."
const textRegex = /"text"\s*:\s*"([^"]+)"/g;
let match;
console.log('--- FOUND PARAGRAPHS ---');
while ((match = textRegex.exec(content)) !== null) {
  console.log(`Text: ${match[1]}`);
}

const highlightRegex = /"highlight"\s*:\s*"([^"]+)"/g;
console.log('\n--- FOUND HIGHLIGHTS ---');
while ((match = highlightRegex.exec(content)) !== null) {
  console.log(`Highlight: ${match[1]}`);
}

// Let's print out other key strings
const otherRegex = /"([A-Za-z0-9_]{3,30})"\s*:\s*"([^"]{3,150})"/g;
console.log('\n--- OTHER SIMPLE KEY-VALUES ---');
while ((match = otherRegex.exec(content)) !== null) {
  console.log(`${match[1]}: ${match[2]}`);
}
