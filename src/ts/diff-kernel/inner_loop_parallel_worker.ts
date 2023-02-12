import { expose } from "threads/worker";
import { IPathMatrix } from "./path_matrix";

export interface DCoordinate {
    x: number,
    y: number
}

export function GrowDPath(old_string: string, new_string: string, value_left: number, value_right:number, k: number, d:number) : DCoordinate {
    //console.log(`In worker at d=${d}, k=${k}. M(d-1,k-1) = ${value_left}, M(d-1, k+1) = ${value_right}`)
    let x:number, y:number;
    if(k == -d || (k != d && value_left < value_right)) {
        x = value_right;
        y = x-k;
    } else {
        x = value_left + 1;
        y = x-k;
    }

    while(x < old_string.length && y < new_string.length && (old_string[x] == new_string[y])) {
        x++;
        y++;
    }

    //console.log(`Passed worker returning {x:${x}, y:${y}}`)
    return { x: x, y: y};
}

export type GrowDPathFunction = typeof GrowDPath;

expose (GrowDPath);