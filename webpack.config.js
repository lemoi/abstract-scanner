const path = require('path');

module.exports = {
    entry: path.join(__dirname, "/lib/index.js"),
    output: {
        path: path.join(__dirname, "/lib"),
        filename: "abstract-scanner.umd.js",
        libraryTarget: "umd",
        library: "abs"
    }
}