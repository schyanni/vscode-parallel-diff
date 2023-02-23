import { default_diff } from "./diff-default/default_kernel";
import { greedy_diff } from "./diff-kernel/basic_kernel";
import { inner_loop_parallel_diff } from "./diff-kernel/inner_loop_parallel_kernel";
import { spawn_parallel_diff } from "./diff-kernel/spawn_parallel_diff";
import { spawn_diff } from "./diff-kernel/spawn_diff";
import { diagonal_parallel_diff } from "./play/diagonal_parallel_kernel";
import { diagonal_diff } from "./play/diagonal_kernel";
import { ChangeObject } from "./common/change_object";
import { ParallelOptions } from "./common/parallel_options";
import { verify } from "./verify";
import { matrix_diff } from "./diff-kernel/matrix_diff";
import { writeFileSync, readFileSync } from "fs";

type kernel_fn = (old_string: string, new_string: string, paralel_options?: ParallelOptions | undefined) => Promise<ChangeObject[]>;

async function do_benchmark(kernel: kernel_fn, kernel_name: string, old_string: string, new_string: string, reps: number, threads: number) : Promise<string[]> {
    let measurements: string[] = [];
    for(let i = 0; i < reps; i++) {
        let option: ParallelOptions = {threads: threads, repetition: i};
        console.log(`At alg=${kernel_name}, iteration=${i}/${reps}, threds=${threads}.`)
        await kernel(old_string, new_string, option);
        measurements.push(`${kernel_name},${i},${threads},${option.kernel_time},${option.reconstruction_time},${option.total_time}\n`);
    }

    return measurements;
}

export async function Benchmark(new_string: string, old_string: string, repetitions?: number | undefined, threads?: number[] | undefined, file_name?: string | undefined) : Promise<string> {
    // do serial implementations
    let measurements: string = "#algorithm,iteration,threads,kernel_time,path_time,total_time\n";
    if(repetitions == undefined) {
        repetitions = 5;
    }
    if(threads == undefined){
        threads = [1];
    }
    let data: string[];
    data = await do_benchmark(default_diff, "default_diff", old_string, new_string, repetitions, 1);
    measurements = measurements.concat(...data);
    data = await do_benchmark(greedy_diff, "greedy_diff", old_string, new_string, repetitions, 1);
    measurements = measurements.concat(...data);
    data = await do_benchmark(spawn_diff, "spawn_diff", old_string, new_string, repetitions, 1);
    measurements = measurements.concat(...data);
    // data = await do_benchmark(diagonal_diff, "diagonal_diff", old_string, new_string, repetitions, 1);
    // measurements = measurements.concat(...data);
    data = await do_benchmark(matrix_diff, "matrix_diff", old_string, new_string, repetitions, 1);
    measurements = measurements.concat(...data);

    // do parallel benchmarks
    for(let i = 0; i < threads.length; ++i) {
        let t = threads[i];
        data = await do_benchmark(inner_loop_parallel_diff, "inner_loop_parallel_diff", old_string, new_string, repetitions, t);
        measurements = measurements.concat(...data);
    }
    for(let i = 0; i < threads.length; ++i) {
        let t = threads[i];
        data = await do_benchmark(spawn_parallel_diff, "spawn_parallel_diff", old_string, new_string, repetitions, t);
        measurements = measurements.concat(...data);
    }
    // for(let i = 0; i < threads.length; ++i) {
    //     let t = threads[i];
    //     data = await do_benchmark(diagonal_parallel_diff, "diagonal_parallel_diff", old_string, new_string, repetitions, t);
    //     measurements = measurements.concat(...data);
    // }

    if(file_name != undefined) {
        writeFileSync(file_name, measurements);
    }

    return measurements;
}

//let string_1: string = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam"
//let string_2: string = "Lorem ipsum sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut et dolore magna aliquyam"

let string_1: string = readFileSync("input1.txt", "utf-8");
let string_2: string = readFileSync("input2.txt", "utf-8");

Benchmark(string_2, string_1, 20, [1, 4, 8, 16, 32], "measurements.csv");
