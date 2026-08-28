const { run } = require('node:test');
const { spec } = require('node:test/reporters');
const path = require('path');

process.exitCode = 0;

const stream = run({
  files: [
    path.resolve(__dirname, '../test/all.test.js')
  ]
});

stream.on('test:fail', () => { 
  process.exitCode = 1; 
});

const reporter = new spec();
stream.compose(reporter).pipe(process.stdout);

stream.on('end', () => {
  setTimeout(() => {
    process.exit(process.exitCode);
  }, 100);
});
