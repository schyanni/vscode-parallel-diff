import { IPathMatrix } from "./path_matrix";
import { ChangeObject } from "../common/change_object";

export function ReconstrunctPath(left: string, path_length: number, path_matrix: IPathMatrix): [number, number][] {
    function FindDiagonal(x_coord: number, d_level: number, path_matrix: IPathMatrix): number {
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

function MergeSameChangeActions(changes: ChangeObject[]): ChangeObject[] {
    let i: number = 1;
    let j: number = 0;
    let merged: ChangeObject[] = [];

    if (changes.length == 0) {
        return merged;
    }

    merged.push(changes[0]);
    while (i < changes.length) {
        if (changes[i].added === merged[j].added && changes[i].removed === merged[j].removed) {
            // they are the same type
            merged[j].value += changes[i].value;
            merged[j].count = (merged[j].count ?? 0) + (changes[i].count ?? 0);
            ++i;
        } else {
            // it is a new element
            merged.push(changes[i]);
            ++j;
            ++i;
        }
    }

    return merged;
}

export function BuildChangeObjects(left: string, right: string, path: [number, number][]): ChangeObject[] {
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
            changeObjects.push({ count: 1, removed: true, value: left[current[0]] });
            if (y_dist > 0) {
                const value: string = left.substring(current[0] + 1, next[0]);
                changeObjects.push({ count: value.length, value: value });
            }
        } else if (y_dist > x_dist) {
            // there is one vertical segment + snake
            changeObjects.push({ count: 1, added: true, value: right[current[1]] });
            if (x_dist > 0) {
                const value: string = left.substring(current[0], next[0]);
                changeObjects.push({ count: value.length, value: value });
            }
        } else if (x_dist > 0) {
            // there is only snake
            const value: string = left.substring(current[0], next[0]);
            changeObjects.push({ count: value.length, value: value });
        }
        current = next;
    }

    changeObjects = MergeSameChangeActions(changeObjects);
    return changeObjects;
}