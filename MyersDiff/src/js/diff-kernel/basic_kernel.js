"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.benchmark_greedy_diff = exports.greedy_diff = void 0;
const path_matrix_1 = require("./path_matrix");
const path_tools_1 = require("./path_tools");
const perf_hooks_1 = require("perf_hooks");
const fs_1 = require("fs");
function BuildDPath(left, right) {
    const size = left.length + right.length;
    let paths = new path_matrix_1.PathMatrix();
    let x, y;
    // handle d=0
    x = 0;
    y = 0;
    while (x < left.length && y < right.length && left[x] == right[y]) {
        x++;
        y++;
    }
    paths.set(0, 0, x);
    //console.debug(`[0,0]: Initial Snake -> x=${x} | Word: ${left.substring(0, x)}`);
    for (let d = 1; d <= size; ++d) {
        //console.debug(`Extending to d=${d} | Left: ${left} | Right: ${right}`);
        for (let k = -d; k <= d; k += 2) {
            if (k == -d || (k != d && paths.get(d - 1, k - 1) < paths.get(d - 1, k + 1))) {
                x = paths.get(d - 1, k + 1);
                y = x - k;
                //console.debug(`  [${d}/${k}]: Vertical edge   -> x=${x} | Left: ${left.substring(0, x)} | Right: ${right.substring(0, y)}`);
            }
            else {
                x = paths.get(d - 1, k - 1) + 1;
                y = x - k;
                //console.debug(`  [${d}/${k}]: Horizontal edge -> x=${x} | Left: ${left.substring(0, x)} | Right: ${right.substring(0, y)}`);
            }
            while (x < left.length && y < right.length && (left[x] == right[y])) {
                x++;
                y++;
            }
            //console.debug(`  [${d}/${k}]: Snake           -> x=${x} | Left: ${left.substring(0, x)} | Right: ${right.substring(0, y)}`);
            //console.debug('');
            paths.set(d, k, x);
            if (x >= left.length && y >= right.length) {
                //console.debug(`[${d}/${k}]: Done at pos (${x}/${y})`);
                return [d, paths];
            }
        }
    }
    return [-1, new path_matrix_1.PathMatrix()];
}
async function greedy_diff(old_string, new_string, parallel_options) {
    let d_level;
    let path_matrix;
    let changeObjects;
    let start = perf_hooks_1.performance.now();
    [d_level, path_matrix] = BuildDPath(old_string, new_string);
    let middle = perf_hooks_1.performance.now();
    let path = (0, path_tools_1.ReconstrunctPath)(old_string, d_level, path_matrix);
    changeObjects = (0, path_tools_1.BuildChangeObjects)(old_string, new_string, path);
    let stop = perf_hooks_1.performance.now();
    if (parallel_options != undefined) {
        parallel_options.kernel_time = middle - start;
        parallel_options.reconstruction_time = stop - middle;
        parallel_options.total_time = stop - start;
    }
    return changeObjects;
}
exports.greedy_diff = greedy_diff;
async function benchmark_greedy_diff(old_string, new_string, threads, repetitions, file_name) {
    let measurements = "#iteration,threads,kernel_time,path_time\n";
    let data = [];
    let changes = [];
    for (let i = 0; i < repetitions; ++i) {
        let options = { threads: threads, repetition: i };
        changes = await greedy_diff(old_string, new_string, options);
        data.push(`${i},${threads},${options.kernel_time},${options.reconstruction_time}\n`);
    }
    measurements = measurements.concat(...data);
    (0, fs_1.writeFileSync)(file_name, measurements);
    return changes;
}
exports.benchmark_greedy_diff = benchmark_greedy_diff;
