const Scanner = require('../examples/scanner').Scanner;
const fs = require('fs');
const target = require.resolve("everything.js/es2015-module.js");
const source = fs.readFileSync(target, 'utf8');

const s = new Scanner(source);

let time = process.hrtime();
while (!s.eof()) {
    s.skipSpace();
    let token = s.nextToken();
    console.log(token);
}
time = process.hrtime(time);
console.log(`It costs ${time[0]}s ${time[1] / 1e6}ms.`);