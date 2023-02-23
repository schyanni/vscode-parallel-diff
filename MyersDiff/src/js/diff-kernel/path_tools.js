"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildChangeObjects = exports.MergeSameChangeActions = exports.ReconstrunctPath = void 0;
function ReconstrunctPath(left, path_length, path_matrix) {
    function FindDiagonal(x_coord, d_level, path_matrix) {
        for (let k = -d_level; k <= d_level; k += 2) {
            if (path_matrix.get(path_length, k) == x_coord) {
                return k;
            }
        }
        return NaN;
    }
    let path = [];
    let x_coord;
    let y_coord;
    let go_vertical;
    let diagonal;
    x_coord = left.length;
    diagonal = FindDiagonal(x_coord, path_length, path_matrix);
    y_coord = x_coord - diagonal;
    path.push([x_coord, y_coord]);
    while (path_length > 0) {
        go_vertical = diagonal == -path_length || (diagonal != path_length && path_matrix.get(path_length - 1, diagonal - 1) < path_matrix.get(path_length - 1, diagonal + 1));
        if (go_vertical) {
            diagonal = diagonal + 1;
        }
        else {
            diagonal = diagonal - 1;
        }
        path_length--;
        x_coord = path_matrix.get(path_length, diagonal);
        y_coord = x_coord - diagonal;
        path.push([x_coord, y_coord]);
    }
    return path.reverse();
}
exports.ReconstrunctPath = ReconstrunctPath;
function MergeSameChangeActions(changes) {
    let i = 1;
    let j = 0;
    let merged = [];
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
        }
        else {
            // it is a new element
            merged.push(changes[i]);
            ++j;
            ++i;
        }
    }
    return merged;
}
exports.MergeSameChangeActions = MergeSameChangeActions;
function BuildChangeObjects(left, right, path) {
    let current, next;
    if (path.length < 1) {
        console.error("Path has less than two points -> cannot build change objects");
        return [];
    }
    let changeObjects = [];
    let x_dist, y_dist;
    current = [0, 0];
    for (let i = 0; i < path.length; ++i) {
        next = path[i];
        x_dist = next[0] - current[0];
        y_dist = next[1] - current[1];
        if (x_dist > y_dist) {
            // there is one horizontal segment + snake
            changeObjects.push({ count: 1, removed: true, value: left[current[0]] });
            if (y_dist > 0) {
                const value = left.substring(current[0] + 1, next[0]);
                changeObjects.push({ count: value.length, value: value });
            }
        }
        else if (y_dist > x_dist) {
            // there is one vertical segment + snake
            changeObjects.push({ count: 1, added: true, value: right[current[1]] });
            if (x_dist > 0) {
                const value = left.substring(current[0], next[0]);
                changeObjects.push({ count: value.length, value: value });
            }
        }
        else if (x_dist > 0) {
            // there is only snake
            const value = left.substring(current[0], next[0]);
            changeObjects.push({ count: value.length, value: value });
        }
        current = next;
    }
    changeObjects = MergeSameChangeActions(changeObjects);
    return changeObjects;
}
exports.BuildChangeObjects = BuildChangeObjects;
