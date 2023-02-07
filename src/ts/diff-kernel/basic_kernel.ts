import { ChangeObject } from "../common/change_object";
import { ParallelOptions } from "../common/parallel_options";
import { PathMatrix } from "./path_matrix";
import { ReconstrunctPath, BuildChangeObjects } from "./path_tools";
import { performance } from 'perf_hooks';

function BuildDPath(left: string, right: string): [number, PathMatrix] {
    const size: number = left.length + right.length;
    let paths: PathMatrix = new PathMatrix();

    let x: number, y: number;
    // handle d=0
    x = 0;
    y = 0;
    while (x < left.length && y < right.length && left[x] == right[y]) {
        x++;
        y++;
    }
    paths.set(0, 0, x);
    //console.debug(`[0,0]: Initial Snake -> x=${x} | Word: ${left.substring(0, x)}`);

    for (let d: number = 1; d <= size; ++d) {
        //console.debug(`Extending to d=${d} | Left: ${left} | Right: ${right}`);
        for (let k: number = -d; k <= d; k += 2) {
            if (k == -d || (k != d && paths.get(d - 1, k - 1) < paths.get(d - 1, k + 1))) {
                x = paths.get(d - 1, k + 1);
                y = x - k;
                //console.debug(`  [${d}/${k}]: Vertical edge   -> x=${x} | Left: ${left.substring(0, x)} | Right: ${right.substring(0, y)}`);
            } else {
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

    return [-1, new PathMatrix()]
}

export async function greedy_diff(old_string: string, new_string: string, parallel_options?: ParallelOptions | undefined): Promise<ChangeObject[]> {
    let d_level: number
    let path_matrix: PathMatrix
    let changeObjects: ChangeObject[]

    let start: any = performance.now();
    [d_level, path_matrix] = BuildDPath(old_string, new_string);

    let middle: any = performance.now();

    let path: [number, number][] = ReconstrunctPath(old_string, d_level, path_matrix);
    changeObjects = BuildChangeObjects(old_string, new_string, path);

    let stop: any = performance.now();

    if(typeof(parallel_options) != undefined && parallel_options != undefined && parallel_options.report != undefined) {
        parallel_options.report(`compute [ms]: ${(middle as number) - (start as number)}`);
        parallel_options.report(`reconstruct [ms]: ${(stop as number) - (middle as number)}`);
        parallel_options.report(`total [ms]: ${(stop as number) - (start as number)}`);
    }
    return changeObjects;
}