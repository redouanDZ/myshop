const fs = require('fs');
const path = require('path');

const dir = 'd:\\MYSHOP';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix apple-touch-icon
    content = content.replace(/href="\/images\/christopher-gower-m_HRfLhgABo-unsplash\.jpg"/g, 'href="/images/logo.png"');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
