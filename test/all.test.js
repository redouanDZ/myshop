/**
 * Master Test Suite - Runs all integration & remediation test suites
 */
const { setGlobalDispatcher, Agent } = require('undici');
setGlobalDispatcher(new Agent({ keepAliveTimeout: 10, keepAliveMaxTimeout: 10 }));

require('./api.test.js');
require('./remediation.test.js');
