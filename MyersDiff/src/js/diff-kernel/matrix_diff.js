"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matrix_diff = void 0;
const path_tools_1 = require("./path_tools");
const perf_hooks_1 = require("perf_hooks");
class Matrix {
    constructor(width, height) {
        this.width = 0;
        this.height = 0;
        this.data = new Array();
        this.width = width;
        this.height = height;
        this.data = new Array(this.width * this.height);
    }
    index(x, y) {
        return y * this.width + x;
    }
    print() {
        for (let y = 0; y < this.height; ++y) {
            let start = this.index(0, y);
            let end = this.index(0, y + 1);
            let slice = this.data.slice(start, end);
            console.log(JSON.stringify(slice));
        }
    }
}
function matrix_kernel(old_string, new_string) {
    const width = old_string.length + 1;
    const height = new_string.length + 1;
    let matrix = new Matrix(width, height);
    for (let x = 0; x < width; ++x) {
        matrix.data[matrix.index(x, 0)] = x;
    }
    for (let y = 1; y < height; ++y) {
        matrix.data[matrix.index(0, y)] = y;
        for (let x = 1; x < width; ++x) {
            const diag = matrix.index(x - 1, y - 1);
            const above = matrix.index(x, y - 1);
            const left = matrix.index(x - 1, y);
            const index = matrix.index(x, y);
            if (old_string[x - 1] == new_string[y - 1]) {
                matrix.data[index] = matrix.data[diag];
            }
            else {
                matrix.data[index] = Math.min(matrix.data[left], matrix.data[above]) + 1;
            }
        }
    }
    //matrix.print();
    return matrix;
}
function extract_changes(matrix, old_string, new_string) {
    let changes = [];
    let x = matrix.width - 1;
    let y = matrix.height - 1;
    while (x > 0 && y > 0) {
        let dlength = matrix.data[matrix.index(x, y)];
        const diag = matrix.data[matrix.index(x - 1, y - 1)];
        const left = matrix.data[matrix.index(x - 1, y)];
        const above = matrix.data[matrix.index(x, y - 1)];
        let min = Math.min(diag, left, above);
        if (min == diag && min == dlength) {
            changes.push({ count: 1, value: old_string[x - 1] });
            --x;
            --y;
        }
        else if (left < above) {
            changes.push({ count: 1, value: old_string[x - 1], removed: true });
            --x;
        }
        else {
            changes.push({ count: 1, value: new_string[y - 1], added: true });
            --y;
        }
    }
    if (x > 0) {
        changes.push({ count: x, value: old_string.substring(0, x), removed: true });
    }
    else if (y > 0) {
        changes.push({ count: y, value: new_string.substring(0, y), added: true });
    }
    return changes.reverse();
}
async function matrix_diff(old_string, new_string, parallel_options) {
    let start = perf_hooks_1.performance.now();
    let matrix = matrix_kernel(old_string, new_string);
    let middle = perf_hooks_1.performance.now();
    let changes = extract_changes(matrix, old_string, new_string);
    changes = (0, path_tools_1.MergeSameChangeActions)(changes);
    let stop = perf_hooks_1.performance.now();
    if (parallel_options != undefined) {
        parallel_options.kernel_time = middle - start;
        parallel_options.reconstruction_time = stop - middle;
        parallel_options.total_time = stop - start;
    }
    return changes;
}
exports.matrix_diff = matrix_diff;
