const vscode = require('vscode');
const fs = require('fs');
const os = require("os");
//const chalk = require("chalk");
const default_diff = require('./src/js/diff-default/default_kernel')




/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('MyersDiff.selectFilesCommand', selectFilesCommand)
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
    let FillDiffs  = await default_diff.default_diff(file1Content, file2Content)
    const test123 = JSON.stringify(FillDiffs);
    console.log("test");

    vscode.window.showInformationMessage(`Contents of difffile ${test123}`);
    openChangesFile(test123);
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
// visualize the contents of a file
function visualizeChanges(changes) {
    // Create a temporary file
    const filePath = `${os.tmpdir()}/changes.txt`;
  
    // Format the datas
    const changesObj = JSON.parse(changes);
    let output = "";
    changesObj.forEach(change => {
        if (change.added) {
          output += `\x1b[32m${change.value}\x1b[0m`;
        } else if (change.removed) {
          output += `\x1b[31m${change.value}\x1b[0m`;
        } else {
          output += `${change.value}`;
        }
      });
  
    // Write the data to the temporary file
    fs.writeFileSync(filePath, output);
  
    // Return the file path    
    return filePath;
  }

  async function openChangesFile(changes) {
    const filePath = visualizeChanges(changes);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    
    const document = await vscode.workspace.openTextDocument({
      content: fileContents,
      language: 'plaintext'
    });
    await vscode.window.showTextDocument(document, {
      preview: false
    });
  }
