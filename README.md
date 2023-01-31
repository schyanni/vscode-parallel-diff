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

