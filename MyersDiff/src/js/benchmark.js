"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Benchmark = void 0;
const default_kernel_1 = require("./diff-default/default_kernel");
const basic_kernel_1 = require("./diff-kernel/basic_kernel");
const inner_loop_parallel_kernel_1 = require("./diff-kernel/inner_loop_parallel_kernel");
const spawn_parallel_diff_1 = require("./diff-kernel/spawn_parallel_diff");
const spawn_diff_1 = require("./diff-kernel/spawn_diff");
const matrix_diff_1 = require("./diff-kernel/matrix_diff");
const fs_1 = require("fs");
async function do_benchmark(kernel, kernel_name, old_string, new_string, reps, threads) {
    let measurements = [];
    for (let i = 0; i < reps; i++) {
        let option = { threads: threads, repetition: i };
        console.log(`At alg=${kernel_name}, iteration=${i}/${reps}, threds=${threads}.`);
        await kernel(old_string, new_string, option);
        measurements.push(`${kernel_name},${i},${threads},${option.kernel_time},${option.reconstruction_time},${option.total_time}\n`);
    }
    return measurements;
}
async function Benchmark(new_string, old_string, repetitions, threads, file_name) {
    // do serial implementations
    let measurements = "#algorithm,iteration,threads,kernel_time,path_time,total_time\n";
    if (repetitions == undefined) {
        repetitions = 5;
    }
    if (threads == undefined) {
        threads = [1];
    }
    let data;
    data = await do_benchmark(default_kernel_1.default_diff, "default_diff", old_string, new_string, repetitions, 1);
    measurements = measurements.concat(...data);
    data = await do_benchmark(basic_kernel_1.greedy_diff, "greedy_diff", old_string, new_string, repetitions, 1);
    measurements = measurements.concat(...data);
    data = await do_benchmark(spawn_diff_1.spawn_diff, "spawn_diff", old_string, new_string, repetitions, 1);
    measurements = measurements.concat(...data);
    // data = await do_benchmark(diagonal_diff, "diagonal_diff", old_string, new_string, repetitions, 1);
    // measurements = measurements.concat(...data);
    data = await do_benchmark(matrix_diff_1.matrix_diff, "matrix_diff", old_string, new_string, repetitions, 1);
    measurements = measurements.concat(...data);
    // do parallel benchmarks
    for (let i = 0; i < threads.length; ++i) {
        let t = threads[i];
        data = await do_benchmark(inner_loop_parallel_kernel_1.inner_loop_parallel_diff, "inner_loop_parallel_diff", old_string, new_string, repetitions, t);
        measurements = measurements.concat(...data);
    }
    for (let i = 0; i < threads.length; ++i) {
        let t = threads[i];
        data = await do_benchmark(spawn_parallel_diff_1.spawn_parallel_diff, "spawn_parallel_diff", old_string, new_string, repetitions, t);
        measurements = measurements.concat(...data);
    }
    // for(let i = 0; i < threads.length; ++i) {
    //     let t = threads[i];
    //     data = await do_benchmark(diagonal_parallel_diff, "diagonal_parallel_diff", old_string, new_string, repetitions, t);
    //     measurements = measurements.concat(...data);
    // }
    if (file_name != undefined) {
        (0, fs_1.writeFileSync)(file_name, measurements);
    }
    return measurements;
}
exports.Benchmark = Benchmark;
//let string_1: string = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam"
//let string_2: string = "Lorem ipsum sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut et dolore magna aliquyam"
let string_1 = (0, fs_1.readFileSync)("input1.txt", "utf-8");
let string_2 = (0, fs_1.readFileSync)("input2.txt", "utf-8");
Benchmark(string_2, string_1, 20, [1, 4, 8, 16, 32], "measurements.csv");
