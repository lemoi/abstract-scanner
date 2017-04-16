const Scanner = require('../examples/scanner').Scanner;
const fs = require('fs');
const target = require.resolve("everything.js/es2015-module.js");
const source = fs.readFileSync(target, 'utf8');

const s = new Scanner(source);

let time = process.hrtime();
let success = true;

try {
    while (!s.eof()) {
        s.skipSpace();
        s.nextToken();
    }
} catch (e) {
    success = false;
} finally {
    time = process.hrtime(time);
    console.log(`${success ? 'Successful' : 'Failed'}, it costs ${time[0]}s ${time[1] / 1e6}ms.`);
}