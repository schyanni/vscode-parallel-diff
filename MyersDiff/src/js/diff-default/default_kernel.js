"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default_diff = void 0;
const diff_1 = require("diff");
const perf_hooks_1 = require("perf_hooks");
async function default_diff(left, right, parallel_options) {
    let start = perf_hooks_1.performance.now();
    let changes = (0, diff_1.diffChars)(left, right);
    let stop = perf_hooks_1.performance.now();
    if (parallel_options != undefined) {
        parallel_options.kernel_time = stop - start;
        parallel_options.reconstruction_time = 0;
        parallel_options.total_time = stop - start;
    }
    return changes;
}
exports.default_diff = default_diff;
