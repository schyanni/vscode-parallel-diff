"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrowDPath = void 0;
const worker_1 = require("threads/worker");
function GrowDPath(old_string, new_string, value_left, value_right, k, d) {
    //console.log(`In worker at d=${d}, k=${k}. M(d-1,k-1) = ${value_left}, M(d-1, k+1) = ${value_right}`)
    let x, y;
    if (k == -d || (k != d && value_left < value_right)) {
        x = value_right;
        y = x - k;
    }
    else {
        x = value_left + 1;
        y = x - k;
    }
    while (x < old_string.length && y < new_string.length && (old_string[x] == new_string[y])) {
        x++;
        y++;
    }
    //console.log(`Passed worker returning {x:${x}, y:${y}}`)
    return { x: x, y: y };
}
exports.GrowDPath = GrowDPath;
(0, worker_1.expose)(GrowDPath);
