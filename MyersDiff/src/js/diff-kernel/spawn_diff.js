"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawn_diff = void 0;
const path_tools_1 = require("../diff-kernel/path_tools");
const perf_hooks_1 = require("perf_hooks");
function fork_d_path(old_string, new_string, path) {
    let horizontal = {
        x: path.x + 1, y: path.y, horizontal: true,
        snake_length: 0, d_length: path.d_length + 1
    };
    let vertical = {
        x: path.x, y: path.y + 1, horizontal: false,
        snake_length: 0, d_length: path.d_length + 1
    };
    while (horizontal.x < old_string.length && horizontal.y < new_string.length
        && old_string[horizontal.x] == new_string[horizontal.y]) {
        horizontal.x++;
        horizontal.y++;
        horizontal.snake_length++;
    }
    while (vertical.x < old_string.length && vertical.y < new_string.length
        && old_string[vertical.x] == new_string[vertical.y]) {
        vertical.x++;
        vertical.y++;
        vertical.snake_length++;
    }
    return [horizontal, vertical];
}
function find_d_path(old_string, new_string) {
    let d = 1;
    let path_0 = { x: 0, y: 0, horizontal: false, snake_length: 0, d_length: 0 };
    while (path_0.x < old_string.length && path_0.y < new_string.length
        && old_string[path_0.x] == new_string[path_0.y]) {
        path_0.x++;
        path_0.y++;
        path_0.snake_length++;
    }
    let paths = [];
    paths[0] = [path_0];
    let done = false;
    for (; d < old_string.length + new_string.length && !done; ++d) {
        paths[d] = new Array(d + 1);
        // map phase
        let temp = new Array(paths[d - 1].length);
        paths[d - 1].forEach((path, index) => temp[index] = fork_d_path(old_string, new_string, path));
        let temp2 = temp.flat(1).filter((value) => {
            if (value.x >= old_string.length && value.y >= new_string.length) {
                done = true;
                path_0 = value;
            }
            return value.horizontal ? value.x <= old_string.length : value.y <= new_string.length;
        });
        // some clean up
        if (done) {
            paths[d] = [path_0];
            return [d, paths];
        }
        paths[d] = new Array(d + 1);
        temp2.forEach((value) => {
            const k = (value.x - value.y + d) / 2;
            if (paths[d][k] == undefined || paths[d][k].x < value.x) {
                paths[d][k] = value;
            }
        });
    }
    // no valid path found
    return [-1, []];
}
function extract_change(old_string, new_string, d, paths) {
    let changes = [];
    let end = paths[d][0];
    --d;
    for (; d >= 0; --d) {
        //console.log(JSON.stringify(end));
        if (end.snake_length > 0) {
            changes.push({ count: end.snake_length, value: old_string.substring(end.x - end.snake_length, end.x) });
        }
        if (end.horizontal) {
            changes.push({ count: 1, value: old_string[end.x - end.snake_length - 1], removed: true });
        }
        else {
            changes.push({ count: 1, value: new_string[end.y - end.snake_length - 1], added: true });
        }
        // find connecting path element
        end = paths[d].find((value) => {
            return value.x == end.x - end.snake_length - (end.horizontal ? 1 : 0)
                && value.y == end.y - end.snake_length - (end.horizontal ? 0 : 1);
        }) ?? { x: -1, y: -1, horizontal: false, d_length: -1, snake_length: 0 };
    }
    if (end.snake_length > 1) {
        changes.push({ count: end.snake_length - 1, value: old_string.substring(end.x - end.snake_length + 1, end.x) });
    }
    return changes.reverse();
}
async function spawn_diff(old_string, new_string, parallel_options) {
    let d;
    let paths;
    let start = perf_hooks_1.performance.now();
    old_string = "0" + old_string;
    new_string = "0" + new_string;
    [d, paths] = find_d_path(old_string, new_string);
    let middle = perf_hooks_1.performance.now();
    let changes = extract_change(old_string, new_string, d, paths);
    changes = (0, path_tools_1.MergeSameChangeActions)(changes);
    let stop = perf_hooks_1.performance.now();
    if (parallel_options != undefined) {
        parallel_options.kernel_time = middle - start;
        parallel_options.reconstruction_time = stop - middle;
        parallel_options.total_time = stop - start;
    }
    return changes;
}
exports.spawn_diff = spawn_diff;
