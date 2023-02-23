"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inner_loop_parallel_diff = void 0;
const path_matrix_1 = require("./path_matrix");
const threads_1 = require("threads");
const path_tools_1 = require("./path_tools");
const perf_hooks_1 = require("perf_hooks");
async function simple_parallelization_kernel(old_string, new_string, options) {
    let workers = [];
    for (let i = 0; i < options.threads; ++i) {
        const spawned = await (0, threads_1.spawn)(new threads_1.Worker("./inner_loop_parallel_worker"));
        workers.push(spawned);
    }
    let paths = new path_matrix_1.LevelledPathMatrix();
    const size = old_string.length + new_string.length;
    // handle case d=0
    let x = 0;
    let y = 0;
    while (x < old_string.length && y < new_string.length && old_string[x] == new_string[y]) {
        ++x;
        ++y;
    }
    paths.CreateLevel(0);
    paths.set(0, 0, x);
    for (let d = 1; d <= size; ++d) {
        console.log(`Inner loop Parallel: At d=${d}`);
        paths.CreateLevel(d);
        let k = -d;
        while (k <= d) {
            let promises = new Array(options.threads);
            let previous_k = k;
            for (let i = 0; i < options.threads && k <= d; ++i, k += 2) {
                promises[i] = workers[i](old_string, new_string, paths.get(d - 1, k - 1), paths.get(d - 1, k + 1), k, d);
            }
            let coords = await Promise.all(promises);
            for (let i = 0; previous_k < k; previous_k += 2, i++) {
                paths.set(d, previous_k, coords[i].x);
                if (coords[i].x >= old_string.length && coords[i].y >= new_string.length) {
                    workers.forEach(worker => {
                        threads_1.Thread.terminate(worker);
                    });
                    return [d, paths];
                }
            }
        }
    }
    workers.forEach(worker => {
        threads_1.Thread.terminate(worker);
    });
    return [-1, new path_matrix_1.LevelledPathMatrix()];
}
async function inner_loop_parallel_diff(old_string, new_string, options) {
    let loptions = { threads: 1, repetition: 1 };
    if (typeof (options) != undefined && options != undefined) {
        loptions = options;
    }
    let start = perf_hooks_1.performance.now();
    let d;
    let paths;
    [d, paths] = await simple_parallelization_kernel(old_string, new_string, loptions);
    let middle = perf_hooks_1.performance.now();
    let path = (0, path_tools_1.ReconstrunctPath)(old_string, d, paths);
    let changes = (0, path_tools_1.BuildChangeObjects)(old_string, new_string, path);
    let stop = perf_hooks_1.performance.now();
    if (loptions != undefined) {
        loptions.kernel_time = middle - start;
        loptions.reconstruction_time = stop - middle;
        loptions.total_time = stop - start;
    }
    return changes;
}
exports.inner_loop_parallel_diff = inner_loop_parallel_diff;
