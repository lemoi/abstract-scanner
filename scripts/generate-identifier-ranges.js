const fs = require('fs');

const unicodeVersion = '9.0.0';

const targetPath = 'src/utils.ts';

function get(what) {
    return require('unicode-' + unicodeVersion + '/Binary_Property/' + what + '/code-points');
};

function toHex(cp) {
    return '0x' + cp.toString(16).toUpperCase();
}

function generate(what) {
    const set = get(what);
    const length = set.length;
    const result = [];
    let i = 0;
    while (set[i] <= 0x7F) {
        i++;
    }
    let start = set[i];
    result.push(toHex(start));
    i++;
    start++;
    while (i < length) {
        if (start !== set[i]) {
            result.push(toHex(start - 1));
            result.push(toHex(set[i]));
            start = set[i];
        }
        i++;
        start++;
    }
    result.push(toHex(start - 1));
    return result;
}

const ranges = {
    'Start': generate('ID_Start').join(', '),
    'Part': generate('ID_Continue').join(', ')
}

const Regex = {
    'start': '(// NonAsciiIdentifier(\\w+)RangesStartMarker\\n)',
    'end': '(\\n// NonAsciiIdentifier\\2RangesEndMarker)'
};

const source = fs.readFileSync(targetPath, 'utf8');
const output = source.replace(new RegExp(Regex.start + '.*?' + Regex.end, 'g'), function (match, p1, p2, p3) {
    return p1 + ranges[p2] + p3;
});

fs.writeFileSync(targetPath, output);