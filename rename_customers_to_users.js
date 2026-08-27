const fs = require('fs');

const files = fs.readdirSync('admin').filter(f => f.endsWith('.html'));

files.forEach(f => {
    let html = fs.readFileSync('admin/' + f, 'utf8');
    
    // Replace sidebar link text
    html = html.replace(/إدارة العملاء/g, 'إدارة المستخدمين');

    // If it's customers.html, also replace titles inside the page
    if (f === 'customers.html') {
        html = html.replace(/<title>.* -/g, '<title>إدارة المستخدمين -');
        html = html.replace(/<h1>.*<\/h1>/g, '<h1>إدارة المستخدمين</h1>');
        html = html.replace(/بحث عن عميل/g, 'بحث عن مستخدم');
        html = html.replace(/تفاصيل العميل/g, 'تفاصيل المستخدم');
        html = html.replace(/بيانات العميل/g, 'بيانات المستخدم');
    }
    
    // Rename customers.html link to users.html
    html = html.replace(/href="customers\.html"/g, 'href="users.html"');
    
    fs.writeFileSync('admin/' + f, html, 'utf8');
    console.log('Updated ' + f);
});

// Rename the file
if (fs.existsSync('admin/customers.html')) {
    fs.renameSync('admin/customers.html', 'admin/users.html');
    console.log('Renamed customers.html to users.html');
}
