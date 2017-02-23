const path = require('path');

module.exports = {
    entry: path.join(__dirname, "/src/index.js"),
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "abstract-scanner.js",
        libraryTarget: "umd",
        library: "abs"
    }
}