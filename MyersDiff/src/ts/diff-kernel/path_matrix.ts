interface DLevel {
    level: number,
    values: [number, number][]
}

export interface IPathMatrix {
    get(d_level: number, k_diagonal: number) : number;

    set(d_level: number, k_diagonal: number, x:number) : void;
}

export class PathMatrix implements IPathMatrix {
    private path_array: number[];

    constructor() {
        this.path_array = [];
    }

    private level_offset(d_level: number): number {
        return ((d_level + 2) * (d_level + 1) / 2) >> 0; // cast to integer
    }

    private index(d_level: number, k_diagonal: number): number {
        const row_offset: number = ((d_level + k_diagonal) / 2 >> 0);
        const level_offset: number = this.level_offset(d_level);
        return level_offset + row_offset; // cast to integer
    }

    public set(d_level: number, k_diagonal: number, x: number): void {
        let idx: number = this.index(d_level, k_diagonal);
        this.path_array[idx] = x;
    }

    public get(d_level: number, k_diagonal: number): number {
        let idx: number = this.index(d_level, k_diagonal);
        if(idx < 0 || idx >= this.path_array.length) {
            return Infinity;
        }
        return this.path_array[idx];
    }

    public print(): void {
        let serialized_matrix: {
            levels: DLevel[]
        } = { levels: [] }

        for (let d_level: number = 0; this.level_offset(d_level) < this.path_array.length; d_level++) {
            serialized_matrix.levels.push(this.level_to_tuple(d_level));
        }


        console.log(JSON.stringify(serialized_matrix));
    }

    private level_to_tuple(d_level: number): DLevel {
        const offset: number = this.level_offset(d_level);
        let result: DLevel;

        let values: [number, number][] = new Array<[number, number]>()

        for (let k: number = -d_level; k <= d_level; k += 2) {
            values.push([k, this.get(d_level, k)]);
        }

        result = { level: d_level, values: values };
        return result
    }
}

export class LevelledPathMatrix implements IPathMatrix {
    private path_arrays: number[][];

    constructor() {
        this.path_arrays = [];
    }

    public CreateLevel(d: number) : void {
        for(let i: number = this.path_arrays.length; i <= d; i++) {
            this.path_arrays[i] = new Array<number>(i+1);
        }
    }

    private index(d_level: number, k_diagonal: number): number {
        const offset: number = ((d_level + k_diagonal) / 2 >> 0);
        return offset; // cast to integer
    }

    public set(d_level: number, k_diagonal: number, x: number): void {
        let idx: number = this.index(d_level, k_diagonal);
        //console.log(`M.set(): d=${d_level}, k=${k_diagonal}, x=${x} => idx=${idx}`)
        this.path_arrays[d_level][idx] = x;
    }

    public get(d_level: number, k_diagonal: number): number {
        let idx: number = this.index(d_level, k_diagonal);
        if(idx < 0 || idx >= this.path_arrays[d_level].length) {
            return Infinity;
        }
        return this.path_arrays[d_level][idx];
    }
}

export function ToArrayIndex(d_level: number, k_diagonal: number) : number {
    return ((d_level + k_diagonal) / 2 >> 0);
}

export function GetArrayForLevel(d_level: number) : Array<number> {
    return new Array<number>(d_level + 1);
} 