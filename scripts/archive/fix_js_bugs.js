const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
    let html = fs.readFileSync(f, 'utf8');
    let changed = false;

    // Use a while loop to find all occurrences of "' + window.I18n.t("
    let startIndex = 0;
    while ((startIndex = html.indexOf("' + window.I18n.t(", startIndex)) !== -1) {
        // Is this inside a template literal?
        // We can check if there's a backtick before and after this on the same line or block.
        // Actually, let's just find the closing parenthesis of window.I18n.t(...)
        
        let parenCount = 0;
        let endIndex = -1;
        
        // Start counting from the '('
        const firstParenIndex = html.indexOf('(', startIndex);
        
        for (let i = firstParenIndex; i < html.length; i++) {
            if (html[i] === '(') parenCount++;
            else if (html[i] === ')') parenCount--;
            
            if (parenCount === 0) {
                endIndex = i;
                break;
            }
        }
        
        if (endIndex !== -1) {
            // Check if there are any chained method calls like .replace(...) after the closing parenthesis
            let checkIndex = endIndex + 1;
            while (checkIndex < html.length && html[checkIndex] === '.') {
                // There is a method call! e.g. .replace(...)
                const nextParenOpen = html.indexOf('(', checkIndex);
                if (nextParenOpen !== -1) {
                    parenCount = 0;
                    for (let i = nextParenOpen; i < html.length; i++) {
                        if (html[i] === '(') parenCount++;
                        else if (html[i] === ')') parenCount--;
                        
                        if (parenCount === 0) {
                            endIndex = i;
                            break;
                        }
                    }
                }
                checkIndex = endIndex + 1;
            }

            // Now check if it's followed by " + '"
            const suffixStr = html.substring(endIndex + 1, endIndex + 5);
            if (suffixStr === " + '") {
                const fullMatch = html.substring(startIndex, endIndex + 5);
                const innerContent = html.substring(startIndex + 4, endIndex + 1); // Extract "window.I18n.t(...)"
                
                // Now, should we replace it with ${innerContent} ?
                // ONLY if the surrounding context is a template literal.
                // We can guess it's a template literal if the match itself is surrounded by template literal string content,
                // but for our case, ALL occurrences of "' + window.I18n.t(...) + '" inside cart.html, shop.html, account.html etc
                // that are inside backticks need this fix.
                // Wait, if it's in a normal string concatenation like `let html = '<div title="' + window.I18n.t(...) + '">';`
                // we MUST NOT change it.
                // How to tell? Let's check the 100 characters before it. If we see a backtick closer than a single quote, it's a template literal.
                
                let lastBacktick = html.lastIndexOf('`', startIndex);
                let lastSingleQuote = html.lastIndexOf("'", startIndex - 1);
                
                // In my i18n script, I injected `window.I18n.t` into standard JS.
                // I will ONLY replace specific known strings that broke the UI.
                
            }
        }
        startIndex += 1;
    }
});
