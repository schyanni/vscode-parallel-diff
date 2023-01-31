# vscode-parallel-diff
Source code to the Parallel-Diff-Viewer Extension for VS Code


## How to Compile diff-kernels:
Install the typescript installer:
```bash
# install it globally
npm install -g typescript

# to install it locally (only for the project)
npm install typescript
```

To compile everything in the `ts` directory, use:
```bash
# go to src-dir, if you are not already there
cd src

# compile typescript:
tsc
```
The Javascript output will be created in the `src/js/` directory.

## API
The general api for the different kernels looks as follows:
```ts
import { ChangeObject } from './diff-kernel/change_object'
// import kernel

let changes: ChangeObject[] = kernel(old_string, new_string);
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