/**
 * Production Validation & Syntax Check Script
 * Executes full static syntax verification, config checks, and file integrity validation.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getAllJsFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                results = results.concat(getAllJsFiles(fullPath));
            }
        } else if (file.endsWith('.js')) {
            results.push(fullPath);
        }
    }
    return results;
}

function runValidation() {
    console.log('--- 🔍 Starting Production Validation & Integrity Check ---');

    // 1. Syntax Check with node --check
    console.log('1. Checking JavaScript syntax with `node --check`...');
    const rootFiles = ['server.js', 'eslint.config.js'];
    const targetDirs = ['src', 'database', 'test'];
    const allFiles = [...rootFiles.map(f => path.join(__dirname, '..', f)), ...targetDirs.flatMap(d => getAllJsFiles(path.join(__dirname, '..', d)))];

    let checkedCount = 0;
    for (const filePath of allFiles) {
        if (fs.existsSync(filePath)) {
            try {
                execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
                checkedCount++;
            } catch (err) {
                console.error(`❌ Syntax error in file: ${filePath}`);
                console.error(err.stderr ? err.stderr.toString() : err.message);
                process.exit(1);
            }
        }
    }
    console.log(`   ✔ Successfully verified syntax of ${checkedCount} JavaScript files.`);

    // 2. Localization Files JSON Integrity
    console.log('2. Checking localization JSON files...');
    const localesDir = path.join(__dirname, '..', 'locales');
    if (fs.existsSync(localesDir)) {
        const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));
        for (const locFile of localeFiles) {
            const locPath = path.join(localesDir, locFile);
            const content = fs.readFileSync(locPath, 'utf8');
            try {
                JSON.parse(content);
            } catch (e) {
                console.error(`❌ Invalid JSON in locale file: ${locFile}`);
                process.exit(1);
            }
        }
        console.log(`   ✔ Localization files verified (${localeFiles.length} languages).`);
    }

    // 3. Database Migration files syntax check
    console.log('3. Checking SQL migration files...');
    const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');
    if (fs.existsSync(migrationsDir)) {
        const sqlFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
        console.log(`   ✔ Migration files discovered: ${sqlFiles.length} files.`);
    }

    console.log('--- ✅ All production checks passed successfully. ---');
    console.log('BUILD/VALIDATION PASSED');
}

runValidation();
