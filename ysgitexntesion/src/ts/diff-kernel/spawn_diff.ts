import { ChangeObject } from "../common/change_object";
import { ParallelOptions } from "../common/parallel_options";
import { MergeSameChangeActions } from "../diff-kernel/path_tools";
import { performance } from 'perf_hooks';


interface d_path_element {
    x: number;
    y: number;
    horizontal: boolean;
    snake_length: number;
    d_length: number;
}

function fork_d_path(old_string: string, new_string: string, path: d_path_element): d_path_element[] {
    let horizontal: d_path_element = {
        x: path.x + 1, y: path.y, horizontal: true,
        snake_length: 0, d_length: path.d_length + 1
    };
    let vertical: d_path_element = {
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

function find_d_path(old_string: string, new_string: string): [number, d_path_element[][]] {
    let d: number = 1;

    let path_0: d_path_element = { x: 0, y: 0, horizontal: false, snake_length: 0, d_length: 0};
    while (path_0.x < old_string.length && path_0.y < new_string.length
        && old_string[path_0.x] == new_string[path_0.y]) {
        path_0.x++;
        path_0.y++;
        path_0.snake_length++;
    }
    let paths: d_path_element[][] = [];
    paths[0] = [path_0];
    let done: boolean = false;

    for (;d < old_string.length + new_string.length && !done; ++d) {
        paths[d] = new Array<d_path_element>(d+1);
        // map phase
        let temp : d_path_element[][] = new Array<d_path_element[]>(paths[d-1].length);
        paths[d-1].forEach( (path, index) => temp[index] = fork_d_path(old_string, new_string, path));
       
        let temp2 = temp.flat(1).filter( (value: d_path_element) => {
            if(value.x >= old_string.length && value.y >= new_string.length) {
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

        paths[d] = new Array<d_path_element>(d+1);
        temp2.forEach( (value) => {
            const k = (value.x - value.y + d)/2;
            if(paths[d][k] == undefined || paths[d][k].x < value.x) {
                paths[d][k] = value;
            }
        });
    }

    // no valid path found
    return [-1, []];
}

function extract_change(old_string: string, new_string: string, d: number, paths: d_path_element[][]) : ChangeObject[] {
    let changes: ChangeObject[] = [];
    let end: d_path_element = paths[d][0];
    --d;
    for(;d >= 0; --d) {
        //console.log(JSON.stringify(end));
        if(end.snake_length > 0) {
           changes.push({count: end.snake_length, value: old_string.substring(end.x - end.snake_length, end.x)});
        }
        if(end.horizontal) {
            changes.push({count: 1, value: old_string[end.x - end.snake_length-1], removed: true});
        } else {
            changes.push({count: 1, value: new_string[end.y-end.snake_length-1], added:true});
        }

        // find connecting path element
        end = paths[d].find((value: d_path_element) => {
            return value.x == end.x - end.snake_length - (end.horizontal ? 1 : 0)
                && value.y == end.y - end.snake_length - (end.horizontal ? 0 : 1);
        }) ?? {x: -1, y: -1, horizontal: false, d_length: -1, snake_length: 0};
    }

    if(end.snake_length > 1) {
        changes.push({count: end.snake_length-1, value: old_string.substring(end.x - end.snake_length+1, end.x)});
    }

    return changes.reverse();
}

export async function spawn_diff(old_string: string, new_string: string, parallel_options? : ParallelOptions | undefined) : Promise<ChangeObject[]> {
    let d: number;
    let paths: d_path_element[][];
    let start: any = performance.now();
    old_string = "0" + old_string;
    new_string = "0" + new_string;
    [d, paths] = find_d_path(old_string, new_string);
    let middle: any = performance.now();

    let changes: ChangeObject[] = extract_change(old_string, new_string, d, paths);
    changes = MergeSameChangeActions(changes);
    let stop: any = performance.now();

    if(parallel_options != undefined) {
        parallel_options.kernel_time = (middle as number) - (start as number);
        parallel_options.reconstruction_time = (stop as number) - (middle as number);
        parallel_options.total_time = (stop as number) - (start as number);
    }

    return changes;
}
