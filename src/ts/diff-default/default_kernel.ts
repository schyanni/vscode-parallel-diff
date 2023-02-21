import { diffChars, Change } from 'diff'
import { ChangeObject } from '../common/change_object';
import { ParallelOptions } from '../common/parallel_options';
import { performance } from 'perf_hooks';

export async function default_diff(left: string, right: string, parallel_options?: ParallelOptions | undefined): Promise<ChangeObject[]> {
    let start: any = performance.now();
    let changes: Change[] = diffChars(left, right);
    let stop: any = performance.now();

    if(parallel_options != undefined) {
        parallel_options.kernel_time = (stop as number) - (start as number);
        parallel_options.reconstruction_time = 0;
        parallel_options.total_time = (stop as number) - (start as number);
    }
    return changes as ChangeObject[];
}

