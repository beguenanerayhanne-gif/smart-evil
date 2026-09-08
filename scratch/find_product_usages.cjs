const fs = require('fs');
const path = require('path');
const baseDir = path.resolve('src');
const exts = ['.ts', '.tsx', '.js', '.jsx'];
const pattern = /product\.(price|stock|reference|images|oldPrice|tags|category)/g;
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (exts.includes(path.extname(entry.name))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split(/\r?\n/);
      lines.forEach((line, i) => {
        if (pattern.test(line)) {
          console.log(`${fullPath}:${i + 1}: ${line.trim()}`);
        }
      });
    }
  }
}
walk(baseDir);
