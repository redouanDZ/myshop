const fs = require('fs');

let html = fs.readFileSync('account.html', 'utf8');

html = html.replace(/' \+ window\.I18n\.t\('account\.order_id', '.*?\#\{id\}'\)\.replace\('\{id\}', ord\.id\) \+ '/g, "${window.I18n.t('account.order_id', 'طلب #{id}').replace('{id}', ord.id)}");
html = html.replace(/' \+ window\.I18n\.t\('common\.currency_alt', '.*?'\) \+ '/g, "${window.I18n.t('common.currency_alt', 'د.ج')}");
html = html.replace(/' \+ window\.I18n\.t\('account\.view_details', '.*?'\) \+ '/g, "${window.I18n.t('account.view_details', 'عرض التفاصيل')}");

fs.writeFileSync('account.html', html, 'utf8');
console.log('Fixed account.html JS');
