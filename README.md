# vscode-parallel-diff
Source code to the Parallel-Diff-Viewer Extension for VS Code


## How to Compile diff-kernels:
Install the typescript installer:
```bash
# install it globally
npm install -g typescript

# to install it locally (only for the project)
npm install typescript

# to install all typescript dependencies:
npm install
```

To compile everything in the `ts` directory, use:
```bash
# go to src-dir, if you are not already there
cd MyersDiff/src

# compile typescript:
tsc
```
The Javascript output will be created in the `src/js/` directory.

## API
The general api for the different kernels looks as follows:
```ts
import { ChangeObject } from './diff-kernel/change_object'
// import kernel

let changes: ChangeObject[] = kernel(old_string, new_string, [parallel_options]);
```

The changes will contain the "edit script" to change `old_string` into `new_string`. The "edit script" is made up
of three different commands:
1. keep
2. delete
3. add
A `ChangeObject` is defined as follows:
```ts
export interface ChangeObject {
    // Number of characters in value
    count?: number | undefined;
    // Characters/string handled by this change
    value: string;
    // if true, then value has been added in new_string
    added?: boolean | undefined;
    // if true, then value has been removed in new_string
    removed?: boolean | undefined;
}
```
* count contains the number of characters referenced in value (if provided)
* value contains the string for the current change
* added: if true, then the string in `value`  has been added in `new_string` as compared to `old_string`
* removed: if true, then the string in `value` has been removed from `old_string`  as compared to `new_string`
* if both `added` and `removed` are false (or unset/undefined), then `value` is contained in both, `new_string` and `old_string`

`parallel_options` is an `ParallelOptions` object and an optional argument. If provided, then kernel that support paralellism can be instructed to use it. ParallelOptions looks as follows:
```ts
export interface ParallelOptions {
    // the number of threads (=workers) to use
    threads: number;
    // the number of repetitions to perform (relevant for benchmarking)
    repetitions: number;
    // whether the output should be verified => meant for testing during development of the algorithms
    verify_solution?: boolean | undefined;
    // a function that takes a string. If provided, then the kernel can use this to report/log timings
    report?: ((message: string) => void) | undefined;
    // Can be used to report the time the kernel took to compute the SES
    kernel_time?: number | undefined
    // Can be  used to report the time the kernel took to reconstruct the changes
    reconstruction_time?: number | undefined
    // Can be used to report the total time the kernel took to compute the changes
    total_time?: number | undefined
}
```
