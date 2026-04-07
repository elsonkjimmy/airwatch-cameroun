const fs = require('fs');
const babylon = require('@babel/parser');
const code = fs.readFileSync('C:\\Users\\momok\\Desktop\\airwatch-cameroun\\frontend\\src\\pages\\Dashboard.jsx', 'utf8');
try {
  babylon.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log("No syntax errors found!");
} catch (e) {
  console.error("Parse Error:");
  console.error(e.message);
  console.error(e.loc);
}
