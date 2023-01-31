import { ChangeObject } from "./change_object";
import { PathMatrix } from "./path_matrix";

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

function ReconstrunctPath(left: string, path_length: number, path_matrix: PathMatrix): [number, number][] {
    function FindDiagonal(x_coord: number, d_level: number, path_matrix: PathMatrix): number {
        for (let k: number = -d_level; k <= d_level; k += 2) {
            if (path_matrix.get(path_length, k) == x_coord) {
                return k;
            }
        }
        return NaN;
    }

    let path: [number, number][] = [];

    let x_coord: number;
    let y_coord: number;
    let go_vertical: boolean;
    let diagonal: number;

    x_coord = left.length;
    diagonal = FindDiagonal(x_coord, path_length, path_matrix);
    y_coord = x_coord - diagonal;

    path.push([x_coord, y_coord]);

    while (path_length > 0) {
        go_vertical = diagonal == -path_length || (diagonal != path_length && path_matrix.get(path_length - 1, diagonal - 1) < path_matrix.get(path_length - 1, diagonal + 1));
        if (go_vertical) {
            diagonal = diagonal + 1;
        } else {
            diagonal = diagonal - 1;
        }
        path_length--;
        x_coord = path_matrix.get(path_length, diagonal);
        y_coord = x_coord - diagonal;

        path.push([x_coord, y_coord]);
    }

    return path.reverse();

}

function BuildChangeObjects(left: string, right: string, path: [number, number][]): ChangeObject[] {
    let current: [number, number], next: [number, number];
    if (path.length < 1) {
        console.error("Path has less than two points -> cannot build change objects");
        return [];
    }

    let changeObjects: ChangeObject[] = [];
    let x_dist: number, y_dist: number;

    current = [0, 0];
    for (let i: number = 0; i < path.length; ++i) {
        next = path[i];
        x_dist = next[0] - current[0];
        y_dist = next[1] - current[1];

        if (x_dist > y_dist) {
            // there is one horizontal segment + snake
            changeObjects.push({ value: left[current[0]], added: false, removed: true });
            if (y_dist > 0) {
                changeObjects.push({ value: left.substring(current[0] + 1, next[0]), added: false, removed: false });
            }
        } else if (y_dist > x_dist) {
            // there is one vertical segment + snake
            changeObjects.push({ value: right[current[1]], added: true, removed: false });
            if (x_dist > 0) {
                changeObjects.push({ value: left.substring(current[0], next[0]), added: false, removed: false });
            }
        } else {
            // there is only snake
            changeObjects.push({ value: left.substring(current[0], next[0]), added: false, removed: false });
        }
        current = next;
    }

    return changeObjects;
}

function ApplyChange(input: string, changeObjects: ChangeObject[]): string {
    let index: number = 0;
    let result: string = '';
    changeObjects.forEach((changeObject: ChangeObject) => {
        if (changeObject.added) {
            result += changeObject.value;
            index += changeObject.value.length;
        } else if (changeObject.removed) {
            //
        } else {
            result += changeObject.value;
            index += changeObject.value.length;
        }
    });
    return result;
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