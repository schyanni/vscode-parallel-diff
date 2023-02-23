"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("threads/worker");
// Module Data ----------------------------------------
let old_str;
let new_str;
let diagonals = new Map();
// Module functions -----------------------------------
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
class Diagonal {
    constructor(k, segments) {
        this.k = k;
        this.line_scan = segments;
        this.updates = [];
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
const diagonal_worker = {
    set_strings(old_string, new_string) {
        old_str = old_string;
        new_str = new_string;
    },
    add_diagonal(k) {
        if (!diagonals.has(k)) {
            let diagonal = new Diagonal(k, line_scan(k));
            diagonals.set(k, diagonal);
        }
    },
    apply_update(updates) {
        let outgoing = [];
        updates.forEach(update => {
            let diag = diagonals.get(update.k);
            if (diag != undefined) {
                outgoing = outgoing.concat(diag.apply_update(update));
            }
        });
        return outgoing;
    },
    get_diagonals() {
        let result = [];
        diagonals.forEach((value) => {
            result.push(value.get_segments());
        });
        return result;
    }
};
(0, worker_1.expose)(diagonal_worker);
