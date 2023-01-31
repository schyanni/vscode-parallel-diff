import { ChangeObject } from "./change_object";
import { PathMatrix } from "./path_matrix";
import { ReconstrunctPath, BuildChangeObjects } from "./path_tools";

function BuildDPath(left: string, right: string): [number, PathMatrix] {
    const size: number = left.length + right.length;
    let paths: PathMatrix = new PathMatrix();

    let x: number, y: number;
    // handle d=0
    x = 0;
    y = 0;
    while (x < left.length && y <= right.length && left[x] == right[y]) {
        x++;
        y++;
    }
    paths.set(0, 0, x);
    console.debug(`[0,0]: Initial Snake -> x=${x} | Word: ${left.substring(0, x)}`);

    for (let d: number = 1; d <= size; ++d) {
        console.debug(`Extending to d=${d} | Left: ${left} | Right: ${right}`);
        for (let k: number = -d; k <= d; k += 2) {
            if (k == -d || (k != d && paths.get(d - 1, k - 1) < paths.get(d - 1, k + 1))) {
                x = paths.get(d - 1, k + 1);
                y = x - k;
                console.debug(`  [${d}/${k}]: Vertical edge   -> x=${x} | Left: ${left.substring(0, x)} | Right: ${right.substring(0, y)}`);
            } else {
                x = paths.get(d - 1, k - 1) + 1;
                y = x - k;
                console.debug(`  [${d}/${k}]: Horizontal edge -> x=${x} | Left: ${left.substring(0, x)} | Right: ${right.substring(0, y)}`);
            }

            while (x < left.length && y < right.length && (left[x] == right[y])) {
                x++;
                y++;
            }
            console.debug(`  [${d}/${k}]: Snake           -> x=${x} | Left: ${left.substring(0, x)} | Right: ${right.substring(0, y)}`);
            console.debug('');
            paths.set(d, k, x);
            if (x >= left.length && y >= right.length) {
                console.debug(`[${d}/${k}]: Done at pos (${x}/${y})`);
                return [d, paths];
            }
        }
    }

    return [-1, new PathMatrix()]
}

export function greedy_diff(left: string, right: string): ChangeObject[] {
    let d_level: number
    let path_matrix: PathMatrix
    let changeObjects: ChangeObject[]

    [d_level, path_matrix] = BuildDPath(left, right);

    let path: [number, number][] = ReconstrunctPath(left, d_level, path_matrix);
    changeObjects = BuildChangeObjects(left, right, path);
    return changeObjects;
}