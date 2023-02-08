
const vscode = require('vscode');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('ysgitexntesion.selectFilesCommand', selectFilesCommand)
    );
}

	
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
async function selectFilesCommand() {
    const files = await vscode.window.showOpenDialog({
        canSelectMany: true,
        openLabel: "Select 2 Files",
        filters: {
            'All files': ['*']
        }
    });

    if (!files) {
        return;
    }

    if (files.length !== 2) {
        vscode.window.showInformationMessage("Please select exactly two files.");
        return;
    }

    // Read the contents of the selected files
    const file1Content = await readFile(files[0].fsPath);
    const file2Content = await readFile(files[1].fsPath);

    // Just to test files
    vscode.window.showInformationMessage(`Contents of file 1: ${file1Content}\nContents of file 2: ${file2Content}`);
}

// Read the contents of a file
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}