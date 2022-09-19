import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let totalKeystrokes = 0;

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const commandId = 'keystrokemanager.showTotalKeystrokes';
	subscriptions.push(vscode.commands.registerCommand(commandId, () => {
		vscode.window.showInformationMessage(`Total Keystrokes: ${totalKeystrokes}`);
	}));
	
	const ITEM_PRIORITY = 1000;
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, ITEM_PRIORITY);
	statusBarItem.command = commandId;
	subscriptions.push(statusBarItem);

	subscriptions.push(vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => updateStatusBarItem(event)));

	statusBarItem.show();
}

function updateStatusBarItem(event: vscode.TextDocumentChangeEvent): void {
	if(event && event.contentChanges) {
		totalKeystrokes++;
		statusBarItem.text = `Keystrokes: ${totalKeystrokes}`;
	}
}