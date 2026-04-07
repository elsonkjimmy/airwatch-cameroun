const code = require('fs').readFileSync('C:\\\\Users\\\\momok\\\\Desktop\\\\airwatch-cameroun\\\\frontend\\\\src\\\\pages\\\\Dashboard.jsx', 'utf8');
const lines = code.split('\\n');
let openCount = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div\\b/g) || []).length;
  const closes = (line.match(/<\\/div>/g) || []).length;
  openCount += opens - closes;
  if (i > 550 && (opens > 0 || closes > 0)) {
    console.log(`${i+1}: ${opens} opens, ${closes} closes, total open: ${openCount} | ${line.trim()}`);
  }
}
