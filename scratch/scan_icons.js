const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') results = results.concat(scanDir(fullPath));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("from 'lucide-react'") || content.includes('from "lucide-react"')) {
        const importLines = content.split('\n').filter(l => l.includes("from 'lucide-react'") || l.includes('from "lucide-react"'));
        const usesSpatialAnimatedIcon = content.includes('SpatialAnimatedIcon');
        results.push({ file: path.relative('.', fullPath), imports: importLines, usesSpatialAnimatedIcon });
      }
    }
  }
  return results;
}

const found = scanDir('./frontend/src');
console.log(`Found ${found.length} files importing from lucide-react:`);
found.forEach(f => {
  console.log(`- ${f.file} (uses SpatialAnimatedIcon: ${f.usesSpatialAnimatedIcon})`);
  f.imports.forEach(i => console.log(`    ${i.trim()}`));
});
