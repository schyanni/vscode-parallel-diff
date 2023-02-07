import { default_diff } from "./diff-default/default_kernel";
import { greedy_diff } from "./diff-kernel/basic_kernel";
import { ChangeObject } from "./common/change_object";
import { ParallelOptions } from "./common/parallel_options";
import { verify } from "./verify";

export function Benchmark(algorithm: string, parallel_options: ParallelOptions, new_string: string, old_string: string) : void {
    // let kernel: (old_string: string,new_string: string, parallel_options?: ParallelOptions | undefined) => Promise<ChangeObject[]>;

    // if(algorithm == 'default') {
    //     kernel = default_diff;
    // }
    // else if(algorithm == 'greedy') {
    //     kernel = greedy_diff;
    // } else {
    //     console.error(" no matching kernel -- cancelling benchmark")
    //     return;
    // }

    // for(let r: number = 0; r < parallel_options.repeats; ++r) {
    //     let changes: ChangeObject[] = kernel(old_string, new_string, parallel_options);
    //     if(parallel_options.verify_solution) {
    //         let correct: boolean = verify(old_string, new_string, changes);
    //     }
    // }
}