import { ChangeObject } from "../common/change_object";
import { ParallelOptions } from "../common/parallel_options";
import { BuildChangeObjects, MergeSameChangeActions } from "./path_tools";
import { performance } from 'perf_hooks';

interface IMatrix {
    width: number;
    height: number;
    data: number[];

    index(x: number, y: number): number;
}

class Matrix implements IMatrix {

    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.data = new Array<number>(this.width * this.height);
    }

    public width: number = 0;
    public height: number = 0;
    public data: number[] = new Array<number>();

    public index(x: number, y: number): number {
        return y * this.width + x;
    }

    public print(): void {
        for (let y: number = 0; y < this.height; ++y) {
            let start = this.index(0, y);
            let end = this.index(0, y + 1)
            let slice = this.data.slice(start, end);
            console.log(JSON.stringify(slice))
        }
    }
}

function matrix_kernel(old_string: string, new_string: string): IMatrix {
    const width: number = old_string.length + 1;
    const height: number = new_string.length + 1;
    let matrix: Matrix = new Matrix(width, height);
    for (let x: number = 0; x < width; ++x) {
        matrix.data[matrix.index(x, 0)] = x;
    }

    for (let y: number = 1; y < height; ++y) {
        matrix.data[matrix.index(0, y)] = y;
        for (let x: number = 1; x < width; ++x) {
            const diag = matrix.index(x - 1, y - 1);
            const above = matrix.index(x, y - 1);
            const left = matrix.index(x - 1, y);
            const index = matrix.index(x, y);
            if (old_string[x - 1] == new_string[y - 1]) {
                matrix.data[index] = matrix.data[diag];
            } else {
                matrix.data[index] = Math.min(matrix.data[left], matrix.data[above]) + 1;
            }
        }
    }
    //matrix.print();
    return matrix;
}

function extract_changes(matrix: IMatrix, old_string: string, new_string: string): ChangeObject[] {
    let changes: ChangeObject[] = [];
    let x: number = matrix.width - 1;
    let y: number = matrix.height - 1;



    while (x > 0 && y > 0) {
        let dlength: number = matrix.data[matrix.index(x, y)];
        const diag = matrix.data[matrix.index(x - 1, y - 1)];
        const left = matrix.data[matrix.index(x - 1, y)];
        const above = matrix.data[matrix.index(x, y - 1)];

        let min = Math.min(diag, left, above);
        if (min == diag && min == dlength) {
            changes.push({ count: 1, value: old_string[x - 1] });
            --x;
            --y;
        } else if (left < above) {
            changes.push({ count: 1, value: old_string[x - 1], removed: true });
            --x;
        } else {
            changes.push({ count: 1, value: new_string[y - 1], added: true });
            --y;
        }
    }
    if (x > 0) {
        changes.push({ count: x, value: old_string.substring(0, x), removed: true });
    } else if (y > 0) {
        changes.push({ count: y, value: new_string.substring(0, y), added: true });
    }

    return changes.reverse();
}

export async function matrix_diff(old_string: string, new_string: string, parallel_options?: ParallelOptions | undefined): Promise<ChangeObject[]> {
    let start: any = performance.now();
    let matrix: IMatrix = matrix_kernel(old_string, new_string);
    let middle: any = performance.now();
    let changes = extract_changes(matrix, old_string, new_string);
    changes = MergeSameChangeActions(changes);
    let stop: any = performance.now();

    if(parallel_options != undefined) {
        parallel_options.kernel_time = (middle as number) - (start as number);
        parallel_options.reconstruction_time = (stop as number) - (middle as number);
        parallel_options.total_time = (stop as number) - (start as number);
    }

    return changes;
}
