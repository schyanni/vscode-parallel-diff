"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagonal_parallel_diff = void 0;
const diagonal_1 = require("./diagonal");
const threads_1 = require("threads");
const perf_hooks_1 = require("perf_hooks");
async function diagonal_kernel(old_string, new_string, options) {
    let workers = [];
    for (let i = 0; i < options.threads; ++i) {
        await (0, threads_1.spawn)(new threads_1.Worker("./diagonal_worker")).then(module_thread => { module_thread.set_strings(old_string, new_string); return module_thread; }).then(module_thread => workers.push(module_thread));
    }
    // wait for all workers to spawn
    //await Promise.all(workers);
    // initialize with minimal diaognals
    let worker_map = new Map();
    let target_k = old_string.length - new_string.length;
    let target_x = old_string.length - 1;
    let done = false;
    function map_k_to_worker(k) {
        if (k >= 0) {
            return (2 * k) % options.threads;
        }
        return ((-2 * k) - 1) % options.threads;
    }
    async function add_diagonal(k) {
        let index = worker_map.get(k);
        if (index == undefined || Number.isNaN(index)) {
            index = map_k_to_worker(k);
            worker_map.set(k, index);
            return workers[index].add_diagonal(k);
        }
        else {
            return;
        }
    }
    async function apply_update_to_diagonal(update) {
        if (done) {
            return; // some other thread was done.
        }
        if (update.k == target_k && update.x > target_x) {
            done = true; // we are done
            return;
        }
        let index = worker_map.get(update.k) ?? NaN;
        let worker = workers[index];
        worker.apply_update([update]).then(async (updates) => updates.forEach(async (u) => add_diagonal(u.k).then(async () => apply_update_to_diagonal(u))));
    }
    let initial_update = { d: 0, k: 0, x: 0, horizontal: true };
    add_diagonal(0).then(async () => apply_update_to_diagonal(initial_update));
    while (!done) {
    }
    let all_diagonals = [];
    workers.forEach(worker => {
        all_diagonals.push(worker.get_diagonals());
    });
    let result = [];
    await Promise.all(all_diagonals).then(value => value.forEach(group => result.concat(group)));
    return result;
}
function map_diagonals(diagonals) {
    let map = new Map();
    diagonals.forEach(diagonal => {
        if (diagonal.length > 0) {
            map.set(diagonal[0].k, new diagonal_1.Diagonal(diagonal[0].k, diagonal));
        }
    });
    return map;
}
function extract_change(diagonals, k, d, old_str, new_str) {
    let changes = [];
    let x = old_str.length - 1;
    while (d >= 0) {
        let diag = diagonals.get(k) ?? new diagonal_1.Diagonal(NaN);
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
async function diagonal_parallel_diff(old_string, new_string, parallel_options) {
    let loptions = { threads: 1, repetition: 1 };
    if (typeof (parallel_options) != undefined && parallel_options != undefined) {
        loptions = parallel_options;
    }
    old_string = "0" + old_string;
    new_string = "0" + new_string;
    let start = perf_hooks_1.performance.now();
    let diagonals = await diagonal_kernel(old_string, new_string, loptions);
    let middle = perf_hooks_1.performance.now();
    (0, diagonal_1.set_string)(old_string, new_string);
    let map = map_diagonals(diagonals);
    let k = old_string.length - new_string.length;
    let d = map.get(k)?.get_d() ?? NaN;
    let changes = extract_change(map, k, d, old_string, new_string);
    let stop = perf_hooks_1.performance.now();
    if (parallel_options != undefined) {
        parallel_options.kernel_time = middle - start;
        parallel_options.reconstruction_time = stop - middle;
        parallel_options.total_time = stop - start;
    }
    return changes;
}
exports.diagonal_parallel_diff = diagonal_parallel_diff;
let old_st = "helan";
let new_st = "human";
diagonal_parallel_diff(old_st, new_st).then((changes) => console.log(JSON.stringify(changes)));
