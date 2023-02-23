"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagonal_diff = void 0;
const path_tools_1 = require("../diff-kernel/path_tools");
const perf_hooks_1 = require("perf_hooks");
let old_str;
let new_str;
function line_scan(k) {
    let scan = [];
    let x;
    let y;
    let segment;
    if (k < 0) {
        x = 0;
        y = x - k;
    }
    else if (k > 0) {
        y = 0;
        x = k + y;
    }
    else {
        x = 0;
        y = 0;
    }
    while (x < old_str.length && y < new_str.length) {
        segment = { d: x + y + 2, k: k, x: x, length: 0 };
        do {
            ++x;
            ++y;
            ++segment.length;
        } while (x < old_str.length && y < new_str.length && old_str[x] == new_str[y]);
        scan.push(segment);
    }
    return scan;
}
function PrintOldString(segment, old_string) {
    return old_string.substring(segment.x, segment.x + segment.length);
}
function PrintNewString(segment, new_string) {
    let y = segment.x - segment.k;
    return new_string.substring(y, y + segment.length);
}
class Diagonal {
    constructor(k) {
        this.k = k;
        this.line_scan = line_scan(k);
        this.updates = [];
        let old_strs = [];
        let new_strs = [];
        this.line_scan.forEach(s => {
            old_strs.push(PrintOldString(s, old_str));
            new_strs.push(PrintNewString(s, new_str));
        });
    }
    find(x) {
        return this.line_scan.find((s) => {
            return s.x <= x && x < s.x + s.length;
        });
    }
    apply_update(update) {
        let segment = this.find(update.x);
        let outgoing = [];
        if (segment != undefined) {
            if (update.d < segment.d) {
                segment.d = update.d;
                segment.horizontal = update.horizontal;
                let x = segment.x + segment.length - 1;
                let y = x - this.k;
                // horizontal update
                if (x < old_str.length) {
                    let update = { k: segment.k + 1, d: segment.d + 1, x: x + 1, horizontal: true };
                    outgoing.push(update);
                }
                // vertical update
                if (y < new_str.length) {
                    let update = { k: segment.k - 1, d: segment.d + 1, x: x, horizontal: false };
                    outgoing.push(update);
                }
            }
        }
        return outgoing;
    }
    get_d() {
        return this.line_scan[this.line_scan.length - 1].d;
    }
    get_segments_with_d(d) {
        return this.line_scan.filter(s => { return s.d == d; });
    }
    get_segments() {
        return this.line_scan;
    }
}
function extract_change(diagonals, k, d) {
    let changes = [];
    let x = old_str.length - 1;
    while (d >= 0) {
        let diag = diagonals.get(k) ?? new Diagonal(NaN);
        let segments = diag.get_segments();
        let segment = segments.find(s => { return s.x <= x && x < s.x + s.length && s.d == d; }) ?? { d: NaN, k: NaN, x: NaN, length: NaN };
        if (segment.length > 1) {
            changes.push({ count: segment.length - 1, value: old_str.substring(segment.x + 1, segment.x + segment.length) });
        }
        if (segment.horizontal == true) {
            changes.push({ count: 1, value: old_str[segment.x], removed: true });
            k = k - 1;
            x = segment.x - 1;
        }
        else if (segment.horizontal == false) {
            let y = segment.x - k;
            changes.push({ count: 1, value: new_str[y], added: true });
            k = k + 1;
            x = segment.x;
        }
        else {
            throw new Error(`Segment can only have at d=0 an unset horizontal. Is now at d=${d}`);
        }
        d = d - 1;
    }
    // handle case d=0;
    changes = changes.reverse();
    changes.shift();
    return changes;
}
async function diagonal_diff(old_string, new_string, parallel_options) {
    let start = perf_hooks_1.performance.now();
    old_str = "0" + old_string;
    new_str = "0" + new_string;
    let min_d = Math.abs(old_str.length - new_str.length);
    let diagonals = new Map();
    let diag = new Diagonal(0);
    diagonals.set(0, diag);
    for (let d = 1; d <= min_d; ++d) {
        diagonals.set(-d, new Diagonal(-d));
        diagonals.set(d, new Diagonal(d));
    }
    let target_diag = diagonals.get(old_str.length - new_str.length) ?? new Diagonal(NaN);
    let updates = [{ d: 0, k: 0, x: 0, horizontal: true }];
    let next_updates = [];
    for (let d = 0; d < old_str.length + new_str.length; ++d) {
        updates.forEach(update => {
            let diag = diagonals.get(update.k);
            if (diag == undefined) {
                diag = new Diagonal(update.k);
                diagonals.set(update.k, diag);
            }
            let new_updates = diag.apply_update(update);
            next_updates = next_updates.concat(new_updates);
        });
        updates = next_updates;
        next_updates = [];
        if (target_diag.get_d() <= d) {
            break;
        }
    }
    let middle = perf_hooks_1.performance.now();
    let changes = extract_change(diagonals, old_str.length - new_str.length, target_diag.get_d());
    changes = (0, path_tools_1.MergeSameChangeActions)(changes);
    let stop = perf_hooks_1.performance.now();
    if (parallel_options != undefined) {
        parallel_options.kernel_time = middle - start;
        parallel_options.reconstruction_time = stop - middle;
        parallel_options.total_time = stop - start;
    }
    return changes;
}
exports.diagonal_diff = diagonal_diff;
