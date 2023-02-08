import { ChangeObject } from "../common/change_object";
import { ParallelOptions } from "../common/parallel_options";
import { LevelledPathMatrix } from "./path_matrix";
import { FunctionThread, spawn, Worker,Thread } from 'threads'
import { GrowDPathFunction, DCoordinate } from "./inner_loop_parallel_worker";
import { BuildChangeObjects, ReconstrunctPath } from "./path_tools";
import { performance } from 'perf_hooks';

async function simple_parallelization_kernel(old_string: string, new_string: string, options: ParallelOptions): Promise<[number, LevelledPathMatrix]> {
    let workers: FunctionThread<[string, string, number,number, number, number], DCoordinate>[] = [];
    for (let i: number = 0; i < options.threads; ++i) {
        const spawned = await spawn<GrowDPathFunction>(new Worker("./inner_loop_parallel_worker"));
        workers.push(spawned);
    }

    //console.log("At D=0");

    let paths: LevelledPathMatrix = new LevelledPathMatrix();
    const size: number = old_string.length + new_string.length;
    // handle case d=0
    let x: number = 0;
    let y: number = 0;
    while (x < old_string.length && y < new_string.length && old_string[x] == new_string[y]) {
        ++x;
        ++y;
    }
    paths.CreateLevel(0);
    paths.set(0, 0, x);

    for (let d: number = 1; d <= size; ++d) {
        //console.log(`At D=${d}`)
        paths.CreateLevel(d);
        let k: number = -d;
        while (k <= d) {
            //console.log(`At d=${d} and k=${k}`)
            let promises: Promise<DCoordinate>[] = [];
            let previous_k = k;
            for (let i: number = 0; i < options.threads && k <= d; ++i, k += 2) {
                promises.push(workers[i](old_string, new_string, paths.get(d-1, k-1), paths.get(d-1, k+1), k, d));
            }

            let coords = await Promise.all(promises);
            //console.log(`Level D=${d}, awaited promises, k=${k} and previous_k=${previous_k}`)
            for (let i = 0; previous_k < k; previous_k += 2, i++) {
                //console.log(`Setting M(${d}, ${previous_k}) = {x:${coords[i].x}, y: ${coords[i].y}}`)
                paths.set(d, previous_k, coords[i].x);
                if (coords[i].x >= old_string.length && coords[i].y >= new_string.length) {
                    workers.forEach(worker => {
                        Thread.terminate(worker);
                    });
                    return [d, paths];
                }
            }
        }
    }

    workers.forEach(worker => {
        Thread.terminate(worker);
    });

    return [-1, new LevelledPathMatrix()];
}

export async function inner_loop_parallel_diff(old_string: string, new_string: string, options?: ParallelOptions | undefined): Promise<ChangeObject[]> {
    let loptions: ParallelOptions = {threads: 1, repeats: 1}
    if (typeof (options) != undefined && options != undefined) {
        loptions = options;
    }

    let start: any = performance.now();
    let d: number;
    let paths: LevelledPathMatrix;
    [d, paths] = await simple_parallelization_kernel(old_string, new_string, loptions);

    let middle: any = performance.now();
    let path: [number, number][] = ReconstrunctPath(old_string, d, paths);
    let changes: ChangeObject[] = BuildChangeObjects(old_string, new_string, path);
    let stop: any = performance.now();

    if (loptions.report != undefined) {
        loptions.report(`compute [ms]: ${(middle as number) - (start as number)}`);
        loptions.report(`reconstruct [ms]: ${(stop as number) - (middle as number)}`);
        loptions.report(`total [ms]: ${(stop as number) - (start as number)}`);
    }

    return changes;

}