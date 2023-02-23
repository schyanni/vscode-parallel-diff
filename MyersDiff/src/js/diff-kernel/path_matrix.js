"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetArrayForLevel = exports.ToArrayIndex = exports.LevelledPathMatrix = exports.PathMatrix = void 0;
class PathMatrix {
    constructor() {
        this.path_array = [];
    }
    level_offset(d_level) {
        return ((d_level + 2) * (d_level + 1) / 2) >> 0; // cast to integer
    }
    index(d_level, k_diagonal) {
        const row_offset = ((d_level + k_diagonal) / 2 >> 0);
        const level_offset = this.level_offset(d_level);
        return level_offset + row_offset; // cast to integer
    }
    set(d_level, k_diagonal, x) {
        let idx = this.index(d_level, k_diagonal);
        this.path_array[idx] = x;
    }
    get(d_level, k_diagonal) {
        let idx = this.index(d_level, k_diagonal);
        if (idx < 0 || idx >= this.path_array.length) {
            return Infinity;
        }
        return this.path_array[idx];
    }
    print() {
        let serialized_matrix = { levels: [] };
        for (let d_level = 0; this.level_offset(d_level) < this.path_array.length; d_level++) {
            serialized_matrix.levels.push(this.level_to_tuple(d_level));
        }
        console.log(JSON.stringify(serialized_matrix));
    }
    level_to_tuple(d_level) {
        const offset = this.level_offset(d_level);
        let result;
        let values = new Array();
        for (let k = -d_level; k <= d_level; k += 2) {
            values.push([k, this.get(d_level, k)]);
        }
        result = { level: d_level, values: values };
        return result;
    }
}
exports.PathMatrix = PathMatrix;
class LevelledPathMatrix {
    constructor() {
        this.path_arrays = [];
    }
    CreateLevel(d) {
        for (let i = this.path_arrays.length; i <= d; i++) {
            this.path_arrays[i] = new Array(i + 1);
        }
    }
    index(d_level, k_diagonal) {
        const offset = ((d_level + k_diagonal) / 2 >> 0);
        return offset; // cast to integer
    }
    set(d_level, k_diagonal, x) {
        let idx = this.index(d_level, k_diagonal);
        //console.log(`M.set(): d=${d_level}, k=${k_diagonal}, x=${x} => idx=${idx}`)
        this.path_arrays[d_level][idx] = x;
    }
    get(d_level, k_diagonal) {
        let idx = this.index(d_level, k_diagonal);
        if (idx < 0 || idx >= this.path_arrays[d_level].length) {
            return Infinity;
        }
        return this.path_arrays[d_level][idx];
    }
}
exports.LevelledPathMatrix = LevelledPathMatrix;
function ToArrayIndex(d_level, k_diagonal) {
    return ((d_level + k_diagonal) / 2 >> 0);
}
exports.ToArrayIndex = ToArrayIndex;
function GetArrayForLevel(d_level) {
    return new Array(d_level + 1);
}
exports.GetArrayForLevel = GetArrayForLevel;
